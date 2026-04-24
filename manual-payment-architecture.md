# PoribarGuard BD: Hybrid Manual Payment System Architecture

## 1. Project Context
PoribarGuard BD is a parental control ecosystem. The target audience includes expatriates (Bangladeshis living abroad) who prefer manual payments via bKash/Nagad agents rather than direct card payments.

## 2. Core Objective
To implement a high-trust, manual payment verification flow where users submit transaction evidence and admins manually verify and activate subscriptions.

## 3. System Flow (The Lifecycle)
1.  **User Request:** User selects a plan -> Chooses 'Manual Payment' -> Receives bKash/Nagad instructions -> Sends money via agent -> Submits form (Last 3 digits + Screenshot).
2.  **Pending State:** Subscription status becomes `PENDING_VERIFICATION`. Access remains restricted but user sees a status badge.
3.  **Admin Review:** Admin receives request in 'Manual Payments' Directory -> Inspects screenshot & digits -> Matches with mobile wallet history.
4.  **Activation:** Admin clicks 'Approve' -> System updates `PaymentStatus` to `APPROVED` AND `SubscriptionStatus` to `ACTIVE` -> Sets `expiryDate` based on `packageId`.
5.  **Rejection:** Admin clicks 'Reject' -> Enters reason -> User notified to re-submit.

## 4. Technical Specifications

### A. Data Model (Relational Logic)
- **Payment Table:** `id`, `userId`, `packageId`, `method (ENUM)`, `amount`, `senderDigits`, `screenshotUrl`, `status (PENDING/APPROVED/REJECTED)`, `rejectionReason`, `createdAt`.
- **GlobalSettings Table:** `id`, `bkashNumber`, `nagadNumber`, `conversionRate` (if applicable).
- **Relationships:** A Payment belongs to a User and a Subscription Package.

### B. UI/UX Standards (The 'Palette' Agent Style)
- **Theme:** Strict Premium Dark Mode (Match existing `#0f172a` / `#1e293b` palette).
- **Consistency:** Reuse `Card`, `Table`, `Badge`, and `Modal` components from the current dashboard.
- **Accessibility:** ARIA labels for all inputs, loading spinners for async actions, and Toast notifications for feedback.
- **Support:** A persistent WhatsApp floating button on payment pages for real-time help.

### C. Security (The 'Sentinel' Agent Style)
- **Role-Based Access (RBAC):** Admin routes (`/admin/payments`) must be guarded.
- **Sanitization:** All user inputs (digits, reasons) must be sanitized to prevent XSS.
- **Validation:** Server-side validation to ensure `amount` is a positive number and `packageId` exists.

### D. Performance (The 'Bolt' Agent Style)
- **Image Optimization:** Use `next/image` for screenshots.
- **Cache Management:** Use `SWR` or `React Query` to `mutate` payment and subscription states instantly upon admin approval.

## 5. Global Admin Controls
- Admin must be able to update the official bKash/Nagad numbers via a 'Payment Settings' UI, which reflects globally on the user frontend.