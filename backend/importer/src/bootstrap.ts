import process from "node:process";

import { ImporterPipeline } from "./pipeline/index.js";

export async function bootstrap(): Promise<void> {
  const args = process.argv.slice(2);

  const resumeIndex = args.indexOf("--resume");

  if (resumeIndex !== -1) {
    const jobId = args[resumeIndex + 1];

    if (!jobId) {
      throw new Error(
        "Missing job ID. Usage: --resume <jobId>",
      );
    }

    const pipeline = new ImporterPipeline({
      source: "json",
    });

    console.log("");
    console.log("================================");
    console.log(" Import Resume");
    console.log("================================");
    console.log("");
    console.log(`Job ID : ${jobId}`);
    console.log("");

    const result = await pipeline.resume(jobId);

    console.log("");
    console.log("================================");
    console.log(" Import Resume Completed");
    console.log("================================");
    console.log("");
    console.log(`Job ID     : ${result.jobId}`);
    console.log(`Source     : ${result.source}`);
    console.log(`Collected  : ${result.collected}`);
    console.log(`Normalized : ${result.normalized}`);
    console.log(`Written    : ${result.written}`);
    console.log(`Created    : ${result.created}`);
    console.log(`Updated    : ${result.updated}`);
    console.log(`Verified   : ${result.verified}`);
    console.log("");

    return;
  }

  const pipeline = new ImporterPipeline({
    source: "json",
  });

  const result = await pipeline.run();

  console.log("");
  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
  console.log("");
  console.log(`Job ID     : ${result.jobId}`);
  console.log(`Source     : ${result.source}`);
  console.log(`Collected  : ${result.collected}`);
  console.log(`Normalized : ${result.normalized}`);
  console.log(`Written    : ${result.written}`);
  console.log(`Created    : ${result.created}`);
  console.log(`Updated    : ${result.updated}`);
  console.log(`Verified   : ${result.verified}`);
  console.log("");
}