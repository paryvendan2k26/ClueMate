// content.js
// This script runs in the context of the active webpage (e.g., LeetCode, CodeChef).
// It extracts the problem description.

/**
 * Extracts the problem description from common coding platforms.
 * @returns {string} The extracted problem text, or an empty string if not found.
 */
function extractProblemDescription() {
    let problemText = '';

    // --- LeetCode Detection ---
    // 1. Try to extract from meta description (most stable if content is sufficient)
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.content) {
        problemText = metaDescription.content;
        // Clean the meta description: replace &nbsp; with space, normalize newlines.
        problemText = problemText.replace(/&nbsp;/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
        // Heuristic check: Does it contain typical problem keywords?
        if (/(Example|Input|Output|Constraints)/i.test(problemText)) {
            return problemText;
        }
    }

    // 2. Fallback to DOM-based extraction if meta description is insufficient or not found
    // This targets the div that typically contains the problem statement content.
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