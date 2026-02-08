import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  Terminal, 
  Wallet, 
  BarChart2, 
  ToggleLeft, 
  ToggleRight,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import useStore from '../store/useStore';

const Sidebar = () => {
  const { theme, toggleTheme, plainEnglishEnabled, toggleJargon, user } = useStore();

  const navItems = [
    { icon: <BookOpen size={20} />, label: 'Academy', path: '/academy' },
    { icon: <Terminal size={20} />, label: 'Terminal', path: '/terminal' },
    { icon: <Wallet size={20} />, label: 'Portfolio', path: '/portfolio' },
    { icon: <ShieldCheck size={20} />, label: 'Hedge Lab', path: '/hedgelab' },
  ];

  const getNavLinkClass = ({ isActive }) => {
    const base = "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ";
    if (theme === 'classroom') {
      return base + (isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "hover:bg-slate-100 text-slate-600");
    } else {
      return base + (isActive ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800 text-slate-300");
    }
  };

  return (
    <div className={`w-64 h-screen flex flex-col border-r ${
      theme === 'classroom' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="p-6">
        <h1 className={`text-2xl font-bold flex items-center gap-2 ${
          theme === 'classroom' ? 'text-blue-600' : 'text-emerald-400'
        }`}>
          <BarChart2 /> OptionQuest
        </h1>
        {user && (
          <div className="mt-4">
            <p className="text-xs uppercase font-semibold text-slate-500">Level {user.level} {user.username}</p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full ${theme === 'classroom' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                style={{ width: `${(user.xp % 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-1 text-slate-400">{user.xp} XP Total</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={getNavLinkClass}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plain English</span>
          <button onClick={toggleJargon} className="text-slate-500 cursor-pointer">
            {plainEnglishEnabled ? <ToggleRight className="text-blue-500" /> : <ToggleLeft />}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            {theme === 'classroom' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className={`p-3 rounded-lg text-center ${
          theme === 'classroom' ? 'bg-blue-50' : 'bg-emerald-900/20'
        }`}>
          <p className="text-[10px] uppercase font-bold text-slate-500">Available Cash</p>
          <p className={`text-lg font-mono font-bold ${
            theme === 'classroom' ? 'text-blue-700' : 'text-emerald-400'
          }`}>
            ${user?.current_cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
