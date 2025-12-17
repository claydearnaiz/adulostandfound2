# Adamson University Lost and Found System

This is a React-based web application for managing lost and found items, built with Vite and Tailwind CSS.

## Features
- **Public View**: Search and filter lost items. View item details.
- **Admin Panel**: Manage items (Add, Edit, Delete). Switch between Grid and Table views.
- **Responsive Design**: Works on mobile and desktop.

## Tech Stack
- React
- Tailwind CSS
- Lucide React (Icons)
- Vite

## Getting Started (Web)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser** at `http://localhost:5173`.

## Mobile (Expo Go + Web)

This repository now ships with a dedicated Expo app located in `mobile/` so you can preview the experience inside **Expo Go** and also run it on Expo’s web target.

1. **Install dependencies (done automatically when we scaffolded the app, but safe to rerun):**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Expo:**
   ```bash
   npm start
   ```
   - Scan the QR code with **Expo Go** on Android or the Camera app on iOS.
   - Press `w` in the terminal to open the Expo web build (this runs alongside the Vite web app if you want to compare them).

3. The Expo UI shares the same data model and filters as the web version so you can test user flows on real devices.

## Deployment (Firebase)

The project is ready for Firebase Hosting.

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase:**
    ```bash
    firebase login
    ```

3.  **Initialize Firebase (if not already done):**
    ```bash
    firebase init
    ```
    - Select **Hosting**.
    - Select **Use an existing project** (create one in Firebase Console first).
    - Public directory: `dist`
    - Configure as a single-page app: `Yes`

4.  **Build for production:**
    ```bash
    npm run build
    ```

5.  **Deploy:**
    ```bash
    firebase deploy
    ```

## Database Integration

Currently, the app uses mock data (`src/services/mockData.js`). To switch to a real database (Firebase Firestore):

1.  Create a Firebase project and enable Firestore Database.
2.  Copy your Firebase config object from the console.
3.  Update `src/services/firebase.js` with your config.
4.  Follow the instructions in `src/services/firebase.js` to update `src/services/itemService.js` to use Firestore instead of the mock array.

"# lostandfound" 
"# adulostandfound2" 
