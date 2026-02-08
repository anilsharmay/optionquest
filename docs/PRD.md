# 📝 Product Requirements Document (PRD): OptionQuest

**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Project Lead:** User / Opencode  

---

## 1. Executive Summary
**OptionQuest** is a gamified educational platform designed to teach absolute beginners the mechanics and risks of options trading. By using real-time market data alongside a "Flight Simulator" environment, the app allows users to practice high-stakes scenarios (like Earnings and Volatility Crushes) with zero financial risk.

## 2. Target Audience
*   **Primary:** Retail stock investors who are "Option-Curious" but intimidated by jargon and risk.
*   **Persona:** "Sam," who has $5,000 in stocks but doesn't understand why an option loses value even if the stock price goes up.

## 3. User Stories
| ID | User Story |
| :--- | :--- |
| **US.1** | As a beginner, I want a "Plain English" toggle so I can understand the trade without deciphering technical jargon. |
| **US.2** | As a student, I want to simulate the passage of time on a trade so I can see how "Time Decay" (Theta) affects my money. |
| **US.3** | As a cautious investor, I want to "Protect my stocks" using a Put so I can see how insurance works in a crash. |
| **US.4** | As a gamer, I want to unlock new trading strategies only after I have proven I understand the risks through a quiz. |
| **US.5** | As a long-term user, I want to "Invest" more virtual cash and see my lifetime ROI against my total deposits. |

## 4. Functional Requirements
### **4.1 The Academy (LMS)**
*   **FR.1:** Markdown-based lesson viewer with support for images/diagrams.
*   **FR.2:** Interactive Quiz engine with "Plain English" toggle for jargon translation.
*   **FR.3:** **Level Locking:** Block "Sell" actions until Level 4. Hedge Lab locked until Level 5.

### **4.2 The Simulation Engine**
*   **FR.4:** **Live Data Sync:** Fetch stock prices and option chains via Yahoo Finance (cached 60s).
*   **FR.5:** **Black-Scholes Math:** Calculate theoretical P&L for "Time Machine" slider (0-30 days into future).
*   **FR.6:** **Virtual Wallet:** Start with $10k. "Emergency Fund" adds $5k if balance < $100.

### **4.3 The Trading Interface**
*   **FR.7:** **Dual-Theme Toggle:** Switch between "Light (Academy)" and "Dark (Pro Terminal)" modes.
*   **FR.8:** **Visual Payoff Diagrams:** Render a "Hockey Stick" graph for every potential trade.
*   **FR.9:** **Order Ticket:** Clear display of Max Profit, Max Loss, and Breakeven Price.

## 5. Non-Functional Requirements
*   **NFR.1 Performance:** Market data fetching must be optimized (caching) to avoid Yahoo Finance rate limits.
*   **NFR.2 Persistence:** User state (XP, Balance, Trades) must persist in a local SQLite database.
*   **NFR.3 Accessibility:** UI must be clear and readable in both Light and Dark themes.

## 6. User Flow
1.  **Onboarding:** User starts with $10,000 and Level 1 ("The Stock Hook").
2.  **Learning:** User reads Lesson 1 -> Passes Quiz -> Unlocks "Buying Calls."
3.  **Simulating:** User enters "The Terminal," picks AAPL, and uses the slider to see "What-If" scenarios.
4.  **Executing:** User places a "Paper Trade" using real market prices.
5.  **Monitoring:** Portfolio dashboard updates ROI in real-time.

## 7. Success Metrics
*   **Completion Rate:** % of users who reach Level 5 (The Pro Level).
*   **Engagement:** Number of "Time Machine" slider uses per session.
*   **Risk Awareness:** % of users who correctly identify an "IV Crush" scenario in the final exam.
