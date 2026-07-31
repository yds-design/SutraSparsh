import type { ContentDocument } from "../types/index.js";
import type { Collector } from "./collector.js";

export class ManualCollector implements Collector {
  public async collect(): Promise<ContentDocument[]> {
    return [
      {
        id: "demo-001",
        title: "योगः कर्मसु कौशलम्",
        body: "Yoga is excellence in action.",
        metadata: {
          language: "sa",
          source: "manual",
          author: "Bhagavad Gita",
          category: "Verse",
          tags: ["karma", "yoga"],
        },
      },
    ];
  }
}