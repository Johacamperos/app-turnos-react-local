# Turnomatic - Queue Management System

Welcome to Turnomatic, a comprehensive digital solution designed to efficiently manage customer flows in service-oriented environments. This system streamlines appointment scheduling, walk-in management, and real-time turn display for enhanced customer and staff experience.

**Lovable URL**: https://lovable.dev/projects/f592be55-d121-4e85-a0f0-a084964411fb


## Table of Contents

- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Key Modules](#key-modules)
  - [Appointment Scheduling](#appointment-scheduling)
  - [Turn Display (Turnero)](#turn-display-turnero)
  - [Advisor Console](#advisor-console)
  - [Queue Management](#queue-management)
  - [Masters Management](#masters-management)
  - [Settings](#settings)
- [Architecture Overview](#architecture-overview)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Internationalization (i18n)](#internationalization-i18n)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Core Features

-   **Appointment Scheduling**: Allows users to book appointments online through a multi-step process, selecting location, service, date, and time. Includes confirmation via email/SMS (integration required).
-   **Turn Display (Turnero)**: Real-time display screen (suitable for TVs) showing the current turn being called and a list of recent calls. Updates automatically via EventSource connection.
-   **Walk-In Management**: Handles walk-in customers, allowing them to register their arrival via QR code scan or manual document entry.
-   **Advisor Console**: Dedicated interface for service staff to manage their availability, view assigned queues, call the next customer (either automatically or specific), mark turns as complete or canceled, and view session statistics.
-   **Queue Management**: Centralized view for administrators to monitor the entire queue, view active tickets, waiting times, and advisor statuses. Allows manual intervention like calling specific tickets or canceling them.
-   **Masters Management**: Admin section to manage core data entities:
    -   Offices (locations)
    -   Zones (service areas within offices)
    -   Priorities (customer priority levels)
    -   Customers (basic CRM)
-   **Settings**: Configuration panel for system administrators:
    -   Theme Customization (colors, logo, company name)
    -   Language Management (add/edit/activate languages)
    -   System Settings (Webhooks, Device Linking)
-   **Authentication & Authorization**: Role-based access control (Admin, Advisor, User) using JWT.

## Technology Stack

-   **Frontend Framework**: React (using Vite for build tooling)
-   **UI Library**: Shadcn/ui (built on Radix UI & Tailwind CSS)
-   **Styling**: Tailwind CSS
-   **State Management**: Redux Toolkit
-   **Data Fetching/Caching**: TanStack Query (React Query)
-   **Routing**: React Router DOM
-   **Forms**: React Hook Form & Zod (for validation)
-   **Internationalization**: i18next, react-i18next
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Date Handling**: date-fns
-   **Real-time Updates (Turnero)**: EventSource (Server-Sent Events)
-   **API Communication**: Fetch API (wrapped in `ApiService`)
-   **Development Tooling**: Vite, TypeScript, ESLint

*(Note: The original proposal mentioned Next.js, but the current implementation uses Vite + React Router DOM)*

## Project Structure

```
├── public/                 # Static assets (images, fonts, locales)
├── src/
│   ├── api/                # API service logic (ApiService, AuthService)
│   ├── assets/             # Static assets like images used in components
│   ├── components/         # Reusable UI components (including shadcn/ui)
│   │   ├── appointments/   # Components specific to appointment scheduling
│   │   ├── auth/           # Authentication related components (ProtectedRoute)
│   │   ├── icons/          # Custom SVG icons
│   │   ├── layout/         # Main layout components (Sidebar, TopBar, Footer)
│   │   ├── masters/        # Components for master data management dialogs
│   │   ├── queue/          # Components for the queue management page
│   │   ├── settings/       # Components for the settings page
│   │   ├── turn/           # Components for the Turnero display
│   │   └── ui/             # Shadcn UI components
│   ├── contexts/           # React Context providers (Theme, Auth, Language, Settings, System)
│   ├── hooks/              # Custom React hooks (useToast, useMobile, data hooks)
│   ├── lib/                # Utility functions (cn, date formatting)
│   ├── locales/            # Translation JSON files (en, es, fr)
│   ├── pages/              # Page components corresponding to routes
│   │   └── masters/        # Pages for master data management
│   ├── slices/             # Redux slices (though contexts are heavily used)
│   ├── store/              # Redux store configuration
│   ├── App.tsx             # Main application component with routing setup
│   ├── App.css             # Minimal global CSS (mostly Tailwind reset)
│   ├── index.css           # Tailwind directives and global CSS variables/styles
│   ├── i18n.ts             # i18next configuration
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment types
├── .eslintrc.js            # ESLint configuration
├── index.html              # Main HTML file for Vite
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration (for Tailwind)
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration (root)
├── tsconfig.app.json       # TypeScript configuration for the app
├── tsconfig.node.json      # TypeScript configuration for Node.js scripts (like Vite config)
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## Getting Started

### Prerequisites

-   Node.js (LTS version recommended, e.g., v18 or v20)
-   npm (usually comes with Node.js)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```
    *If you encounter peer dependency issues, you might need to use `npm install --legacy-peer-deps` or resolve the conflicts manually in `package.json`.*

### Running the Development Server

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:8080` (check the console output for the exact URL). The application will automatically reload when you make changes to the code.

2.  **Open your browser** and navigate to the provided URL.

## Key Modules

### Appointment Scheduling (`src/pages/Appointments.tsx` & `src/components/appointments/`)

-   Multi-step form process guided by `useState` for `currentStep`.
-   Components for each step: `AppointmentStart`, `PersonalDataForm`, `ContactDataForm`, `LocationSelection`, `DepartmentSelection`, `DateSelection`, `TimeSelection`, `AppointmentConfirmation`.
-   Uses `ApiService` to fetch available offices, zones, and eventually save the appointment.
-   Stores selected office data in `localStorage` temporarily between steps.

### Turn Display (Turnero) (`src/pages/Turnero.tsx` & `src/components/turn/`)

-   Displays the last called turn prominently and a list of recent calls.
-   Connects to a Server-Sent Events (SSE) endpoint (`/v1.0/stream/{deviceId}`) using the browser's `EventSource` API.
-   Requires a `deviceId` stored in `localStorage`. A placeholder page (`src/pages/Device.tsx`) can be used to generate/display this ID.
-   Uses `Framer Motion` for animations when new calls arrive.
-   Includes a `TurnModal` component to briefly highlight the newly called turn.

### Advisor Console (`src/pages/AdvisorConsole.tsx`)

-   Dashboard for service advisors.
-   Shows advisor's status (Available, Serving, Paused).
-   Displays the currently served client and allows actions (Complete, Cancel).
-   Fetches and displays the waiting queue specific to the advisor or their assigned services/priorities via `ApiService.fetchAdvisorQueue`.
-   Allows calling the next client automatically (`ApiService.fetchAdvisorNextQueue`) or a specific one (`ApiService.fetchAdvisorQueueTurn`).
-   Includes a history tab (currently showing dummy data).

### Queue Management (`src/pages/QueueManagement.tsx` & `src/components/queue/`)

-   Provides an overview of all active queues.
-   Displays tickets with status, priority, wait times, and assigned advisor.
-   Includes filtering options (currently placeholders).
-   Shows a list of active advisors and their statuses.
-   Allows manual calling of specific tickets (currently placeholder functionality).

### Masters Management (`src/pages/masters/`)

-   Entry point page (`Masters.tsx`) linking to sub-modules.
-   **Customer Management**: CRUD operations for customers.
-   **Office Management**: CRUD for offices, managing associated zones, devices, and availability (working hours, holidays). Uses dialog components (`OfficeForm`, `OfficeDetailsDialog`, `ZoneManagementDialog`, `DeviceManagementDialog`, `OfficeAvailabilityDialog`).
-   **Zone Management**: CRUD for service zones, managing associated offices.
-   **Priority Management**: CRUD for priority levels, managing associated advisors.
-   Uses TanStack Query for data fetching and mutations, interacting with `ApiService`.

### Settings (`src/pages/Settings.tsx` & `src/components/settings/`)

-   Tabbed interface for different settings categories.
-   **Language Settings**: Manages application languages using `LanguageContext` (which internally uses `SettingsContext`). Allows adding, editing, enabling/disabling languages.
-   **Theme Settings**: Customizes application appearance (colors, logo, names) using `ThemeContext` (internally `SettingsContext`). Includes color presets.
-   **System Settings**: Manages Webhook URL, notification toggles, and linked devices using `SystemContext` (internally `SettingsContext`).
-   **Account Settings**: Placeholder for user-specific account settings.
-   Uses the centralized `SettingsContext` to manage and persist settings via `ApiService`.

## Architecture Overview

-   **Component-Based**: Built with reusable React components, organized by feature (appointments, queue, masters, etc.) and UI elements (`src/components/ui`).
-   **Context API for Global State**: Uses multiple contexts (`SettingsContext`, `ThemeContext`, `LanguageContext`, `SystemContext`, `AuthContext` via Redux) to manage global application state like theme, language, system settings, and user authentication. `SettingsContext` acts as the central hub for persisting configuration.
-   **Client-Side Routing**: Uses `react-router-dom` for navigation between pages.
-   **Data Fetching**: Primarily uses TanStack Query (`useQuery`, `useMutation`) for fetching, caching, and updating server data via `ApiService`.
-   **API Service Layer**: `ApiService.ts` encapsulates all communication with the backend API, providing structured methods for different resources.
-   **Styling**: Relies heavily on Tailwind CSS for utility-first styling, complemented by Shadcn/ui components and custom global styles in `index.css`.
-   **Real-time**: The Turnero page uses Server-Sent Events (SSE) for real-time updates. Other parts might require polling or WebSocket integration for real-time updates (currently relies on manual refresh or TanStack Query refetching).

## State Management

-   **Redux Toolkit**: Used primarily for Authentication state (`src/contexts/AuthContext.ts` - despite the name, it's a Redux slice).
-   **React Context API**: Used extensively for managing global configuration states:
    -   `SettingsContext`: Central context for theme, language, system, and account settings persistence. Wraps API calls for saving/loading.
    -   `ThemeContext`, `LanguageContext`, `SystemContext`: Provide simplified access to specific parts of the `SettingsContext`.
-   **TanStack Query**: Manages server state (fetched data), caching, and background updates.
-   **Local State (`useState`)**: Used for component-level state (e.g., form inputs, dialog visibility, current step in multi-step forms).
-   **`localStorage`**: Used for persisting the auth token, user info, device ID, and potentially caching settings as a fallback.

## API Integration

-   All backend communication is handled through `src/api/ApiService.ts`.
-   It defines base URLs and endpoints for different resources (settings, customers, offices, zones, priorities, queue, advisor actions, auth).
-   Provides static methods for fetching and updating data (e.g., `fetchOffices`, `createCustomer`, `updateSettings`).
-   Includes basic error handling and a timeout mechanism for requests.
-   Authentication tokens (JWT) are retrieved from `localStorage` and included in request headers.

## Styling

-   **Tailwind CSS**: The primary tool for styling. Utility classes are used directly in components.
-   **Shadcn/ui**: Provides pre-built, customizable components that integrate seamlessly with Tailwind. Base components are in `src/components/ui`.
-   **CSS Variables**: Global styles and theme colors are defined using CSS variables in `src/index.css`. Theme customization works by updating these variables.
-   **`clsx` and `tailwind-merge`**: Used via the `cn` utility (`src/lib/utils.ts`) to intelligently merge Tailwind classes.

## Internationalization (i18n)

-   Uses `i18next` and `react-i18next`.
-   Configuration is in `src/i18n.ts`.
-   Translation files are located in `src/locales/{lang}/translation.json`.
-   Supports English (`en`), Spanish (`es`), and French (`fr`).
-   The `LanguageContext` (via `SettingsContext`) manages the current language and available languages.
-   The `LanguageSelector` component (`src/components/ui/language-selector.tsx`) allows users to switch languages.

## Environment Variables

This project uses Vite, which handles environment variables differently than Create React App or Next.js.

-   Environment variables should be prefixed with `VITE_`.
-   Create a `.env` file in the project root (e.g., `.env.local` for local overrides).
    ```.env
    VITE_API_BASE_URL=https://your-api-endpoint.com
    VITE_SOME_OTHER_KEY=your_value
    ```
-   Access variables in your code using `import.meta.env.VITE_VARIABLE_NAME`.

*(Currently, the API base URL is hardcoded in `ApiService.ts`. It's recommended to move this to an environment variable.)*

## Deployment

**Publish via Lovable**

Simply open [Lovable](https://lovable.dev/projects/f592be55-d121-4e85-a0f0-a084964411fb) and click on Share -> Publish.

**Manual Deployment**

This is a standard Vite React application.

1.  **Build the application**:
    ```bash
    npm run build
    ```
    This command creates an optimized production build in the `dist` directory.

2.  **Deploy the `dist` directory**:
    You can deploy the contents of the `dist` folder to any static hosting provider like:
    -   Vercel
    -   Netlify
    -   GitHub Pages
    -   AWS S3 + CloudFront
    -   Firebase Hosting

    Most platforms will automatically detect it as a static site. Configure rewrite rules if necessary to handle client-side routing (e.g., redirect all requests to `index.html`). Consult your hosting provider's documentation.

### Custom Domain

To use a custom domain, configure it through your chosen hosting provider (Vercel, Netlify, etc.). Lovable does not directly support custom domains currently. See [Lovable Docs: Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/).

## Contributing

Contributions are welcome! Please follow standard Gitflow practices:

1.  Create a feature branch from `main` or `develop`.
2.  Make your changes.
3.  Ensure code is formatted and linted (`npm run lint`).
4.  Submit a pull request to the appropriate branch.

## License

This project is currently private. Specify license details if applicable (e.g., MIT, Apache 2.0).
```