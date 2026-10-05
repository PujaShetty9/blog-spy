// src/pages/DemoCompetitorSitePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCompetitors, getDummyFeeds } from '../services/storage';
import { ArrowLeft, Calendar, User, ExternalLink, Zap } from 'lucide-react';

export default function DemoCompetitorSitePage() {
  const { competitorSlug } = useParams();
  const navigate = useNavigate();
  const [competitor, setCompetitor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const competitors = getCompetitors();
    const comp = competitors.find(c => c.slug === competitorSlug || c.id === competitorSlug);

    if (comp) {
      setCompetitor(comp);
      const feeds = getDummyFeeds();
      setArticles(feeds[comp.id] || []);
    }
    setLoading(false);
  }, [competitorSlug]);

  if (loading) {
    return <div style={{ padding: '60px', color: '#94a3b8', textAlign: 'center' }}>Loading Competitor Website...</div>;
  }

  if (!competitor) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '32px', background: '#1e293b', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#f8fafc' }}>Competitor Website Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>No dummy competitor website exists for slug: <code>{competitorSlug}</code></p>
        <Link to="/competitors" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Competitors Manager
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* BlogSpy Top Control Bar */}
      <div style={{ background: '#1e1b4b', borderBottom: '1px solid #4338ca', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>🕵️‍♂️</span>
          <span style={{ fontWeight: 700, color: '#a5b4fc' }}>BlogSpy Competitor Simulator:</span>
          <span style={{ color: '#e0e7ff' }}>Viewing Live Website for <strong>{competitor.name}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/demo" className="btn btn-emerald btn-sm">
            <Zap size={12} /> Publish Test Article to {competitor.name}
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ background: '#312e81', color: '#c7d2fe' }}>
            <ArrowLeft size={12} /> Back to BlogSpy Dashboard
          </Link>
        </div>
      </div>

      {/* Competitor Header Branding */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #334155', padding: '24px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                {competitor.name.charAt(0).toUpperCase()}
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {competitor.name.toUpperCase()}
              </h1>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Official Press Room & Engineering Blog
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
            <span>Home</span>
            <span>Products</span>
            <span style={{ color: '#f8fafc', fontWeight: 600, borderBottom: '2px solid #06b6d4', paddingBottom: '4px' }}>Blog</span>
            <span>About</span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Intro Hero */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px 32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            {competitor.name} Official Press Room & Blog
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Official announcements, technical updates, and company news.
          </p>
        </div>

        {/* Articles List Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Published Articles ({articles.length})
          </h3>
        </div>

        {articles.length === 0 ? (
          <div style={{ background: '#0f172a', border: '2px dashed #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No articles published yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {articles.map((art) => {
              const articleUrl = `/demo-site/${competitor.slug}/articles/${art.slug || art.id}`;
              return (
                <article 
                  key={art.id} 
                  style={{ 
                    background: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '12px', 
                    padding: '24px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                    <Link to={articleUrl} style={{ color: '#f8fafc', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
                    <span><User size={12} style={{ verticalAlign: 'middle' }} /> {art.author || 'Editorial Staff'}</span>
                    <span><Calendar size={12} style={{ verticalAlign: 'middle' }} /> Published: {new Date(art.published_at).toLocaleString()}</span>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>
                    {art.body || art.content || 'Article excerpt...'}
                  </p>

                  <Link to={articleUrl} className="btn btn-secondary btn-sm">
                    Read Full Article <ExternalLink size={12} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #334155', marginTop: '60px', paddingTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        © 2026 {competitor.name}. All rights reserved.
      </footer>
    </div>
  );
}
