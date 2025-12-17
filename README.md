# To‑Do List App

A simple, responsive To‑Do List application built with **React** and **Vite**. It supports creating, editing, and persisting tasks to **Firebase**, includes offline support (PWA via Workbox), and uses **Redux Toolkit** for state management.

---

## ✅ Key Features

- Add, edit, delete, and mark tasks as complete
- Persist tasks to Firebase (see `src/firebaseConfig.js`)
- Offline-first experience with a Service Worker (PWA)
- State management with **Redux Toolkit**
- Styling with **Tailwind CSS**
- Notifications via **react-toastify**

## 🚀 Quick Start

**Prerequisites**
- Node.js (18+ recommended)
- npm

**Install**
```bash
git clone https://github.com/SoftwareDevelopor/To-Do-List-App.git
cd To-Do-List-App
npm install
```

**Configure Firebase**
- Replace the Firebase config in `src/firebaseConfig.js` with your project's values, or set Vite env vars (`VITE_FIREBASE_*`) and update the file to read from `import.meta.env`.
- Enable Firestore (or your chosen database) in the Firebase Console.

**Run (development)**
```bash
npm run dev
# open http://localhost:5173
```

**Build & Preview**
```bash
npm run build
npm run preview
```

**Lint**
```bash
npm run lint
```

## 🧭 Project Structure

- `src/` — application source
  - `assets/` — images & static assets
  - `slices/` — Redux slices (e.g. `UserSlice.js`)
  - `store/` — Redux store setup
  - `firebaseConfig.js` — Firebase initialization
  - `sw.js` — service worker / PWA logic
- `public/` — public static files
- `package.json` — scripts and dependencies

## 🔧 Notes on PWA & Offline

This project uses `vite-plugin-pwa` and `workbox-window`. After running a production build, a service worker will be available to cache assets and enable offline functionality. Check `sw.js` for the registration and caching strategy used.

## 🙏 Contributing

Contributions are welcome — open an issue or a pull request. Please run `npm run lint` and ensure changes are well documented.

## 📄 License

This project is released under the **ISC** License.

---

If you'd like, I can also add badges, CI instructions, or a `CONTRIBUTING.md`. Tell me which you'd like next.

