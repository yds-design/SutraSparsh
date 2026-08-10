// backend/importer/src/index.ts

import process from "node:process";

import { ImporterPipeline } from "./pipeline/index.js";

async function bootstrap(): Promise<void> {
  const args = process.argv.slice(2);

  const resumeIndex =
    args.indexOf("--resume");

  if (resumeIndex !== -1) {
    const jobId =
      args[resumeIndex + 1];

    if (!jobId) {
      throw new Error(
        "Missing job ID for --resume.",
      );
    }

    const pipeline =
      new ImporterPipeline({
        source: "json",
      });

    await pipeline.resume(jobId);

    console.log("");
    console.log("================================");
    console.log(" Import Resume Completed");
    console.log("================================");
    return;
  }

  const pipeline =
    new ImporterPipeline({
      source: "json",
    });

  await pipeline.run();

  console.log("");
  console.log("================================");
  console.log(" Importer Ready");
  console.log("================================");
}

bootstrap().catch(
  (error: unknown) => {
    console.error("");
    console.error(
      "================================",
    );
    console.error(
      " Importer Failed",
    );
    console.error(
      "================================",
    );
    console.error("");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }

    process.exitCode = 1;
  },
);