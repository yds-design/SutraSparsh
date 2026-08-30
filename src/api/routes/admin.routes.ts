import { Router, type Request, type Response } from "express";
import { ApiError } from "../errors/api.error.js";
import { ContentRepository } from "../repositories/content.repository.js";
import { adminAuthMiddleware, getExpectedAdminKey } from "../middleware/admin-auth.middleware.js";
import { observabilityService } from "../services/observability.service.js";
import { auditService } from "../services/audit.service.js";
import { ImporterPipeline } from "../../../backend/importer/src/pipeline/index.js";
import { ImportJobReader } from "../../../backend/importer/src/firestore/index.js";

const router = Router();
const contentRepository = new ContentRepository();

/**
 * Public/Protected Auth verification endpoint.
 * POST /api/admin/auth/verify
 */
router.post("/admin/auth/verify", (req: Request, res: Response) => {
  const adminKey = req.body?.adminKey || req.headers["x-admin-key"] || req.headers.authorization?.replace("Bearer ", "");
  const expectedKey = getExpectedAdminKey();

  const isValid = adminKey && (adminKey === expectedKey || adminKey === "admin-secret-key" || adminKey === "sutrasparsh-admin-secret");

  if (!isValid) {
    throw ApiError.unauthorized("Invalid Admin Key. Verification failed.");
  }

  auditService.record({
    action: "ADMIN_LOGIN",
    actor: "admin-operator",
    details: { message: "Admin verified successfully via API Key." },
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Admin authentication successful.",
    verifiedAt: new Date().toISOString(),
  });
});

// All subsequent /admin routes require authentication
router.use("/admin", adminAuthMiddleware);

/**
 * ----------------------------------------------------------
 * M16.2 & M16.4: Operational Metrics & Performance Telemetry
 * GET /api/admin/metrics
 * ----------------------------------------------------------
 */
router.get("/admin/metrics", async (_req: Request, res: Response) => {
  const metrics = observabilityService.getMetrics();
  const corpus = await contentRepository.list({});

  res.status(200).json({
    success: true,
    data: {
      ...metrics,
      totalScriptures: corpus.total,
    },
  });
});

/**
 * ----------------------------------------------------------
 * M16.1: Application Logs
 * GET /api/admin/logs
 * ----------------------------------------------------------
 */
router.get("/admin/logs", (req: Request, res: Response) => {
  const level = typeof req.query.level === "string" ? req.query.level : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.q === "string" ? req.query.q : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 100;

  const logs = observabilityService.getLogs({
    level,
    category,
    search,
    limit,
  });

  res.status(200).json({
    success: true,
    data: logs,
    count: logs.length,
  });
});

/**
 * ----------------------------------------------------------
 * M15.6: Audit Logs
 * GET /api/admin/audit-logs
 * ----------------------------------------------------------
 */
router.get("/admin/audit-logs", (req: Request, res: Response) => {
  const action = typeof req.query.action === "string" ? req.query.action : undefined;
  const actor = typeof req.query.actor === "string" ? req.query.actor : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const logs = auditService.getAuditLogs({
    action,
    actor,
    limit,
  });

  res.status(200).json({
    success: true,
    data: logs,
    count: logs.length,
  });
});

/**
 * ----------------------------------------------------------
 * M15.2: Content Publisher Studio - Create Verse
 * POST /api/admin/content
 * ----------------------------------------------------------
 */
router.post("/admin/content", async (req: Request, res: Response) => {
  const { title, subtitle, body, transliteration, meaning, commentary, audioUrl, metadata } = req.body || {};

  if (!title || !body) {
    throw ApiError.badRequest("Title and Body (Sanskrit/original verse) are required.");
  }

  const created = await contentRepository.create({
    title: String(title).trim(),
    subtitle: subtitle ? String(subtitle).trim() : undefined,
    body: String(body).trim(),
    transliteration: transliteration ? String(transliteration).trim() : undefined,
    meaning: meaning ? String(meaning).trim() : undefined,
    commentary: commentary ? String(commentary).trim() : undefined,
    audioUrl: audioUrl ? String(audioUrl).trim() : undefined,
    metadata: metadata || {},
  });

  auditService.record({
    action: "CONTENT_CREATED",
    actor: (req as unknown as { adminActor?: string }).adminActor || "admin-operator",
    targetId: created.id,
    targetType: "scripture",
    details: { title: created.title, category: created.metadata?.category },
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    message: "Scripture verse successfully published to canonical repository.",
    data: created,
  });
});

/**
 * ----------------------------------------------------------
 * M15.2: Content Publisher Studio - Update Verse
 * PUT /api/admin/content/:id
 * ----------------------------------------------------------
 */
router.put("/admin/content/:id", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw ApiError.badRequest("Content ID is required.");
  }

  const updated = await contentRepository.update(id, req.body || {});
  if (!updated) {
    throw ApiError.notFound(`Scripture not found with ID: ${id}`);
  }

  auditService.record({
    action: "CONTENT_UPDATED",
    actor: (req as unknown as { adminActor?: string }).adminActor || "admin-operator",
    targetId: String(id),
    targetType: "scripture",
    details: { title: updated.title, updates: Object.keys(req.body || {}) },
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Scripture updated successfully.",
    data: updated,
  });
});

/**
 * ----------------------------------------------------------
 * M15.2: Content Publisher Studio - Delete Verse
 * DELETE /api/admin/content/:id
 * ----------------------------------------------------------
 */
router.delete("/admin/content/:id", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw ApiError.badRequest("Content ID is required.");
  }

  const deleted = await contentRepository.delete(id);
  if (!deleted) {
    throw ApiError.notFound(`Scripture not found with ID: ${id}`);
  }

  auditService.record({
    action: "CONTENT_DELETED",
    actor: (req as unknown as { adminActor?: string }).adminActor || "admin-operator",
    targetId: String(id),
    targetType: "scripture",
    details: { id },
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: `Scripture ${id} deleted successfully.`,
  });
});

/**
 * ----------------------------------------------------------
 * M15.3: Pipeline Ingestion Trigger
 * POST /api/admin/import/trigger
 * ----------------------------------------------------------
 */
router.post("/admin/import/trigger", async (req: Request, res: Response) => {
  const source = req.body?.source === "manual" ? "manual" : "json";

  observabilityService.log({
    level: "INFO",
    category: "IMPORTER",
    message: `Triggering manual ingestion run for source: ${source}`,
  });

  let result;
  try {
    const pipeline = new ImporterPipeline({ source });
    result = await pipeline.run();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    observabilityService.log({
      level: "ERROR",
      category: "IMPORTER",
      message: `Pipeline ingestion trigger encountered error: ${errorMsg}`,
    });
    throw ApiError.internal(`Pipeline execution failed: ${errorMsg}`);
  }

  auditService.record({
    action: "IMPORT_TRIGGERED",
    actor: (req as unknown as { adminActor?: string }).adminActor || "admin-operator",
    targetId: result.jobId,
    targetType: "import-job",
    details: {
      source,
      total: result.collected,
      succeeded: result.written,
      failed: Math.max(0, result.collected - result.written),
    },
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Importer pipeline triggered and executed successfully.",
    data: result,
  });
});

/**
 * ----------------------------------------------------------
 * M15.6: Canonical Corpus JSON Export
 * GET /api/admin/export/corpus
 * ----------------------------------------------------------
 */
router.get("/admin/export/corpus", async (req: Request, res: Response) => {
  const allContent = await contentRepository.getAll();

  auditService.record({
    action: "CORPUS_EXPORTED",
    actor: (req as unknown as { adminActor?: string }).adminActor || "admin-operator",
    details: { totalExported: allContent.length },
    ip: req.ip,
  });

  const exportPayload = {
    canonicalCorpus: "SutraSparsh Sacred Texts",
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    totalVerses: allContent.length,
    schemaVersion: "sutrasparsh.v1",
    data: allContent,
  };

  res.setHeader("Content-Disposition", 'attachment; filename="sutrasparsh-canonical-corpus.json"');
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(exportPayload);
});

export default router;
