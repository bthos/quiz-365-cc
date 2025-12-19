# Real-time Quiz

A web-based real-time quiz platform inspired by Kahoot. The project allows a host to run quiz sessions and players to join via PIN code, answer questions, and compete for the top spot on the leaderboard.

## Features
- Real-time multiplayer quiz (host & players)
- PIN-based game joining
- Live timer and answer feedback
- Leaderboard and scoring
- Firebase Realtime Database backend
- Responsive UI for desktop and mobile

## Tech Stack
- HTML, CSS, JavaScript (Vanilla)
- Firebase Realtime Database
- GitHub Pages (static hosting)

## Project Structure
```
├── host.html           # Host interface
├── play.html           # Player interface
├── index.html          # Landing page
├── css/
│   └── style.css       # Styles
├── js/
│   ├── firebase-config.js  # Firebase config & init
│   ├── host.js         # Host logic
│   ├── player.js       # Player logic
│   └── questions.js    # Questions data
└── package.json        # For npm dependencies (firebase)
```

## Local Development
1. Clone the repo
2. Run a static server (e.g. `npx serve` or `npx http-server`)
3. Open `host.html` or `play.html` in your browser

> **Note:** For client-side Firebase apps, the config is public. Secure your data with strict Firebase Database rules.

## Deployment
- Deploy to GitHub Pages for public access.
- All client code and Firebase config will be public.

## Security
- Do **not** store sensitive data in Firebase.
- Restrict database access via Firebase rules.

## License
MIT
