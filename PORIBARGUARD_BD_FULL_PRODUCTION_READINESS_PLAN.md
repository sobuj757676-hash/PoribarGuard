# PORIBARGUARD BD — FULL PRODUCTION READINESS PLAN
### Web + Android Unified Master Roadmap
*Generated: 2026-03-04 | Single Source of Truth for all development*

---

## 1. Executive Summary

### Current Overall Status

PoribarGuard BD is an ambitious parental control platform designed for Bangladeshi expatriate parents monitoring their children remotely. The system consists of two projects:

- **Web Dashboard + Backend** (`fsafe.com`): Next.js 16 + Prisma + Socket.IO custom server
- **Android Child App** (`poribarguard-android`): Kotlin, WebRTC, Socket.IO, AccessibilityService

The core foundations are strong: authentication works end-to-end, device pairing is functional, the Socket.IO signaling infrastructure handles real-time events between parent and child, and three live tools (Camera, Mic, Screen View) have been built with considerable engineering effort. The app survives phone restarts via BootReceiver + WorkManager watchdog, and stealth mode (icon hiding) is implemented.

However, the project is not yet production-ready. Several dashboard features display mocked/placeholder data, critical Android features (Location, Geofencing, App Usage Tracking, SOS) are not implemented, there is no real payment gateway, and reliability under Bangladesh's challenging network conditions needs extensive hardening.

### Production Readiness Scores

| Area | Web Score | Android Score | Combined |
|------|-----------|---------------|----------|
| **Authentication & Pairing** | 8/10 | 8/10 | **8/10** |
| **Live Tools (Camera/Mic/Screen)** | 7/10 | 7/10 | **7/10** |
| **Location & Geofencing** | 3/10 | 0/10 | **1.5/10** |
| **App Controls & Usage** | 4/10 | 0/10 | **2/10** |
| **Alerts & Notifications** | 4/10 | 0/10 | **2/10** |
| **Reports & Analytics** | 3/10 | 0/10 | **1.5/10** |
| **Billing & Monetization** | 2/10 | N/A | **2/10** |
| **Stealth & Background** | N/A | 7/10 | **7/10** |
| **UI/UX & Bangla** | 7/10 | 5/10 | **6/10** |
| **Reliability (BD conditions)** | 5/10 | 6/10 | **5.5/10** |

**Overall Combined Score: 4.5 / 10**

> [!IMPORTANT]
> The live tools architecture is the strongest part of the project. However, the majority of the "parental control" features (location tracking, app blocking, geofencing, usage reports, SOS alerts) exist only as database schemas and UI skeletons — the Android app does not implement any of these yet.

---

## 2. Currently Working Features (End-to-End)

These features work fully from Android → Server → Dashboard:

| # | Feature | Android | Server | Web | Status |
|---|---------|---------|--------|-----|--------|
| 1 | **Device Pairing** | `PairingApiClient.kt` → `POST /api/devices/pair` | API route validates code, creates device | Dashboard generates 6-digit code, polls for status | ✅ Working |
| 2 | **Parent Auth** | N/A | NextAuth v5 Credentials Provider | Login, Register, Session, Role-based routing | ✅ Working |
| 3 | **Child Onboarding** | 4-step `SetupActivity`: Pair → Consent → Permissions → Stealth | N/A | AddChildWorkflow component | ✅ Working |
| 4 | **Socket.IO Connection** | `SignalingClient.kt` connects, heartbeat every 30s | `server.js` tracks `onlineDevices` + zombie cleanup | `SocketContext.js` connects on session | ✅ Working |
| 5 | **Live Camera** | `PoribarGuardCameraService` → WebRTC video stream | Relays offers/answers/ICE via Socket.IO | `LiveCameraModal` + `useWebRTC` hook | ✅ Working |
| 6 | **Live Ambient Mic** | `PoribarGuardMicService` → WebRTC audio-only stream | Relays `offer_mic` events | `AmbientMicModal` + `useWebRTC(audio=true)` | ✅ Working |
| 7 | **Live Screen View** | `PoribarGuardScreenService` → AccessibilityService screenshots | Relays base64 JPEG frames via Socket.IO | `LiveScreenModal` displays frames | ✅ Working (recently fixed) |
| 8 | **Boot Persistence** | `BootReceiver` starts SignalingService on reboot | N/A | N/A | ✅ Working |
| 9 | **Service Watchdog** | `SignalingWatchdogWorker` + `ServiceAliveWorker` via WorkManager | N/A | N/A | ✅ Working |
| 10 | **Stealth Mode** | `hideAppIcon()` in SetupActivity removes launcher icon | N/A | N/A | ✅ Working |
| 11 | **Admin Panel** | N/A | Admin API routes | Admin dashboard with stats, parent list, content filters, tickets | ✅ Working (basic) |
| 12 | **Encrypted Storage** | `PreferencesManager` uses EncryptedSharedPreferences | N/A | N/A | ✅ Working |

---

## 3. Incomplete, Missing & Partially Implemented Features

### A. Location & Geofencing

| Feature | Web Status | Android Status | Gap |
|---------|-----------|---------------|-----|
| **Real-time Location Tracking** | DB schema exists (`Device.latitude/longitude`), MapTab UI exists but shows placeholder | **Not implemented** — no location service | Android needs `LocationService` that periodically sends GPS coordinates to server |
| **Geofencing** | DB schema exists (`GeofenceZone`), API route exists | **Not implemented** | Android needs `GeofencingClient` to monitor enter/exit events |
| **Location History** | No API route | **Not implemented** | Both need `LocationHistory` model + API + UI timeline |

### B. App Controls & Usage Monitoring

| Feature | Web Status | Android Status | Gap |
|---------|-----------|---------------|-----|
| **App Usage Tracking** | DB schema exists (`AppControl.usageToday`), `PACKAGE_USAGE_STATS` permission declared | **Not implemented** | Android needs `UsageStatsManager` integration + periodic reporting |
| **App Blocking** | DB schema + API toggle exists | **Not implemented** | Android needs `AccessibilityService`-based app blocker or `DevicePolicyManager` |
| **App Install Alerts** | Alert type defined | **Not implemented** | Android needs `PackageInstallReceiver` |
| **Prayer Time Lock** | DB schema exists (`PrayerTimeLock`) | **Not implemented** | Android needs scheduled device lock functionality |

### C. Alerts & Notifications

| Feature | Web Status | Android Status | Gap |
|---------|-----------|---------------|-----|
| **SOS Button** | Alert type defined in UI | **Not implemented** | Android needs SOS trigger (e.g., volume button pattern) |
| **Low Battery Alert** | Alert type defined | **Not implemented** | Android needs battery level monitor that triggers alert |
| **Tamper Detection** | Alert type defined | **Not implemented** | Android needs detection of accessibility service disabling, app force-stop etc. |
| **Push Notifications** | Not implemented | Not implemented | Both need FCM integration for offline parent alerting |
| **SMS/Email Alerts** | Not implemented | N/A | Server needs real SMS provider (SSL Wireless) and email (SendGrid) |

### D. Reports & Analytics

| Feature | Web Status | Android Status | Gap |
|---------|-----------|---------------|-----|
| **Screen Time Reports** | `ReportsTab` exists with CSV download — but data is mocked | **Not implemented** | Android must send daily usage summaries |
| **Weekly/Monthly Reports** | UI skeleton | N/A | Server needs aggregation queries |
| **Content Filter Enforcement** | Admin can create `ContentFilter` entries | **Not implemented** | Android needs DNS-based or VPN-based content blocking |

### E. Billing & Monetization

| Feature | Web Status | Android Status | Gap |
|---------|-----------|---------------|-----|
| **Payment Gateway** | DB schema (`Subscription`, `Transaction`), Billing tab exists | N/A | No real bKash/Nagad/Rocket/AmarPay integration |
| **Subscription Enforcement** | `Subscription` model has `status` field | N/A | No enforcement — expired subs still work |
| **Auto-Renewal** | Schema has `autoRenew` field | N/A | No webhook handling |

### F. Infrastructure & Quality

| Feature | Current State | Gap |
|---------|--------------|-----|
| **Rate Limiting** | In-memory `Map` in `api-utils.js` | Must migrate to Redis (Upstash) for multi-instance |
| **Data Caching** | Raw `useEffect` + `fetch` | Need SWR or React Query for caching + retry |
| **PWA** | `@ducanh2912/next-pwa` in deps but no `manifest.json` | Need proper PWA manifest + icons + offline page |
| **Error Boundaries** | Basic `error.js` exists | Need user-friendly messages in Bangla |
| **PDPO 2025 Compliance** | Not implemented | Need consent checkboxes, data export, account deletion |
| **TURN Server** | Uses Google's free STUN only | Need paid TURN server for reliable WebRTC behind NAT |

---

## 4. Prioritized Task List

### 🔴 CRITICAL PRIORITY — Must Have for Any Launch

---

#### Task 1: Android Location Service + Real-Time Tracking

**Description:** Build a `PoribarGuardLocationService` that runs as a foreground service, collects GPS coordinates using `FusedLocationProviderClient`, and periodically sends location updates to the server via REST API (`POST /api/children/[id]/status`). The web dashboard's `MapTab` must display the real location on an embedded map (Leaflet or Google Maps).

**Why:** Location is the #1 feature parents expect. Without it, the app has no core value beyond live tools.

**Files Involved:**
- **Android:** `core/PoribarGuardLocationService.kt` [NEW], `AndroidManifest.xml`
- **Web:** `src/app/api/children/[id]/status/route.js` [MODIFY], `src/app/[locale]/dashboard/page.js` (MapTab)
- **Server:** `server.js` (relay location via Socket.IO for real-time update)

**Effort:** Large
**Dependencies:** `ACCESS_FINE_LOCATION` permission (already declared in Manifest)
**Coordination:** Android sends `{ latitude, longitude, batteryLevel, networkType }` via REST; server also pushes to dashboard via Socket.IO `child_location_update`.

---

#### Task 2: Android App Usage Tracking

**Description:** Use Android's `UsageStatsManager` to collect daily app usage statistics (which apps used, for how long). Send a daily summary to the server. The dashboard's `ReportsTab` must display real data instead of mocked charts.

**Why:** Screen time and app usage reporting is a core parental control feature and the main selling point for daily engagement.

**Files Involved:**
- **Android:** `core/PoribarGuardUsageService.kt` [NEW], `AndroidManifest.xml`
- **Web:** `src/app/api/children/[id]/usage/route.js` [NEW], `ReportsTab` in dashboard

**Effort:** Medium
**Dependencies:** `PACKAGE_USAGE_STATS` permission (already declared)
**Coordination:** Android collects usage via `UsageStatsManager.queryUsageStats()` and sends via REST API.

---

#### Task 3: SOS Emergency Alert System

**Description:** Implement an SOS trigger on the child's Android device (e.g., pressing volume-up 5x rapidly) that immediately sends a `CRITICAL` alert to the server, which pushes it to the parent's dashboard in real-time and (eventually) via SMS/push notification.

**Why:** Child safety is the ultimate priority. SOS is a must-have for any parental control app.

**Files Involved:**
- **Android:** `core/SOSTrigger.kt` [NEW] or integrate into `PoribarGuardSignalingService`
- **Web:** `src/app/api/alerts/route.js` [MODIFY], dashboard FeedTab
- **Server:** `server.js` — relay `sos_alert` event to parent

**Effort:** Medium
**Dependencies:** None
**Coordination:** Android emits `sos_alert` via Socket.IO + REST backup. Server relays to parent dashboard immediately.

---

#### Task 4: Geofencing Implementation

**Description:** Use Google's `GeofencingClient` on Android to monitor predefined zones (Home, School, Mosque). When the child enters or exits a zone, emit an alert to the server. The web dashboard must allow parents to create/edit geofence zones on a map.

**Why:** Parents want to know when their child leaves home or arrives at school.

**Files Involved:**
- **Android:** `core/PoribarGuardGeofenceService.kt` [NEW], `core/GeofenceBroadcastReceiver.kt` [NEW]
- **Web:** `src/app/api/geofences/route.js` [MODIFY], MapTab (draw circles on map)
- **Prisma:** `GeofenceZone` model (already exists)

**Effort:** Large
**Dependencies:** Task 1 (Location Service must work first)
**Coordination:** Web creates geofences via API → server pushes to child via Socket.IO → Android registers with `GeofencingClient`.

---

#### Task 5: TURN Server for Reliable WebRTC

**Description:** Currently, WebRTC only uses Google's free STUN servers. In Bangladesh, many ISPs use CGNAT (multiple users behind one public IP), which means STUN fails frequently. A TURN relay server is required for reliable connections.

**Why:** Without TURN, Live Camera and Ambient Mic will fail for ~30-40% of Bangladeshi users behind restrictive NATs.

**Files Involved:**
- **Android:** `webrtc/WebRTCManager.kt` — add TURN server credentials to ICE config
- **Web:** `src/hooks/useWebRTC.js` — add TURN server credentials

**Effort:** Small (code change) + requires provisioning a TURN server (Twilio TURN, Metered.ca, or self-hosted coturn)
**Dependencies:** TURN server account/credentials
**Coordination:** Both Android and Web must use the same TURN credentials.

---

### 🟠 HIGH PRIORITY — Required for a Respectable Product

---

#### Task 6: App Blocking & Control Enforcement (Android)

**Description:** Implement app blocking on the child's device. When a parent blocks an app in the dashboard, the command is pushed via Socket.IO to the child. The Android app uses `AccessibilityService` to detect app launches and block them by overlaying a "blocked" screen or navigating back to home.

**Why:** App blocking is a defining feature of any parental control app.

**Files Involved:**
- **Android:** `core/PoribarGuardScreenService.kt` [MODIFY — add app detection], or `core/AppBlockerService.kt` [NEW]
- **Web:** `src/app/api/children/[id]/apps/route.js` (already exists), ControlsTab
- **Server:** `server.js` — relay `block_app` / `unblock_app` commands

**Effort:** Large
**Dependencies:** None
**Coordination:** Web sends `{ packageName, isBlocked }` → server relays to child → Android blocks via AccessibilityService.

---

#### Task 7: Push Notifications (FCM)

**Description:** Implement Firebase Cloud Messaging for sending push notifications to the parent's device/browser when critical alerts occur (SOS, Geofence exit, Tamper) even when the dashboard is closed.

**Why:** Parents must be alerted immediately, even if the PWA/browser is closed.

**Files Involved:**
- **Android:** `build.gradle.kts` (add Firebase), `core/PoribarGuardFCMService.kt` [NEW]
- **Web:** `src/app/api/notifications/push/route.js` [NEW], service worker for web push
- **Server:** Add FCM admin SDK to `server.js` or a dedicated notification service

**Effort:** Medium
**Dependencies:** Firebase project setup
**Coordination:** Server-side dispatch to both web push and Android FCM.

---

#### Task 8: Tamper Detection (Android)

**Description:** Detect when the child attempts to disable the AccessibilityService, force-stop the app, revoke permissions, or uninstall the app. Send an immediate `TAMPER` alert to the parent.

**Why:** Tech-savvy teenagers will try to disable the monitoring. The app must detect and report this.

**Files Involved:**
- **Android:** `core/TamperDetector.kt` [NEW], `core/PoribarGuardSignalingService.kt` [MODIFY]
- **Web:** FeedTab displays TAMPER alerts
- **Server:** Relay `tamper_alert` event

**Effort:** Medium
**Dependencies:** None
**Coordination:** Android detects tampering → emits alert via Socket.IO → parent sees alert in dashboard.

---

#### Task 9: Low Battery & Status Reporting (Android)

**Description:** Implement periodic device status reporting: battery level, network type (WiFi/4G/3G/2G), screen on/off state, storage capacity. Send to server every 5 minutes via REST and update in real-time via Socket.IO heartbeat.

**Why:** Parents need to see the child's phone status at a glance.

**Files Involved:**
- **Android:** `core/DeviceStatusReporter.kt` [NEW] or extend `SignalingClient.kt` heartbeat payload
- **Web:** Dashboard HomeTab (battery/network indicators)
- **Server:** Store last status in `onlineDevices` map for Socket.IO, plus persist to DB

**Effort:** Small
**Dependencies:** None
**Coordination:** Extend the existing `child_heartbeat` event payload to include `{ batteryLevel, networkType, isScreenOn }`.

---

#### Task 10: PWA Configuration

**Description:** Create a proper `manifest.json`, generate app icons (multiple sizes), configure the service worker for offline caching, and ensure the "Add to Home Screen" prompt works correctly on both iOS Safari and Android Chrome.

**Why:** Parents need the dashboard to feel like a real app on their phone.

**Files Involved:**
- **Web:** `public/manifest.json` [NEW], `public/icons/*` [NEW], `next.config.mjs` [MODIFY]

**Effort:** Small
**Dependencies:** None
**Coordination:** None (web-only).

---

### 🟡 MEDIUM PRIORITY — Polish & Monetization Readiness

---

#### Task 11: Robust i18n (Bangla/English)

**Description:** Replace the hardcoded dictionary approach with `next-intl` (already partially configured — `src/i18n.js` and `src/messages/` exist). Ensure 100% coverage of all UI strings in both English and Bangla, including error messages and toasts.

**Effort:** Medium | **Dependencies:** None

---

#### Task 12: Data Fetching Optimization (SWR / React Query)

**Description:** Replace raw `fetch` + `useEffect` patterns with SWR or React Query for caching, background revalidation, and retry logic. Currently, every tab switch triggers a full re-fetch.

**Effort:** Medium | **Dependencies:** None

---

#### Task 13: Redis-based Rate Limiting

**Description:** Migrate the in-memory rate limiter in `api-utils.js` to Redis (Upstash) for production reliability.

**Effort:** Small | **Dependencies:** Redis/Upstash account

---

#### Task 14: PDPO 2025 Compliance

**Description:** Add consent checkboxes during registration, "Download My Data" button, and "Delete Account & All Data" flow in Settings.

**Effort:** Medium | **Dependencies:** Task 11 (for translated legal text)

---

#### Task 15: Prayer Time Auto-Lock

**Description:** Implement scheduled device locking during prayer times. Parents configure times in dashboard; Android locks the device during those windows.

**Effort:** Medium | **Dependencies:** Task 6 (App Blocking foundation)

---

### 🟢 LOW PRIORITY — Later Phase

---

#### Task 16: Payment Gateway Integration (bKash, Nagad, Rocket)

**Description:** Integrate AmarPay or direct APIs for bKash, Nagad, Rocket payments. Handle subscription lifecycle, webhook verification, auto-renewal.

**Effort:** Large | **Dependencies:** AmarPay/SSLCommerz sandbox account

---

#### Task 17: SMS & Email Notifications

**Description:** Connect real SMS (SSL Wireless/BulkSMS BD) and email (SendGrid/Resend) providers for alerts.

**Effort:** Small | **Dependencies:** API credits

---

#### Task 18: Content Filtering (DNS/VPN)

**Description:** Enforce content filters (domains/keywords) from Admin panel on child devices using local VPN or DNS-based filtering.

**Effort:** Large | **Dependencies:** Complex Android VPN implementation

---

## 5. Production Readiness Checklist

### Reliability After First Install
- [x] App survives phone restart (BootReceiver restarts SignalingService)
- [x] WorkManager watchdog ensures SignalingService stays alive
- [x] Heartbeat every 30 seconds proves socket liveness
- [x] Zombie cleanup removes stale connections after 90 seconds
- [ ] App survives app updates without losing pairing
- [ ] App survives battery optimization (Doze mode) on all OEMs (Xiaomi, Samsung, Oppo)
- [ ] SignalingService reconnects after hours of no network (village power cuts)
- [ ] Live tools work after network switch (WiFi ↔ Cellular)

### Battery & Network Optimization
- [x] WebRTC adaptive bitrate (`adjustBitrate` in WebRTCManager)
- [x] Screen capture uses adaptive FPS (1-2 FPS with backoff)
- [x] Mic service has 10-minute failsafe timer
- [x] Camera uses `START_NOT_STICKY` (doesn't restart forever)
- [ ] Location service uses `PRIORITY_BALANCED_POWER_ACCURACY` for battery savings
- [ ] Heartbeat interval increases when on cellular vs WiFi
- [ ] Usage stats batch upload (not per-app)

### Error Handling & User Feedback
- [x] WebRTC has exponential backoff for ICE failures
- [x] useWebRTC hook has `MAX_RETRIES = 3` with backoff
- [x] Screen capture has exponential backoff on `errorCode=3`
- [ ] Global error boundary shows Bangla error messages
- [ ] Dashboard shows toast notifications for all actions
- [ ] Android emits specific error codes (`CAMERA_IN_USE`, `PERMISSION_DENIED`)

### Security & Stealth (Android)
- [x] `hideAppIcon()` removes app from launcher
- [x] `EncryptedSharedPreferences` for pairing credentials
- [x] Transparent activities (`excludeFromRecents=true`)
- [x] Low-priority notifications (don't show in notification shade prominently)
- [ ] Device Admin for anti-uninstall protection
- [ ] Tamper detection (accessibility service disabled, permissions revoked)
- [ ] App name disguised in Settings (e.g., "System Service")

### UI/UX + Bangla Support
- [x] Dashboard responsive design with sidebar + bottom nav
- [x] Language switcher exists
- [x] `next-intl` partially configured
- [ ] 100% Bangla translation coverage
- [ ] UI tested for Bangla text expansion (buttons, labels)
- [ ] Offline fallback page for PWA

### Compliance (PDPO 2025)
- [ ] "I am the legal guardian" consent checkbox on registration
- [ ] Clear data retention policy displayed
- [ ] "Download My Data" functional endpoint
- [ ] "Delete Account & All Data" with cascade delete + Socket.IO un-pair command

---

## 6. Recommended Development Roadmap

### Phase 1: Core Android Features (Weeks 1-2)
> **Focus: Make the Android app actually useful as a parental control tool**

| Week | Tasks | Project |
|------|-------|---------|
| 1 | **Task 1** (Location Service) + **Task 9** (Battery/Status Reporting) | Android |
| 1 | **Task 3** (SOS Alert) | Android + Web |
| 2 | **Task 2** (App Usage Tracking) | Android |
| 2 | **Task 5** (TURN Server) | Android + Web |

### Phase 2: Protection Features (Weeks 3-4)
> **Focus: Enforcement and alerting**

| Week | Tasks | Project |
|------|-------|---------|
| 3 | **Task 4** (Geofencing) | Android + Web |
| 3 | **Task 8** (Tamper Detection) | Android |
| 4 | **Task 6** (App Blocking) | Android + Web |
| 4 | **Task 10** (PWA) | Web |

### Phase 3: Polish & Engagement (Weeks 5-6)
> **Focus: Quality, localization, and parent experience**

| Week | Tasks | Project |
|------|-------|---------|
| 5 | **Task 11** (i18n) + **Task 14** (PDPO Compliance) | Web |
| 5 | **Task 12** (Data Fetching Optimization) | Web |
| 6 | **Task 7** (FCM Push Notifications) | Both |
| 6 | **Task 15** (Prayer Time Lock) | Android |

### Phase 4: Monetization & Launch (Weeks 7-8)
> **Focus: Revenue and go-to-market**

| Week | Tasks | Project |
|------|-------|---------|
| 7 | **Task 16** (Payment Gateways) | Web |
| 7 | **Task 13** (Redis Rate Limiting) | Web |
| 8 | **Task 17** (SMS/Email Alerts) | Web |
| 8 | Final QA, Load Testing, Submission | Both |

---

## 7. Technical Debt & Recommendations

### 1. State Management (Web)
The dashboard page (`page.js`) is **986 lines** with heavy prop drilling between 8+ tabs. Recommendation: Extract each tab into its own file and use Zustand or React Query's cache for shared state.

### 2. Separate Signaling Server
Currently, `server.js` hosts both Next.js and Socket.IO on the same process. For production scale:
- Deploy **Next.js** on Vercel (free, auto-scaling, edge CDN)
- Deploy **Socket.IO** on a dedicated Render/Railway/EC2 instance

This is already partially addressed (currently deployed on Render together), but for scale they should be separated.

### 3. Database Connection Pooling
Prisma connects directly to Neon PostgreSQL. Under load, this will exhaust connection limits. Use Neon's built-in connection pooler (`?pgbouncer=true` in the connection string).

### 4. Android Service Architecture
All services (Camera, Mic, Screen, Location, Usage, Geofence) use separate foreground notifications. On Android 14+, there are strict limits on foreground service types. Consider consolidating into fewer services to reduce notification clutter and permission complexity.

### 5. WebRTC Session Lifecycle
Currently, each WebRTC session creates a new `WebRTCManager` instance. If the parent rapidly starts/stops streams, there's a risk of resource leaks (EglBase, PeerConnectionFactory). Consider pooling or strictly reference-counting these resources.

### 6. Missing API Authentication for Device Endpoints
`PairingApiClient.kt` stores a `deviceToken`, but the Android app currently does **not** pass this token in the `Authorization` header for any subsequent API calls. All device→server REST calls should be authenticated.

### 7. Android App Custom Icon & Name
The app currently uses `@android:drawable/sym_def_app_icon` (Android default icon). For production, a proper app icon and branded name must be created.

---

## 8. Notes for Android-Web Coordination

### Socket.IO Event Contract

#### Events Android MUST Emit:
| Event | Payload | When |
|-------|---------|------|
| `child_connect` | `{ childId }` | On service start / reconnect |
| `child_heartbeat` | `{ childId, timestamp, batteryLevel, networkType, isScreenOn }` | Every 30 seconds |
| `webrtc_signal` type=`answer` | `{ parentSocketId, sdp }` | After receiving WebRTC offer |
| `ice_candidate` | `{ targetSocketId, childId, candidate }` | During ICE negotiation |
| `screen_frame` | `{ childId, frame }` (base64 JPEG) | During screen capture |
| `screen_status` | `{ childId, status, message }` | Screen capture state changes |
| `webrtc_telemetry` | `{ childId, durationSeconds, batteryDropPercent }` | After session ends |
| `sos_alert` | `{ childId, location }` | **[NEW]** SOS triggered |
| `location_update` | `{ childId, latitude, longitude, accuracy, speed }` | **[NEW]** Periodic GPS |
| `tamper_alert` | `{ childId, type, details }` | **[NEW]** Tampering detected |

#### Events Android MUST Listen For:
| Event | Payload | Action |
|-------|---------|--------|
| `remote_action` type=`offer` | `{ parentSocketId, sdp }` | Start Camera WebRTC |
| `remote_action` type=`offer_mic` | `{ parentSocketId, sdp }` | Start Mic WebRTC |
| `remote_action` type=`start_screen` | `{}` | Start screenshot capture |
| `remote_action` type=`stop` | `{}` | Stop Camera/Mic |
| `remote_action` type=`stop_screen` | `{}` | Stop screenshot capture |
| `remote_action` type=`switch_camera` | `{}` | Switch front/back camera |
| `remote_action` type=`block_app` | `{ packageName }` | **[NEW]** Block an app |
| `remote_action` type=`unblock_app` | `{ packageName }` | **[NEW]** Unblock an app |
| `remote_action` type=`update_geofences` | `{ zones: [...] }` | **[NEW]** Update geofence list |
| `ping_request` | `{}` | Respond with `pong_parent` |

### REST API Endpoints (Android → Server)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/devices/pair` | Initial pairing | Pairing code |
| POST | `/api/children/[id]/status` | **[NEW]** Send location + battery + status | Device token |
| POST | `/api/children/[id]/usage` | **[NEW]** Send app usage data | Device token |
| POST | `/api/alerts` | **[EXISTING]** Send alerts (SOS, Geofence, Tamper) | Device token |

### WebRTC Configuration (Both Must Match)

```javascript
// ICE Servers — MUST be identical on both sides
const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // TURN servers [MUST ADD for production]:
    // { urls: "turn:your-turn-server.com:3478", username: "user", credential: "pass" }
];
```

---

## Final Notes

This document replaces the earlier `PORIBARGUARD_BD_WEB_PRODUCTION_READINESS_PLAN.md` as the single source of truth. The key insight from this analysis is:

> **The live streaming infrastructure (Camera, Mic, Screen) is impressively complete. But the bread-and-butter parental control features (Location, Geofencing, App Usage, App Blocking, SOS, Alerts) only exist as database schemas and UI skeletons. The Android app needs significant new services to become a real parental control product.**

The recommended approach is to build the Android features first (Phase 1-2), then polish the web experience (Phase 3), and finally add monetization (Phase 4).
