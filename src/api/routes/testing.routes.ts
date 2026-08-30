import { Router, type Request, type Response } from "express";
import { SecurityHardeningTester } from "../../testing/security-hardening.test.js";
import { PerformanceBenchmarker } from "../../testing/performance-benchmark.js";
import { E2EMatrixRunner } from "../../testing/e2e-matrix.runner.js";
import { Phase12ReleaseGate } from "../../testing/phase12-release-gate.js";
import { CICDPipelineRunner } from "../../testing/ci-cd-pipeline.runner.js";
import { DeploymentPipelineRunner } from "../../testing/deployment-pipeline.runner.js";
import { ProductionSmokeRunner } from "../../testing/production-smoke.runner.js";
import { DataReconciliationService } from "../../services/data-reconciliation.service.js";
import { BackupRestoreService } from "../../services/backup-restore.service.js";
import { ReleaseCandidateRunner } from "../../testing/release-candidate.runner.js";
import { M21FinalSmokeRunner } from "../../testing/m21-final-smoke.runner.js";
import { ReleaseNotesService } from "../../services/release-notes.service.js";
import { ProductionLaunchService } from "../../services/production-launch.service.js";
import { StabilizationService } from "../../services/stabilization.service.js";
import { monetizationQAService } from "../../testing/monetization-qa.service.js";
import { adminAuthMiddleware } from "../middleware/admin-auth.middleware.js";

const router = Router();

// Protect all testing and benchmark endpoints with admin authorization
router.use(adminAuthMiddleware);

/**
 * POST /api/tests/security
 * Executes the M17 Security Hardening & Dirty Dozen Test Suite
 */
router.post("/tests/security", async (_req: Request, res: Response): Promise<void> => {
  const report = await SecurityHardeningTester.runAllTests();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * POST /api/tests/performance
 * Executes the M18 Performance Benchmark and Latency Regression Suite
 */
router.post("/tests/performance", async (_req: Request, res: Response): Promise<void> => {
  const report = await PerformanceBenchmarker.runBenchmark();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * POST /api/tests/e2e
 * Executes the M19 Master E2E 15-Workflow Matrix
 */
router.post("/tests/e2e", async (_req: Request, res: Response): Promise<void> => {
  const report = await E2EMatrixRunner.runMatrix();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/release-gate
 * Evaluates Phase 12 Release Gate
 */
router.get("/tests/release-gate", async (_req: Request, res: Response): Promise<void> => {
  const evaluation = await Phase12ReleaseGate.evaluateGate();
  res.status(200).json({
    success: true,
    data: evaluation,
  });
});

router.post("/tests/release-gate/evaluate", async (_req: Request, res: Response): Promise<void> => {
  const evaluation = await Phase12ReleaseGate.evaluateGate();
  res.status(200).json({
    success: true,
    data: evaluation,
  });
});

/**
 * GET & POST /api/tests/ci-pipeline
 * Executes the Phase 13 / M20.2 CI/CD Build & Test Pipeline simulation
 */
router.get("/tests/ci-pipeline", async (_req: Request, res: Response): Promise<void> => {
  const report = await CICDPipelineRunner.runPipeline();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/ci-pipeline/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await CICDPipelineRunner.runPipeline();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/deployment-pipeline (# 74)
 * Executes the full 7-stage Deployment Pipeline
 */
router.get("/tests/deployment-pipeline", async (_req: Request, res: Response): Promise<void> => {
  const report = await DeploymentPipelineRunner.executeDeploymentPipeline();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/deployment-pipeline/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await DeploymentPipelineRunner.executeDeploymentPipeline();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/deployment-pipeline/approvals (# 75)
 * Manages multi-gate release approvals
 */
router.get("/tests/deployment-pipeline/approvals", (_req: Request, res: Response): void => {
  const approvals = DeploymentPipelineRunner.getApprovals();
  res.status(200).json({
    success: true,
    data: approvals,
  });
});

router.post("/tests/deployment-pipeline/approvals", (req: Request, res: Response): void => {
  const actor = (req as unknown as { adminActor?: string }).adminActor || "admin-signer";
  const updated = DeploymentPipelineRunner.updateApprovals(req.body || {}, actor);
  res.status(200).json({
    success: true,
    data: updated,
  });
});

/**
 * GET & POST /api/tests/smoke-tests (# 78 / M20.4)
 * Runs Production Smoke Tests
 */
router.get("/tests/smoke-tests", async (_req: Request, res: Response): Promise<void> => {
  const report = await ProductionSmokeRunner.runSmokeTests();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/smoke-tests/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await ProductionSmokeRunner.runSmokeTests();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/data-reconciliation (# 76 / # 77 / M20.3)
 * Runs Initial Content Verification and Database Readiness
 */
router.get("/tests/data-reconciliation", async (_req: Request, res: Response): Promise<void> => {
  const report = await DataReconciliationService.runReconciliation();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/data-reconciliation/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await DataReconciliationService.runReconciliation();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/backup-restore (# 85 / M21.6)
 * Executes automated disaster recovery and isolated restore verification
 */
router.get("/tests/backup-restore", async (_req: Request, res: Response): Promise<void> => {
  const report = await BackupRestoreService.executeBackupAndRestoreDrill();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/backup-restore/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await BackupRestoreService.executeBackupAndRestoreDrill();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/release-candidate (# 79 - # 85 / Phase 14 M21)
 * Evaluates full Release Candidate readiness
 */
router.get("/tests/release-candidate", async (_req: Request, res: Response): Promise<void> => {
  const report = await ReleaseCandidateRunner.evaluateReleaseCandidate();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/release-candidate/evaluate", async (_req: Request, res: Response): Promise<void> => {
  const report = await ReleaseCandidateRunner.evaluateReleaseCandidate();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET & POST /api/tests/m21-final-smoke (M21.7)
 * Executes the 8-node final production smoke test:
 * Launch -> Authentication -> Search -> Content -> Bookmark -> History -> Admin -> Monitoring
 */
router.get("/tests/m21-final-smoke", async (_req: Request, res: Response): Promise<void> => {
  const report = await M21FinalSmokeRunner.runFinalSmokeTest();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/m21-final-smoke/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await M21FinalSmokeRunner.runFinalSmokeTest();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET /api/tests/release-notes (M21.8)
 * Returns structured release notes and deployment metadata
 */
router.get("/tests/release-notes", (_req: Request, res: Response): void => {
  const notes = ReleaseNotesService.getReleaseNotes();
  res.status(200).json({
    success: true,
    data: notes,
  });
});

/**
 * GET & POST /api/tests/production-launch (M22.1)
 * Gets status or executes rolling production deployment
 */
router.get("/tests/production-launch", (_req: Request, res: Response): void => {
  const status = ProductionLaunchService.getDeploymentStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
});

router.post("/tests/production-launch/deploy", async (_req: Request, res: Response): Promise<void> => {
  const status = await ProductionLaunchService.executeProductionDeployment();
  res.status(200).json({
    success: true,
    data: status,
  });
});

/**
 * GET /api/tests/monitoring-initial (M22.2 & M22.3)
 * Telemetry and error monitoring stream
 */
router.get("/tests/monitoring-initial", (_req: Request, res: Response): void => {
  const metrics = ProductionLaunchService.getInitialMonitoringMetrics();
  res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * GET /api/tests/import-monitoring (M22.4)
 * Ingestion and importer monitoring stream
 */
router.get("/tests/import-monitoring", (_req: Request, res: Response): void => {
  const status = ProductionLaunchService.getImportMonitoring();
  res.status(200).json({
    success: true,
    data: status,
  });
});

/**
 * GET & POST /api/tests/user-flow-verify (M22.5)
 * Real production workflow verification: Open -> Browse -> Search -> Read -> Login -> Bookmark -> History
 */
router.get("/tests/user-flow-verify", async (_req: Request, res: Response): Promise<void> => {
  const report = await ProductionLaunchService.executeUserFlowVerification();
  res.status(200).json({
    success: true,
    data: report,
  });
});

router.post("/tests/user-flow-verify/run", async (_req: Request, res: Response): Promise<void> => {
  const report = await ProductionLaunchService.executeUserFlowVerification();
  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * GET /api/tests/rollback-readiness (M22.6)
 * Pre-launch rollback readiness status
 */
router.get("/tests/rollback-readiness", (_req: Request, res: Response): void => {
  const status = ProductionLaunchService.getRollbackReadiness();
  res.status(200).json({
    success: true,
    data: status,
  });
});

/**
 * GET & POST /api/tests/production-launch/gate (#94)
 * 10-point Production Launch Gate Evaluation
 */
router.get("/tests/production-launch/gate", async (_req: Request, res: Response): Promise<void> => {
  const gate = await ProductionLaunchService.evaluateProductionLaunchGate();
  res.status(200).json({
    success: true,
    data: gate,
  });
});

router.post("/tests/production-launch/gate/evaluate", async (_req: Request, res: Response): Promise<void> => {
  const gate = await ProductionLaunchService.evaluateProductionLaunchGate();
  res.status(200).json({
    success: true,
    data: gate,
  });
});

/**
 * PHASE 15: Post-Launch Stabilization Routes (M23)
 */

// M23.1 - Production Bug Tracker
router.get("/stabilization/bugs", (_req: Request, res: Response): void => {
  const bugs = StabilizationService.getBugs();
  res.status(200).json({ success: true, data: bugs });
});

router.post("/stabilization/bugs", (req: Request, res: Response): void => {
  const bug = StabilizationService.addBug(req.body);
  res.status(201).json({ success: true, data: bug });
});

router.patch("/stabilization/bugs/:id/status", (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const { status } = req.body;
  const updated = StabilizationService.updateBugStatus(id, status);
  if (!updated) {
    res.status(404).json({ success: false, error: "Bug not found" });
    return;
  }
  res.status(200).json({ success: true, data: updated });
});

// M23.2 - Performance Measurement & Tuning Report
router.get("/stabilization/performance-tuning", (_req: Request, res: Response): void => {
  const report = StabilizationService.getPerformanceTuningReport();
  res.status(200).json({ success: true, data: report });
});

// M23.3 - Controlled Data Corrections Workflow
router.get("/stabilization/data-corrections", (_req: Request, res: Response): void => {
  const corrections = StabilizationService.getDataCorrections();
  res.status(200).json({ success: true, data: corrections });
});

router.post("/stabilization/data-corrections/execute", (req: Request, res: Response): void => {
  const actor = (req as unknown as { adminActor?: string }).adminActor || "admin-curator";
  const correction = StabilizationService.prepareAndExecuteDataCorrection({
    detectedIssue: req.body.detectedIssue || "Minor diacritic normalization",
    affectedRecords: req.body.affectedRecords || ["tattvartha-sutra-01"],
    preparedDiff: req.body.preparedDiff || {},
    reviewer: req.body.reviewer || actor,
    verifier: req.body.verifier || "lead-scholar@sutrasparsh.internal",
  });
  res.status(200).json({ success: true, data: correction });
});

// M23.4 - User Feedback
router.get("/stabilization/feedback", (_req: Request, res: Response): void => {
  const feedback = StabilizationService.getFeedbacks();
  res.status(200).json({ success: true, data: feedback });
});

router.post("/stabilization/feedback", (req: Request, res: Response): void => {
  const feedback = StabilizationService.submitFeedback(req.body);
  res.status(201).json({ success: true, data: feedback });
});

// M23.5 - Monitoring Refinement
router.get("/stabilization/monitoring-refinement", (_req: Request, res: Response): void => {
  const refinement = StabilizationService.getMonitoringRefinements();
  res.status(200).json({ success: true, data: refinement });
});

/**
 * GET /api/tests/system-status
 * Aggregated summary of security, performance, QA status, Phase 12/13/14 gates & Phase 15 stabilization
 */
router.get("/tests/system-status", async (_req: Request, res: Response): Promise<void> => {
  const [security, performance, e2e, releaseGate, rc, smoke, launchGate] = await Promise.all([
    SecurityHardeningTester.runAllTests(),
    PerformanceBenchmarker.runBenchmark(),
    E2EMatrixRunner.runMatrix(),
    Phase12ReleaseGate.evaluateGate(),
    ReleaseCandidateRunner.evaluateReleaseCandidate(),
    M21FinalSmokeRunner.runFinalSmokeTest(),
    ProductionLaunchService.evaluateProductionLaunchGate(),
  ]);

  const productionReady =
    security.overallStatus === "COMPLIANT" &&
    performance.regressionCheck.passed &&
    e2e.overallStatus === "CERTIFIED_READY" &&
    releaseGate.passed &&
    rc.isReadyForRelease &&
    smoke.allPassed &&
    launchGate.overallPassed;

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    productionReady,
    summary: {
      securityCompliance: security.overallStatus,
      securityPassRate: `${security.passedTests}/${security.totalTests}`,
      searchP95LatencyMs: performance.searchBenchmark.p95LatencyMs,
      contentFetchP95LatencyMs: performance.contentFetchBenchmark.p95LatencyMs,
      cacheHitRatePercent: performance.cacheMetrics.hitRatePercent,
      e2eWorkflowsPassed: `${e2e.passedWorkflows}/${e2e.totalWorkflows}`,
      e2eCertification: e2e.overallStatus,
      phase12GateStatus: releaseGate.overallStatus,
      phase14ReleaseCandidateStatus: rc.overallStatus,
      m21FinalSmokeStatus: smoke.allPassed ? "PASS" : "FAIL",
      productionLaunchGateStatus: launchGate.overallPassed ? "PASS" : "FAIL",
    },
    reports: {
      security,
      performance,
      e2e,
      releaseGate,
      releaseCandidate: rc,
      m21FinalSmoke: smoke,
      productionLaunchGate: launchGate,
    },
  });
});

/**
 * POST /api/tests/monetization
 * Executes M36 Monetization Cross-Phase Test Suite
 */
router.post("/tests/monetization", async (_req: Request, res: Response): Promise<void> => {
  const result = await monetizationQAService.runFullMonetizationSuite();
  res.status(200).json({
    success: true,
    data: result,
  });
});

export default router;

