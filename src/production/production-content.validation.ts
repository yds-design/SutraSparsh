import type { ProductionContentRecord } from "./production-content.schema.js";

export interface ProductionContentValidationIssue {
  index: number;
  field: string;
  message: string;
}

export interface ProductionContentValidationResult {
  valid: boolean;
  issues: ProductionContentValidationIssue[];
  validRecords: ProductionContentRecord[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRecord(
  record: unknown,
  index: number,
): ProductionContentValidationIssue[] {
  const issues: ProductionContentValidationIssue[] = [];

  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    issues.push({
      index,
      field: "$",
      message: "Production content record must be an object.",
    });

    return issues;
  }

  const value = record as Record<string, unknown>;

  if (!isNonEmptyString(value.id)) {
    issues.push({
      index,
      field: "id",
      message:
        "Production content ID is required and must be a non-empty string.",
    });
  }

  if (!isNonEmptyString(value.title)) {
    issues.push({
      index,
      field: "title",
      message:
        "Production content title is required and must be a non-empty string.",
    });
  }

  if (!isNonEmptyString(value.content)) {
    issues.push({
      index,
      field: "content",
      message:
        "Production content body is required and must be a non-empty string.",
    });
  }

  if (
    typeof value.metadata !== "object" ||
    value.metadata === null ||
    Array.isArray(value.metadata)
  ) {
    issues.push({
      index,
      field: "metadata",
      message: "Production content metadata is required and must be an object.",
    });

    return issues;
  }

  const metadata = value.metadata as Record<string, unknown>;

  if (!isNonEmptyString(metadata.language)) {
    issues.push({
      index,
      field: "metadata.language",
      message: "Production content language is required.",
    });
  }

  if (!isNonEmptyString(metadata.source)) {
    issues.push({
      index,
      field: "metadata.source",
      message: "Production content source is required.",
    });
  }

  return issues;
}

export function validateProductionContent(
  records: unknown[],
): ProductionContentValidationResult {
  const issues: ProductionContentValidationIssue[] = [];
  const validRecords: ProductionContentRecord[] = [];

  records.forEach((record, index) => {
    const recordIssues = validateRecord(record, index);

    issues.push(...recordIssues);

    if (recordIssues.length === 0) {
      validRecords.push(record as ProductionContentRecord);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    validRecords,
  };
}
