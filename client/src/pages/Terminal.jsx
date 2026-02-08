import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, Clock, Lock, Info, X } from 'lucide-react';
import useStore from '../store/useStore';
import { translate } from '../utils/translator';
import { blackScholes } from '../utils/math';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../api/apiClient';
import { toast } from 'sonner';
import PayoffChart from '../components/PayoffChart';
import { useSearchParams } from 'react-router-dom';

const Terminal = () => {
  const [searchParams] = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get('ticker') || 'AAPL');
  const [quote, setQuote] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeShift, setTimeShift] = useState(0); // Days into future
  const [selectedOption, setSelectedOption] = useState(null); // { opt, type }
  const { theme, plainEnglishEnabled, buyPosition, user } = useStore();
  const pollInterval = useRef(null);

  const fetchMarketData = async (sym, isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
      setQuote(null);
      setOptions(null);
      setSelectedOption(null);
    }
    try {
      const qRes = await api.fetchQuote(sym);
      if (!qRes.data || !qRes.data.symbol) {
        toast.error(`Stock ${sym} not found.`);
        return;
      }
      
      const oRes = await api.fetchOptions(sym);
      setQuote(qRes.data);
      setOptions(oRes.data);

      // Handle direct action from URL params
      const action = searchParams.get('action');
      if (action && oRes.data && oRes.data.options && oRes.data.options.length > 0) {
        const type = action === 'buy_call' ? 'call' : action === 'buy_put' ? 'put' : null;
        if (type) {
           const contracts = type === 'call' ? oRes.data.options[0].calls : oRes.data.options[0].puts;
           
           if (contracts && contracts.length > 0) {
             // Auto-select the first Near-The-Money option
             const stockPrice = qRes.data.regularMarketPrice;
             const closest = contracts.reduce((prev, curr) => 
               Math.abs(curr.strike - stockPrice) < Math.abs(prev.strike - stockPrice) ? curr : prev
             );
             setSelectedOption({ opt: closest, type });
           }
        }
      }
    } catch (err) {
      console.error(err);
      if (!isPolling) toast.error(`Failed to load market data for ${sym}`);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData(symbol);
    
    // Polling every 60 seconds
    pollInterval.current = setInterval(() => {
      fetchMarketData(symbol, true);
    }, 60000);

    return () => clearInterval(pollInterval.current);
  }, [symbol]);

  const getTheoreticalPrice = (opt, type) => {
    if (!quote || !options || !options.options || !options.options[0]) return opt.lastPrice;
    
    // Parse expiry from option chain if available
    const expiryTimestamp = options.options[0].expirationDate; // ISO String from Yahoo
    const now = Date.now();
    let daysToExpiry = (new Date(expiryTimestamp) - now) / 86400000;
    
    // Fallback to 30 days if data is weird
    if (isNaN(daysToExpiry) || daysToExpiry <= 0) daysToExpiry = 30;

    const adjustedDays = Math.max(0.001, daysToExpiry - timeShift); 
    const t = adjustedDays / 365;
    const r = 0.05; // 5% risk free rate
    const v = opt.impliedVolatility || 0.3; // Default 30% vol
    
    const price = blackScholes(quote.regularMarketPrice, opt.strike, t, r, v, type);
    return Math.max(0.01, price);
  };

  const handleBuy = async () => {
    if (!selectedOption) return;
    const { opt, type } = selectedOption;
    
    const requiredLevel = type === 'call' ? 2 : 3;
    if (user.level < requiredLevel) {
      toast.error(`Level ${requiredLevel} required for ${type.toUpperCase()}s`);
      return;
    }

    const tradeData = {
      userId: user.id,
      ticker: symbol,
      type: type,
      strategy: 'long',
      strike: opt.strike,
      expiry: opt.expiration || options.options[0].expirationDate,
      entryPrice: opt.lastPrice,
      quantity: 1
    };
    
    try {
      await buyPosition(tradeData);
      toast.success('Trade Executed Successfully!');
      setSelectedOption(null);
    } catch (err) {
      toast.error(`Trade failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const isCallUnlocked = user?.level >= 2;
  const isPutUnlocked = user?.level >= 3;

  const renderOptionCard = (opt, type) => {
    const isUnlocked = type === 'call' ? isCallUnlocked : isPutUnlocked;
    const currentPrice = getTheoreticalPrice(opt, type);
    
    return (
      <div 
        key={`${type}-${opt.strike}`} 
        onClick={() => isUnlocked && setSelectedOption({ opt, type })}
        className={`p-4 rounded-xl flex items-center justify-between border cursor-pointer transition-all ${
        selectedOption?.opt.strike === opt.strike && selectedOption?.type === type
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : theme === 'classroom' ? 'bg-white border-slate-100 hover:border-blue-300' : 'bg-slate-800 border-slate-700 hover:border-emerald-500'
      } ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold">{translate('strike', plainEnglishEnabled)}</p>
          <p className="text-lg font-mono font-bold">${opt.strike}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold">{translate('premium', plainEnglishEnabled)}</p>
          <div className="flex items-center gap-2 justify-end">
            {timeShift > 0 && (
              <span className="text-xs line-through text-slate-400">${opt.lastPrice.toFixed(2)}</span>
            )}
            <p className={`text-lg font-mono font-bold ${timeShift > 0 ? 'text-amber-500' : type === 'call' ? 'text-blue-500' : 'text-rose-500'}`}>
              ${currentPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleBuyStock = async () => {
    if (!quote) return;
    const tradeData = {
      userId: user.id,
      ticker: symbol,
      type: 'stock',
      strategy: 'long',
      strike: null,
      expiry: null,
      entryPrice: quote.regularMarketPrice,
      quantity: 100
    };
    
    try {
      await buyPosition(tradeData);
      toast.success('100 Shares Purchased! Visit Hedge Lab to protect them.');
    } catch (err) {
      toast.error(`Purchase failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-400">Terminal</h2>
          <p className="text-slate-500">Real-time market simulator.</p>
        </div>
        <div className="flex items-center gap-4">
          {quote && (
            <button 
              onClick={handleBuyStock}
              className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${
                theme === 'classroom' 
                  ? 'border-blue-200 text-blue-600 hover:bg-blue-50' 
                  : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20'
              }`}
            >
              Buy 100 Shares
            </button>
          )}
          <div className="relative">
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && fetchMarketData(symbol)}
              className={`pl-10 pr-4 py-2 rounded-xl border-2 outline-none transition-all ${
                theme === 'classroom' ? 'bg-white border-slate-200 focus:border-blue-500 text-slate-800' : 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100'
              }`}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </header>

      {/* Time Machine Slider */}
      <div className={`p-4 rounded-2xl border ${theme === 'classroom' ? 'bg-blue-50 border-blue-100' : 'bg-slate-800/80 border-slate-700'}`}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> The Time Machine
          </label>
          <span className="text-xs font-mono bg-blue-500 text-white px-2 py-0.5 rounded">
            +{timeShift} Days into Future
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="30" 
          value={timeShift} 
          onChange={(e) => setTimeShift(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <p className="text-[10px] mt-2 text-slate-400">
          Slide to see how {translate('theta', plainEnglishEnabled)} affects {translate('premium', plainEnglishEnabled)}s as the deadline approaches.
        </p>
      </div>

      {quote && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-2xl flex items-center justify-between ${
            theme === 'classroom' ? 'bg-white shadow-sm' : 'bg-slate-800/50 border border-slate-700'
          }`}
        >
          <div>
            <h3 className="text-4xl font-mono font-bold">{quote.symbol}</h3>
            <p className="text-slate-500 font-medium">{quote.shortName}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-mono font-bold">${quote.regularMarketPrice?.toFixed(2) || 'N/A'}</p>
            {quote.regularMarketChange !== undefined && (
              <p className={`font-bold ${quote.regularMarketChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {quote.regularMarketChange >= 0 ? '+' : ''}{quote.regularMarketChange.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
              </p>
            )}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Connecting to Market Oracle...</p>
        </div>
      ) : options && options.options && options.options.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls Section */}
          <section>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" /> {translate('call', plainEnglishEnabled)}s
              {!isCallUnlocked && <span className="flex items-center gap-1 text-xs text-amber-500 ml-2"><Lock size={12} /> Level 2 Required</span>}
            </h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {options.options[0].calls?.slice(0, 10).map((opt) => renderOptionCard(opt, 'call'))}
              {(!options.options[0].calls || options.options[0].calls.length === 0) && <p className="text-slate-500 text-sm italic">No calls available.</p>}
            </div>
          </section>

          {/* Puts Section */}
          <section>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="text-rose-500" /> {translate('put', plainEnglishEnabled)}s
              {!isPutUnlocked && <span className="flex items-center gap-1 text-xs text-amber-500 ml-2"><Lock size={12} /> Level 3 Required</span>}
            </h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {options.options[0].puts?.slice(0, 10).map((opt) => renderOptionCard(opt, 'put'))}
              {(!options.options[0].puts || options.options[0].puts.length === 0) && <p className="text-slate-500 text-sm italic">No puts available.</p>}
            </div>
          </section>
        </div>
      ) : options && (
        <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${theme === 'classroom' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
          <p className="text-slate-500">No option data available for {symbol}.</p>
        </div>
      )}

      {/* Advanced Order Ticket Panel */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-0 left-64 right-0 p-6 border-t shadow-2xl z-40 ${
              theme === 'classroom' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button 
              onClick={() => setSelectedOption(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Strategy</h4>
                  <p className="text-xl font-bold flex items-center gap-2">
                    {symbol} ${selectedOption.opt.strike} {translate(selectedOption.type, plainEnglishEnabled)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Max Loss</p>
                    <p className="text-lg font-mono font-bold text-rose-500">${(selectedOption.opt.lastPrice * 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Max Profit</p>
                    <p className="text-lg font-mono font-bold text-emerald-500">Unlimited</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Breakeven</p>
                    <p className="text-lg font-mono font-bold text-blue-500">
                      ${(selectedOption.type === 'call' ? selectedOption.opt.strike + selectedOption.opt.lastPrice : selectedOption.opt.strike - selectedOption.opt.lastPrice).toFixed(2)}
                    </p>
                  </div>
                  <button 
                    onClick={handleBuy}
                    className={`mt-2 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all ${
                      selectedOption.type === 'call' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    EXECUTE TRADE
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   Visual Payoff Map <Info size={12} className="text-slate-400" />
                 </h4>
                 <PayoffChart 
                  type={selectedOption.type}
                  strike={selectedOption.opt.strike}
                  premium={selectedOption.opt.lastPrice}
                  stockPrice={quote.regularMarketPrice}
                  theme={theme}
                 />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Terminal;
