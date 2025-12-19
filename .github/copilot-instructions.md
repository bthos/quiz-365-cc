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

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

## REFERENCES & EXTERNAL RESOURCES

## SECRETS MANAGEMENT

~~Firebase configuration details MUST now be stored in `secrets/firebaseConfig.json` and should not be hardcoded in the JavaScript files.~~

**Firebase Configuration for Client-Side Applications (e.g., GitHub Pages):**

For client-side Firebase applications, such as those deployed on GitHub Pages, the `firebaseConfig` details are inherently public. The keys within `firebaseConfig` are necessary for the client-side application to identify and connect to the Firebase project. These keys do not grant access to the Firebase console or project management capabilities.

*   **Storage:** `firebaseConfig` can be stored directly in the repository (e.g., in `js/firebase-config.js`).
*   **Security:** Ensure robust security by configuring strict access rules within Firebase Database and Storage. Security should be enforced through access rules, not through the secrecy of `firebaseConfig` keys.
*   **GitHub Secrets:** Avoid storing `firebaseConfig` in GitHub secrets for client-side applications, as these secrets would still be exposed in the client-side JavaScript code. GitHub secrets are suitable for server-side applications or CI/CD environments where secrets are not exposed to the client.