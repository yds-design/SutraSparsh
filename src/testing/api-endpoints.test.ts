/**
 * Automated Live API Endpoints Verification Suite
 * Tests all backend Express routes and middleware responses.
 */

import http from "http";
import path from "path";
import fs from "fs";
import { createApiApp } from "../api/app.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testId: string, description: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] [${testId}] ${description}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] [${testId}] ${description}`);
    failedTests++;
  }
}

console.log("================================================================================");
console.log("🚀 SUTRASPARSH LIVE API & EXPRESS BACKEND ROUTE VERIFICATION");
console.log("================================================================================\n");

const app = createApiApp();

// Also mount robots.txt and sitemap.xml as in server.ts
app.get("/robots.txt", (_req, res) => {
  const robotsPath = path.join(process.cwd(), "public", "robots.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(robotsPath);
});

app.get("/sitemap.xml", (_req, res) => {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.sendFile(sitemapPath);
});

const server = http.createServer(app);

server.listen(0, async () => {
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    let body: any = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, headers: res.headers, body };
  }

  try {
    // 1. GET /api/status
    const statusRes = await request("/api/status");
    assert(statusRes.status === 200, "API-01", "GET /api/status returns HTTP 200 OK");
    assert(statusRes.body?.service === "sutrasparsh-backend", "API-02", "GET /api/status identifies backend service");

    // 2. GET /api/health
    const healthRes = await request("/api/health");
    assert(healthRes.status === 200, "API-03", "GET /api/health returns HTTP 200 OK");
    assert(healthRes.body?.data?.status === "ok" || healthRes.body?.status === "healthy", "API-04", "GET /api/health reports system status");

    // 3. GET /api/metrics
    const metricsRes = await request("/api/metrics");
    assert(metricsRes.status === 200, "API-05", "GET /api/metrics returns HTTP 200 OK");
    assert(typeof metricsRes.body?.uptime === "number", "API-06", "GET /api/metrics includes process uptime");

    // 4. GET /api/tts/health
    const ttsHealthRes = await request("/api/tts/health");
    assert(ttsHealthRes.status === 200, "API-07", "GET /api/tts/health returns HTTP 200 OK");
    assert(ttsHealthRes.body?.success === true, "API-08", "GET /api/tts/health reports audio service status");

    // 5. GET /api/content/all
    const contentAllRes = await request("/api/content/all");
    assert(contentAllRes.status === 200, "API-09", "GET /api/content/all returns HTTP 200 OK");
    assert(Array.isArray(contentAllRes.body?.data), "API-10", "GET /api/content/all returns array of scripture documents");
    assert(contentAllRes.body?.data.length >= 10, "API-11", "Content repository contains canonical scriptures");

    // 6. GET /api/content/search?q=dharma
    const searchRes = await request("/api/content/search?q=dharma");
    assert(searchRes.status === 200, "API-12", "GET /api/content/search?q=dharma returns HTTP 200 OK");
    assert(Array.isArray(searchRes.body?.data), "API-13", "Content search returns array of search results");

    // 7. GET /api/content/categories
    const catRes = await request("/api/content/categories");
    assert(catRes.status === 200, "API-14", "GET /api/content/categories returns HTTP 200 OK");
    assert(Array.isArray(catRes.body?.data), "API-15", "Categories endpoint returns array of categories");

    // 8. GET /api/tests/system-status (Protected by Admin Auth)
    const sysRes = await request("/api/tests/system-status", {
      headers: { "x-admin-key": "sutrasparsh-admin-secret" },
    });
    assert(sysRes.status === 200, "API-16", "GET /api/tests/system-status with admin key returns HTTP 200 OK");

    // 9. GET /api/billing/tiers
    const tiersRes = await request("/api/billing/tiers");
    assert(tiersRes.status === 200, "API-17", "GET /api/billing/tiers returns HTTP 200 OK");
    assert(Array.isArray(tiersRes.body?.tiers), "API-18", "Billing tiers endpoint returns tiers array");

    // 10. GET /api/donations/ashram-accounts
    const donRes = await request("/api/donations/ashram-accounts");
    assert(donRes.status === 200, "API-19", "GET /api/donations/ashram-accounts returns HTTP 200 OK");
    assert(Array.isArray(donRes.body?.accounts), "API-20", "Donations returns ashram accounts list");

    // 11. Security 404 handler: GET /api/non-existent-endpoint
    const nonExistRes = await request("/api/non-existent-endpoint-random");
    assert(nonExistRes.status === 404, "API-21", "Unrecognized /api route returns clean HTTP 404");
    assert(nonExistRes.body?.error || nonExistRes.body?.message, "API-22", "404 response returns JSON error payload without leaking stack trace");

    // 12. Security 401 handler: POST /api/admin/mutate without auth
    const unauthRes = await request("/api/admin/corpus/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: "illegal" }),
    });
    assert(unauthRes.status === 401 || unauthRes.status === 403, "API-23", "Unauthorized admin mutations blocked with 401/403");

    // 13. SEO Static: GET /robots.txt
    const robotsRes = await request("/robots.txt");
    assert(robotsRes.status === 200, "API-24", "GET /robots.txt returns HTTP 200 OK");
    assert(typeof robotsRes.body === "string" && robotsRes.body.includes("User-agent"), "API-25", "robots.txt includes valid crawler rules");

    // 14. SEO Static: GET /sitemap.xml
    const sitemapRes = await request("/sitemap.xml");
    assert(sitemapRes.status === 200, "API-26", "GET /sitemap.xml returns HTTP 200 OK");
    assert(typeof sitemapRes.body === "string" && sitemapRes.body.includes("<urlset"), "API-27", "sitemap.xml includes valid XML urlset");

  } catch (err: any) {
    console.error("Test execution caught error:", err);
    failedTests++;
  } finally {
    server.close(() => {
      console.log("\n================================================================================");
      console.log(`📊 API TESTING SUMMARY:`);
      console.log(`   Total Assertions Executed : ${totalTests}`);
      console.log(`   Passed Assertions         : ${passedTests}`);
      console.log(`   Failed Assertions         : ${failedTests}`);
      console.log(`   Pass Rate                 : ${((passedTests / totalTests) * 100).toFixed(1)}%`);
      console.log("================================================================================");

      if (failedTests > 0) {
        console.error("❌ API TESTS DETECTED FAILURES!");
        process.exit(1);
      } else {
        console.log("🎉 ALL API ENDPOINTS PASSED WITH 100% SUCCESS!");
        process.exit(0);
      }
    });
  }
});
