export interface ContentMetadata {
  language: string;
  source: string;
  author?: string;
  category?: string;
  chapter?: number;
  verse?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  devanagari?: string;
  transliteration?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  transliteration?: string;
  meaning?: string;
  commentary?: string;
  audioUrl?: string;
  metadata: ContentMetadata;
}

export interface ContentResponse {
  success: boolean;
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ImportJob {
  jobId: string;
  source: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  error?: string;
}

export interface ImportStats {
  total: number;
  completed: number;
  failed: number;
}

export interface JournalEntry {
  id: string;
  verseId: string;
  verseTitle: string;
  note: string;
  createdAt: string;
}

export interface AppLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  category: "HTTP" | "IMPORTER" | "DATABASE" | "ADMIN" | "AUTH" | "SYSTEM";
  message: string;
  details?: Record<string, unknown> | string;
  durationMs?: number;
  statusCode?: number;
  path?: string;
  method?: string;
  ip?: string;
}

export interface LatencyMetric {
  path: string;
  method: string;
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p95Ms: number;
  lastUpdated: string;
  history: number[];
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  averageLatencyMs: number;
  totalScriptures?: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  endpointLatencies: Record<string, LatencyMetric>;
  recentErrorCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "CONTENT_CREATED" | "CONTENT_UPDATED" | "CONTENT_DELETED" | "IMPORT_TRIGGERED" | "JOB_RECOVERED" | "CORPUS_EXPORTED" | "ADMIN_LOGIN" | string;
  actor: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, unknown>;
  ip?: string;
}

export interface DetailedHealthStatus {
  status: "healthy" | "degraded" | "failing";
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  subsystems: {
    apiServer: { status: string; port: number };
    contentStore: { status: string; itemCount: number; type: string };
    importerPipeline: { status: string };
    observabilityEngine: { status: string };
  };
  telemetry: {
    totalRequests: number;
    averageLatencyMs: number;
    recentErrorCount: number;
    memoryMb: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
}

// Phase 11 / 12 Testing & Certification Types
export interface SecurityTestItem {
  id: string;
  name: string;
  category: "INJECTION" | "AUTHORIZATION" | "RATE_LIMIT" | "DATA_LEAK" | "INPUT_VALIDATION";
  status: "PASSED" | "FAILED";
  details: string;
  durationMs: number;
}

export interface SecurityReportData {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: SecurityTestItem[];
  overallStatus: "COMPLIANT" | "NON_COMPLIANT";
}

export interface BenchmarkMetricsData {
  totalOperations: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  operationsPerSecond: number;
}

export interface BenchmarkReportData {
  timestamp: string;
  searchBenchmark: BenchmarkMetricsData;
  contentFetchBenchmark: BenchmarkMetricsData;
  autocompleteBenchmark: BenchmarkMetricsData;
  cacheMetrics: {
    size: number;
    hits: number;
    misses: number;
    hitRatePercent: number;
  };
  regressionCheck: {
    searchP95ThresholdMs: number;
    searchP95ActualMs: number;
    readP95ThresholdMs: number;
    readP95ActualMs: number;
    passed: boolean;
  };
}

export interface E2EWorkflowItem {
  id: string;
  workflow: string;
  criticality: "P0" | "P1";
  status: "PASSED" | "FAILED";
  stepVerification: string[];
  durationMs: number;
}

export interface E2EMatrixReportData {
  timestamp: string;
  totalWorkflows: number;
  passedWorkflows: number;
  failedWorkflows: number;
  results: E2EWorkflowItem[];
  overallStatus: "CERTIFIED_READY" | "QA_FAILED";
}

export interface SystemStatusReport {
  timestamp: string;
  productionReady: boolean;
  summary: {
    securityCompliance: string;
    securityPassRate: string;
    searchP95LatencyMs: number;
    contentFetchP95LatencyMs: number;
    cacheHitRatePercent: number;
    e2eWorkflowsPassed: string;
    e2eCertification: string;
    phase12GateStatus?: string;
    phase12PassedCriteria?: string;
  };
  reports: {
    security: SecurityReportData;
    performance: BenchmarkReportData;
    e2e: E2EMatrixReportData;
    releaseGate?: Phase12GateEvaluationData;
    deploymentPipeline?: DeploymentPipelineReportData;
    smokeTests?: ProductionSmokeReportData;
    dataReconciliation?: DatabaseReadinessReportData;
    releaseCandidate?: ReleaseCandidateEvaluationData;
  };
}

export interface GateCriterionData {
  id: string;
  name: string;
  passed: boolean;
  status: "PASSED" | "FAILED";
  details: string;
  metrics?: Record<string, unknown>;
}

export interface Phase12GateEvaluationData {
  timestamp: string;
  overallStatus: "PHASE_12_CERTIFIED_PASS" | "PHASE_12_GATE_BLOCKED";
  passed: boolean;
  totalCriteria: number;
  passedCriteria: number;
  failedCriteria: number;
  criteria: {
    allP0E2EPass: GateCriterionData;
    noUnresolvedCriticalDefects: GateCriterionData;
    noKnownSecurityBlocker: GateCriterionData;
    noDataIntegrityBlocker: GateCriterionData;
    noPerformanceRegression: GateCriterionData;
  };
  reports: {
    e2e: E2EMatrixReportData;
    security: SecurityReportData;
    performance: BenchmarkReportData;
  };
}

export interface PipelineStageData {
  step: number;
  name: string;
  category: "BUILD_PIPELINE" | "TEST_PIPELINE" | "RELEASE_GATE";
  status: "PASSED" | "FAILED";
  durationMs: number;
  details: string;
  metrics?: Record<string, unknown>;
}

export interface CICDPipelineReportData {
  timestamp: string;
  version: string;
  commit: string;
  environment: string;
  totalStages: number;
  passedStages: number;
  failedStages: number;
  overallStatus: "CI_CD_CERTIFIED_PASSED" | "CI_CD_PIPELINE_FAILED";
  stages: PipelineStageData[];
  releaseGate: Phase12GateEvaluationData;
}

export interface ReleaseApprovalStatusData {
  applicationApproved: boolean;
  applicationSigner?: string;
  backendApproved: boolean;
  backendSigner?: string;
  databaseRulesApproved: boolean;
  databaseRulesSigner?: string;
  contentApproved: boolean;
  contentSigner?: string;
  securityApproved: boolean;
  securitySigner?: string;
  allApproved: boolean;
  approvedAt?: string;
}

export interface DeploymentPipelineStageData {
  step: number;
  id: string;
  name: string;
  status: "PASSED" | "WAITING_FOR_APPROVAL" | "FAILED" | "IN_PROGRESS" | "SKIPPED";
  durationMs: number;
  description: string;
  details?: Record<string, unknown>;
}

export interface DeploymentPipelineReportData {
  timestamp: string;
  version: string;
  commit: string;
  currentStage: string;
  pipelineStatus: "DEPLOYMENT_SUCCESS" | "AWAITING_APPROVALS" | "DEPLOYMENT_FAILED";
  stages: DeploymentPipelineStageData[];
  approvals: ReleaseApprovalStatusData;
  ciReport?: CICDPipelineReportData;
  smokeReport?: ProductionSmokeReportData;
}

export interface SmokeTestCheckData {
  id: string;
  name: string;
  subsystem: "API" | "AUTHENTICATION" | "SEARCH" | "CONTENT" | "IMPORTER" | "ADMIN";
  status: "PASSED" | "FAILED";
  durationMs: number;
  details: string;
  evidence?: Record<string, unknown>;
}

export interface ProductionSmokeReportData {
  timestamp: string;
  environment: string;
  version: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  allPassed: boolean;
  overallStatus: "PRODUCTION_SMOKE_PASSED" | "PRODUCTION_SMOKE_FAILED";
  checks: SmokeTestCheckData[];
}

export interface ReconciliationFunnelData {
  sourceCount: number;
  validatedCount: number;
  importedCount: number;
  rejectedCount: number;
  searchIndexedCount: number;
  publishedCount: number;
  uiVisibleCount: number;
  discrepancies: Array<{
    stage: string;
    expected: number;
    actual: number;
    difference: number;
    explanation: string;
  }>;
}

export interface DatabaseReadinessReportData {
  timestamp: string;
  isReadyForProduction: boolean;
  indexesStatus: "DEPLOYED" | "MISSING";
  securityRulesStatus: "DEPLOYED_STRICT" | "PERMISSIVE_WARN";
  collectionsValidated: boolean;
  funnel: ReconciliationFunnelData;
  integrity: {
    totalRecords: number;
    validIdsCount: number;
    validDevanagariCount: number;
    validTranslationsCount: number;
    duplicateIdsFound: string[];
    malformedRecords: Array<{ id: string; reason: string }>;
    searchIndexParity: boolean;
    isCompliant: boolean;
  };
}

export interface BackupRestoreValidationData {
  timestamp: string;
  passed: boolean;
  metadata: {
    rpoHours: number;
    rtoMinutes: number;
    restoreProcedureDoc: string;
    restoreOwner: string;
    verificationDate: string;
    isolatedEnvironmentId: string;
  };
  backupArtifact: {
    snapshotId: string;
    timestamp: string;
    totalCollections: number;
    totalDocuments: number;
    sha256Checksum: string;
    sizeBytes: number;
    status: "CREATED" | "VERIFIED" | "RESTORED";
  };
  isolatedRestoreStatus: {
    environmentCreated: boolean;
    dataLoaded: boolean;
    schemaIntegrityPassed: boolean;
    contentCheckPassed: boolean;
    appAccessPassed: boolean;
    restoreDurationSeconds: number;
  };
  stepLogs: string[];
}

export interface ReleaseCandidateEvaluationData {
  timestamp: string;
  version: string;
  commit: string;
  overallStatus: "RELEASE_CANDIDATE_CERTIFIED" | "RELEASE_CANDIDATE_BLOCKED";
  isReadyForRelease: boolean;
  featureFreeze: {
    frozen: boolean;
    freezeDate: string;
    allowedChangeTypes: string[];
    openArchitecturalExperiments: number;
    openNonCriticalRefactors: number;
    compliant: boolean;
  };
  regressionReport: {
    status: "PASS" | "FAIL";
    e2e: E2EMatrixReportData;
    security: SecurityReportData;
    performance: BenchmarkReportData;
  };
  securityReview: {
    firestoreRules: { status: "PASS"; details: string };
    apiEndPoints: { status: "PASS"; details: string };
    authentication: { status: "PASS"; details: string };
    authorization: { status: "PASS"; details: string };
    adminAccess: { status: "PASS"; details: string };
    secretsManagement: { status: "PASS"; details: string };
    dependenciesAudit: { status: "PASS"; details: string };
    inputHandling: { status: "PASS"; details: string };
    loggingPrivacy: { status: "PASS"; details: string };
    overallCompliant: boolean;
  };
  performanceReview: {
    startupTimeMs: { actual: number; threshold: number; passed: boolean };
    searchLatencyP95Ms: { actual: number; threshold: number; passed: boolean };
    apiLatencyP95Ms: { actual: number; threshold: number; passed: boolean };
    firestoreReadP95Ms: { actual: number; threshold: number; passed: boolean };
    contentRenderLatencyMs: { actual: number; threshold: number; passed: boolean };
    importerThroughputOpsSec: { actual: number; threshold: number; passed: boolean };
    adminAuditLatencyMs: { actual: number; threshold: number; passed: boolean };
    allPassed: boolean;
  };
  dataIntegrityReview: DatabaseReadinessReportData;
  backupRestoreReview: BackupRestoreValidationData;
  signOffSummary: {
    passedReviews: number;
    totalReviews: number;
    unresolvedBlockers: number;
  };
}

// ==========================================
// M21.7 & M21.8: Final Smoke & Release Notes
// ==========================================

export interface M21FinalSmokeStep {
  step: number;
  name: string;
  node: "Launch" | "Authentication" | "Search" | "Content" | "Bookmark" | "History" | "Admin" | "Monitoring";
  status: "PASSED" | "FAILED";
  durationMs: number;
  details: string;
  evidence: Record<string, unknown>;
}

export interface M21FinalSmokeReportData {
  timestamp: string;
  environment: string;
  version: string;
  commit: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  allPassed: boolean;
  totalDurationMs: number;
  steps: M21FinalSmokeStep[];
}

export interface ReleaseNotesData {
  version: string;
  releaseDate: string;
  status: "RELEASED" | "RELEASE_CANDIDATE" | "DRAFT";
  commit: string;
  majorFeatures: Array<{ title: string; description: string; tag: string }>;
  fixes: Array<{ id: string; description: string; severity: string }>;
  knownLimitations: string[];
  migrationRequirements: Array<{ component: string; instruction: string; mandatory: boolean }>;
  operationalNotes: Array<{ category: string; note: string }>;
}

// ==========================================
// M22: Production Launch, Monitoring & Gate
// ==========================================

export interface ProductionDeploymentStatus {
  timestamp: string;
  environment: "PRODUCTION" | "STAGING";
  version: string;
  commit: string;
  pipelineStage: "DEPLOYMENT_COMPLETED" | "DEPLOYING" | "ROLLED_BACK" | "FAILED";
  artifact: {
    containerImage: string;
    sha256: string;
    buildTimestamp: string;
  };
  rolloutStrategy: "ROLLING_UPDATE_ZERO_DOWNTIME";
  minInstances: number;
  maxInstances: number;
  activeRevision: string;
}

export interface InitialMonitoringMetrics {
  timestamp: string;
  uptimeSeconds: number;
  traffic: {
    requestsPerMinute: number;
    activeUsers: number;
    totalRequestsSinceLaunch: number;
  };
  latency: {
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    searchP95Ms: number;
    contentFetchP95Ms: number;
  };
  errors: {
    totalErrors: number;
    errorRatePercent: number;
    crashSpikeCount: number;
    apiFailures: number;
    authFailures: number;
    searchErrors: number;
    firestoreErrors: number;
    importErrors: number;
    clientSideExceptions: number;
  };
  subsystems: {
    authentication: "HEALTHY" | "DEGRADED" | "DOWN";
    search: "HEALTHY" | "DEGRADED" | "DOWN";
    content: "HEALTHY" | "DEGRADED" | "DOWN";
    imports: "HEALTHY" | "DEGRADED" | "DOWN";
    database: "HEALTHY" | "DEGRADED" | "DOWN";
    frontendClient: "HEALTHY" | "DEGRADED" | "DOWN";
  };
}

export interface ImportMonitoringStatus {
  timestamp: string;
  scheduledImportsActive: boolean;
  manualImportReady: boolean;
  activeJobsCount: number;
  completedJobsCount: number;
  totalRecordsIngested: number;
  validationFailureCount: number;
  searchIndexingParityPercent: number;
  recentJobs: Array<{
    jobId: string;
    source: string;
    recordCount: number;
    status: "COMPLETED" | "RUNNING" | "FAILED";
    durationMs: number;
    indexed: boolean;
  }>;
}

export interface UserFlowVerificationData {
  timestamp: string;
  flowName: "Open -> Browse -> Search -> Read -> Login -> Bookmark -> History";
  allPassed: boolean;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    passed: boolean;
    durationMs: number;
    details: string;
  }>;
}

export interface RollbackReadinessData {
  timestamp: string;
  isRollbackReady: boolean;
  previousAppArtifact: {
    version: string;
    imageDigest: string;
    available: boolean;
  };
  previousBackendVersion: {
    revisionId: string;
    deployedAt: string;
    verified: boolean;
  };
  databaseRollbackStrategy: {
    documented: boolean;
    strategy: "POINT_IN_TIME_RESTORE_AND_SANDBOX_FALLBACK";
    runbookRef: string;
  };
  featureFlags: {
    available: boolean;
    flags: Record<string, boolean>;
  };
  contentRollbackStrategy: {
    available: boolean;
    snapshotId: string;
    rollbackDurationEstimateMinutes: number;
  };
  designatedOwner: {
    name: string;
    role: string;
    contact: string;
    confirmedOnCall: boolean;
  };
}

export interface ProductionLaunchGateData {
  timestamp: string;
  overallPassed: boolean;
  readyToLaunch: boolean;
  checklist: Array<{
    id: string;
    criteria: string;
    passed: boolean;
    mandatory: boolean;
    evidence: string;
  }>;
}

// ==========================================
// Phase 15: Post-Launch Stabilization (M23)
// ==========================================

export interface ProductionBugItem {
  id: string;
  priority: "P0" | "P1" | "P2" | "P3";
  title: string;
  category: "outage/data/security" | "major workflow broken" | "degraded feature" | "cosmetic/minor";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "VERIFIED";
  reportedAt: string;
  resolvedAt?: string;
  slaTargetMinutes: number;
  slaCompliant: boolean;
  owner: string;
  rootCause?: string;
}

export interface PerformanceTuningReport {
  timestamp: string;
  slowScreens: Array<{ screen: string; renderTimeMs: number; thresholdMs: number; status: "OK" | "SLOW" }>;
  slowQueries: Array<{ query: string; durationMs: number; thresholdMs: number; status: "OK" | "SLOW" }>;
  searchLatency: { p95Ms: number; slaMs: number; isWithinSla: boolean };
  apiLatency: { p95Ms: number; slaMs: number; isWithinSla: boolean };
  importThroughput: { opsPerSec: number; targetOpsPerSec: number; isHealthy: boolean };
  memoryUsageMb: { heapUsedMb: number; heapTotalMb: number; rssMb: number; leakDetected: boolean };
  crashRatePercent: { current: number; threshold: number; isAcceptable: boolean };
  tuningActionsTaken: string[];
}

export interface DataCorrectionRecord {
  correctionId: string;
  detectedIssue: string;
  affectedRecords: string[];
  preparedDiff: Record<string, { before: unknown; after: unknown }>;
  reviewedBy: string;
  reviewedAt: string;
  executionStatus: "PREPARED" | "EXECUTED" | "VERIFIED" | "REVERTED";
  executedAt?: string;
  auditTrailId: string;
  verifiedBy: string;
}

export interface UserFeedbackItem {
  id: string;
  type: "Bug" | "Usability problem" | "Feature request" | "Content correction" | "Operational problem";
  userRef: string;
  rating: number; // 1-5
  comment: string;
  submittedAt: string;
  triageStatus: "NEW" | "TRIAGED" | "PLANNED" | "RESOLVED";
  assignedCategory: string;
  actionItem?: string;
}

export interface MonitoringRefinementData {
  timestamp: string;
  noisyAlertsRemoved: string[];
  missingAlertsAdded: string[];
  tunedThresholds: Array<{ metric: string; oldThreshold: string; newThreshold: string; reason: string }>;
  dashboardsUpdated: string[];
  errorGroupingRules: string[];
  logsEnrichedFields: string[];
}

export * from "./types/monetization.js";

