import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  FileText, 
  Activity, 
  FlaskConical, 
  Zap 
} from 'lucide-react';

export default function Sidebar({ activeTab }) {
  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'competitors', path: '/competitors', label: 'Competitors', icon: Globe },
    { id: 'articles', path: '/articles', label: 'Articles', icon: FileText },
    { id: 'logs', path: '/monitoring-logs', label: 'Monitoring Logs', icon: Activity },
    { id: 'demo', path: '/demo', label: 'Demo Mode', icon: FlaskConical },
    { id: 'test100', path: '/test-100', label: '100-Site Test', icon: Zap },
  ];

  return (
    <div className="sidebar">
      <Link to="/dashboard" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-icon">🕵️‍♂️</div>
        <div>
          <div className="brand-title">BlogSpy</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Content Monitor V1</div>
        </div>
      </Link>

      <ul className="nav-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div><strong style={{ color: 'var(--text-primary)' }}>JS Client Engine</strong></div>
        <div style={{ marginTop: '4px' }}>LocalStorage Persisted</div>
        <div style={{ marginTop: '4px', color: 'var(--accent-emerald)' }}>● Loop Interval: 5s</div>
      </div>
    </div>
  );
}


