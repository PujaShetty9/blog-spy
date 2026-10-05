// src/services/storage.js

const KEYS = {
  COMPETITORS: 'competitors',
  ARTICLES: 'articles',
  MONITORING_LOGS: 'monitoring_logs',
  DUMMY_FEEDS: 'dummy_competitor_feeds',
};

const RESET_KEY = 'blogspy_clean_v1_reset';

export const initStorage = () => {
  // Purge any legacy sample data from previous versions
  if (!localStorage.getItem(RESET_KEY)) {
    localStorage.removeItem(KEYS.COMPETITORS);
    localStorage.removeItem(KEYS.ARTICLES);
    localStorage.removeItem(KEYS.MONITORING_LOGS);
    localStorage.removeItem(KEYS.DUMMY_FEEDS);
    localStorage.setItem(RESET_KEY, 'true');
  }

  if (!localStorage.getItem(KEYS.COMPETITORS)) {
    localStorage.setItem(KEYS.COMPETITORS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.DUMMY_FEEDS)) {
    localStorage.setItem(KEYS.DUMMY_FEEDS, JSON.stringify({}));
  }
  if (!localStorage.getItem(KEYS.ARTICLES)) {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MONITORING_LOGS)) {
    localStorage.setItem(KEYS.MONITORING_LOGS, JSON.stringify([]));
  }
};

export const getCompetitors = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.COMPETITORS)) || [];
  } catch (e) {
    return [];
  }
};

export const setCompetitors = (competitors) => {
  localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(competitors));
};

export const getArticles = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.ARTICLES)) || [];
  } catch (e) {
    return [];
  }
};

export const setArticles = (articles) => {
  localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
};

export const getMonitoringLogs = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.MONITORING_LOGS)) || [];
  } catch (e) {
    return [];
  }
};

export const setMonitoringLogs = (logs) => {
  localStorage.setItem(KEYS.MONITORING_LOGS, JSON.stringify(logs));
};

export const getDummyFeeds = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.DUMMY_FEEDS)) || {};
  } catch (e) {
    return {};
  }
};

export const setDummyFeeds = (feeds) => {
  localStorage.setItem(KEYS.DUMMY_FEEDS, JSON.stringify(feeds));
};
