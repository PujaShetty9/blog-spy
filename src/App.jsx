// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CompetitorsPage from './pages/CompetitorsPage';
import ArticlesPage from './pages/ArticlesPage';
import MonitoringLogsPage from './pages/MonitoringLogsPage';
import DemoControlPage from './pages/DemoControlPage';
import Test100Page from './pages/Test100Page';
import ArticleDetailModal from './pages/ArticleDetailModal';
import DemoCompetitorSitePage from './pages/DemoCompetitorSitePage';
import DemoArticlePage from './pages/DemoArticlePage';
import { monitoringEngine } from './services/monitoringEngine';

function MainAppLayout() {
  const location = useLocation();
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Determine active tab from current pathname
  const path = location.pathname.substring(1) || 'dashboard';
  const activeTab = path === 'monitoring-logs' ? 'logs' : path === 'test-100' ? 'test100' : path;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} />
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage 
                onSelectArticle={(art) => setSelectedArticle(art)} 
              />
            } 
          />
          <Route path="/competitors" element={<CompetitorsPage />} />
          <Route 
            path="/articles" 
            element={
              <ArticlesPage 
                onSelectArticle={(art) => setSelectedArticle(art)}
              />
            } 
          />
          <Route path="/monitoring-logs" element={<MonitoringLogsPage />} />
          <Route 
            path="/demo" 
            element={
              <DemoControlPage 
                onSelectArticle={(art) => setSelectedArticle(art)}
              />
            } 
          />
          <Route path="/test-100" element={<Test100Page />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Start client-side background monitoring engine loop
    monitoringEngine.start(5000);
    return () => monitoringEngine.stop();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Dummy Competitor Website Routes */}
        <Route path="/demo-site/:competitorSlug" element={<DemoCompetitorSitePage />} />
        <Route path="/demo-site/:competitorSlug/articles/:articleSlug" element={<DemoArticlePage />} />

        {/* Main BlogSpy Application Routes */}
        <Route path="/*" element={<MainAppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
