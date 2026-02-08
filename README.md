# 🦅 OptionQuest

**Master Options Trading without the Financial Risk.**

OptionQuest is a gamified educational platform designed for absolute beginners to master options trading mechanics. It bridges the gap between theory (The Academy) and practice (The Terminal) using real-time market simulation and risk-free experimentation.

---

## 🚀 Features

### 🎓 The Academy (Learn)
*   **Interactive Curriculum:** Markdown-based lessons covering calls, puts, and Greeks.
*   **Plain English Mode:** Toggle to translate jargon (e.g., "Theta" → "Time Decay") instantly.
*   **Active Quizzes:** Test your knowledge to earn XP. Lesson 1 unlocks trading.
*   **Quest System:** Direct "mission" links from lessons to the Terminal (e.g., "Go buy a Call on AAPL").

### 📈 The Terminal (Trade)
*   **Live Market Data:** Real-time prices and option chains fetched via Yahoo Finance (60s caching).
*   **The Time Machine:** Validated Black-Scholes simulation. Slide 0-30 days into the future to see how **Time Decay** eats your premium.
*   **Visual Payoff Charts:** Dynamic "Hockey Stick" graphs showing Max Profit, Max Loss, and Breakeven before you trade.
*   **Level Locking:** 
    *   **Level 2:** Unlocks Call Buying.
    *   **Level 3:** Unlocks Put Buying.
    *   **Level 4:** Unlocks Selling/Closing positions.

### 🧪 Hedge Lab (Protect)
*   **Clearance Level 5:** An advanced sandbox unlocked only after mastering the basics.
*   **Crash Simulator:** Slide a market crash from 0% to -50% to stress-test a portfolio.
*   **Visual Protection:** Line charts comparing an "Unprotected" stock drop vs. a "Hedged" portfolio with Protective Puts.

### 💼 Portfolio (Track)
*   **Performance Metrics:** Real-time tracking of Net Worth, Cash, and Lifetime ROI.
*   **Emergency Fund:** Automatically offers a $5,000 top-up if your balance drops below $100.
*   **Allocation:** Visual breakdown of Cash vs. Options exposure.

---

## 🛠️ Architecture

### Frontend (`/client`)
*   **Framework:** React (Vite)
*   **State Management:** Zustand (User, Positions, Theme, Lessons)
*   **Styling:** Tailwind CSS with dual-theme support (Classroom Light / Terminal Dark).
*   **Charts:** Recharts for payoff diagrams and portfolio visualization.

### Backend (`/server`)
*   **Runtime:** Node.js (Express)
*   **Database:** SQLite (`optionquest.db`) with `sqlite3` driver.
*   **Market Data:** `yahoo-finance2` library with in-memory caching.
*   **Security:** Server-side validation of trade prices against live market data (20% allowed drift) to prevent cheating.

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v16+)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/anilsharmay/optionquest.git
    cd optionquest
    ```

2.  **Install Client Dependencies**
    ```bash
    cd client
    npm install
    ```

3.  **Install Server Dependencies**
    ```bash
    cd ../server
    npm install
    ```

### Running Locally

1.  **Start the Backend**
    ```bash
    # From /server directory
    npm start
    # Server runs on http://localhost:3000
    ```

2.  **Start the Frontend**
    ```bash
    # From /client directory
    npm run dev
    # Client runs on http://localhost:5173
    ```

---

## 🛡️ License

This project is open-source and available under the MIT License.
