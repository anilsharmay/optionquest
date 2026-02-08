# OptionQuest: Changes Log

---

## ✅ Completed (Recent Session)

### 1. Duplicate `toggleTheme` in useStore
- **Fix:** Removed duplicate function. Theme now persists correctly to `localStorage`.

### 2. Typo: "EXCUTE TRADE"
- **Fix:** Fixed to "EXECUTE TRADE" in Terminal order ticket.

### 3. Option Position Valuation
- **Fix:** Backend now fetches option chains to get actual `lastPrice` for contract valuation. No longer uses stock price for options.

### 4. Plain English in Quiz
- **Fix:** Added `friendlyQuestion` support to `lessons.js`. Academy now shows simplified questions/options when Jargon is disabled.

### 5. Education Bailout
- **Feature:** Portfolio now detects when a user is out of cash and offers a $5,000 "Emergency Fund" via a toast notification and action button.

---

## 🚨 Recommended Fixes (Code Review)

### 10. Critical Race Condition in Transactions
- **Issue:** `BEGIN TRANSACTION` (Deferred) allows multiple users to read the same balance before writing, leading to negative balances.
- **Fix:** Change to `BEGIN IMMEDIATE TRANSACTION` in `server/index.js` for all consistent read/write operations (deposit, buy, sell).

### 11. Security: Blind Trust of Client Inputs
- **Issue:** `server/index.js` accepts `entryPrice` and `strike` directly from the client. Malicious users can buy options for $0.01.
- **Fix:** Validation layer must fetch the real-time Option Chain from Yahoo Finance to verify the `entryPrice` is within a valid range (e.g. ±5% of Last/Ask) before executing the trade.

### 12. Performance: Missing Database Indices
- **Issue:** Foreign keys (`user_id`) in `positions` and `transactions` tables are not indexed, causing full table scans.
- **Fix:** Add `CREATE INDEX` statements in `server/db.js` for these columns.

### 13. Scalability: Hardcoded User ID
- **Issue:** Frontend stores hardcode `fetchUser(1)`.
- **Fix:** Refactor `useStore.js` to accept a dynamic user ID or implement a basic `authContext`.

---

## ⏳ Future Improvements (Remaining)

### 6. Simulation Quiz Tasks (FR.2)
- **Status:** Partially implemented with "Active Quest" visuals in Academy. Full sandbox mode deferred.

### 7. Authentication
- **Status:** Deferred. User ID remains hardcoded as 1.

### 8. Images in lessons
- **Status:** Deferred. Need diagram assets.

### 9. Covered Call simulation
- **Status:** Deferred. Needs logic for validating 100 shares ownership before selling calls.
