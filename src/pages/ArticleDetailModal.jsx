import React from 'react';
import { X, ExternalLink, Clock, Tag, User, Calendar } from 'lucide-react';
import { formatDelay } from '../services/api';

export default function ArticleDetailModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-method">{article.detection_method}</span>
            <span style={{ marginLeft: '8px' }} className={`badge ${article.detection_delay_seconds === null ? 'badge-delay-none' : 'badge-delay-good'}`}>
              <Clock size={12} style={{ marginRight: '4px' }} />
              {article.detection_delay_seconds === null ? 'Publication time unavailable' : formatDelay(article.detection_delay_seconds)}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>{article.title}</h2>

        <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Publication Time</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {article.published_at ? new Date(article.published_at).toLocaleString() : 'Publication time unavailable'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Detection Time</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {article.detected_at ? new Date(article.detected_at).toLocaleString() : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Detection Delay</div>
              <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {article.detection_delay_seconds === null ? 'Publication time unavailable' : formatDelay(article.detection_delay_seconds)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span><strong>Competitor:</strong> {article.competitor_name}</span>
          {article.author && <span><User size={14} style={{ verticalAlign: 'middle' }} /> {article.author}</span>}
        </div>

        {article.featured_image && (
          <img
            src={article.featured_image}
            alt={article.title}
            style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }}
          />
        )}

        {article.meta_description && (
          <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', fontStyle: 'italic' }}>
            "{article.meta_description}"
          </div>
        )}

        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '24px', whiteSpace: 'pre-line' }}>
          {article.content || 'No article preview body extracted.'}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {article.tags.map((t, idx) => (
              <span key={idx} style={{ background: '#334155', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <a href={article.source_url || '#'} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            <ExternalLink size={14} /> Open Source Page
          </a>
          <a href={article.canonical_url || article.source_url || '#'} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            Canonical URL
          </a>
        </div>
      </div>
    </div>
  );
}
