// popup.js
// This script runs within the popup.
document.addEventListener('DOMContentLoaded', async () => {
    const problemInput = document.getElementById('problemInput');
    const detectProblemBtn = document.getElementById('detectProblemBtn'); // New: Detect Problem Button
    const clueLevelSelect = document.getElementById('clueLevel');
    const getClueBtn = document.getElementById('getClueBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const clueOutput = document.getElementById('clueOutput');
    const clueText = document.getElementById('clueText'); // Now a div
    const copyClueBtn = document.getElementById('copyClueBtn');
    const errorMessage = document.getElementById('errorMessage');

    // --- Persistence Logic: Load saved data on startup ---
    await loadSavedData();

    async function loadSavedData() {
        try {
            const result = await chrome.storage.local.get(['savedProblem', 'savedClue', 'savedClueLevel']);
            if (result.savedProblem) {
                problemInput.value = result.savedProblem;
                newPromptBtn.classList.remove('hidden');
                if (result.savedClue) {
                    clueText.innerHTML = convertMarkdownToHtml(result.savedClue);
                    clueOutput.classList.remove('hidden');
                    copyClueBtn.classList.remove('hidden');
                }
            }
            clueLevelSelect.value = result.savedClueLevel || 'high-level';

        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    async function saveCurrentData(problem, clue, clueLevel) {
        try {
            await chrome.storage.local.set({ savedProblem: problem, savedClue: clue, savedClueLevel: clueLevel });
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async function clearSavedData() {
        try {
            await chrome.storage.local.remove(['savedProblem', 'savedClue', 'savedClueLevel']);
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }
    // --- End Persistence Logic ---

    // --- Markdown to HTML Conversion Function ---
    function convertMarkdownToHtml(markdownText) {
        let htmlText = markdownText;

        // Convert code blocks: ```language\ncode\n``` to <pre><code>code</code></pre>
        htmlText = htmlText.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');

        // Convert inline code: `code` to <code>code</code>
        htmlText = htmlText.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Convert bold: **text** to <strong>text</strong>
        htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert italics: *text* or _text_ to <em>text</em>
        htmlText = htmlText.replace(/(?<!\*)\*(.*?)\*(?!\*)/g, '<em>$1</em>');
        htmlText = htmlText.replace(/(?<!\_)\_(.*?)\_(?!\_)/g, '<em>$1</em>');

        // Convert lists (basic unordered/ordered)
        // This regex attempts to find list items and wrap them in ul/ol.
        // It's a simple approach and might not handle complex nested lists perfectly.
        const listRegex = /^( *)([*-]|\d+\.) (.+)/gm;
        let listMatches = [];
        let match;
        // Reset regex lastIndex for global searches
        listRegex.lastIndex = 0;
        while ((match = listRegex.exec(htmlText)) !== null) {
            listMatches.push({
                fullMatch: match[0],
                leadingSpaces: match[1],
                marker: match[2],
                content: match[3],
                index: match.index
            });
        }

        let processedHtml = '';
        let lastIndex = 0;
        let currentListType = null; // 'ul' or 'ol'
        let currentListIndent = -1;

        for (let i = 0; i < listMatches.length; i++) {
            const m = listMatches[i];
            const indent = m.leadingSpaces.length;
            const isUnordered = m.marker === '*' || m.marker === '-';

            // Add text before the current list item
            processedHtml += htmlText.substring(lastIndex, m.index);

            // Determine if a new list needs to start or an existing one needs to close/change
            if (currentListType === null) { // No list open
                currentListType = isUnordered ? 'ul' : 'ol';
                currentListIndent = indent;
                processedHtml += `<${currentListType}>`;
            } else if ((isUnordered && currentListType === 'ol') || (!isUnordered && currentListType === 'ul') || indent > currentListIndent) {
                // If list type changes or indent increases, close current and open new (simple nesting)
                processedHtml += `</${currentListType}>`;
                currentListType = isUnordered ? 'ul' : 'ol';
                currentListIndent = indent;
                processedHtml += `<${currentListType}>`;
            } else if (indent < currentListIndent) {
                // If indent decreases, close current list (simple un-nesting)
                processedHtml += `</${currentListType}>`;
                currentListType = isUnordered ? 'ul' : 'ol'; // Assume new list type based on current item
                currentListIndent = indent;
                processedHtml += `<${currentListType}>`;
            }

            processedHtml += `<li>${m.content}</li>`;
            lastIndex = m.index + m.fullMatch.length;
        }

        processedHtml += htmlText.substring(lastIndex); // Add any remaining text

        // Close any open list at the end
        if (currentListType !== null) {
            processedHtml += `</${currentListType}>`;
        }

        htmlText = processedHtml;

        // Convert remaining newlines to <br> tags, but not inside <pre><code> blocks
        // This regex tries to avoid converting newlines within <pre> tags.
        // It's a simple approach and might not cover all edge cases with complex HTML.
        htmlText = htmlText.replace(/\n(?!<pre>)(?!<\/pre>)(?!<code>)(?!<\/code>)(?!<li>)(?!<\/li>)(?!<ul>)(?!<\/ul>)(?!<ol>)(?!<\/ol>)/g, '<br>');


        return htmlText;
    }
    // --- End Markdown to HTML Conversion Function ---

    // --- Detect Problem Button Event Listener ---
    detectProblemBtn.addEventListener('click', async () => {
        errorMessage.classList.add('hidden'); // Hide any previous errors
        loadingIndicator.classList.remove('hidden'); // Show loading indicator

        try {
            // Get the active tab's URL
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.url) {
                errorMessage.textContent = 'Could not detect problem: No active tab found.';
                errorMessage.classList.remove('hidden');
                return;
            }

            // Execute content script in the active tab
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: extractProblemDescription, // Function to be injected and executed
            });

            if (results && results[0] && results[0].result) {
                const problemText = results[0].result;
                if (problemText.trim()) {
                    problemInput.value = problemText.trim();
                    errorMessage.classList.add('hidden');
                } else {
                    errorMessage.textContent = 'No problem description found on this page. Please ensure you are on a LeetCode or CodeChef problem page.';
                    errorMessage.classList.remove('hidden');
                }
            } else {
                errorMessage.textContent = 'Failed to extract problem description. Are you on a LeetCode or CodeChef problem page?';
                errorMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error detecting problem:', error);
            errorMessage.textContent = `Error detecting problem: ${error.message}. Ensure you are on a supported platform (LeetCode/CodeChef).`;
            errorMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    });

    // --- Function to be injected into the content script ---
    // This function runs IN THE CONTEXT OF THE WEBPAGE
    function extractProblemDescription() {
        let problemText = '';

        // --- LeetCode Detection ---
        // 1. Try to extract from meta description (most stable if content is sufficient)
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && metaDescription.content) {
            problemText = metaDescription.content;
            // Clean the meta description: replace &nbsp; with space, normalize newlines.
            problemText = problemText.replace(/&nbsp;/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
            // Check if it contains enough content to be considered a problem description
            // This is a heuristic: check for "Example", "Input", "Output", "Constraints"
            if (/(Example|Input|Output|Constraints)/i.test(problemText)) {
                return problemText;
            }
        }

        // 2. Fallback to DOM-based extraction if meta description is insufficient or not found
        const leetcodeProblemContainer = document.querySelector('div[data-track-load="description_content"]');
        if (leetcodeProblemContainer) {
            problemText = leetcodeProblemContainer.innerText;
            // Clean the extracted text: remove examples, constraints, follow-up sections.
            problemText = problemText.replace(/Example \d+:\nInput:[\s\S]*?Output:[\s\S]*?(?=\nExample|$)/g, '');
            problemText = problemText.replace(/Constraints:[\s\S]*$/g, '');
            problemText = problemText.replace(/Follow up:[\s\S]*$/g, '');
            problemText = problemText.replace(/\n\s*\n/g, '\n\n').trim(); // Normalize multiple newlines
            if (problemText) return problemText;
        }

        // 3. Further fallback for older LeetCode UI or other structures
        const leetcodeOldProblemDiv = document.querySelector('.xFUwe');
        if (leetcodeOldProblemDiv) {
             problemText = leetcodeOldProblemDiv.innerText;
             problemText = problemText.replace(/Example \d+:\nInput:[\s\S]*?Output:[\s\S]*?(?=\nExample|$)/g, '');
             problemText = problemText.replace(/Constraints:[\s\S]*$/g, '');
             problemText = problemText.replace(/Follow up:[\s\S]*$/g, '');
             problemText = problemText.replace(/\n\s*\n/g, '\n\n').trim();
             if (problemText) return problemText;
        }


        // --- CodeChef Detection ---
        const codechefProblemDiv = document.querySelector('.problem-statement');
        if (codechefProblemDiv) {
            problemText = codechefProblemDiv.innerText;
            problemText = problemText.replace(/Input\n[\s\S]*?Output\n/g, '');
            problemText = problemText.replace(/Constraints\n[\s\S]*$/g, '');
            problemText = problemText.replace(/\n\s*\n/g, '\n\n').trim();
            if (problemText) return problemText;
        }

        return ''; // Return empty string if no problem text is found on any supported platform
    }

    getClueBtn.addEventListener('click', async () => {
        const prompt = problemInput.value.trim();
        const selectedClueLevel = clueLevelSelect.value;

        if (!prompt) {
            clueText.innerHTML = 'Please enter a problem description to get a clue.';
            clueOutput.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            copyClueBtn.classList.add('hidden');
            return;
        }

        clueOutput.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        newPromptBtn.classList.add('hidden');
        copyClueBtn.classList.add('hidden');

        try {
            let chatHistory = [];
            let clueInstruction = "";

            switch (selectedClueLevel) {
                case 'high-level':
                    clueInstruction = "Provide a very high-level, subtle hint focusing on the core concept or a general direction, without mentioning specific algorithms or data structures.";
                    break;
                case 'algorithm-focus':
                    clueInstruction = "Provide a hint that suggests a suitable algorithm or data structure, explaining why it's a good fit without giving away the full implementation.";
                    break;
                case 'detailed-insight':
                    clueInstruction = "Provide a more detailed insight, including common pitfalls, edge cases, or a specific technique that might be useful, but still avoid giving the complete solution.";
                    break;
                default:
                    clueInstruction = "Provide a simple, optimal, and concise coding clue.";
            }

            const llmPrompt = `${clueInstruction}

Problem:
${prompt}

Clue:`;

            chatHistory.push({ role: "user", parts: [{ text: llmPrompt }] });

            const payload = { contents: chatHistory };
            const apiKey = "YOUR_ACTUAL_API_KEY_HERE"; // Make sure your API key is here
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API request failed:', response.status, response.statusText, errorData);
                errorMessage.textContent = `Error: ${errorData.error?.message || 'API request failed'}. Please check your network or try again.`;
                errorMessage.classList.remove('hidden');
                return;
            }

            const result = await response.json();
            console.log('API response:', result);

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                clueText.innerHTML = convertMarkdownToHtml(text);
                clueOutput.classList.remove('hidden');
                newPromptBtn.classList.remove('hidden');
                copyClueBtn.classList.remove('hidden');
                await saveCurrentData(prompt, text, selectedClueLevel);
            } else {
                console.error('Unexpected API response structure or no content:', result);
                errorMessage.textContent = 'Could not get a clue. The API response was unexpected.';
                errorMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error fetching clue:', error);
            errorMessage.textContent = `Network error or problem with API call: ${error.message}. Please check your internet connection.`;
            errorMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    });

    newPromptBtn.addEventListener('click', async () => {
        problemInput.value = '';
        clueText.innerHTML = '';
        clueOutput.classList.add('hidden');
        errorMessage.classList.add('hidden');
        newPromptBtn.classList.add('hidden');
        copyClueBtn.classList.add('hidden');
        clueLevelSelect.value = 'high-level';
        await clearSavedData();
        problemInput.focus();
    });

    copyClueBtn.addEventListener('click', async () => {
        try {
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = clueText.textContent;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            copyClueBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyClueBtn.textContent = '📋';
            }, 1500);

        } catch (err) {
            console.error('Failed to copy text: ', err);
            copyClueBtn.textContent = 'Error!';
            setTimeout(() => {
                copyClueBtn.textContent = '📋';
            }, 1500);
        }
    });
});