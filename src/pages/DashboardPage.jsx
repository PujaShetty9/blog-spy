import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Zap, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { fetchDashboardStats, formatDelay, triggerCheck } from '../services/api';
import { monitoringEngine } from '../services/monitoringEngine';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function DashboardPage({ onSelectArticle }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingAll, setCheckingAll] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await fetchDashboardStats();
      setData(res);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = monitoringEngine.subscribe(() => {
      loadData();
    });
    const interval = setInterval(loadData, 3000); // refresh stats every 3s
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleCheckAll = async () => {
    setCheckingAll(true);
    setCheckMessage('Checking all active sites...');
    try {
      await monitoringEngine.runMonitoringCycle();
      await loadData();
      setCheckMessage('All monitored sites checked.');
    } catch (e) {
      console.error("Check all error:", e);
    } finally {
      setCheckingAll(false);
      setTimeout(() => setCheckMessage(''), 3500);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;
  }

  const { stats, recent_articles = [], competitors = [] } = data || {};

  // Recharts chart data preparation
  const chartData = (recent_articles || []).slice(0, 7).map((art, idx) => ({
    name: art.title.length > 20 ? art.title.substring(0, 18) + '...' : art.title,
    delay: art.detection_delay_seconds ? Math.round(art.detection_delay_seconds) : 0,
    method: art.detection_method
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Real-Time Content Monitoring</h1>
          <p className="page-subtitle">Continuous detection of competitor articles across RSS feeds and internal website routes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {checkMessage && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ✓ {checkMessage}
            </span>
          )}
          <button className="btn btn-secondary" onClick={() => loadData()} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary" onClick={handleCheckAll} disabled={checkingAll}>
            <Zap size={16} className={checkingAll ? 'spin' : ''} /> {checkingAll ? 'Checking Sites...' : 'Check All Monitored Sites'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-title">Competitors Monitored</div>
          <div className="card-value">{stats?.total_competitors || 0}</div>
          <div className="card-subtext" style={{ color: 'var(--accent-emerald)' }}>
            {stats?.online_competitors || 0} Active ● {stats?.offline_competitors || 0} Offline
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Articles Detected</div>
          <div className="card-value" style={{ color: 'var(--accent-cyan)' }}>
            {stats?.total_articles || 0}
          </div>
          <div className="card-subtext">Across all active strategies</div>
        </div>

        <div className="card">
          <div className="card-title">Avg Detection Delay</div>
          <div className="card-value" style={{ color: '#fbbf24' }}>
            {formatDelay(stats?.avg_delay_seconds)}
          </div>
          <div className="card-subtext">calculated (detected_at - published_at)</div>
        </div>

        <div className="card">
          <div className="card-title">Fastest / Slowest Delay</div>
          <div className="card-value" style={{ fontSize: '1.4rem' }}>
            {formatDelay(stats?.fastest_delay_seconds)} / {formatDelay(stats?.slowest_delay_seconds)}
          </div>
          <div className="card-subtext">Exact numerical duration</div>
        </div>
      </div>

      {/* Detection Delay Chart */}
      <div className="section-box">
        <div className="section-header">
          <div>
            <h2 className="section-title">Detection Delay Analytics (Recent Articles)</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Calculated duration between article publication and monitoring detection
            </div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} unit="s" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  formatter={(val) => [`${formatDelay(val)} (${val}s)`, 'Detection Delay']}
                />
                <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#6366f1" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
            No recent article detection data available. Add competitors or run Demo Mode!
          </div>
        )}
      </div>

      {/* Two Column Layout: Latest Articles & Competitors Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Recent Articles */}
        <div className="section-box" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2 className="section-title">Latest Detected Articles</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/articles')}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title & Competitor</th>
                  <th>Method</th>
                  <th>Detection Delay</th>
                </tr>
              </thead>
              <tbody>
                {recent_articles.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No articles detected yet. Click "Demo Mode" to test publishing a test article!
                    </td>
                  </tr>
                ) : (
                  recent_articles.map((art) => (
                    <tr key={art.id} style={{ cursor: 'pointer' }} onClick={() => onSelectArticle(art)}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {art.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {art.competitor_name} ● {new Date(art.detected_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-method">{art.detection_method}</span>
                      </td>
                      <td>
                        <span className={`badge ${art.detection_delay_seconds === null ? 'badge-delay-none' : 'badge-delay-good'}`}>
                          {art.detection_delay_seconds === null ? 'Publication time unavailable' : formatDelay(art.detection_delay_seconds)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitor Overview */}
        <div className="section-box" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2 className="section-title">Monitored Competitors</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/competitors')}>
              Manage
            </button>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Competitor</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Articles: {comp.article_count}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${comp.monitoring_status === 'Active' ? 'badge-active' : 'badge-offline'}`}>
                        {comp.monitoring_status}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-method">
                        RSS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

