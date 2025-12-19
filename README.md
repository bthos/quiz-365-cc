# 🎮 Real-time Quiz - 365 IQ Quiz

A web-based real-time quiz platform inspired by Kahoot! 🎯 The project allows a host to run quiz sessions and players to join via PIN code, answer questions, and compete for the top spot on the leaderboard. 🏆

## ✨ Features

- 🎲 Real-time multiplayer quiz (host & players)
- 🔢 PIN-based game joining
- ⏱️ Live timer and answer feedback
- 🏆 Leaderboard and scoring
- ☁️ Firebase Realtime Database backend
- 📱 Responsive UI for desktop and mobile

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (Vanilla)
- Firebase Realtime Database
- Firebase Hosting

## 📁 Project Structure

```
├── public/
│   ├── host.html           # Host interface
│   ├── play.html           # Player interface
│   ├── index.html          # Landing page
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       ├── firebase-config.js  # Firebase config & init
│       ├── host.js         # Host logic
│       ├── player.js       # Player logic
│       └── questions.js    # Questions data
├── firebase.json           # Firebase configuration
├── .firebaserc            # Firebase project ID
└── database.rules.json    # Database security rules
```

## 🚀 Complete Setup Guide

This guide will walk you through setting up the quiz application from scratch to deployment. Don't worry if you're not technical - we'll explain everything step by step! 😊

### 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:

1. **Git** - for downloading the project
   - Download from: https://git-scm.com/downloads
   - During installation, use default settings
   - Verify installation: Open a terminal/command prompt and type `git --version`

2. **Node.js** - for running Firebase tools
   - Download from: https://nodejs.org/ (choose the LTS version)
   - During installation, use default settings
   - Verify installation: Open a terminal/command prompt and type `node --version`

3. **A Google Account** - for Firebase (free tier is sufficient)

### 📥 Step 1: Clone the Repository

**What is cloning?** Cloning means downloading the project files to your computer.

1. Open your terminal/command prompt:
   - **Windows:** Press `Win + R`, type `cmd`, press Enter
   - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
   - **Linux:** Press `Ctrl + Alt + T`

2. Navigate to where you want to store the project (e.g., Desktop or Documents):
   ```bash
   cd Desktop
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/your-username/quiz-365-cc.git
   ```
   *(Replace `your-username` with the actual repository URL)*

4. Enter the project folder:
   ```bash
   cd quiz-365-cc
   ```

✅ **You should now see the project files in your folder!**

### 🔧 Step 2: Install Firebase Tools

**What is Firebase?** Firebase is Google's platform that provides hosting and database services for web applications.

1. Install Firebase CLI (Command Line Interface) globally:
   ```bash
   npm install -g firebase-tools
   ```
   - This may take a few minutes ⏳
   - You might see some warnings - that's okay! ✅

2. Verify installation:
   ```bash
   firebase --version
   ```
   - You should see a version number (e.g., 13.0.0)

### 🔐 Step 3: Set Up Firebase Account

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Click **"Add project"** or **"Create a project"**

3. Enter project name: `quiz-365-cc` (or any name you prefer)

4. Click **"Continue"** and follow the setup wizard:
   - Google Analytics: You can disable this (it's optional)
   - Click **"Create project"**
   - Wait for project creation (about 30 seconds) ⏳

5. Once created, click **"Continue"**

### 📝 Step 4: Get Firebase Configuration

**What is this?** You need to copy your Firebase project settings into the code so the app can connect to your Firebase project.

1. In the Firebase Console, click the **gear icon** ⚙️ next to "Project Overview" (top left)

2. Select **"Project settings"** from the dropdown menu

3. Scroll down to the **"Your apps"** section

4. If you don't see a web app yet:
   - Click the **"</>" (web icon)** to add a web app
   - Register app with a nickname (e.g., "Quiz App")
   - Click **"Register app"**
   - You can skip Firebase Hosting setup for now (we'll do that later)

5. You'll see your **Firebase SDK configuration** - it looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

   **Note:** If you don't see `databaseURL` in the config:
   - Go to **"Realtime Database"** in the left sidebar
   - Click **"Create Database"** (if you haven't already)
   - Choose a location (e.g., "europe-west1")
   - Start in **"Test mode"** (we'll secure it later)
   - After creation, the Database URL will appear at the top
   - Copy this URL and add it to your `firebaseConfig` as `databaseURL`

6. **Copy all these values** - you'll need them in the next step! 📋

7. Open the file `public/js/firebase-config.js` in your project folder

8. Replace the existing `firebaseConfig` object with your values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY_HERE",
     authDomain: "YOUR_AUTH_DOMAIN_HERE",
     databaseURL: "YOUR_DATABASE_URL_HERE",
     projectId: "YOUR_PROJECT_ID_HERE",
     storageBucket: "YOUR_STORAGE_BUCKET_HERE",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
     appId: "YOUR_APP_ID_HERE"
   };
   ```

9. **Important:** Make sure to:
   - Keep the quotes around each value
   - Replace each placeholder with your actual values
   - Don't delete any commas or brackets
   - Save the file when done 💾

✅ **Your Firebase configuration is now set up!**

### 🔑 Step 5: Login to Firebase

1. In your terminal, run:
   ```bash
   firebase login
   ```

2. This will open your web browser:
   - Sign in with your Google account
   - Click **"Allow"** to grant permissions
   - You should see "Success! Logged in as [your-email]"

3. Return to your terminal - you should see a success message ✅

### 🎯 Step 6: Initialize Firebase in Your Project

**What is initialization?** This connects your local project to your Firebase project.

1. Make sure you're in the project folder:
   ```bash
   cd quiz-365-cc
   ```

2. Initialize Firebase:
   ```bash
   firebase init
   ```

3. You'll see a series of questions. Answer them as follows:

   **Question 1: Which Firebase features?**
   - Use arrow keys to navigate
   - Press **Space** to select: `Hosting` and `Database`
   - Press **Enter** to confirm

   **Question 2: Select a default Firebase project**
   - Select the project you created (quiz-365-cc)
   - Press **Enter**

   **Question 3: What do you want to use as your public directory?**
   - Type: `public`
   - Press **Enter**

   **Question 4: Configure as a single-page app?**
   - Type: `N` (No)
   - Press **Enter**

   **Question 5: Set up automatic builds and deploys?**
   - Type: `N` (No)
   - Press **Enter**

   **Question 6: File public/index.html already exists. Overwrite?**
   - Type: `N` (No)
   - Press **Enter**

   **Question 7: What file should be used for Database Rules?**
   - Type: `database.rules.json`
   - Press **Enter**

   **Question 8: File database.rules.json already exists. Overwrite?**
   - Type: `N` (No)
   - Press **Enter**

✅ **Firebase initialization complete!**

### 🧪 Step 7: Test Locally (Optional but Recommended)

Before deploying, you can test the site on your computer:

1. Install a simple web server:
   ```bash
   npm install -g http-server
   ```

2. Navigate to the public folder:
   ```bash
   cd public
   ```

3. Start the server:
   ```bash
   http-server
   ```

4. Open your browser and go to:
   - `http://localhost:8080` (or the port shown in terminal)

5. Test the application:
   - Open `http://localhost:8080/host` in one tab
   - Open `http://localhost:8080/play` in another tab
   - Try creating a game and joining with the PIN

6. Stop the server: Press `Ctrl + C` in the terminal

### 🚀 Step 8: Deploy to Firebase

**What is deployment?** Deployment means uploading your website to the internet so others can access it.

1. Make sure you're in the project root folder (not the public folder):
   ```bash
   cd ..
   ```
   (or navigate back to `quiz-365-cc` if you're elsewhere)

2. Deploy everything:
   ```bash
   firebase deploy
   ```

3. Wait for deployment to complete:
   - You'll see progress messages
   - This usually takes 1-2 minutes ⏳
   - You'll see "Deploy complete!" when finished ✅

4. Copy the hosting URL shown (e.g., `https://quiz-365-cc.web.app`)

### ✅ Step 9: Verify Deployment

1. Open the URL in your browser (the one from Step 7)

2. You should see the quiz landing page! 🎉

3. Test the deployed site:
   - Open the host page: `https://quiz-365-cc.web.app/host`
   - Open the player page: `https://quiz-365-cc.web.app/play` (in another tab/window)
   - Create a game and join with the PIN to verify everything works

### 🔄 Updating Your Site

Whenever you make changes to the code:

1. Make your changes to the files

2. Deploy again:
   ```bash
   firebase deploy
   ```

3. Wait for completion - your changes will be live in 1-2 minutes! ⚡

### 📝 Deployment Commands Reference

Here are the most useful commands:

| Command | What it does |
|---------|-------------|
| `firebase deploy` | Deploy everything (hosting + database rules) |
| `firebase deploy --only hosting` | Deploy only the website files |
| `firebase deploy --only database` | Deploy only database rules |
| `firebase login` | Login to your Firebase account |
| `firebase logout` | Logout from Firebase |

### 🌐 Your Live URLs

After deployment, your site will be available at:

- **Main page:** `https://quiz-365-cc.web.app/`
- **Host page:** `https://quiz-365-cc.web.app/host`
- **Player page:** `https://quiz-365-cc.web.app/play`

*(Replace `quiz-365-cc` with your actual project name if different)*

### 🔒 Security Notes

- ⚠️ All client-side code and Firebase configuration are **public** (this is normal for web apps)
- 🔐 Secure your data using Firebase Database Rules (in `database.rules.json`)
- 🚫 Never store sensitive information (passwords, API keys) in client-side code
- ✅ The Firebase config keys are safe to be public - they only identify your project

### 🆘 Troubleshooting

**Problem: "Command not found" errors**
- Solution: Make sure Node.js and Firebase CLI are installed correctly
- Try: `npm install -g firebase-tools` again

**Problem: "Permission denied" during deployment**
- Solution: Make sure you're logged in: `firebase login`

**Problem: "Project not found"**
- Solution: Make sure you selected the correct project during `firebase init`
- Try: `firebase use --add` to add your project

**Problem: Site not updating after deployment**
- Solution: Clear your browser cache (Ctrl+Shift+Delete) or try incognito mode
- Wait 2-3 minutes - sometimes changes take a moment to propagate

## 📝 Adding and Updating Questions

Want to customize the quiz with your own questions? It's easy! All questions are stored in the `public/js/questions.js` file. 🎯

### 📍 Finding the Questions File

1. Open the `public` folder in your project
2. Navigate to the `js` folder
3. Open `questions.js` in any text editor (Notepad, VS Code, etc.)

### 📋 Question Structure

Each question follows this format:

```javascript
{
    question: "Your question text here?",
    answers: ["Answer option 1", "Answer option 2", "Answer option 3", "Answer option 4"],
    correct: 0
}
```

**Important details:**
- `question`: The question text (keep it clear and concise)
- `answers`: An array of exactly **4 answer options**
- `correct`: The **index** (0, 1, 2, or 3) of the correct answer
  - `0` = first answer is correct
  - `1` = second answer is correct
  - `2` = third answer is correct
  - `3` = fourth answer is correct

### ➕ Adding a New Question

1. Open `public/js/questions.js`

2. Find the `QUESTIONS` array (it starts with `const QUESTIONS = [`)

3. Add your new question before the closing `];` bracket

4. Follow this example:
   ```javascript
   {
       question: "What is the capital of France?",
       answers: ["London", "Paris", "Berlin", "Madrid"],
       correct: 1  // Paris is the second option (index 1)
   }
   ```

5. **Don't forget the comma!** Add a comma after the previous question's closing `}`

6. Save the file 💾

### ✏️ Updating an Existing Question

1. Open `public/js/questions.js`

2. Find the question you want to change

3. Edit any part:
   - Change the question text
   - Modify answer options
   - Update the `correct` index if you changed which answer is right

4. Save the file 💾

### 🗑️ Removing a Question

1. Find the question in `questions.js`

2. Delete the entire question object (including the `{ }` brackets)

3. Remove the comma from the previous question (if it was the last one)

4. Save the file 💾

### ✅ Example: Complete Question Array

Here's what a few questions look like together:

```javascript
const QUESTIONS = [
    {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correct: 1  // 4 is correct (second option)
    },
    {
        question: "Which planet is closest to the Sun?",
        answers: ["Venus", "Mercury", "Earth", "Mars"],
        correct: 1  // Mercury is correct (second option)
    },
    {
        question: "What year did World War II end?",
        answers: ["1943", "1944", "1945", "1946"],
        correct: 2  // 1945 is correct (third option)
    }
];
```

### 🎯 Best Practices

- ✅ **Keep questions clear and concise** - players have limited time
- ✅ **Make all 4 answers plausible** - avoid obviously wrong answers
- ✅ **Double-check the `correct` index** - make sure it matches the right answer
- ✅ **Test your questions** - deploy and try them out before using in a real quiz
- ✅ **Use consistent formatting** - keep commas and brackets in the right places

### 🚀 After Making Changes

1. **Save the file** (`Ctrl+S` or `Cmd+S`)

2. **Deploy to Firebase** to make changes live:
   ```bash
   firebase deploy
   ```

3. **Wait for deployment** (1-2 minutes) ⏳

4. **Test your changes** by visiting your deployed site

### ⚠️ Common Mistakes to Avoid

- ❌ **Forgetting commas** between questions
- ❌ **Wrong `correct` index** (remember: 0, 1, 2, or 3, not 1, 2, 3, 4)
- ❌ **Missing quotes** around text strings
- ❌ **Not having exactly 4 answers** (the quiz requires 4 options)
- ❌ **Forgetting to deploy** after making changes

### 💡 Tips

- You can use emojis in questions and answers! 🎉
- Questions can be in any language 🌍
- There's no limit to how many questions you can have
- Mix easy and hard questions for better engagement

### 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Git Basics](https://git-scm.com/doc)

### 📄 License

MIT License - feel free to use and modify! 🎉

---

**Need help?** Check the troubleshooting section above or refer to Firebase documentation. Happy quizzing! 🎮✨
