import {
  Router,
  type Request,
  type Response,
} from "express";

import { ApiError } from "../errors/api.error.js";
import { ContentRepository } from "../repositories/content.repository.js";
import { searchEngine } from "../../services/search-engine.service.js";

const router = Router();
const contentRepository = new ContentRepository();

/**
 * GET /api/content/autocomplete
 * High-performance search typeahead suggestions (<5ms)
 */
router.get(
  "/content/autocomplete",
  (req: Request, res: Response): void => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const suggestions = searchEngine.autocomplete(q, 8);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    res.status(200).json({
      success: true,
      query: q,
      suggestions,
    });
  }
);

/**
 * GET /api/content
 *
 * Supported query parameters:
 * page, limit, language, source, category, tag, q
 */
router.get(
  "/content",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20);

    if (limit > 100) {
      throw ApiError.badRequest("The maximum page size is 100.");
    }

    const language = getQueryString(req.query.language);
    const source = getQueryString(req.query.source);
    const category = getQueryString(req.query.category);
    const tag = getQueryString(req.query.tag);
    const search = getQueryString(req.query.q);

    const result = await contentRepository.list({
      language,
      source,
      category,
      tag,
      search,
    });

    const total = result.total;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    if (totalPages > 0 && page > totalPages) {
      throw ApiError.badRequest(`Page ${page} exceeds the available page range.`);
    }

    const offset = (page - 1) * limit;
    const items = result.items.slice(offset, offset + limit);

    // Set client and proxy caching headers
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=300");

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  },
);

/**
 * GET /api/content/:id
 */
router.get(
  "/content/:id",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = typeof req.params.id === "string" ? req.params.id.trim() : "";

    if (!id) {
      throw ApiError.badRequest("Content ID is required.");
    }

    const content = await contentRepository.getById(id);

    if (!content) {
      throw ApiError.notFound(`Content not found: ${id}`);
    }

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    res.status(200).json({
      success: true,
      data: content,
    });
  },
);

function getQueryString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest("Pagination parameters must be integers.");
  }

  if (!/^\d+$/.test(value)) {
    throw ApiError.badRequest("Pagination parameters must be positive integers.");
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw ApiError.badRequest("Pagination parameters must be positive integers.");
  }

  return parsed;
}

export default router;
