import React, { useState } from 'react';
import { Zap, ShieldCheck, AlertOctagon, CheckCircle2, Clock, Users } from 'lucide-react';
import { run100SiteTest } from '../services/api';

export default function Test100Page() {
  const [workers, setWorkers] = useState(10);
  const [sites, setSites] = useState(100);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunTest = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await run100SiteTest(workers, sites);
      setResult(res);
    } catch (e) {
      alert("Simulation error: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">100-Website Concurrency Simulation</h1>
          <p className="page-subtitle">Demonstrates high-throughput concurrent monitoring, thread isolation, and error tolerance at scale.</p>
        </div>
      </div>

      <div className="section-box">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">Total Websites to Monitor</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ width: '140px' }} 
              value={sites}
              onChange={(e) => setSites(parseInt(e.target.value) || 100)}
            />
          </div>

          <div>
            <label className="form-label">Concurrent Worker Threads</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ width: '140px' }} 
              value={workers}
              onChange={(e) => setWorkers(parseInt(e.target.value) || 10)}
            />
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button className="btn btn-primary" onClick={handleRunTest} disabled={running}>
              <Zap size={16} /> {running ? 'Running 100-Site Simulation...' : 'Run Concurrency Test'}
            </button>
          </div>
        </div>

        {running && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--accent-cyan)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Executing Concurrent Check Cycle across {sites} Websites...
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Dispatching work across {workers} parallel ThreadPoolExecutor workers...
            </div>
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: '#090d16', border: '1px solid var(--accent-primary)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                ========================================<br/>
                100 WEBSITE MONITORING TEST RESULTS<br/>
                ========================================
              </div>

              <div className="grid-cards" style={{ marginBottom: '20px' }}>
                <div className="card">
                  <div className="card-title">Total Websites</div>
                  <div className="card-value">{result.total_websites}</div>
                </div>

                <div className="card">
                  <div className="card-title">Parallel Workers</div>
                  <div className="card-value" style={{ color: 'var(--accent-cyan)' }}>{result.concurrent_workers}</div>
                </div>

                <div className="card">
                  <div className="card-title">Successful / Failed</div>
                  <div className="card-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.5rem' }}>
                    {result.successful} / <span style={{ color: 'var(--accent-rose)' }}>{result.failed}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Total Cycle Time</div>
                  <div className="card-value" style={{ color: '#fbbf24', fontSize: '1.5rem' }}>
                    {result.total_monitoring_time_seconds}s
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
                ✓ Key Result: {result.failed} failed/timeout websites were safely isolated and did NOT crash or delay the other {result.successful} successful website checks!
              </div>
            </div>

            {/* Sample Table */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Sample Results Breakdown (First 15 Sites)</h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Site ID</th>
                    <th>Competitor URL</th>
                    <th>Status</th>
                    <th>Strategy</th>
                    <th>Articles Detected</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sample_results.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>#{s.id}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                      <td>
                        <span className={`badge ${s.status === 'Failed' ? 'badge-failed' : 'badge-success'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td><span className="badge badge-method">{s.method}</span></td>
                      <td style={{ fontWeight: 700 }}>{s.articles_found}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.response_time_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
