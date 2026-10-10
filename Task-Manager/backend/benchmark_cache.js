import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import { flushAllCache, getCacheStats } from './services/cacheService.js';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runBenchmark = async () => {
  console.log('\n======================================================');
  console.log('   TASK MANAGEMENT CACHING BENCHMARK & VERIFICATION   ');
  console.log('======================================================\n');

  // Wait a moment for server & DB connection
  await sleep(1500);

  const baseUrl = 'http://localhost:5000';

  // 1. Flush any prior cache
  flushAllCache();
  console.log('1. Cleared cache before testing.\n');

  const uncachedReadings = [];
  const cachedReadings = [];

  // Helper to make GET /tasks request
  const fetchTasks = async (label) => {
    const start = performance.now();
    const res = await fetch(`${baseUrl}/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const duration = performance.now() - start;
    const data = await res.json();
    const cacheHeader = res.headers.get('x-cache') || (data.cached ? 'HIT' : 'MISS');
    const responseTimeHeader = res.headers.get('x-response-time') || `${duration.toFixed(2)}ms`;

    console.log(
      `[${label}] Status: ${res.status} | X-Cache: ${cacheHeader} | Server Time: ${responseTimeHeader} | Client Roundtrip: ${duration.toFixed(2)}ms | Tasks: ${data.count}`
    );

    return {
      duration: parseFloat(duration.toFixed(2)),
      serverTime: parseFloat(responseTimeHeader.replace('ms', '')),
      cacheHeader,
      cached: data.cached,
    };
  };

  console.log('--- Collecting 3 Sample Readings for UNCACHED (Cache MISS) ---');
  for (let i = 1; i <= 3; i++) {
    // Flush cache before each to guarantee MISS
    flushAllCache();
    const result = await fetchTasks(`Uncached Sample #${i}`);
    uncachedReadings.push(result);
    await sleep(200);
  }

  console.log('\n--- Collecting 3 Sample Readings for CACHED (Cache HIT) ---');
  // First ensure cache is primed
  await fetchTasks('Prime Cache');
  for (let i = 1; i <= 3; i++) {
    const result = await fetchTasks(`Cached Sample #${i}`);
    cachedReadings.push(result);
    await sleep(100);
  }

  console.log('\n--- Testing Cache Invalidation on Write Operations ---');
  console.log('Current cache stats before write:');
  console.log(getCacheStats());

  console.log('\nPerforming POST /tasks (Create Task)...');
  const postRes = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Benchmark Task ${Date.now()}`,
      description: 'Verifying automatic cache invalidation on write operation',
      status: 'incomplete',
    }),
  });
  const postData = await postRes.json();
  const createdId = postData.data?._id;
  console.log(`Created Task: "${postData.data?.title}" (ID: ${createdId})`);

  console.log('\nVerifying that cache was invalidated:');
  const afterPostFetch = await fetchTasks('Post-Write Fetch (Should be MISS)');

  console.log('\nFetching again (Should be HIT now):');
  const afterMissFetch = await fetchTasks('Second Post-Write Fetch (Should be HIT)');

  console.log('\nPerforming PUT /tasks/:id (Update Task)...');
  await fetch(`${baseUrl}/tasks/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Benchmark Task Updated ${Date.now()}`,
    }),
  });

  const afterPutFetch = await fetchTasks('Post-PUT Fetch (Should be MISS)');

  console.log('\nPerforming DELETE /tasks/:id (Delete Task)...');
  await fetch(`${baseUrl}/tasks/${createdId}`, {
    method: 'DELETE',
  });

  const afterDeleteFetch = await fetchTasks('Post-DELETE Fetch (Should be MISS)');

  console.log('\n======================================================');
  console.log('               BENCHMARK RESULTS SUMMARY               ');
  console.log('======================================================');
  console.table(
    uncachedReadings.map((r, i) => ({
      Sample: `#${i + 1}`,
      Type: 'Uncached (MongoDB MISS)',
      'Server Processing Time': `${r.serverTime} ms`,
      'Client Total Time': `${r.duration} ms`,
      'X-Cache Header': r.cacheHeader,
    }))
  );

  console.table(
    cachedReadings.map((r, i) => ({
      Sample: `#${i + 1}`,
      Type: 'Cached (node-cache HIT)',
      'Server Processing Time': `${r.serverTime} ms`,
      'Client Total Time': `${r.duration} ms`,
      'X-Cache Header': r.cacheHeader,
    }))
  );

  const avgUncachedServer = (
    uncachedReadings.reduce((sum, r) => sum + r.serverTime, 0) / uncachedReadings.length
  ).toFixed(2);
  const avgCachedServer = (
    cachedReadings.reduce((sum, r) => sum + r.serverTime, 0) / cachedReadings.length
  ).toFixed(2);
  const speedup = (avgUncachedServer / avgCachedServer).toFixed(1);

  console.log(`\nAverage Uncached Server Time: ${avgUncachedServer} ms`);
  console.log(`Average Cached Server Time:   ${avgCachedServer} ms`);
  console.log(`Performance Speedup:          ~${speedup}x faster with node-cache! 🚀\n`);

  process.exit(0);
};

runBenchmark().catch((err) => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
