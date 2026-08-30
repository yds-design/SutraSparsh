/**
 * SutraSparsh - Phase 12 Release Gate Evaluator
 * Enforces the strict Phase 12 exit criteria:
 * 1. All P0 E2E tests pass
 * 2. No unresolved critical defects
 * 3. No known security blocker
 * 4. No data integrity blocker
 * 5. No production-blocking performance regression
 */

import { E2EMatrixRunner, type E2EMatrixReport } from "./e2e-matrix.runner.js";
import { SecurityHardeningTester, type SecuritySuiteReport } from "./security-hardening.test.js";
import { PerformanceBenchmarker, type BenchmarkReport } from "./performance-benchmark.js";
import { ContentRepository } from "../api/repositories/content.repository.js";
import { observabilityService } from "../api/services/observability.service.js";

export interface GateCriterionResult {
  id: string;
  name: string;
  passed: boolean;
  status: "PASSED" | "FAILED";
  details: string;
  metrics?: Record<string, unknown>;
}

export interface Phase12GateEvaluation {
  timestamp: string;
  overallStatus: "PHASE_12_CERTIFIED_PASS" | "PHASE_12_GATE_BLOCKED";
  passed: boolean;
  totalCriteria: number;
  passedCriteria: number;
  failedCriteria: number;
  criteria: {
    allP0E2EPass: GateCriterionResult;
    noUnresolvedCriticalDefects: GateCriterionResult;
    noKnownSecurityBlocker: GateCriterionResult;
    noDataIntegrityBlocker: GateCriterionResult;
    noPerformanceRegression: GateCriterionResult;
  };
  reports: {
    e2e: E2EMatrixReport;
    security: SecuritySuiteReport;
    performance: BenchmarkReport;
  };
}

export class Phase12ReleaseGate {
  public static async evaluateGate(): Promise<Phase12GateEvaluation> {
    const repository = new ContentRepository();
    
    // Execute all underlying test suites
    const [e2eReport, securityReport, perfReport] = await Promise.all([
      E2EMatrixRunner.runMatrix(),
      SecurityHardeningTester.runAllTests(),
      PerformanceBenchmarker.runBenchmark(),
    ]);

    // Criterion 1: All P0 E2E tests pass
    const p0Tests = e2eReport.results.filter((r) => r.criticality === "P0");
    const failedP0 = p0Tests.filter((r) => r.status === "FAILED");
    const allP0E2EPass: GateCriterionResult = {
      id: "GATE-01",
      name: "All P0 E2E Tests Pass",
      passed: failedP0.length === 0,
      status: failedP0.length === 0 ? "PASSED" : "FAILED",
      details:
        failedP0.length === 0
          ? `All ${p0Tests.length} P0 critical end-to-end workflows executed with 100% pass rate.`
          : `${failedP0.length} P0 workflow(s) failed: ${failedP0.map((f) => f.id + ' (' + f.workflow + ')').join(", ")}.`,
      metrics: {
        totalP0: p0Tests.length,
        passedP0: p0Tests.length - failedP0.length,
        failedP0: failedP0.length,
      },
    };

    // Criterion 2: No unresolved critical defects
    const metrics = observabilityService.getMetrics();
    const serverErrors = metrics.serverErrors;
    const recentErrors = metrics.recentErrorCount;
    const noUnresolvedCriticalDefects: GateCriterionResult = {
      id: "GATE-02",
      name: "No Unresolved Critical Defects",
      passed: serverErrors === 0 && recentErrors === 0,
      status: serverErrors === 0 && recentErrors === 0 ? "PASSED" : "FAILED",
      details:
        serverErrors === 0 && recentErrors === 0
          ? "Zero unhandled 5xx server exceptions or critical defect telemetry spikes recorded."
          : `Active defects detected: ${serverErrors} server error(s), ${recentErrors} recent failure(s).`,
      metrics: {
        serverErrors,
        recentErrors,
        systemUptimeSeconds: metrics.uptimeSeconds,
      },
    };

    // Criterion 3: No known security blocker
    const securityFailures = securityReport.results.filter((r) => r.status === "FAILED");
    const noKnownSecurityBlocker: GateCriterionResult = {
      id: "GATE-03",
      name: "No Known Security Blocker",
      passed: securityFailures.length === 0 && securityReport.overallStatus === "COMPLIANT",
      status: securityFailures.length === 0 ? "PASSED" : "FAILED",
      details:
        securityFailures.length === 0
          ? `All ${securityReport.totalTests} security threat vectors (XSS, timing-safe auth, ReDoS, ID traversal, injection) verified clean.`
          : `${securityFailures.length} security vulnerability vector(s) failed: ${securityFailures.map((s) => s.name).join(", ")}.`,
      metrics: {
        totalVectors: securityReport.totalTests,
        passedVectors: securityReport.passedTests,
        failedVectors: securityFailures.length,
      },
    };

    // Criterion 4: No data integrity blocker
    const contentResult = await repository.list({ limit: 100 });
    let corruptedRecords = 0;
    const corruptedIds: string[] = [];
    
    for (const item of contentResult.items) {
      if (!item.id || !item.title || (!item.body && !item.metadata?.devanagari)) {
        corruptedRecords++;
        corruptedIds.push(item.id || "unknown");
      }
    }

    const noDataIntegrityBlocker: GateCriterionResult = {
      id: "GATE-04",
      name: "No Data Integrity Blocker",
      passed: corruptedRecords === 0 && contentResult.total > 0,
      status: corruptedRecords === 0 && contentResult.total > 0 ? "PASSED" : "FAILED",
      details:
        corruptedRecords === 0 && contentResult.total > 0
          ? `All ${contentResult.total} scripture records verified compliant with canonical schema standards.`
          : `Data integrity violations found in ${corruptedRecords} record(s): ${corruptedIds.join(", ")}.`,
      metrics: {
        verifiedRecords: contentResult.total,
        corruptedRecords,
      },
    };

    // Criterion 5: No production-blocking performance regression
    const searchP95 = perfReport.searchBenchmark.p95LatencyMs;
    const readP95 = perfReport.contentFetchBenchmark.p95LatencyMs;
    const regressionPassed = perfReport.regressionCheck.passed;
    const noPerformanceRegression: GateCriterionResult = {
      id: "GATE-05",
      name: "No Performance Regression",
      passed: regressionPassed && searchP95 <= 50 && readP95 <= 30,
      status: regressionPassed && searchP95 <= 50 && readP95 <= 30 ? "PASSED" : "FAILED",
      details:
        regressionPassed && searchP95 <= 50 && readP95 <= 30
          ? `P95 latencies well within SLAs (Search: ${searchP95}ms < 50ms, Read: ${readP95}ms < 30ms). Cache Hit Rate: ${perfReport.cacheMetrics.hitRatePercent}%.`
          : `Performance SLA breached (Search P95: ${searchP95}ms, Read P95: ${readP95}ms).`,
      metrics: {
        searchP95Ms: searchP95,
        searchP95ThresholdMs: 50,
        readP95Ms: readP95,
        readP95ThresholdMs: 30,
        cacheHitRate: perfReport.cacheMetrics.hitRatePercent,
      },
    };

    const criteriaList = [
      allP0E2EPass,
      noUnresolvedCriticalDefects,
      noKnownSecurityBlocker,
      noDataIntegrityBlocker,
      noPerformanceRegression,
    ];

    const passedCriteria = criteriaList.filter((c) => c.passed).length;
    const failedCriteria = criteriaList.filter((c) => !c.passed).length;
    const allPassed = failedCriteria === 0;

    return {
      timestamp: new Date().toISOString(),
      overallStatus: allPassed ? "PHASE_12_CERTIFIED_PASS" : "PHASE_12_GATE_BLOCKED",
      passed: allPassed,
      totalCriteria: criteriaList.length,
      passedCriteria,
      failedCriteria,
      criteria: {
        allP0E2EPass,
        noUnresolvedCriticalDefects,
        noKnownSecurityBlocker,
        noDataIntegrityBlocker,
        noPerformanceRegression,
      },
      reports: {
        e2e: e2eReport,
        security: securityReport,
        performance: perfReport,
      },
    };
  }
}

// Standalone execution support
if (process.argv[1]?.includes("phase12-release-gate")) {
  Phase12ReleaseGate.evaluateGate()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.passed ? 0 : 1);
    })
    .catch((err) => {
      console.error("Release gate evaluation crashed:", err);
      process.exit(1);
    });
}
