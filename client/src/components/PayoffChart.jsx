import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

const PayoffChart = ({ type, strike, premium, stockPrice, theme }) => {
  if (!strike || !premium) return null;
  const multiplier = 100;
  const cost = premium * multiplier;
  
  // Calculate range for X axis (stock prices)
  const minPrice = Math.floor(strike * 0.8);
  const maxPrice = Math.ceil(strike * 1.2);
  const step = (maxPrice - minPrice) / 20;

  const data = [];
  for (let p = minPrice; p <= maxPrice; p += step) {
    let profit = 0;
    if (type === 'call') {
      profit = Math.max(0, p - strike) * multiplier - cost;
    } else {
      profit = Math.max(0, strike - p) * multiplier - cost;
    }
    data.push({
      price: parseFloat(p.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
    });
  }

  const breakeven = type === 'call' ? strike + premium : strike - premium;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pnl = payload[0].value;
      return (
        <div className={`p-2 rounded border shadow-lg ${
          theme === 'classroom' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
        }`}>
          <p className="text-xs font-bold">Stock Price: ${payload[0].payload.price}</p>
          <p className={`text-sm font-mono font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            P&L: {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'classroom' ? '#e2e8f0' : '#334155'} vertical={false} />
          <XAxis 
            dataKey="price" 
            stroke={theme === 'classroom' ? '#64748b' : '#94a3b8'} 
            fontSize={10} 
            tickFormatter={(val) => `$${val}`}
          />
          <YAxis 
            stroke={theme === 'classroom' ? '#64748b' : '#94a3b8'} 
            fontSize={10}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
          <ReferenceLine x={breakeven} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'BE', position: 'top', fill: '#3b82f6', fontSize: 10 }} />
          <ReferenceLine x={stockPrice} stroke={theme === 'classroom' ? '#1e293b' : '#f1f5f9'} strokeWidth={1} label={{ value: 'Now', position: 'bottom', fill: theme === 'classroom' ? '#1e293b' : '#f1f5f9', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="profit" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorProfit)" 
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayoffChart;
