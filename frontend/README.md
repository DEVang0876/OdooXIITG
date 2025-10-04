# Frontend Project README

This is the frontend for the Expense Management prototype (React + Vite).

Quick start
1. cd frontend
2. npm install
3. npm run dev

By default Vite will run on a port like 5173 (or next available). Open the URL shown in the terminal.

About this frontend
- Uses a local mock store (localStorage) so the frontend is fully functional without a backend.
- Authentication, users, expenses, approval rules and categories are persisted in the browser.
- React Router is used for role-based routing (admin/employee/manager).

Seeded dev accounts
- admin@example.com / admin123 (admin)
- bob.manager@example.com / manager123 (manager)
- alice@example.com / alice123 (employee)

Notable pages & features
- Login / Signup / Forgot / Reset (reset token displayed to developer when requested)
- Admin: manage users, approval rules, categories
- Employee: add/save/submit expenses, view approval timeline per expense
- Manager: view pending approvals, inspect details, approve/reject with remarks
- Search/Filter available on Admin, Employee, Manager lists

Integration notes
- Replace `src/services/auth.js` and/or `src/services/mockStore.js` with real API calls to connect to a backend.
- `src/services/api.js` contains an axios instance ready for real endpoints.

Security note
- This app uses plaintext passwords and localStorage for tokens for development only. Do not use this mechanism in production.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
