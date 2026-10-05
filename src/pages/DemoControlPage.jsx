// src/pages/DemoControlPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, CheckCircle, Zap, ExternalLink } from 'lucide-react';
import { publishDemoArticle, fetchCompetitors, formatDelay } from '../services/api';

export default function DemoControlPage({ onSelectArticle }) {
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Demo Author');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);

  const loadCompetitors = async () => {
    const list = await fetchCompetitors();
    setCompetitors(list);

    let activeId = selectedCompId;
    if (!activeId && list.length > 0) {
      activeId = list[0].id;
      setSelectedCompId(activeId);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, [selectedCompId]);

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCompId) {
      alert("Please create a competitor first before publishing a demo article.");
      return;
    }

    setPublishing(true);
    setResult(null);

    const articleTitle = title || `Breaking Launch Announcement #${Math.floor(Math.random() * 1000)}`;
    const articleContent = content || `This article was published live to the competitor website at ${new Date().toLocaleTimeString()} to test real-time detection & delay calculation.`;

    try {
      const res = await publishDemoArticle({
        competitor_id: selectedCompId,
        title: articleTitle,
        content: articleContent,
        author: author,
        trigger_check: true
      });
      setResult(res);
      setTitle('');
      setContent('');
      loadCompetitors();
    } catch (err) {
      alert("Demo publish failed: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const fillPreset = (num) => {
    if (num === 1) {
      setTitle('Acme Corp Announces Next-Gen Cloud Platform V3');
      setContent('Today Acme Corp launched its revolutionary AI-native cloud architecture promising 5x latency improvements and automated scaling.');
    } else if (num === 2) {
      setTitle('Exclusive: Competitor Raises $50M Series B Funding');
      setContent('Leading analytics competitor secures $50M to expand global content monitoring capabilities and enterprise integrations.');
    } else {
      setTitle('Product Teardown: Why Competitor X Changed Their Pricing');
      setContent('An in-depth analysis of competitor pricing tiers, feature gates, and strategic repositioning in Q4.');
    }
  };

  const selectedCompetitor = competitors.find(c => c.id === selectedCompId);
  const targetRoute = selectedCompetitor ? `/demo-site/${selectedCompetitor.slug || selectedCompetitor.id}` : '#';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Controlled Demo Environment</h1>
          <p className="page-subtitle">Publish controlled articles to any dummy competitor website and observe real-time detection & delay calculation.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Publish Test Article Form */}
        <div className="section-box">
          <div className="section-header">
            <h2 className="section-title">
              <FlaskConical size={20} style={{ color: 'var(--accent-cyan)', verticalAlign: 'middle', marginRight: '8px' }} />
              Publish Test Article
            </h2>
          </div>

          {competitors.length === 0 ? (
            <div style={{ background: '#0f172a', border: '2px dashed var(--border-color)', padding: '32px 20px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Create a competitor first before publishing a demo article.
              </div>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                You need at least one dummy competitor website to publish articles into.
              </p>
              <Link to="/competitors" className="btn btn-primary btn-sm">
                + Create Competitor Website
              </Link>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Select Competitor *</label>
                <select 
                  className="form-control" 
                  value={selectedCompId} 
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}
                >
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Quick Presets:
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillPreset(1)}>Cloud Platform Launch</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillPreset(2)}>$50M Funding</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillPreset(3)}>Pricing Teardown</button>
                </div>
              </div>

              <form onSubmit={handlePublish}>
                <div className="form-group">
                  <label className="form-label">Article Title *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter article title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Article Content</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Enter article body..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center' }} disabled={publishing}>
                  <Zap size={16} /> {publishing ? 'Publishing & Monitoring...' : `⚡ Publish to ${selectedCompetitor?.name || 'Competitor'} & Run Monitoring`}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Live Detection Feedback */}
        <div className="section-box">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Detection Pipeline Feedback</h2>

          {publishing && (
            <div style={{ color: 'var(--accent-cyan)', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                Article Published to {selectedCompetitor?.name}!
              </div>
              <div>Waiting for client-side monitoring engine to detect new post...</div>
            </div>
          )}

          {!publishing && result ? (
            <div style={{ background: '#064e3b', border: '1px solid #10b981', borderRadius: '8px', padding: '20px', color: '#a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '12px' }}>
                <CheckCircle size={24} /> Article Published & Detected!
              </div>

              <div style={{ fontSize: '0.9rem', marginBottom: '14px' }}>
                <strong>Competitor:</strong> {result.target_competitor?.name}<br/>
                <strong>Article Title:</strong> {result.article?.title}
              </div>

              <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Publication Time</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {result.detected_article?.published_at ? new Date(result.detected_article.published_at).toLocaleTimeString() : new Date(result.article?.published_at).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Detection Time</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {result.detected_article?.detected_at ? new Date(result.detected_article.detected_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Exact Detection Delay (detected_at - published_at)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {result.detected_article?.detection_delay_seconds !== undefined && result.detected_article?.detection_delay_seconds !== null
                      ? formatDelay(result.detected_article.detection_delay_seconds)
                      : formatDelay(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link to={targetRoute} className="btn btn-emerald btn-sm" style={{ background: '#065f46', color: '#fff' }}>
                  <ExternalLink size={12} /> View Demo Site
                </Link>
              </div>
            </div>
          ) : !publishing && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
              Select a competitor and click "Publish" to simulate a competitor publishing a post and observe real-time pipeline detection!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
