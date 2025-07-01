# Coding Clues Chrome Extension

A subtle and professional Chrome extension designed to provide optimal hints for coding problems on platforms like LeetCode and CodeChef. Stuck on a tricky algorithm or data structure? Get a gentle nudge in the right direction without revealing the full solution.

## ✨ Features

* **Intelligent Clue Generation:** Get concise and optimal hints powered by the Gemini API.
* **Customizable Clue Levels:** Choose the granularity of your hint:
    * **High-Level Hint:** Focuses on the core concept or general direction.
    * **Algorithm Focus:** Suggests suitable algorithms or data structures.
    * **Detailed Insight:** Provides deeper insights, common pitfalls, or specific techniques.
* **Problem Auto-Detection:** Automatically extracts problem descriptions from active LeetCode and CodeChef pages, saving you time.
* **Persistent Clues:** Your last problem and generated clue remain in the popup even if you close and reopen the extension, until you start a new prompt.
* **Copy to Clipboard:** Easily copy the generated clue with a single click.
* **Clean & Professional UI/UX:** A minimalist and aesthetic design for a focused coding experience.
* **Markdown Rendering:** Clues are rendered with proper bolding, italics, lists, and code blocks for enhanced readability.

## 🚀 Installation

To install this extension in your Chrome browser:

1.  **Clone the Repository (or Download ZIP):**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git)
    ```
    Or download the ZIP file from the GitHub repository and extract it.

2.  **Get Your Gemini API Key:**
    * Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Sign in with your Google account.
    * Click "Create API Key in new project" or "Get API Key".
    * **Copy your generated API key.**

3.  **Configure the Extension:**
    * Open the `popup.js` file in your cloned/extracted extension directory.
    * Find the line:
        ```javascript
        const apiKey = "YOUR_ACTUAL_API_KEY_HERE";
        ```
    * **Replace `"YOUR_ACTUAL_API_KEY_HERE"` with the API key you copied from Google AI Studio.**
    * Save the `popup.js` file.

4.  **Load in Chrome:**
    * Open Chrome and go to `chrome://extensions/`.
    * Enable **"Developer mode"** (usually a toggle in the top-right corner).
    * Click on **"Load unpacked"**.
    * Navigate to and select the root directory of your cloned/extracted extension (the folder containing `manifest.json`).

5.  **Pin the Extension (Optional):**
    * Click the puzzle piece icon in your Chrome toolbar.
    * Find "Coding Clues" and click the pin icon next to it to make it visible in your toolbar.

## 💡 Usage

1.  **Open the Extension:** Click the "Coding Clues" icon in your Chrome toolbar.
2.  **Input Problem Description:**
    * **Manual Paste:** Paste your coding problem description into the text area.
    * **Auto-Detect (Recommended):** Navigate to a LeetCode or CodeChef problem page, then click the **"Detect Problem"** button in the extension popup. The problem description should automatically populate the text area.
3.  **Select Clue Level:** Choose your desired hint granularity from the "Clue Level" dropdown (`High-Level Hint`, `Algorithm Focus`, `Detailed Insight`).
4.  **Get Clue:** Click the **"Get Clue"** button. A loading indicator will appear, and then your clue will be displayed.
5.  **Copy Clue:** Click the **clipboard icon** next to the "Clue:" heading to copy the generated hint to your clipboard.
6.  **Start New Prompt:** Click the **"New Prompt"** button to clear the current problem and clue, allowing you to get a hint for a new problem. Your previous data will persist until you click this button.

## 🌐 Supported Platforms for Auto-Detection

* LeetCode (`leetcode.com`)
* CodeChef (`www.codechef.com`)

*(Note: Website structures can change, which might occasionally affect the auto-detection feature. If it stops working on a platform, an update to the `content.js` file might be needed.)*

## 🚧 Future Enhancements (Ideas)

* **Clue History:** Store and browse a history of all generated clues.
* **Feedback Mechanism:** Allow users to rate clue helpfulness.
* **More Platform Support:** Extend auto-detection to other popular coding platforms.
* **User Customization:** Allow users to save preferred clue levels or other settings.

## 🤝 Contributing

Feel free to fork this repository, open issues, or submit pull requests if you have suggestions or improvements!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
