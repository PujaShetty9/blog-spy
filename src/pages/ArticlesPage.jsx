import React, { useEffect, useState } from 'react';
import { FileText, Filter, Clock, ExternalLink, User, Search } from 'lucide-react';
import { fetchArticles, fetchCompetitors, formatDelay } from '../services/api';
import { monitoringEngine } from '../services/monitoringEngine';

export default function ArticlesPage({ onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const compList = await fetchCompetitors();
      setCompetitors(compList);

      const params = {};
      if (selectedComp) params.competitor_id = selectedComp;
      if (selectedMethod) params.method = selectedMethod;

      let artList = await fetchArticles(params);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        artList = artList.filter(a => 
          (a.title && a.title.toLowerCase().includes(q)) || 
          (a.body && a.body.toLowerCase().includes(q)) ||
          (a.author && a.author.toLowerCase().includes(q))
        );
      }
      setArticles(artList);
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
  }, [selectedComp, selectedMethod, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Detected Articles</h1>
          <p className="page-subtitle">Browse all articles captured by our multi-strategy monitoring engine.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              className="form-control"
              style={{ width: '220px', paddingLeft: '34px' }}
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select 
            className="form-control" 
            style={{ width: '180px' }}
            value={selectedComp} 
            onChange={(e) => setSelectedComp(e.target.value)}
          >
            <option value="">All Competitors</option>
            {competitors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            className="form-control" 
            style={{ width: '160px' }}
            value={selectedMethod} 
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="">All Methods</option>
            <option value="RSS">RSS Feed</option>
            <option value="Sitemap">XML Sitemap</option>
            <option value="Direct Page">Direct Page</option>
          </select>
        </div>
      </div>


      <div className="section-box">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Competitor</th>
                <th>Method</th>
                <th>Published Time</th>
                <th>Detected Time</th>
                <th>Detection Delay</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No articles found matching filters.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} style={{ cursor: 'pointer' }} onClick={() => onSelectArticle(art)}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {art.title}
                      </div>
                      {art.author && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <User size={12} style={{ verticalAlign: 'middle' }} /> {art.author}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {art.competitor_name}
                    </td>
                    <td>
                      <span className="badge badge-method">{art.detection_method}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {art.published_at ? new Date(art.published_at).toLocaleString() : 'Publication time unavailable'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(art.detected_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${art.detection_delay_seconds === null ? 'badge-delay-none' : 'badge-delay-good'}`}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
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
    </div>
  );
}
