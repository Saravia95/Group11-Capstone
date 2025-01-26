# 🎵 JukeVibes - Client

This project is the frontend for the JukeVibes, an innovative web-based music system that allows customers to browse, request, and play songs via QR codes. The system is designed to enhance customer experience in venues such as restaurants and cafes by offering a seamless digital jukebox experience.

## Getting Started

- Environment Variables

```
SUPABASE_URL=       //The API gateway for your Supabase project
SUPABASE_ANON_KEY=  //The anon key for your Supabase API
```

- Install dependencies

```
npm install
```

- Run the project

```
npm run dev
```

## Folder Structure

```
client/
├── public/             # Static assets such as index.html, favicon, and other public resources
├── src/                # Main source code for the application
│   ├── assets/         # Images, fonts, and other static files used in the project
│   ├── components/     # Reusable UI components such as buttons, modals, and forms
│   ├── config/         # Configuration files
│   ├── hooks/          # Custom React hooks to encapsulate reusable logic across components
│   ├── pages/          # Page-level components that represent different views of the application
│   ├── stores/         # Zustand state management store files for managing global state
│   ├── types/          # TypeScript type definitions and interfaces for better type safety
│   ├── utils/          # Utility/helper functions for common operations used across the app
│   ├── App.tsx         # Root component that defines the app structure and routes
│   └── main.tsx        # Entry point for the React application, rendering the root component
├── .eslintrc.json      # ESLint configuration file to enforce coding style and best practices
├── .prettierrc         # Prettier configuration for code formatting rules
├── tsconfig.json       # TypeScript configuration file to define compiler options
├── package.json        # Project dependencies, scripts, and metadata
└── README.md
```
