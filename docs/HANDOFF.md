# 📦 OptionQuest: Project Handoff Package

## 1. Project Vision
**OptionQuest** is a gamified, real-market simulator designed for absolute beginners who understand stocks but are intimidated by options. It bridges the gap between theoretical knowledge and practical execution using real-time data and "Flight Simulator" style scenarios.

*   **Target User:** Beginner Stock Investors.
*   **The Hook:** "Learn to trade options without the jargon, using real market data and 0% financial risk."
*   **The Goal:** Complete the "Academy" to unlock advanced strategies and a "Pro" trading terminal.

---

## 2. Product Features
### **A. Dual-Theme Interface**
*   **The Classroom (Light Mode):** Friendly, high-guidance, Duolingo-style UI. Focuses on tutorials and simple cards.
*   **The Terminal (Dark Mode):** Professional, high-density, "Fintech" aesthetic. Focuses on charts and rapid execution.
*   **Plain English Mode:** A global toggle that translates jargon (e.g., "Premium" → "Cost of Bet", "Strike" → "Target Price").

### **B. The Trade Engine (Real Market + Math)**
*   **Real Data Oracle:** Integrates with `yahoo-finance2` for real-time stock prices and full option chains (AAPL, TSLA, NVDA, SPY, MSFT, etc.).
*   **The Time Machine:** A slider allowing users to simulate the effect of **Time Decay (Theta)** and **Price Movement** on an open or theoretical position using the Black-Scholes model.
*   **Investment Tracking:** Users can "Invest" more virtual cash (Top-ups) and track **Lifetime ROI** (Total Invested vs. Current Portfolio Value).

### **C. Gamification Mechanics**
*   **Level Locking:** Strategies (Puts, Spreads, Covered Calls) are locked until the corresponding Academy module is passed.
*   **The Education Bailout:** If a user loses their virtual balance, they unlock a "Risk Management" lesson. Passing the quiz grants a $2,000 "Reset Grant."
*   **XP & Badges:** Earned for completing lessons, placing successful hedges, and surviving "Earnings Events."

---

## 3. Technical Architecture
*   **Stack:** Vite + React + Tailwind CSS (Frontend), Node.js + Express (Backend), SQLite3 (Persistence).
*   **Libraries:**
    *   `yahoo-finance2`: Real-time market data.
    *   `black-scholes`: Option price modeling for simulation.
    *   `framer-motion`: Theme transitions and animations.
    *   `recharts` / `lightweight-charts`: Payoff diagrams and stock price action.
*   **Database Schema:**
    *   `users`: XP, Level, Balance, Theme Preference.
    *   `investments`: History of cash "deposits" (Starting $10k + top-ups).
    *   `positions`: Ticker, Contract Type, Strike, Expiry, EntryPrice, Quantity.
    *   `completed_lessons`: Track which modules are unlocked.

---

## 4. The Academy: Curriculum & Practical Scenarios
The coding agent must implement these **Scenarios** as interactive "Quests."

| Module | Title | Practical Quest |
| :--- | :--- | :--- |
| **1** | **The Multiplier** | Calculate why a $2.50 option costs $250. No trade allowed until calculated correctly. |
| **2** | **Bullish Bets** | Pick a Call on AAPL. Use the "Time Machine" to see profit if stock rises $5. |
| **3** | **IV Crush** | **The NVIDIA Trap:** Buy a Call 1 day before earnings. Fast-forward to "Post-Earnings." Watch value drop despite stock rising. |
| **4** | **The Shield** | **Protective Put:** Buy a Put for a simulated $10k SPY portfolio. Trigger a "Market Correction" and see the portfolio value stay flat. |
| **5** | **The Clock** | **Theta Decay:** Buy a 0DTE option. Slide the time forward 4 hours and watch the value "melt" while stock price stays still. |
| **6** | **Income** | **Covered Call:** Simulate owning 100 shares of MSFT and "selling" a call to collect rent. |

---

## 5. Implementation Roadmap for the Agent

### **Step 1: Scaffolding**
*   Setup React + Express + SQLite.
*   Implement `MarketService` to wrap `yahoo-finance2`.
*   Build the `Wallet` logic (Balance, Total Invested, Lifetime ROI).

### **Step 2: The Simulator UI**
*   Create a "Symbol Search" that pulls live price/options.
*   Build the "Order Ticket" with the "Plain English" translation toggle.
*   Implement the "Time Machine" slider using the Black-Scholes math service.

### **Step 3: The Academy Engine**
*   Create a JSON manifest for lessons and quizzes.
*   Implement the "Scenario Sandbox"—a mode where the engine uses specific historical or simulated data for the quests.

### **Step 4: Gamification & Polish**
*   Build the "Quest Map" (Level 1 -> Level 5).
*   Add theme-switching logic and "Quest Complete" animations.

---

## 6. Resources & References
*   **Strategy Logic:** [Options Playbook](https://www.optionsplaybook.com/option-strategies/)
*   **Curriculum Standards:** [Fidelity Learning Center](https://www.fidelity.com/learning-center/investment-products/options/options)
*   **Basics Reference:** [Investopedia Options Basics](https://www.investopedia.com/options-trading-4427223)
