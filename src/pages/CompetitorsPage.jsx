// src/pages/CompetitorsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, RefreshCw, Trash2, Power, ExternalLink } from 'lucide-react';
import { 
  fetchCompetitors, 
  addCompetitor, 
  deleteCompetitor, 
  toggleCompetitor, 
  triggerCheck 
} from '../services/api';
import { monitoringEngine } from '../services/monitoringEngine';

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingId, setCheckingId] = useState(null);

  const loadData = async () => {
    try {
      const list = await fetchCompetitors();
      setCompetitors(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = monitoringEngine.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    try {
      await addCompetitor({ name: name.trim() });
      setName('');
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      alert("Error adding competitor: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    await toggleCompetitor(id);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this competitor and its articles?")) {
      await deleteCompetitor(id);
      loadData();
    }
  };

  const handleManualCheck = async (id) => {
    setCheckingId(id);
    await triggerCheck(id);
    await loadData();
    setCheckingId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Competitor Management</h1>
          <p className="page-subtitle">Manage internal dummy competitor websites and RSS monitoring loops.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Competitor Website
        </button>
      </div>

      <div className="section-box">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Competitor Name</th>
                <th>Internal Website Route</th>
                <th>Strategy</th>
                <th>Status</th>
                <th>Last Checked</th>
                <th>Articles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {competitors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No competitors added yet. Click "Create Competitor Website" above.
                  </td>
                </tr>
              ) : (
                competitors.map((comp) => {
                  const websiteRoute = `/demo-site/${comp.slug || comp.id}`;
                  return (
                    <tr key={comp.id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{comp.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Created {new Date(comp.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Link to={websiteRoute} style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                          {websiteRoute}
                        </Link>
                      </td>
                      <td>
                        <span className="badge badge-method">
                          RSS
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${comp.monitoring_status === 'Active' ? 'badge-active' : 'badge-offline'}`}>
                          {comp.monitoring_status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {comp.last_checked_at ? new Date(comp.last_checked_at).toLocaleTimeString() : 'Never'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {comp.article_count}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            title="Run Manual Check"
                            onClick={() => handleManualCheck(comp.id)}
                            disabled={checkingId === comp.id}
                          >
                            <RefreshCw size={12} className={checkingId === comp.id ? 'spin' : ''} /> Check
                          </button>
                          <button 
                            className={`btn btn-sm ${comp.monitoring_enabled ? 'btn-secondary' : 'btn-emerald'}`}
                            title="Toggle Monitoring"
                            onClick={() => handleToggle(comp.id)}
                          >
                            <Power size={12} /> {comp.monitoring_enabled ? 'Pause' : 'Resume'}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            title="Delete"
                            onClick={() => handleDelete(comp.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Create Competitor Website</h2>
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Competitor Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Acme Technologies, CloudNova, TechSphere" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  A dummy competitor website page will automatically be generated at <code>/demo-site/&lt;slug&gt;</code>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Website...' : 'Create Competitor Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
