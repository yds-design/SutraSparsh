import fs from "node:fs/promises";
import path from "node:path";

import type { ContentDocument } from "../types/index.js";
import type { Collector } from "./collector.js";

export class JsonCollector implements Collector {
  private readonly filePath = path.resolve(
    process.cwd(),
    "data",
    "sample-content.json"
  );

  public async collect(): Promise<ContentDocument[]> {
    try {
      const file = await fs.readFile(this.filePath, "utf8");

      const data = JSON.parse(file) as ContentDocument[];

      console.log("JSON Collector");
      console.log("----------------------");
      console.log(`Source : ${this.filePath}`);
      console.log(`Loaded : ${data.length} documents`);
      console.log("");

      return data;
    } catch (error) {
      console.error("Failed to load JSON content.");

      if (error instanceof Error) {
        console.error(error.message);
      }

      return [];
    }
  }
}