# NIGHT OF DISCIPLINE

A private, responsive training log for Park Seongjun. It tracks weekly targets, body-composition changes, short- and long-term goals, and cumulative monthly challenge performance.

## Run locally

Node.js 20 or later is required. The repository includes an `.nvmrc` for Node 22.

```bash
nvm use
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## First-time owner setup

The first visit opens an owner-account setup screen. Enter your own email and a password of at least eight characters. That becomes the only account recognized by that browser profile.

- The password is salted and hashed with the Web Crypto API before storage.
- The plain-text password is never saved.
- Owner credentials, sessions, records, and goals stay in browser storage.
- Signing out removes the active session, not the owner account.

> This is local MVP access control, not production authentication. Anyone with access to the browser profile or developer tools may be able to alter local data. Before public deployment, move authentication, authorization, and records to a trusted backend.

## Validation

```bash
npm test
npm run build
npm run preview
```

## Features

- Owner-only setup, sign-in, persistent-session option, and sign-out
- English interface with a single Park Seongjun demo profile
- Weekly squad board designed to support a distinct color per future member
- Cumulative challenge-performance graph beginning on September 30, 2026
- Hover/focus result cards on challenge nodes and click-through to full challenge details
- Short- and long-term goal edit mode with titles, dates, and execution notes
- Weight, skeletal-muscle, and body-fat series combined in one normalized graph
- Body-record input, current-goal progress editing, and a unified history timeline
- Responsive desktop and mobile layouts
- Browser-local persistence with demo-data reset

## Data model

- `Participant`: profile, weekly/current goal, goal plans, recent activity, and body records
- `Goal`: numeric, milestone, or completion-based progress
- `PlanGoal`: short- or long-term goal title, target date, and execution note
- `BodyRecord`: dated weight, skeletal-muscle, body-fat, and note values
- `Challenge`: monthly round, status, target snapshot, stake, and outcome

Numeric goals are normalized against their start and target values. The combined body graph normalizes each metric to percentage change from its own September 30 baseline so kilograms and percentages can be read on one chart.

## Production path

1. Add server-managed authentication and an owner allowlist.
2. Store credentials and sessions in a secure identity provider; never ship password hashes to the client.
3. Move body records, goals, and challenges to PostgreSQL with owner-scoped authorization.
4. Add encrypted backups, audit logs, and explicit export/delete controls.
5. Keep only non-sensitive UI preferences in browser storage.

## Stack

React 18, TypeScript, Vite, Lucide React, and Vitest. The UI does not depend on remote fonts or images.
