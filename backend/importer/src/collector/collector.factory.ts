import type { Collector } from "./collector.js";

import { JsonCollector } from "./json.collector.js";
import { ManualCollector } from "./manual.collector.js";

export class CollectorFactory {
  public static create(source: string): Collector {
    switch (source.toLowerCase()) {
      case "manual":
        return new ManualCollector();

      case "json":
        return new JsonCollector();

      default:
        throw new Error(`Unknown collector: ${source}`);
    }
  }
}