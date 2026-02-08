# Implementation Plan: UX & Connectivity Overhaul

**Goal:** Bridge the gaps between Academy (Learning) and Terminal (Doing) to fix the "disjointed" user experience.

## 1. Onboarding Flow (New Component)
**Objective:** Guide new users immediately upon first load.

### 1.1 Create `client/src/components/OnboardingModal.jsx`
-   **State:** Local state for `step` (1 to 3).
-   **Content:**
    -   **Step 1:** Welcome & Mission ("Learn Options Risk-Free").
    -   **Step 2:** The Tools ("Academy for theory, Terminal for practice").
    -   **Step 3:** Call to Action ("Start Lesson 1").
-   **Logic:**
    -   Check `user.hasOnboarded` (need to add this to DB or just localstorage for now? *Decision: LocalStorage for MVP to avoid DB schema change, or implied by `check if level == 1 and xp == 0`*).
    -   On close, redirect to `/academy`.

### 1.2 Modify `client/src/App.jsx`
-   Import and mount `<OnboardingModal />`.
-   Trigger it if `user.level === 1` and `completedLessons.length === 0`.

---

## 2. Academy-to-Terminal Connection
**Objective:** meaningful transition from theory to practice.

### 2.1 Update `client/src/utils/lessons.js`
Add a `practicalAction` object to lessons where applicable.
```javascript
// Example for 'intro_calls' lesson
practicalAction: {
  label: "Try Buying a Call",
  path: "/terminal",
  search: "?ticker=AAPL&action=buy_call"  // URL params to pre-fill terminal
}
```

### 2.2 Update `client/src/pages/Academy.jsx`
-   In the "Lesson Complete" (Feedback) view:
-   Check if `selectedLesson.practicalAction` exists.
-   If yes, render a secondary button: **"Go to Terminal: [Label]"**.
-   This button should navigate to `practicalAction.path` with the search params.

---

## 3. Active Quest Persistence
**Objective:** Remind users of their goal while in the Terminal.

### 3.1 Update `client/src/store/useStore.js`
-   Add `activeQuest` to the state.
-   Update `completeLesson` to *clear* the active quest.
-   Create action `startQuest(quest)` that sets the active quest.
-   **Trigger:** When opening a lesson in `Academy.jsx`, if it has a quest, call `startQuest`.

### 3.2 Create `client/src/components/QuestOverlay.jsx`
-   A small, semi-transparent overlay (bottom-right or top-center).
-   Visible ONLY on `/terminal` or `/portfolio`.
-   Displays: `activeQuest.title` and `activeQuest.instruction`.
-   Style: "Gamified" look (amber/gold border).

### 3.3 Modify `client/src/App.jsx`
-   Mount `<QuestOverlay />` globally (it will handle its own visibility logic based on route/state).

---

## 4. Hedge Lab & Visuals
**Objective:** Make the app feel more connected.

### 4.1 Update `client/src/pages/HedgeLab.jsx`
-   Visual polish: Make the "Locked" state look like a "Level 4 Clearance Required" security gate (cool UI) rather than a boring error message.
-   Add a progress bar showing "Current Level / Required Level".

### 4.2 Terminal Tweaks (`client/src/pages/Terminal.jsx`)
-   Read URL params (`ticker`, `action`) on mount.
-   If present, pre-select the ticker and strategy (e.g., if `action=buy_call`, switch tab to 'Long Call').

---

## Execution Order
1.  **Store & Data:** Update `useStore` and `lessons.js`.
2.  **Components:** Build `OnboardingModal` and `QuestOverlay`.
3.  **Pages:** Update `Academy` logic and `Terminal` param handling.
4.  **Polish:** Hedge Lab UI.
