---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## PROJECT DESCRIPTION & GOALS

## TECH STACK

## PROJECT STRUCTURE

## CODING STANDARDS

### General

### JavaScript

## WORKFLOW & RELEASE RULES

## DEBUGGING

When a bug is reported, such as "after the first question, the time runs out too quickly," the following steps should be taken:

1.  **Search for relevant code:** Use `copilot_findTextInFiles` to search for keywords related to time, timers, and related functions (e.g., `time`, `timer`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`) in the JavaScript files (`**/js/**`).
2.  **Inspect relevant files:** Use `copilot_readFile` to examine the code in `js/player.js` and `js/host.js`, paying close attention to sections that manage the timer and question flow.
3.  **Analyze the code:** Identify any potential issues in the timer logic, such as incorrect initialization, premature clearing of timers, or unexpected interactions between different parts of the code.

**Timer Synchronization Bug:**

*   **Problem:** The player's timer (`startPlayerTimer`) always initializes to 20 seconds, disregarding the actual remaining time if the player joins a question late. This causes the timer to expire too quickly after the first question if there's a delay in the player joining.
*   **Cause:** The `startPlayerTimer()` function uses `let timeLeft = 20;` instead of retrieving the remaining time from the server.
*   **Solution:** Fetch the question start time (`questionStartTime`) from Firebase and calculate the actual remaining time to synchronize the player's timer with the host.

## TESTING

**Site Validation:**
The deployed site can be validated at https://quiz-365-cc.web.app/. To validate changes, execute `firebase deploy` first to deploy the latest changes to Firebase Hosting.

**Multi-Tab Testing:**
To properly validate the quiz functionality, multiple browser tabs need to be opened:
1. **Host Tab:** Open one tab and navigate to the host page (https://quiz-365-cc.web.app/host) to start a game as the host. This will display a PIN code.
2. **Player Tabs:** Open additional tabs and navigate to the player page (https://quiz-365-cc.web.app/play). In each player tab, enter the PIN code displayed in the host tab to join the game.
3. **Testing Flow:** Once players have joined, start the game from the host tab and test the full game flow including answering questions, viewing results, and checking the leaderboard.

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

## REFERENCES & EXTERNAL RESOURCES

## SECRETS MANAGEMENT

**Firebase Configuration for Client-Side Applications (e.g., GitHub Pages):**

For client-side Firebase applications, such as those deployed on GitHub Pages, the `firebaseConfig` details are inherently public. The keys within `firebaseConfig` are necessary for the client-side application to identify and connect to the Firebase project. These keys do not grant access to the Firebase console or project management capabilities.

*   **Storage:** `firebaseConfig` can be stored directly in the repository (e.g., in `js/firebase-config.js`).
*   **Security:** Ensure robust security by configuring strict access rules within Firebase Database and Storage. Security should be enforced through access rules, not through the secrecy of `firebaseConfig` keys.
*   **GitHub Secrets:** Avoid storing `firebaseConfig` in GitHub secrets for client-side applications, as these secrets would still be exposed in the client-side JavaScript code. GitHub secrets are suitable for server-side applications or CI/CD environments where secrets are not exposed to the client.

**Firebase Hosting Deployment Checklist:**

To deploy the project on Firebase Hosting, ensure the following:

1.  **Firebase Hosting Initialization:** Verify that Firebase Hosting is initialized (`firebase.json` exists).
2.  **Public Directory Configuration:** The `public` directory in `firebase.json` should point to the folder containing the static files (usually `public` or the project root).
3.  **File Placement:** All main HTML files (`index.html`, `host.html`, `play.html`, etc.) and assets (CSS, JS) must be located in the `public` directory or served via rewrites.
4.  **Asset Paths:** Confirm that all asset paths in the HTML files are correct relative to the `public` directory.
5.  **Deployment:** Execute `firebase deploy` to deploy the project.

**Firebase Hosting Configuration and Rewrites:**

*   **Serving Static Files:** Firebase Hosting serves static files from the directory specified by the `"public"` key in `firebase.json`.
*   **Rewrites:** To serve HTML files located outside the public directory (or to provide clean URLs), configure rewrites in `firebase.json`. For example:

```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "/host", "destination": "/host.html" },
      { "source": "/play", "destination": "/play.html" }
    ]
  },
  "database": {
    "rules": "database.rules.json"
  }
}
```

    *   This configuration ensures that requests to `/host` are served by `public/host.html` and requests to `/play` are served by `public/play.html`.  The `host.html` and `play.html` files must be located in the `public` directory.
*   **index.html:** The `index.html` file in the `public` directory is automatically served at the root URL (`/`). No rewrite is required for it.  Any `index.html` files outside of the `public` directory are ignored by Firebase Hosting. If multiple `index.html` files exist, remove the one in the project root to avoid confusion.

**Firebase Hosting Deployment Steps (Summary):**

1.  **Initialization:** Firebase Hosting must be initialized (`firebase.json` exists).
2.  **Public Directory:** The `public` directory in `firebase.json` must point to the folder containing the static files (usually `public` or the project root).
3.  **File Placement:** All main HTML files (`index.html`, `host.html`, `play.html`, etc.) and assets (CSS, JS) must be located in the `public` directory or served via rewrites.
4.  **Asset Paths:** All asset paths in the HTML files must be correct relative to the `public` directory.
5.  **Deployment:** Execute `firebase deploy` to deploy the project.

**`.gitignore` Configuration:**

```gitignore
# Firebase build and config folders
.firebase/
firebase-debug.log

# Local project settings
.specstory/
.vscode/

# Node dependencies
node_modules/
```