# WebNet Browser v1.0.0

**WebNet** is a lightweight, privacy-focused desktop browser built with Electron. It features a custom search engine integration and a built-in Incognito mode.

## Features
- **Smart Search**: Direct URL navigation or specialized DuckDuckGo searching (`&rpl=1&kp=1&ia=web`).
- **Incognito Mode**: A dedicated "Ghost" session that runs entirely in memory—no history or cookies saved.
- **Persistent Cache**: Normal mode saves your site data for a faster, logged-in experience.
- **Security First**: 
  - Blocked unauthorized pop-ups.
  - Disabled dangerous hardware permissions by default.
- **Custom UI**: Integrated URL bar, Back, and Reload controls.

## How to Run (Dev)
1. Ensure [Node.js](https://nodejs.org) is installed.
2. In the project folder, run:
   ```bash
   npm install
   npm start
