# Client & Studio Portal Module

## Overview
The Studio & Client Portal module is designed for photography studios, client onboarding, project workspace tracking, and production milestones.

## Integrated Routes (in `frontend/`)
- `/studio/dashboard` — Main studio workspace & business analytics
- `/studio/clients` — Client directory & active shoots
- `/studio/clients/onboard` — Client onboarding wizard
- `/studio/clients/:clientId` — Client interactive project workspace & shoot milestones
- `/studio/workflow` — 8-step photography pipeline tracker
- `/studio/activity` — Studio team activity logs
- `/client/*` — Clean client portal aliases

## Architecture
- **Frontend Components**: Located in `frontend/src/modules/clients/`
- **Backend API Routes**: Integrated in `backend/src/routes/clients.ts`, `backend/src/routes/shoots.ts`, `backend/src/routes/studios.ts`
- **Status**: Fully integrated into the unified frontend web application.
