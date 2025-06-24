# Invoice App

A modern invoicing app built with Vue 3 and Vite, featuring advanced invoice management, PDF/JPG export, cloud sync, and more.

## 🚀 Usage Instructions

- **Creating Invoices**: Click the "+" button on the dashboard to open the invoice modal. Fill in client details, items, and totals.
- **Exporting**: In the invoice modal, use the download buttons to export as PDF or JPG.
- **Managing Clients**: Navigate to the Clients tab to add or edit client information.
- **Cloud Sync**: Use the settings dropdown (gear icon) to migrate or sync your data with the cloud.
- **Authentication**: Click "Login" to access your account and enable cloud features.

Screenshots and detailed usage examples coming soon!

---

## 🆕 Recent Features

- **Payment Account Integration**: Add, edit, and select payment accounts for invoices. Enable or disable payment methods per invoice, and display the selected payment account in the settings panel with easy removal and re-selection.
- **Animated Modals**: All modals (account, company, payment) now feature smooth slide-up/down transitions for a modern user experience.
- **Company & Payment CRUD**: Manage companies and payment accounts with full create, edit, and delete functionality, including logo upload for companies and detailed payment info.
- **Improved UI**: Account and company information is now displayed more clearly, with responsive layouts and concise, non-editable fields for key details.
- **See More Modals**: Company and payment lists show up to three items by default, with a "See More" button to view and manage all entries in a dedicated modal.

---

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
