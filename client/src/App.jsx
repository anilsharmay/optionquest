import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import Academy from './pages/Academy';
import Terminal from './pages/Terminal';
import Portfolio from './pages/Portfolio';
import HedgeLab from './pages/HedgeLab';
import { Toaster } from 'sonner';
import OnboardingModal from './components/OnboardingModal';
import QuestOverlay from './components/QuestOverlay';

function App() {
  const { theme, fetchUser, fetchPositions, fetchLessons } = useStore();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  useEffect(() => {
    // Initial data fetch for the default user (ID 1)
    fetchUser(1);
    fetchPositions(1);
    fetchLessons(1);

    // Check onboarding
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <Router>
      <Toaster position="top-right" theme={theme === 'classroom' ? 'light' : 'dark'} />
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <QuestOverlay />
      <div className={`flex h-screen theme-transition ${theme === 'classroom' ? 'theme-classroom' : 'theme-terminal'}`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/academy" replace />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/hedgelab" element={<HedgeLab />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
