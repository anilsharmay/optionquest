export const lessons = [
  {
    id: 'intro_multiplier',
    title: 'The Multiplier',
    difficulty: 'Novice',
    xp: 50,
    module: 1,
    content: `
      ### Why Options?
      In the world of stocks, you buy shares. If you want 100 shares of Apple at $180, you need $18,000. That's a lot of cash!
      
      Options allow you to "control" those same 100 shares for a much smaller fee, called a **Premium**.
      
      **The Golden Rule:** 
      1 Option Contract = 100 Shares of Stock.
      
      If an option price says "$2.50", you must multiply it by 100. So, it actually costs **$250**.
    `,
    quiz: {
      question: "If a Call option for Tesla is listed at $5.00, how much will you actually pay to buy 1 contract?",
      friendlyQuestion: "If an UP-Bet for Tesla is listed at $5.00, how much will you actually pay to buy 1 contract?",
      options: ["$5.00", "$50.00", "$500.00", "$5,000.00"],
      answer: 2
    },
    practicalAction: {
      label: "Check Option Costs",
      path: "/terminal",
      search: "?ticker=TSLA"
    }
  },
  {
    id: 'intro_calls',
    title: 'The Up-Bet (Calls)',
    difficulty: 'Novice',
    xp: 100,
    module: 2,
    content: `
      ### What is a Call?
      A **Call Option** is a contract that gives you the right to buy a stock at a specific price (the **Strike Price**) until a certain date.
      
      You buy a Call when you think the stock is going **UP**.
      
      **Example:** 
      Apple is at $180. You buy a $185 Call. If Apple goes to $200, you still have the right to buy it at $185! That's a huge profit.
    `,
    quiz: {
      question: "When would you typically buy a Call option?",
      friendlyQuestion: "When would you typically place an UP-Bet?",
      options: [
        "When you think the stock will crash",
        "When you think the stock will stay flat",
        "When you think the stock will go up",
        "When you want to sell your stock"
      ],
      answer: 2
    },
    practicalAction: {
      label: "Try Buying a Call",
      path: "/terminal",
      search: "?ticker=AAPL&action=buy_call"
    }
  },
  {
    id: 'intro_puts',
    title: 'The Down-Bet (Puts)',
    difficulty: 'Novice',
    xp: 100,
    module: 3,
    content: `
      ### What is a Put?
      A **Put Option** gives you the right to sell a stock at a specific price. 
      
      You buy a Put when you think the stock is going **DOWN**, or when you want to insure your stocks against a crash.
      
      **Example:** 
      You own SPY at $500. You buy a $490 Put. If SPY crashes to $400, your Put allows you to sell at $490!
    `,
    quiz: {
      question: "How do Puts act like insurance?",
      friendlyQuestion: "How do DOWN-Bets act like insurance?",
      options: [
        "They make the stock price go up",
        "They let you sell at a high price even if the market crashes",
        "They give you free money every month",
        "They prevent the stock from ever dropping"
      ],
      answer: 1
    },
    practicalAction: {
      label: "Try Buying a Put",
      path: "/terminal",
      search: "?ticker=SPY&action=buy_put"
    }
  },
  {
    id: 'intro_closing',
    title: 'Cashing Out (Closing)',
    difficulty: 'Intermediate',
    xp: 150,
    module: 4,
    content: `
      ### How to get your money back?
      You don't have to wait for expiration! You can "Sell to Close" your option anytime the market is open.
      
      If you bought a Call for $2.00 and it's now worth $5.00, you can sell it and keep the $300 profit immediately.
    `,
    quiz: {
      question: "True or False: You must hold an option until the expiration date.",
      friendlyQuestion: "True or False: You must hold your bet until the deadline.",
      options: ["True", "False"],
      answer: 1
    },
    quest: {
      title: "The Profit Taker",
      instruction: "Go to your Portfolio and close a profitable trade."
    },
    practicalAction: {
      label: "Manage Portfolio",
      path: "/portfolio"
    }
  }
];
