# PORIBARGUARD BD WEB - PRODUCTION READINESS PLAN

## 1. Executive Summary

### Current Status of the Web Project
The **PoribarGuard BD** web project (fsafe.com) is currently functioning as a solid proof-of-concept/beta. The Next.js foundation is robust, integrating Prisma for database ORM and NextAuth for secure parent and admin authentication. The core UI for the Parental Dashboard and Admin Panel is well-structured, responsive, and visually polished, utilizing Tailwind CSS and Lucide React icons.

Crucially, the complex WebRTC signaling and Socket.IO infrastructure for live device monitoring (Camera, Screen View) is successfully established in the custom `server.js` implementation. Database models for essential entities (Users, Children, Devices, Subscriptions, Alerts) are present and linked.

However, several critical systems required for a commercial launch in Bangladesh remain unimplemented or utilize mocked/placeholder data. Production-grade error handling, compliance features (PDPO 2025), full internationalization (i18n), and actual payment gateway integrations are missing.

### Overall Production Readiness Level
**Overall Score: 6.5 / 10**

*   **UI/UX:** 8/10 (Clean, modern, responsive design exists)
*   **Authentication & DB:** 8/10 (NextAuth and Prisma are solid)
*   **Live Tools Architecture:** 7/10 (Socket.IO/WebRTC scaffolding is present, but needs edge-case handling)
*   **Business Logic (Billing/Compliance):** 3/10 (Missing real gateways and compliance flows)
*   **Infrastructure (PWA/Scalability):** 4/10 (In-memory rate limiting, missing PWA manifests)

---

## 2. Currently Working Features

The following features are implemented, connected to the backend, and functioning properly:

*   **Authentication Flow:** Parent Registration, Login, and Session management via NextAuth credentials provider. Role-based access control (Admin vs. Parent) is active.
*   **Database ORM Setup:** Prisma schema defines all necessary relationships (User, Child, Device, Alert, GeofenceZone, Subscription).
*   **Socket.IO Infrastructure:** Custom `server.js` successfully hosts Socket.IO for real-time bi-directional communication between the Web app and (simulated) Android devices.
*   **Child Onboarding Workflow:** The "Add Child" UI flow successfully creates records in the database, generates 6-digit pairing codes, and polls for connection status.
*   **WebRTC Signaling:** The application successfully negotiates WebRTC offers/answers and ICE candidates for Live Camera and Live Screen capabilities.
*   **Basic Dashboard UI:** The Parental Dashboard layout renders dynamic data fetched from API endpoints (e.g., list of children, recent alerts, basic device status).
*   **Admin Dashboard Skeleton:** The Admin Panel successfully aggregates basic statistics, lists parents, and provides a UI for support tickets and content filters.

---

## 3. Incomplete, Missing & Partially Implemented Features

### Categorized Deficiencies

#### A. Core Business & Monetization
*   **Payment Gateways:** Missing integrations for Bangladeshi payment providers (bKash, Nagad, Rocket, AmarPay). The `api/subscriptions` route handles data but does not initiate real transactions.
*   **Subscription Lifecycle:** Auto-renewal logic, webhook handling for payment success/failure, and trial expiration enforcement are incomplete.

#### B. UI/UX & Localization
*   **Bangla Language Support:** The application currently uses a hardcoded dictionary object (`const t = { en: {...}, bn: {...} }`) inside `page.js`. This is not scalable and needs a proper i18n library (e.g., `next-intl` or `react-i18next`).
*   **PWA Readiness:** Despite having `@ducanh2912/next-pwa` in `package.json`, there is no `manifest.json`, offline fallback page, or proper service worker registration configured for an installable app experience.

#### C. Compliance & Privacy
*   **PDPO 2025 Compliance:** Missing mandatory data consent checkboxes during registration, clear data retention policies UI, and "Download My Data" / "Right to be Forgotten" functional buttons in the Settings tab.

#### D. Live Tools & Reliability
*   **Edge Case Handling (WebRTC):** Missing robust fallback UI for when the child's device drops connection mid-stream or rejects the WebRTC offer due to Android OS restrictions.
*   **Ambient Mic Implementation:** The UI button exists ("Ambient Mic"), but the specific WebRTC `offer_mic` handling and audio-only stream rendering require refinement.

#### E. Error Handling & Feedback
*   **Global Error Boundaries:** Next.js `error.js` boundaries are basic. They need to display user-friendly messages (in simple Bangla/English) rather than technical stack traces.
*   **API Data Fetching:** The dashboard uses basic `useEffect` and `fetch`. It lacks a robust caching and retry mechanism (like SWR or React Query), leading to loading skeletons on every tab switch.

#### F. Scalability
*   **Rate Limiting:** `src/lib/api-utils.js` uses an in-memory `Map` for rate limiting. This will fail when deployed to a multi-instance serverless environment (like Vercel). It must be moved to Redis (e.g., Upstash).

---

## 4. Prioritized Task List

### CRITICAL PRIORITY

#### Task 1: Integrate Bangladeshi Payment Gateways (bKash, Nagad, Rocket)
*   **Description:** Implement secure payment flows using AmarPay or direct API integrations for bKash, Nagad, and Rocket to handle subscription purchases and renewals. Implement webhook listeners for transaction verification.
*   **Why:** Essential for monetization in the target market.
*   **Files Involved:** `src/app/api/subscriptions/route.js`, `src/app/api/webhooks/payment/route.js` (new), `src/app/dashboard/page.js` (Billing Tab).
*   **Effort:** Large
*   **Dependencies:** Proper DB schema for Transaction logs (exists, needs linking).
*   **Notes for Android coordination:** The Android app must cleanly reflect the updated subscription status pushed via Socket.IO immediately after a successful web payment.

#### Task 2: Implement Robust i18n (Bangla/English)
*   **Description:** Replace the hardcoded dictionary object with a standardized Next.js internationalization framework. Ensure all error messages, toasts, and API responses support dynamic language switching.
*   **Why:** A primary requirement for user accessibility and trust in Bangladesh.
*   **Files Involved:** `next.config.mjs`, `src/i18n.js` (new), `src/messages/bn.json` (new), `src/messages/en.json` (new), all UI components.
*   **Effort:** Medium
*   **Dependencies:** None.
*   **Notes for Android coordination:** None (UI only).

#### Task 3: Redis-based Rate Limiting & Session State
*   **Description:** Refactor the `rateLimit` function in `api-utils.js` to utilize a Redis database (e.g., Upstash) instead of an in-memory Map, ensuring it functions correctly in serverless deployments.
*   **Why:** In-memory rate limiting causes inconsistencies and memory leaks in production Node.js clusters or Vercel edge environments.
*   **Files Involved:** `src/lib/api-utils.js`, `.env` (add Redis URL).
*   **Effort:** Small
*   **Dependencies:** Provisioning a Redis instance.
*   **Notes for Android coordination:** The Android app must cleanly handle `HTTP 429 Too Many Requests` responses and implement exponential backoff for API retries.

### HIGH PRIORITY

#### Task 4: PDPO 2025 Compliance Features
*   **Description:** Add explicit consent checkboxes during registration ("I confirm I am the legal guardian..."). Implement a "Download Data Dump" and "Delete Account & All Data" flow in the Settings tab.
*   **Why:** Legal requirement for processing minors' data in Bangladesh by 2025.
*   **Files Involved:** `src/app/register/page.js`, `src/app/api/auth/register/route.js`, `src/app/api/profile/export/route.js` (new), `src/app/api/profile/delete/route.js` (new).
*   **Effort:** Medium
*   **Dependencies:** Task 2 (for translated legal text).
*   **Notes for Android coordination:** Account deletion triggered on the web must send an immediate un-pair/wipe command to the child device via Socket.IO before DB deletion.

#### Task 5: WebRTC Error Handling & Reconnection Flows
*   **Description:** Enhance `useWebRTC.js` and `LiveCameraModal.js` to handle ICE connection failures gracefully. Provide explicit, translated error messages if the child's phone is unreachable or permissions are denied.
*   **Why:** Live tools are the core value proposition; they must fail gracefully rather than freezing or crashing.
*   **Files Involved:** `src/hooks/useWebRTC.js`, `src/components/LiveCameraModal.js`, `server.js`.
*   **Effort:** Medium
*   **Dependencies:** None.
*   **Notes for Android coordination:** The Android service must emit specific error codes (e.g., `CAMERA_IN_USE`, `PERMISSION_DENIED`) via Socket.IO when rejecting a WebRTC offer, rather than silently failing.

#### Task 6: Progressive Web App (PWA) Configuration
*   **Description:** Create a comprehensive `manifest.json`, generate required Apple Touch Icons and Favicons, and configure the `@ducanh2912/next-pwa` plugin for offline caching and installation prompts.
*   **Why:** Allows parents to install the dashboard on their iOS/Android devices as a native-feeling app.
*   **Files Involved:** `next.config.mjs`, `public/manifest.json`, `public/icons/*`.
*   **Effort:** Small
*   **Dependencies:** None.
*   **Notes for Android coordination:** None.

### MEDIUM PRIORITY

#### Task 7: Data Fetching Optimization (SWR / React Query)
*   **Description:** Replace raw `fetch` and `useEffect` patterns in the dashboard with SWR or React Query. This provides caching, optimistic UI updates, and eliminates redundant loading states when switching tabs.
*   **Why:** Significantly improves the perceived performance and snappiness of the dashboard.
*   **Files Involved:** `src/app/dashboard/page.js`, `src/app/admin/page.js`.
*   **Effort:** Medium
*   **Dependencies:** None.
*   **Notes for Android coordination:** None.

#### Task 8: Ambient Mic Implementation Polish
*   **Description:** Ensure the WebRTC logic correctly handles audio-only streams (`offer_mic`). Build a dedicated UI visualizer (e.g., an animated waveform) for the Ambient Mic modal since there is no video feed.
*   **Why:** Completes the promised "Live Tools" suite.
*   **Files Involved:** `src/components/AmbientMicModal.js`, `src/hooks/useWebRTC.js`, `server.js`.
*   **Effort:** Medium
*   **Dependencies:** Android app must support audio-only WebRTC streaming.
*   **Notes for Android coordination:** The Android side must accept `offer_mic` and return a MediaStream containing only the microphone track, ensuring the screen/camera is not activated.

### LOW PRIORITY

#### Task 9: SMS & Email Notification Providers
*   **Description:** Connect real API keys (SSL Wireless for BD SMS, SendGrid for Email) in the backend to trigger real alerts for SOS, Geofence breaches, and registration Magic Links.
*   **Why:** Ensures urgent alerts reach the parent even if the PWA/Dashboard is closed.
*   **Files Involved:** `src/lib/notifications.js` (new), `src/app/api/alerts/route.js`.
*   **Effort:** Small
*   **Dependencies:** Purchasing API credits.
*   **Notes for Android coordination:** Android alerts (SOS/Geofence) trigger these notifications server-side; no direct changes needed on the device.

---

## 5. Production Readiness Checklist

**1. Reliability & Reconnection**
- [ ] Socket.IO heartbeat logic handles mobile network drops gracefully.
- [ ] Zombie connections are accurately cleared without false positives.
- [ ] WebRTC renegotiation handles switching between WiFi and Cellular.

**2. Error Handling & User Feedback**
- [ ] Global Error Boundary catches unexpected React crashes.
- [ ] API routes return standardized JSON error structures (`{ error: "...", code: "..." }`).
- [ ] UI displays toast notifications for all success/failure actions in simple language.

**3. UI/UX Polish & Bangla Language Support**
- [ ] Proper i18n library installed and configured.
- [ ] 100% coverage of Bangla translations across all dashboards, modals, and emails.
- [ ] UI does not break when switching between languages (text expansion handling).

**4. Performance & Loading Speed**
- [ ] Data fetching utilizes caching (SWR/React Query).
- [ ] Images and heavy components (Maps, WebRTC videos) are lazy-loaded.
- [ ] Prisma queries are optimized to prevent N+1 fetching problems.

**5. Security & Data Protection**
- [ ] Rate limiting is backed by Redis.
- [ ] CSRF protection (`checkCsrf`) is active on all state-mutating API routes.
- [ ] PDPO 2025 compliance flows (Consent, Data Deletion, Export) are functional.
- [ ] API routes strictly verify that parents can only access their own children's data.

**6. Mobile Responsiveness & PWA Readiness**
- [ ] Valid `manifest.json` and service worker registered.
- [ ] Dashboard is fully usable on screens as small as 320px (iPhone SE).
- [ ] "Add to Home Screen" prompt triggers correctly.

---

## 6. Recommended Development Roadmap

### Phase 1: Architecture & Stability (Weeks 1-2)
*   Implement standard i18n library (Task 2).
*   Refactor API Data Fetching to SWR/React Query (Task 7).
*   Migrate Rate Limiting to Redis (Task 3).
*   Configure PWA Manifest and Service Workers (Task 6).

### Phase 2: Core Integrations & Compliance (Weeks 3-4)
*   Integrate Bangladeshi Payment Gateways (bKash, Nagad) (Task 1).
*   Implement PDPO 2025 Compliance Features (Consent, Delete) (Task 4).
*   Connect SMS/Email Notification Providers (Task 9).

### Phase 3: Live Tools & Android Sync (Weeks 5-6)
*   *Requires close coordination with Android Developer.*
*   Refine WebRTC Error Handling & Reconnections (Task 5).
*   Polish Ambient Mic Implementation & UI (Task 8).
*   End-to-End testing of Socket.IO lifecycle (backgrounding, doze mode recovery).

### Phase 4: Polish & Launch (Week 7)
*   Complete Production Readiness Checklist.
*   Final QA testing across devices (iOS Safari, Android Chrome, Desktop).
*   Load testing WebRTC signaling server (`server.js`).

---

## 7. Technical Debt & Recommendations

1.  **State Management:** The current implementation passes props heavily between the main Dashboard layout and its tabs. Moving to a lightweight global state manager (like Zustand) or relying strictly on React Query cache for user data will clean up the codebase significantly.
2.  **Separate Signaling Server:** Currently, `server.js` hosts both the Next.js frontend application and the Socket.IO signaling server. As traffic scales, this will become a bottleneck. *Recommendation:* Extract the Socket.IO logic into a dedicated Node.js microservice (`signaling.fsafe.com`). This allows the Next.js frontend to be deployed serverlessly (e.g., on Vercel), while the stateful WebSocket server runs on a dedicated instance (e.g., AWS EC2 or DigitalOcean Droplet).
3.  **Database Connection Pooling:** Ensure Prisma uses a connection pooler (like PgBouncer) in production to prevent exhausting database connections during high traffic spikes.

---

## 8. Notes for Android Coordination

*(To be shared with the Android Development Team)*

**1. Authentication & Security (REST & WebSockets):**
*   **Pairing Flow:** The Android app receives a 6-digit cryptographic pairing code from the parent. It must submit this code to `POST /api/devices/pair` to receive a long-lived `deviceToken` (JWT).
*   **API Headers:** All subsequent REST API calls (like `/status` or `/alerts`) MUST include the header `Authorization: Bearer <deviceToken>`.
*   **Socket.IO Auth:** When initiating the Socket.IO connection, the `deviceToken` must be passed in the `auth` payload: `io("wss://fsafe.com", { auth: { token: "<deviceToken>" } })`.

**2. Required API Endpoints & Payloads:**
*   `POST /api/children/[id]/status`: Device must periodically send app usage stats, battery level, and current location.
    *   Payload: `{ batteryLevel: Int, latitude: Float, longitude: Float, locationName: String, ... }`
*   `POST /api/alerts`: Device must immediately trigger an alert for critical events (SOS, Geofence Exit, App Install).
    *   Payload: `{ childId: String, type: "SOS" | "GEOFENCE_EXIT" | "APP_INSTALL", title: String, description: String }`

**3. WebSocket/Socket.IO Events:**
*   The Android app must connect to `wss://fsafe.com/api/socketio` using `socket.io-client`.
*   **Must Emit:** `child_connect` (on startup/wakeup), `child_heartbeat` (every 30s to prevent zombie cleanup).
*   **Must Listen For:**
    *   `webrtc_signal` (Handle incoming WebRTC offers, generate answers, process ICE candidates).
    *   `remote_action` (Handle commands like `start_screen`, `stop_screen`, `switch_camera`).
    *   `ping_request` (Must immediately respond with `pong_parent` for latency checking).

**4. Data Formats (Live Tools):**
*   **Live Camera:** Standard WebRTC MediaStream (Video track). Must respect front/back camera switch requests.
*   **Live Mic (`offer_mic`):** WebRTC MediaStream (Audio track only). Must ensure video hardware is not engaged.
*   **Live Screen:** The web dashboard currently expects JPEG/WebP base64 frames emitted over Socket.IO (`screen_frame` event) rather than a WebRTC stream for screen sharing, to ensure compatibility with older Android versions.

**5. Permissions & Lifecycle:**
*   The Android service must be a Foreground Service to maintain the Socket.IO connection and respond to WebRTC offers while the device is locked or the app is in the background.
*   Must handle cases where Camera/Mic permissions are revoked by the OS and emit an appropriate `webrtc_error` back to the parent.