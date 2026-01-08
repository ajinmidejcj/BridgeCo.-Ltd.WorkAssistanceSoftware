import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { YearProjects } from './pages/YearProjects';
import { DatabasePage } from './pages/DatabasePage';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'yearProjects' | 'database'>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentView('yearProjects');
  };

  const handleBackToDashboard = () => {
    setSelectedYear(null);
    setCurrentView('dashboard');
  };

  const handleViewDatabase = () => {
    setCurrentView('database');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'dashboard' && (
        <Dashboard onYearSelect={handleYearSelect} onViewDatabase={handleViewDatabase} />
      )}
      {currentView === 'yearProjects' && (
        <YearProjects onBack={handleBackToDashboard} selectedYear={selectedYear} />
      )}
      {currentView === 'database' && (
        <DatabasePage onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

export default App;
