# Randall's House of API

Randall's House of API is a multi-tenant management interface for configuring tenant-specific API integrations. It is built with Next.js, React, TypeScript, Firebase Authentication, Cloud Firestore, and Genkit with Google's Gemini model.

## Snapshot

After signing in with Google, users land on a tenant dashboard where they can create and manage tenants. Each tenant has a detail view bringing together API server and gateway configuration, data storage, AI-generated summaries, event streams, upstream APIs, and API monetization settings. Tenant records and user profiles are stored in Firestore; access is governed by the rules in `firestore.rules`.

## Requirements

- Node.js 20 or later and npm
- A Firebase project with a web app, Google sign-in enabled in Firebase Authentication, and Cloud Firestore set up
- A Google AI API key for the Genkit-powered AI features

## Install

```bash
git clone https://github.com/roime81/randall_house_of_api.git
cd randall_house_of_api
npm install
```

Configure Firebase before starting the app:

1. Register or select a Firebase web app in the Firebase console.
2. Replace the values in `src/firebase/config.ts` with that app's Firebase configuration.
3. Enable Google as a sign-in provider in Firebase Authentication and create a Cloud Firestore database.
4. Publish the rules from `firestore.rules` to your Firestore database.

For AI features, make your Google AI API key available in the environment. For example, in a bash shell:

```bash
export GOOGLE_GENAI_API_KEY="your-api-key"
```

Do not commit API keys or other secrets to the repository.

## Run locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects signed-in users to the dashboard and other visitors to the login page.

To run the Genkit development process as well, start it in a second terminal after setting `GOOGLE_GENAI_API_KEY`:

```bash
npm run genkit:dev
```

## Other commands

```bash
npm run typecheck  # Check TypeScript types
npm run build      # Create a production build
npm run start      # Serve the production build
```

## Project structure

- `src/app/` — Next.js routes for login, dashboard, and tenant pages
- `src/components/` — UI and tenant-management components
- `src/firebase/` — Firebase initialization, authentication, and Firestore hooks
- `src/ai/` — Genkit configuration and AI flows
- `firestore.rules` — Firestore access rules
- `docs/` — Product blueprint and backend documentation