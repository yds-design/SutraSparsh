export interface ProductionContentMetadata {
  language: string;
  source: string;
}

export interface ProductionContentInput {
  id: string;
  title: string;
  content: string;
  metadata: ProductionContentMetadata;
}

export type ProductionContentRecord = ProductionContentInput;

export interface ProductionContentValidationResult {
  valid: boolean;
  errors: string[];
}

const SUPPORTED_LANGUAGES = new Set([
  "sanskrit",
]);

const REQUIRED_SOURCE = "production";

export function validateProductionContent(
  input: ProductionContentInput,
): ProductionContentValidationResult {
  const errors: string[] = [];

  // ----------------------------------------------------------
  // ID
  // ----------------------------------------------------------

  if (
    typeof input?.id !== "string" ||
    input.id.trim().length === 0
  ) {
    errors.push("Production content ID is required.");
  }

  // ----------------------------------------------------------
  // Title
  // ----------------------------------------------------------

  if (
    typeof input?.title !== "string" ||
    input.title.trim().length === 0
  ) {
    errors.push("Production content title is required.");
  }

  // ----------------------------------------------------------
  // Content
  // ----------------------------------------------------------

  if (
    typeof input?.content !== "string" ||
    input.content.trim().length === 0
  ) {
    errors.push("Production content body is required.");
  }

  // ----------------------------------------------------------
  // Metadata
  // ----------------------------------------------------------

  if (
    !input?.metadata ||
    typeof input.metadata !== "object"
  ) {
    errors.push(
      "Production content metadata is required.",
    );
  } else {
    // --------------------------------------------------------
    // Language
    // --------------------------------------------------------

    if (
      typeof input.metadata.language !== "string" ||
      !SUPPORTED_LANGUAGES.has(
        input.metadata.language.trim().toLowerCase(),
      )
    ) {
      errors.push(
        "Production content language is not supported.",
      );
    }

    // --------------------------------------------------------
    // Source
    // --------------------------------------------------------

    if (
      typeof input.metadata.source !== "string" ||
      input.metadata.source.trim().toLowerCase() !==
        REQUIRED_SOURCE
    ) {
      errors.push(
        "Production content source must be production.",
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}