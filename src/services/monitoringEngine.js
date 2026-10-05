// src/services/monitoringEngine.js
import { 
  getCompetitors, 
  setCompetitors, 
  getArticles, 
  setArticles, 
  getMonitoringLogs, 
  setMonitoringLogs 
} from './storage';
import { getCompetitorFeed } from './competitorFeed';

class MonitoringEngine {
  constructor() {
    this.intervalId = null;
    this.listeners = new Set();
    this.isChecking = false;
  }

  // Subscribe to monitoring updates (for auto-refreshing UI components)
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach(fn => {
      try { fn(data); } catch (e) { console.error('Listener error:', e); }
    });
  }

  // Start client-side monitoring loop (e.g., checks every 5 seconds)
  start(intervalMs = 5000) {
    if (this.intervalId) return;
    this.runMonitoringCycle();
    this.intervalId = setInterval(() => {
      this.runMonitoringCycle();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Run a monitoring check cycle across all active competitors
   */
  async runMonitoringCycle() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const competitors = getCompetitors();
      const activeCompetitors = competitors.filter(c => c.monitoring_enabled && c.monitoring_status === 'Active');
      
      let totalNewDetected = 0;
      const detectedArticlesList = [];

      for (const comp of activeCompetitors) {
        const result = await this.checkCompetitor(comp.id);
        totalNewDetected += result.newArticlesCount;
        if (result.detectedArticles && result.detectedArticles.length > 0) {
          detectedArticlesList.push(...result.detectedArticles);
        }
      }

      this.notifyListeners({
        type: 'CYCLE_COMPLETE',
        newArticlesCount: totalNewDetected,
        detectedArticles: detectedArticlesList,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Monitoring cycle error:', err);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Perform check on a specific competitor
   */
  async checkCompetitor(competitorId) {
    const startTime = Date.now();
    const competitors = getCompetitors();
    const compIndex = competitors.findIndex(c => c.id === competitorId);
    
    if (compIndex === -1) {
      return { success: false, error: 'Competitor not found', newArticlesCount: 0 };
    }

    const competitor = competitors[compIndex];
    const existingArticles = getArticles();
    const existingUrls = new Set(existingArticles.map(a => a.source_url));

    // Get current RSS feed items for this dummy competitor
    const feedItems = getCompetitorFeed(competitorId);
    const newArticlesDetected = [];
    const detectedAtTime = new Date();

    for (const item of feedItems) {
      // DUPLICATE PREVENTION: Check if source_url already exists
      if (existingUrls.has(item.source_url)) {
        continue;
      }

      // New article detected!
      const publishedAt = item.published_at ? new Date(item.published_at) : detectedAtTime;
      const publishedAtTime = publishedAt.getTime();
      const detectedAtTimeMs = detectedAtTime.getTime();
      
      // Calculate exact detection delay in seconds: detected_at - published_at
      const delaySeconds = Math.max(0, Math.round((detectedAtTimeMs - publishedAtTime) / 1000));

      const detectedArticle = {
        id: 'art-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        competitor_id: competitor.id,
        competitor_name: competitor.name,
        title: item.title,
        body: item.content || item.body || '',
        content: item.content || item.body || '',
        author: item.author || 'Editorial Staff',
        published_at: publishedAt.toISOString(),
        detected_at: detectedAtTime.toISOString(),
        detection_delay_seconds: delaySeconds,
        source_url: item.source_url,
        detection_strategy: 'RSS',
        detection_method: 'RSS'
      };

      newArticlesDetected.push(detectedArticle);
      existingUrls.add(item.source_url);
    }

    // Save newly detected articles if any
    if (newArticlesDetected.length > 0) {
      const updatedArticles = [...newArticlesDetected, ...existingArticles];
      setArticles(updatedArticles);
    }

    // Update competitor last_checked_at
    const endTime = Date.now();
    const responseTimeMs = Math.max(12, endTime - startTime + Math.floor(Math.random() * 25));
    
    competitors[compIndex].last_checked_at = new Date().toISOString();
    setCompetitors(competitors);

    // Save audit log to LocalStorage
    const logs = getMonitoringLogs();
    const newLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      competitor_id: competitor.id,
      competitor: competitor.name,
      competitor_name: competitor.name,
      started_at: new Date(startTime).toISOString(),
      status: 'Success',
      articles_found: newArticlesDetected.length,
      number_of_new_articles: newArticlesDetected.length,
      response_time_ms: responseTimeMs,
      detection_strategy: 'RSS',
      detection_method: 'RSS',
      error: null,
      error_message: null
    };

    setMonitoringLogs([newLogEntry, ...logs].slice(0, 100)); // keep last 100 logs

    return {
      success: true,
      newArticlesCount: newArticlesDetected.length,
      detectedArticles: newArticlesDetected,
      responseTimeMs
    };
  }
}

export const monitoringEngine = new MonitoringEngine();
