import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { fetchMonitoringChecks } from '../services/api';
import { monitoringEngine } from '../services/monitoringEngine';

export default function MonitoringLogsPage() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await fetchMonitoringChecks();
      setChecks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const unsubscribe = monitoringEngine.subscribe(() => {
      loadLogs();
    });
    const interval = setInterval(loadLogs, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);


  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Execution Logs</h1>
          <p className="page-subtitle">Real-time audit log of every background check, strategy execution, response time, and isolated failure.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadLogs}>
          <RefreshCw size={16} /> Refresh Audit Log
        </button>
      </div>

      <div className="section-box">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Started At</th>
                <th>Competitor</th>
                <th>Status</th>
                <th>Detection Method</th>
                <th>Articles Found</th>
                <th>Response Time</th>
                <th>Details / Error Log</th>
              </tr>
            </thead>
            <tbody>
              {checks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No monitoring check logs recorded yet.
                  </td>
                </tr>
              ) : (
                checks.map((chk) => (
                  <tr key={chk.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(chk.started_at).toLocaleTimeString()}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {chk.competitor_name}
                    </td>
                    <td>
                      <span className={`badge ${chk.status === 'Success' ? 'badge-success' : chk.status === 'Failed' ? 'badge-failed' : 'badge-delay-none'}`}>
                        {chk.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-method">{chk.detection_method || 'N/A'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: chk.articles_found > 0 ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                      {chk.articles_found}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {chk.response_time_ms} ms
                    </td>
                    <td style={{ fontSize: '0.8rem', color: chk.error_message ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      {chk.error_message || 'Completed cleanly without error.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
