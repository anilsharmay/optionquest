import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ArrowRight, ShieldAlert, TrendingDown, Info, ShoppingCart, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as api from '../api/apiClient';
import { toast } from 'sonner';
import { translate } from '../utils/translator';

const HedgeLab = () => {
  const { theme, user, positions, fetchPositions, plainEnglishEnabled } = useStore();
  const [selectedStock, setSelectedStock] = useState(null);
  const [crashPercent, setCrashPercent] = useState(0);
  const [isHedged, setIsHedged] = useState(false);
  const [putData, setPutData] = useState(null);
  const [loading, setLoading] = useState(false);

  const requiredLevel = 5;
  const isLevelLocked = user?.level < requiredLevel;
  const levelProgress = Math.min(100, (user?.level / requiredLevel) * 100);

  useEffect(() => {
    fetchPositions();
  }, []);

  const stocks = positions.filter(p => p.type === 'stock');

  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setLoading(true);
    setCrashPercent(0);
    setIsHedged(false);
    try {
      const res = await api.fetchOptions(stock.ticker);
      if (res.data && res.data.options && res.data.options[0]) {
        const puts = res.data.options[0].puts;
        // Find a Put close to the stock's current price (ATM)
        const currentPrice = stock.current_price || stock.entry_price;
        const atmPut = puts.reduce((prev, curr) => 
          Math.abs(curr.strike - currentPrice) < Math.abs(prev.strike - currentPrice) ? curr : prev
        );
        setPutData(atmPut);
      }
    } catch (err) {
      toast.error("Failed to fetch insurance data for " + stock.ticker);
    } finally {
      setLoading(false);
    }
  };

  if (isLevelLocked) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-2xl w-full p-12 rounded-[2.5rem] border-4 border-dashed text-center space-y-8 ${
            theme === 'classroom' 
              ? 'bg-white border-slate-200 shadow-xl' 
              : 'bg-slate-900 border-slate-800 shadow-2xl shadow-emerald-500/5'
          }`}
        >
          <div className="relative inline-block">
            <div className={`p-8 rounded-full ${theme === 'classroom' ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-600'}`}>
              <ShieldCheck size={80} />
            </div>
            <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-3 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
              <Lock size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={`text-4xl font-black uppercase tracking-tight ${theme === 'classroom' ? 'text-slate-900' : 'text-white'}`}>
              Level {requiredLevel} Clearance Required
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              Advanced risk-management algorithms are restricted to senior traders. Complete Module 5 to unlock.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Security Level</span>
              <span>{user?.level} / {requiredLevel}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className={`h-full ${theme === 'classroom' ? 'bg-blue-600' : 'bg-emerald-500'}`}
              />
            </div>
          </div>

          <Link 
            to="/academy"
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-xl hover:scale-105 active:scale-95 ${
              theme === 'classroom' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            GO TO ACADEMY <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- Sandbox Calculations ---
  const currentPrice = selectedStock?.current_price || selectedStock?.entry_price || 0;
  const simulatedPrice = currentPrice * (1 - (crashPercent / 100));
  
  const unprotectedValue = simulatedPrice * 100;
  const unprotectedPnl = (simulatedPrice - currentPrice) * 100;

  let hedgedValue = unprotectedValue;
  let hedgedPnl = unprotectedPnl;
  let putCost = 0;

  if (isHedged && putData) {
    putCost = putData.lastPrice * 100;
    // Put intrinsic value at expiry: Max(0, Strike - Price)
    const putValue = Math.max(0, putData.strike - simulatedPrice) * 100;
    hedgedValue = unprotectedValue + putValue - putCost;
    hedgedPnl = hedgedValue - (currentPrice * 100);
  }

  // Chart Data Generation
  const chartData = [];
  for (let i = 0; i <= 50; i += 5) {
    const p = currentPrice * (1 - (i / 100));
    const unprot = p * 100;
    let hedged = unprot;
    if (isHedged && putData) {
      const v = Math.max(0, putData.strike - p) * 100;
      hedged = unprot + v - (putData.lastPrice * 100);
    }
    chartData.push({
      drop: i,
      Unprotected: parseFloat(unprot.toFixed(2)),
      Hedged: parseFloat(hedged.toFixed(2)),
    });
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Hedge Lab</h2>
            <p className="text-slate-500">{plainEnglishEnabled ? "The Insurance Lab" : "What-If Sandbox: Portfolio Insurance"}</p>
          </div>
        </div>
        {selectedStock && (
          <button 
            onClick={() => setSelectedStock(null)}
            className="text-sm font-bold text-blue-500 hover:underline"
          >
            Switch Stock
          </button>
        )}
      </header>

      {!selectedStock ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">{plainEnglishEnabled ? "Pick a Stock to Test" : "Select a Stock to Stress Test"}</h3>
          {stocks.length === 0 ? (
            <div className={`p-12 rounded-[2rem] border-2 border-dashed flex flex-col items-center gap-6 ${
              theme === 'classroom' ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
            }`}>
               <ShieldAlert size={48} className="text-amber-500" />
               <div className="text-center">
                 <h3 className="text-xl font-bold">{plainEnglishEnabled ? "No Owned Stocks" : "No Stocks Found"}</h3>
                 <p className="text-slate-500 mt-1 max-w-sm">
                   {plainEnglishEnabled 
                     ? "You need to hold at least 100 shares of a company to buy insurance for it." 
                     : "You need to own at least 100 shares of a stock to test protection strategies."}
                 </p>
                 <Link to="/terminal" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                   <ShoppingCart size={18} /> {plainEnglishEnabled ? "Buy Some Shares" : "Visit Terminal"}
                 </Link>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => handleSelectStock(s)}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all hover:border-blue-500 ${
                    theme === 'classroom' ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <h4 className="text-2xl font-black">{s.ticker}</h4>
                  <p className="text-slate-500 font-bold">100 Shares</p>
                  <p className="text-sm mt-4 text-slate-400">Current Value: ${(s.current_price * 100).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            <section className={`p-6 rounded-3xl border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
              <h4 className="font-bold flex items-center gap-2 mb-4 text-rose-500">
                <TrendingDown size={18} /> {plainEnglishEnabled ? "Simulate a Market Drop" : "Simulate Market Crash"}
              </h4>
              <input 
                type="range" 
                min="0" max="50" 
                value={crashPercent}
                onChange={(e) => setCrashPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between mt-2 font-mono text-sm font-bold">
                <span>0%</span>
                <span className="text-rose-500">-{crashPercent}%</span>
              </div>
            </section>

            <section className={`p-6 rounded-3xl border transition-all ${
              isHedged 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold flex items-center gap-2">
                  <ShieldCheck size={18} className={isHedged ? 'text-emerald-500' : 'text-slate-400'} /> 
                  {plainEnglishEnabled ? "Add an Insurance Bet" : "Apply Protection"}
                </h4>
                <button 
                  onClick={() => setIsHedged(!isHedged)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isHedged ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHedged ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              
              {loading ? (
                <p className="text-xs text-slate-500 animate-pulse text-center py-4">Finding best Put contract...</p>
              ) : putData ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                    <p className="text-[10px] uppercase font-bold text-slate-500">{plainEnglishEnabled ? "Insurance Bet" : "Insurance Policy"}</p>
                    <p className="text-sm font-bold">{selectedStock.ticker} ${putData.strike} {plainEnglishEnabled ? translate('put', plainEnglishEnabled) : 'Put'}</p>
                    <p className="text-xs text-slate-400">Cost: ${putCost.toFixed(2)} premium</p>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {plainEnglishEnabled 
                      ? `This ${translate('put', plainEnglishEnabled)} means you can sell your shares at $${putData.strike} even if the market drops.` 
                      : `This Put gives you the right to sell at $${putData.strike} no matter how low the price falls.`}

                  </p>
                </div>
              ) : (
                <p className="text-xs text-rose-400">{plainEnglishEnabled ? "Cannot find insurance for this stock." : "No insurance data available for this ticker."}</p>
              )}
            </section>

            <section className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">Outcome Summary</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-60">Portfolio Value</p>
                  <p className="text-3xl font-black">${hedgedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60">Net P&L</p>
                    <p className={`font-mono font-bold ${hedgedPnl >= 0 ? 'text-emerald-300' : 'text-rose-200'}`}>
                      {hedgedPnl >= 0 ? '+' : ''}${hedgedPnl.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60">Vs. No Hedge</p>
                    <p className="font-mono font-bold text-emerald-300">
                      +${(hedgedValue - unprotectedValue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Visualizer Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-8 rounded-[2.5rem] border ${theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
              <h4 className="font-bold flex items-center gap-2 mb-6">
                {plainEnglishEnabled ? "Will Your Wealth Survive a Drop?" : "Stress Test: Wealth Resilience"} <Info size={14} className="text-slate-400" />
              </h4>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'classroom' ? '#f1f5f9' : '#334155'} />
                    <XAxis 
                      dataKey="drop" 
                      reverse
                      label={{ value: plainEnglishEnabled ? 'Market Drop %': 'Market Crash %', position: 'insideBottom', offset: -5, fontSize: 12 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(val) => [`$${val.toLocaleString()}`, 'Portfolio Value']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Unprotected" 
                      stroke="#f43f5e" 
                      strokeWidth={3} 
                      dot={false}
                      strokeDasharray={isHedged ? "5 5" : "0"}
                      opacity={isHedged ? 0.3 : 1}
                    />
                    {isHedged && (
                      <Line 
                        type="monotone" 
                        dataKey="Hedged" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        dot={false}
                        animationDuration={500}
                      />
                    )}
                    <ReferenceLine x={crashPercent} stroke="#3b82f6" label={{ value: 'SIMULATED', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${theme === 'classroom' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <graduation-cap size={18} className="text-blue-500" /> Real-World Implementation
              </h4>
              <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                <div>
                  {plainEnglishEnabled ? (
                    <p>This is a <strong className="text-slate-800 dark:text-slate-200">Protection Bet</strong>. You buy one {translate('put', plainEnglishEnabled)} for every 100 shares you own.</p>
                  ) : (
                    <p>This strategy is called a <strong className="text-slate-800 dark:text-slate-200">Protective Put</strong>. In the real world, you would buy 1 Put contract for every 100 shares of stock you own.</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{plainEnglishEnabled ? "What happened?" : "What just happened?"}</p>
                    <div>
                      {plainEnglishEnabled ? (
                        <p>As the stock dropped, the money you lost on your shares was matched by the money you made on the {translate('put', plainEnglishEnabled)}. Your wealth stayed safe.</p>
                      ) : (
                        <p>As the stock price crashed, the <span className="text-rose-500 font-bold">loss</span> on your shares was perfectly offset by the <span className="text-emerald-500 font-bold">profit</span> on the Put option. Your wealth hit a "floor" and stopped falling.</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{plainEnglishEnabled ? "How to do it?" : "How do I do this?"}</p>
                    <div>
                      {plainEnglishEnabled ? (
                        <p>Go to your broker, pick the stock, and <strong className="text-blue-600">Buy a {translate('put', plainEnglishEnabled)}</strong> with a {translate('strike', plainEnglishEnabled)} near the current stock price. This is like buying insurance for your shares.</p>
                      ) : (
                        <p>Go to your broker, find the stock you own, and <strong className="text-blue-600">Buy a Put</strong> with a strike price near the current price. You pay a small fee (premium) today to guarantee your exit price tomorrow.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HedgeLab;
