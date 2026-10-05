// src/services/competitorFeed.js
import { getDummyFeeds, setDummyFeeds, getCompetitors } from './storage';
import { slugify } from '../utils/slugify';

/**
 * Get published feed items for a specific competitor ID
 */
export const getCompetitorFeed = (competitorId) => {
  const feeds = getDummyFeeds();
  return feeds[competitorId] || [];
};

/**
 * Publish a new test article to a specific dummy competitor's RSS feed.
 * This simulates the selected competitor publishing an article live on their website.
 * Does NOT mark it as detected. The monitoring engine will detect it on check.
 */
export const publishDemoArticleToFeed = ({ competitorId, title, content, author }) => {
  const feeds = getDummyFeeds();
  const competitors = getCompetitors();
  const competitor = competitors.find(c => c.id === competitorId) || competitors[0];

  if (!competitor) {
    throw new Error('No competitor found. Please create a competitor first.');
  }

  const targetCompId = competitor.id;
  const compSlug = competitor.slug || slugify(competitor.name);
  const articleTitle = title || `New Announcement #${Math.floor(Math.random() * 1000)}`;
  const artSlug = slugify(articleTitle) || `article-${Date.now()}`;
  const sourceUrl = `/demo-site/${compSlug}/articles/${artSlug}`;

  const publishedArticle = {
    id: 'feed-art-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    competitor_id: targetCompId,
    competitor_name: competitor.name,
    title: articleTitle,
    slug: artSlug,
    content: content || `Live published article body content on ${competitor.name} website.`,
    body: content || `Live published article body content on ${competitor.name} website.`,
    author: author || 'Editorial Staff',
    published_at: new Date().toISOString(), // exact publication timestamp
    source_url: sourceUrl
  };

  if (!feeds[targetCompId]) {
    feeds[targetCompId] = [];
  }

  feeds[targetCompId].unshift(publishedArticle);
  setDummyFeeds(feeds);

  return {
    success: true,
    published_article: publishedArticle,
    target_competitor: competitor
  };
};
