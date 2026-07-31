import type { ContentDocument } from "../types/index.js";
import type { Collector } from "./collector.js";

export class JsonCollector implements Collector {
  public async collect(): Promise<ContentDocument[]> {
    return [];
  }
}