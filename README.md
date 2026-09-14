# Field Task Mobile RN App

Candidate code: **SA-RN-4257**

## Overview

This project is a React Native + Expo application for technicians working in the field. It helps them create, track, review, and synchronize daily tasks with required metadata such as due date/time, location, attachments, and status history.

## Features

- Task creation and editing with validation
- Required fields for title, description, due date/time, and address
- Task list sorting by created time, due time, or status
- Detail view with full metadata, attachment previews, and history log
- Status updates with persistent activity history
- Local image attachments stored with metadata
- Notification scheduling for tasks due soon, plus a 30-60 second demo flow
- Map pins for location-aware tasks
- Offline-first local persistence with mock server sync status
- Light and dark style support

## Tech choices

- React Native + Expo: fast mobile iteration and APK-friendly build workflow
- TypeScript: strong typing and safer refactors
- AsyncStorage: lightweight local persistence for offline-first behavior
- json-server: simple mock REST server for sync testing
- Zustand: minimal shared state for task data without unnecessary complexity
- expo-image-picker + expo-notifications + react-native-maps: direct mobile integrations for attachments, alerts, and location markers

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the mock server:
   ```bash
   pnpm mock-server
   ```
3. In a separate terminal, start the Expo app:
   ```bash
   pnpm start
   ```
4. Use an Android emulator or a physical device with Expo Go.

## Mock server setup

The repository includes a `db.json` seed file and a `mock-server` script:

```bash
pnpm mock-server
```

The service listens on `http://localhost:3001` or `http://10.0.2.2:3001` from Android emulators.

## APK / build instructions

For a production-style Android build, install EAS CLI and run:

```bash
pnpm add -g eas-cli
eas login
eas build -p android --profile preview
```

If you are using a local preview environment, you can also run the app directly via Expo for testing before packaging an APK.

## Architecture

- `src/store`: shared task state and sort logic
- `src/services/storage.ts`: local persistence and task mutation helpers
- `src/services/syncService.ts`: last-write-wins sync logic with the mock JSON server
- `src/utils/validation.ts`: task validation and reminder checks
- `src/utils/notifications.ts`: local reminder scheduling
- `src/types.ts`: shared domain types

## Notification behavior

- If a task is due in less than 30 minutes, the app shows a clear warning and schedules a fallback reminder immediately.
- A demo button is available in the settings tab to trigger the same reminder flow after 30-60 seconds without waiting for a real due date.
- Notification permission handling includes a user-friendly failure message when access is denied.

## Offline and sync model

The app works offline by default. Tasks stay available in local storage and are marked as `Pending Sync` until connectivity returns. When the device reconnects, the app sends the latest version of each task to the mock server using a last-write-wins strategy.

## Known limitations

- Real geocoding is not implemented; coordinates are optional and can be manually entered.
- The mock sync flow is intentionally simple and does not model multi-user conflict resolution beyond last-write-wins semantics.
- Attachments are stored locally and remain visible when the app can access the same local file paths.

## AI and tooling disclosure

This project was developed with GitHub Copilot and its code generation/refinement workflow in VS Code. The AI tooling was used to scaffold the app, draft TypeScript modules, and review the implementation for structure and correctness.

## Submission notes

The app includes the required candidate code (**SA-RN-4257**) in the Settings screen and in this README. During the video demonstration, open **Settings → Candidate code** and keep that screen visible long enough for the code to be read. Include the APK and demo video links as required in the email submission package.
