// src/pages/DemoArticlePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCompetitors, getDummyFeeds, getArticles } from '../services/storage';
import { ArrowLeft, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { formatDelay } from '../services/api';

export default function DemoArticlePage() {
  const { competitorSlug, articleSlug } = useParams();
  const navigate = useNavigate();
  const [competitor, setCompetitor] = useState(null);
  const [article, setArticle] = useState(null);
  const [detectedRecord, setDetectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const competitors = getCompetitors();
    const comp = competitors.find(c => c.slug === competitorSlug || c.id === competitorSlug);

    if (comp) {
      setCompetitor(comp);
      const feeds = getDummyFeeds();
      const compArticles = feeds[comp.id] || [];
      const art = compArticles.find(a => a.slug === articleSlug || a.id === articleSlug);
      
      setArticle(art || compArticles[0] || null);

      // Check if detected in BlogSpy articles store
      const detectedArticles = getArticles();
      const targetUrl = `/demo-site/${comp.slug}/articles/${articleSlug}`;
      const det = detectedArticles.find(a => a.source_url === targetUrl || (art && a.title === art.title));
      setDetectedRecord(det || null);
    }
    setLoading(false);
  }, [competitorSlug, articleSlug]);

  if (loading) {
    return <div style={{ padding: '60px', color: '#94a3b8', textAlign: 'center' }}>Loading Article Page...</div>;
  }

  if (!article) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '32px', background: '#1e293b', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#f8fafc' }}>Article Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>No article exists for slug: <code>{articleSlug}</code></p>
        <Link to={`/demo-site/${competitorSlug}`} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Competitor Website
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* BlogSpy Control Bar */}
      <div style={{ background: '#1e1b4b', borderBottom: '1px solid #4338ca', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>🕵️‍♂️</span>
          <span style={{ fontWeight: 700, color: '#a5b4fc' }}>BlogSpy Article Page View:</span>
          <span style={{ color: '#e0e7ff' }}>{competitor?.name} Blog Post</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/demo-site/${competitorSlug}`} className="btn btn-secondary btn-sm" style={{ background: '#312e81', color: '#c7d2fe' }}>
            <ArrowLeft size={12} /> ← Back to {competitor?.name || 'Competitor'} Website
          </Link>
          <Link to="/articles" className="btn btn-emerald btn-sm">
            View in BlogSpy Dashboard
          </Link>
        </div>
      </div>

      {/* Main Article Container */}
      <main style={{ maxWidth: '820px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link to={`/demo-site/${competitorSlug}`} style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Back to {competitor?.name} Articles
          </Link>
        </div>

        {/* Article Card */}
        <article style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '36px' }}>
          <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            {competitor?.name} Press Release
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '16px' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <span><User size={14} style={{ verticalAlign: 'middle' }} /> {article.author || 'Editorial Staff'}</span>
            <span><Calendar size={14} style={{ verticalAlign: 'middle' }} /> Published: {new Date(article.published_at).toLocaleString()}</span>
          </div>

          {/* Detection Info Card if Detected */}
          {detectedRecord && (
            <div style={{ background: '#064e3b', border: '1px solid #10b981', borderRadius: '8px', padding: '16px 20px', marginBottom: '28px', color: '#a7f3d0', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Captured by BlogSpy Monitoring Loop
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '8px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>Publication Time</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{new Date(detectedRecord.published_at).toLocaleTimeString()}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>Detection Time</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{new Date(detectedRecord.detected_at).toLocaleTimeString()}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>Exact Detection Delay</div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{formatDelay(detectedRecord.detection_delay_seconds)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Article Body Content */}
          <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#f8fafc', whiteSpace: 'pre-line' }}>
            {article.body || article.content || 'Article content...'}
          </div>
        </article>

        {/* Footer Navigation */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <Link to={`/demo-site/${competitorSlug}`} className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to {competitor?.name} Homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
