import type { PipelineContext } from "../types/index.js";

export class Pipeline {
  constructor(
    private readonly context: PipelineContext,
  ) {}

  public summary(): void {
    console.log("");
    console.log("Pipeline");
    console.log("----------------------");
    console.log(
      `Job ID     : ${this.context.jobId}`,
    );
    console.log(
      `Source     : ${this.context.source}`,
    );
    console.log(
      `Documents  : ${this.context.documents.length}`,
    );
    console.log("");
  }

  public setDocuments(
    documents: PipelineContext["documents"],
  ): void {
    this.context.documents =
      documents;
  }

  public getContext(): PipelineContext {
    return this.context;
  }
}