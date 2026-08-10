import type { ContentDocument } from "../types/index.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Validator {
  validate(documents: ContentDocument[]): ValidationResult;
}