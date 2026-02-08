import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Briefcase, TrendingUp, TrendingDown, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Portfolio = () => {
  const { user, positions, fetchPositions, sellPosition, theme, deposit, resetPortfolio } = useStore();
  const [loading, setLoading] = useState(false);


  const refreshPortfolio = async () => {
    setLoading(true);
    try {
      await fetchPositions(user?.id);
      toast.success('Prices updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update portfolio prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) refreshPortfolio();
  }, [user?.id]);

  const totalInvested = user?.total_deposited || 10000;
  const currentCash = user?.current_cash || 0;
  
  // Calculate total portfolio value using backend-provided current_price
  const optionsValue = positions.reduce((acc, pos) => {
    const multiplier = pos.type === 'stock' ? 1 : 100;
    return acc + (pos.current_price * pos.quantity * multiplier);
  }, 0);

  const portfolioValue = currentCash + optionsValue;
  const roi = ((portfolioValue - totalInvested) / totalInvested) * 100;

  useEffect(() => {
    if (currentCash < 100 && positions.length === 0 && !loading) {
       toast.error("Low Funds Alert!", {
         description: "You've run out of virtual cash. Click 'Emergency Fund' to reset.",
         action: {
           label: "Emergency Fund",
           onClick: () => handleDeposit()
         }
       });
    }
  }, [currentCash, positions.length]);

  const data = [
    { name: 'Cash', value: currentCash },
    { name: 'Options', value: optionsValue },
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  const handleDeposit = async () => {
    try {
      await deposit(5000, user.id);
      toast.success('Capital Injection: $5,000 added!');
    } catch (err) {
      toast.error('Deposit failed');
    }
  };

  const handleSell = async (pos) => {
    if (user.level < 4) {
      toast.error("Module 4 Lock: You must learn to 'Cash Out' before selling!");
      return;
    }
    
    try {
      await sellPosition({ 
        positionId: pos.id, 
        userId: user.id, 
        currentPrice: pos.current_price 
      });
      toast.success('Position Liquidated');
    } catch (err) {
      toast.error('Sale failed');
    }
  };

  const handleResetPortfolio = async () => {
    if (window.confirm("Are you sure you want to reset your portfolio? This will clear all trades and reset your cash to $10,000.")) {
      try {
        await resetPortfolio(user.id);
        toast.success('Portfolio reset successfully!');
      } catch (err) {
        toast.error('Failed to reset portfolio.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Portfolio</h2>
          <p className="text-slate-500">Track your investment journey.</p>
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={refreshPortfolio}
            className={`flex items-center gap-2 text-xs font-bold text-blue-500 hover:underline ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
          >
            <RefreshCcw size={14} />
            {loading ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button 
            onClick={handleResetPortfolio}
            className={`text-xs font-bold text-rose-500 hover:underline flex items-center gap-2`}
          >
            <Trash2 size={14} /> Reset Portfolio
          </button>
        </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase">Net Worth</p>
          <p className="text-3xl font-mono font-bold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className={`flex items-center gap-1 text-sm font-bold mt-2 ${roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {roi >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {roi.toFixed(2)}% Lifetime ROI
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase">Total Invested</p>
          <p className="text-3xl font-mono font-bold">${totalInvested.toLocaleString()}</p>
          <button 
            onClick={handleDeposit} 
            className={`text-xs mt-2 font-bold hover:underline ${currentCash < 100 ? 'text-amber-500' : 'text-blue-500'}`}
          >
            {currentCash < 100 ? '+ Emergency $5,000' : '+ Invest $5,000 More'}
          </button>
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase">Cash Available</p>
          <p className="text-3xl font-mono font-bold">${currentCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border min-h-[300px] ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
          <h3 className="font-bold mb-4">Allocation</h3>
          {optionsValue > 0 || currentCash > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Cash</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Options</span>
              </div>
            </>
          ) : (
             <div className="flex items-center justify-center h-[200px] text-slate-400">No data</div>
          )}
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
          <h3 className="font-bold mb-4">Active Positions</h3>
          <div className="space-y-4">
            {positions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Briefcase size={40} className="mx-auto mb-2 opacity-20" />
                <p>No active trades. Visit the Terminal to start.</p>
              </div>
            ) : (
              positions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${pos.type === 'call' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {pos.type === 'call' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="font-bold">{pos.ticker} ${pos.strike} {pos.type.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Entry: ${pos.entry_price} • Live: ${pos.current_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden md:block">
                      <p className={`text-sm font-bold ${pos.unrealized_pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pos.unrealized_pnl >= 0 ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {pos.unrealized_pnl_percent.toFixed(2)}%
                      </p>
                    </div>
                    <button 
                      onClick={() => handleSell(pos)}
                      className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                        user.level >= 4 
                          ? 'bg-rose-500 text-white hover:bg-rose-600' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title={user.level < 4 ? "Unlock at Level 4" : ""}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
