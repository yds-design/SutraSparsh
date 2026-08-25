import { describe, expect, it } from "vitest";
import {
  validateProductionContent,
  type ProductionContentInput,
} from "../../../../src/production/production-content.schema.js";
describe("Production Content Validation — M9.3", () => {
  it("accepts a valid production content document", () => {
    const document: ProductionContentInput = {
      id: "prod-001",
      title: "Test Production Content",
      content: "This is valid production content.",
      metadata: { language: "sanskrit", source: "production" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
  it("rejects a missing content ID", () => {
    const document = {
      title: "Test Production Content",
      content: "This is valid production content.",
      metadata: { language: "sanskrit", source: "production" },
    } as ProductionContentInput;
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Production content ID is required.");
  });
  it("rejects an empty title", () => {
    const document: ProductionContentInput = {
      id: "prod-002",
      title: "",
      content: "This is valid production content.",
      metadata: { language: "sanskrit", source: "production" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Production content title is required.");
  });
  it("rejects empty content", () => {
    const document: ProductionContentInput = {
      id: "prod-003",
      title: "Valid title",
      content: "",
      metadata: { language: "sanskrit", source: "production" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Production content body is required.");
  });
  it("rejects missing metadata", () => {
    const document = {
      id: "prod-004",
      title: "Valid title",
      content: "Valid content.",
    } as ProductionContentInput;
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Production content metadata is required.");
  });
  it("rejects an unsupported language", () => {
    const document: ProductionContentInput = {
      id: "prod-005",
      title: "Valid title",
      content: "Valid content.",
      metadata: { language: "unknown", source: "production" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Production content language is not supported.",
    );
  });
  it("rejects an invalid production source", () => {
    const document: ProductionContentInput = {
      id: "prod-006",
      title: "Valid title",
      content: "Valid content.",
      metadata: { language: "sanskrit", source: "json" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Production content source must be production.",
    );
  });
  it("trims whitespace when validating required fields", () => {
    const document: ProductionContentInput = {
      id: " ",
      title: " ",
      content: " ",
      metadata: { language: "sanskrit", source: "production" },
    };
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
  it("returns multiple validation errors together", () => {
    const document = {
      id: "",
      title: "",
      content: "",
      metadata: { language: "unknown", source: "json" },
    } as ProductionContentInput;
    const result = validateProductionContent(document);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(5);
  });
});
