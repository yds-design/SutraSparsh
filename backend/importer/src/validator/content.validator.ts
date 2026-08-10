import type { ContentDocument } from "../types/index.js";
import type {
  ValidationResult,
  Validator,
} from "./validator.js";

export class ContentValidator implements Validator {
  public validate(documents: ContentDocument[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (documents.length === 0) {
      warnings.push("No content documents were provided.");
    }

    const ids = new Set<string>();

    documents.forEach((document, index) => {
      const prefix = `Document ${index + 1}`;

      // ------------------------------------------------------
      // Required fields
      // ------------------------------------------------------

      if (!document.id?.trim()) {
        errors.push(`${prefix}: id is required.`);
      }

      if (!document.title?.trim()) {
        errors.push(`${prefix}: title is required.`);
      }

      if (!document.body?.trim()) {
        errors.push(`${prefix}: body is required.`);
      }

      // ------------------------------------------------------
      // Duplicate IDs
      // ------------------------------------------------------

      if (document.id?.trim()) {
        if (ids.has(document.id)) {
          errors.push(
            `${prefix}: duplicate document id "${document.id}".`,
          );
        }

        ids.add(document.id);
      }

      // ------------------------------------------------------
      // Metadata
      // ------------------------------------------------------

      if (!document.metadata) {
        errors.push(`${prefix}: metadata is required.`);
        return;
      }

      if (!document.metadata.language?.trim()) {
        errors.push(`${prefix}: metadata.language is required.`);
      }

      if (!document.metadata.source?.trim()) {
        errors.push(`${prefix}: metadata.source is required.`);
      }

      if (!document.metadata.author?.trim()) {
        warnings.push(`${prefix}: metadata.author is empty.`);
      }

      if (!document.metadata.category?.trim()) {
        warnings.push(`${prefix}: metadata.category is empty.`);
      }

      // ------------------------------------------------------
      // Tags
      // ------------------------------------------------------

      if (!document.metadata.tags) {
        warnings.push(`${prefix}: metadata.tags is missing.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}