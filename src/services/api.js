// src/services/api.js
import { 
  getCompetitors, 
  setCompetitors, 
  getArticles, 
  setArticles, 
  getMonitoringLogs, 
  setMonitoringLogs,
  getDummyFeeds,
  setDummyFeeds 
} from './storage';
import { publishDemoArticleToFeed } from './competitorFeed';
import { monitoringEngine } from './monitoringEngine';
import { run100SiteSimulation } from './simulationEngine';
import { slugify } from '../utils/slugify';

/**
 * Format exact numerical delay into human readable string
 * e.g., 7 sec, 1 min 24 sec, 2 hr 10 min 05 sec
 */
export const formatDelay = (seconds) => {
  if (seconds === null || seconds === undefined) return 'Publication time unavailable';
  const sec = Math.max(0, Math.floor(seconds));
  if (sec < 60) {
    return `${sec} sec`;
  }
  const mins = Math.floor(sec / 60);
  const remSec = sec % 60;
  const remSecStr = remSec < 10 ? `0${remSec}` : `${remSec}`;
  if (mins < 60) {
    return `${mins} min ${remSecStr} sec`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours} hr ${remMins} min ${remSecStr} sec`;
};

/**
 * Fetch Dashboard KPI Stats & Data
 */
export const fetchDashboardStats = async () => {
  const competitors = getCompetitors();
  const articles = getArticles();

  const activeComps = competitors.filter(c => c.monitoring_status === 'Active' && c.monitoring_enabled);
  const offlineComps = competitors.filter(c => c.monitoring_status !== 'Active' || !c.monitoring_enabled);

  const delays = articles
    .map(a => a.detection_delay_seconds)
    .filter(d => typeof d === 'number' && !isNaN(d));

  const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : null;
  const fastestDelay = delays.length > 0 ? Math.min(...delays) : null;
  const slowestDelay = delays.length > 0 ? Math.max(...delays) : null;

  const competitorsWithCounts = competitors.map(c => ({
    ...c,
    article_count: articles.filter(a => a.competitor_id === c.id).length
  }));

  return {
    stats: {
      total_competitors: competitors.length,
      online_competitors: activeComps.length,
      offline_competitors: offlineComps.length,
      total_articles: articles.length,
      avg_delay_seconds: avgDelay,
      fastest_delay_seconds: fastestDelay,
      slowest_delay_seconds: slowestDelay
    },
    recent_articles: articles.slice(0, 10),
    competitors: competitorsWithCounts
  };
};

/**
 * Fetch list of competitors
 */
export const fetchCompetitors = async () => {
  const competitors = getCompetitors();
  const articles = getArticles();
  return competitors.map(c => ({
    ...c,
    article_count: articles.filter(a => a.competitor_id === c.id).length
  }));
};

/**
 * Add a new competitor website
 * Input: { name }
 * Generates unique slug and internal route /demo-site/{slug}
 * Seeds initial baseline articles
 */
export const addCompetitor = async ({ name }) => {
  const competitors = getCompetitors();
  let baseSlug = slugify(name) || 'competitor-' + Date.now();
  
  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (competitors.some(c => c.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newId = 'comp-' + slug;
  const websiteUrl = `/demo-site/${slug}`;

  const newComp = {
    id: newId,
    name: name.trim(),
    slug: slug,
    website_url: websiteUrl,
    monitoring_status: 'Active',
    monitoring_enabled: true,
    monitoring_interval: 5,
    created_at: new Date().toISOString(),
    last_checked_at: new Date().toISOString(),
    discovered_methods: {
      rss: true,
      sitemap: true,
      direct_page: true,
      recommended_method: 'RSS'
    }
  };

  setCompetitors([newComp, ...competitors]);

  // Initial empty feed for new competitor (starts with 0 articles)
  const feeds = getDummyFeeds();
  feeds[newId] = [];
  setDummyFeeds(feeds);

  return {
    success: true,
    competitor: newComp
  };
};


/**
 * Delete competitor
 */
export const deleteCompetitor = async (id) => {
  const competitors = getCompetitors().filter(c => c.id !== id);
  setCompetitors(competitors);

  const articles = getArticles().filter(a => a.competitor_id !== id);
  setArticles(articles);

  const feeds = getDummyFeeds();
  delete feeds[id];
  setDummyFeeds(feeds);

  return { success: true };
};

/**
 * Toggle competitor active/paused monitoring state
 */
export const toggleCompetitor = async (id) => {
  const competitors = getCompetitors();
  const compIndex = competitors.findIndex(c => c.id === id);
  if (compIndex !== -1) {
    const currentEnabled = competitors[compIndex].monitoring_enabled;
    competitors[compIndex].monitoring_enabled = !currentEnabled;
    competitors[compIndex].monitoring_status = !currentEnabled ? 'Active' : 'Paused';
    setCompetitors(competitors);
  }
  return { success: true };
};

/**
 * Analyze competitor
 */
export const analyzeCompetitor = async (id) => {
  return {
    success: true,
    rss: true,
    sitemap: true,
    recommended_method: 'RSS'
  };
};

/**
 * Trigger manual monitoring check on competitor
 */
export const triggerCheck = async (id) => {
  return await monitoringEngine.checkCompetitor(id);
};

/**
 * Fetch articles list with filters
 */
export const fetchArticles = async (params = {}) => {
  let articles = getArticles();
  if (params.competitor_id) {
    articles = articles.filter(a => a.competitor_id === params.competitor_id);
  }
  if (params.method) {
    articles = articles.filter(a => a.detection_strategy === params.method || a.detection_method === params.method);
  }
  return articles;
};

/**
 * Fetch article detail
 */
export const fetchArticleDetail = async (id) => {
  const articles = getArticles();
  const article = articles.find(a => a.id === id);
  return article || null;
};

/**
 * Fetch monitoring execution audit logs
 */
export const fetchMonitoringChecks = async () => {
  return getMonitoringLogs();
};

/**
 * Publish demo article to specific dummy competitor feed and run monitoring check
 */
export const publishDemoArticle = async ({ competitor_id, title, content, author, trigger_check = true }) => {
  // Publish article to selected competitor's RSS feed
  const publishRes = publishDemoArticleToFeed({ competitorId: competitor_id, title, content, author });
  const publishedArt = publishRes.published_article;

  let detectedArt = null;

  if (trigger_check) {
    // Wait 1.5 seconds to demonstrate realistic non-zero delay
    await new Promise(res => setTimeout(res, 1500));
    
    // Check ONLY the selected competitor's feed
    const checkRes = await monitoringEngine.checkCompetitor(publishedArt.competitor_id);
    if (checkRes.detectedArticles && checkRes.detectedArticles.length > 0) {
      detectedArt = checkRes.detectedArticles.find(a => a.source_url === publishedArt.source_url) || checkRes.detectedArticles[0];
    }
  }

  return {
    success: true,
    article: publishedArt,
    detected_article: detectedArt
  };
};

/**
 * Run 100-site simulation
 */
export const run100SiteTest = async (workers = 10, sites = 100) => {
  return await run100SiteSimulation(workers, sites);
};
