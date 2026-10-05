// src/services/simulationEngine.js

/**
 * 100-Site Concurrency Simulation Engine
 * Runs a simulated high-throughput monitoring check across N dummy websites 
 * with W concurrent workers using JavaScript Promises.
 */
export const run100SiteSimulation = async (workersCount = 10, sitesCount = 100) => {
  const startTime = Date.now();
  const sites = Array.from({ length: sitesCount }, (_, i) => ({
    id: i + 1,
    name: `Dummy Competitor Site #${i + 1}`,
    url: `https://competitor-${i + 1}.example.com/rss`,
    method: i % 5 === 0 ? 'Sitemap' : i % 7 === 0 ? 'Direct Page' : 'RSS'
  }));

  let successful = 0;
  let failed = 0;
  const sampleResults = [];

  // Helper to simulate a single site check
  const checkSingleSite = async (site) => {
    // Simulate realistic network latency (10ms to 60ms)
    const latency = Math.floor(Math.random() * 50) + 12;
    await new Promise(res => setTimeout(res, latency));

    // Simulate occasional 3% error/timeout rate to demonstrate error isolation
    const isError = Math.random() < 0.03;
    const articlesFound = isError ? 0 : (Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 1 : 0);

    const result = {
      id: site.id,
      name: site.name,
      url: site.url,
      method: site.method,
      status: isError ? 'Failed' : 'Success',
      response_time_ms: latency,
      articles_found: articlesFound,
      error_message: isError ? 'Simulated connection timeout / 503 response' : null
    };

    if (isError) {
      failed++;
    } else {
      successful++;
    }

    return result;
  };

  // Run in concurrent worker pools (e.g. 10 workers concurrently)
  const results = [];
  for (let i = 0; i < sites.length; i += workersCount) {
    const chunk = sites.slice(i, i + workersCount);
    const chunkResults = await Promise.all(chunk.map(site => checkSingleSite(site)));
    results.push(...chunkResults);
  }

  const endTime = Date.now();
  const totalDurationSeconds = parseFloat(((endTime - startTime) / 1000).toFixed(2));

  return {
    total_websites: sitesCount,
    concurrent_workers: workersCount,
    successful,
    failed,
    total_monitoring_time_seconds: totalDurationSeconds,
    average_site_latency_ms: Math.round(results.reduce((acc, r) => acc + r.response_time_ms, 0) / sitesCount),
    sample_results: results.slice(0, 15)
  };
};
