# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Offline registration (email/password)

This app supports queuing email/password registrations while offline. Queued registrations are stored in IndexedDB and will be processed automatically when the app detects the device is back online.

Important security notes:
- Queued credentials are stored locally in IndexedDB temporarily and cleared on successful registration.
- Storing passwords on a device has security implications. For production use, consider encrypting queued credentials with Web Crypto and educating users about the risk.

Behavior:
- If the device is offline when a user submits an email/password registration, the app shows: "Registration queued — will complete when online".
- When online, queued registrations are attempted and successful ones are removed from the queue. If a queued email is already registered, it is removed and the user is notified.
