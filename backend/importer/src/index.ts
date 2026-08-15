import process from "node:process";

import { ImporterPipeline } from "./pipeline/index.js";

import {
  registerShutdownHandlers,
} from "./lifecycle/shutdown.js";

export interface ImporterCliOptions {
  resumeJobId?: string;
}

export function parseCliArguments(
  args: string[],
): ImporterCliOptions {
  const resumeIndex =
    args.indexOf("--resume");

  if (resumeIndex === -1) {
    return {};
  }

  const jobId =
    args[resumeIndex + 1];

  if (!jobId) {
    throw new Error(
      "Missing job ID for --resume.",
    );
  }

  return {
    resumeJobId: jobId,
  };
}

export async function bootstrap(
  options: ImporterCliOptions =
    parseCliArguments(
      process.argv.slice(2),
    ),
): Promise<void> {
  const pipeline =
    new ImporterPipeline({
      source: "json",
    });

  if (
    options.resumeJobId
  ) {
    const result =
      await pipeline.resume(
        options.resumeJobId,
      );

    console.log("");
    console.log(
      "================================",
    );
    console.log(
      " Import Resume Completed",
    );
    console.log(
      "================================",
    );
    console.log("");

    console.log(
      `Job ID     : ${result.jobId}`,
    );

    console.log(
      `Source     : ${result.source}`,
    );

    console.log(
      `Collected  : ${result.collected}`,
    );

    console.log(
      `Normalized : ${result.normalized}`,
    );

    console.log(
      `Written    : ${result.written}`,
    );

    console.log(
      `Created    : ${result.created}`,
    );

    console.log(
      `Updated    : ${result.updated}`,
    );

    console.log(
      `Unchanged  : ${result.unchanged}`,
    );

    console.log(
      `Verified   : ${result.verified}`,
    );

    return;
  }

  await pipeline.run();

  console.log("");
  console.log(
    "================================",
  );
  console.log(
    " Importer Ready",
  );
  console.log(
    "================================",
  );
}

export function startImporter(): void {
  const shutdownController =
    registerShutdownHandlers();

  void bootstrap().catch(
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

      if (
        error instanceof Error
      ) {
        console.error(
          error.message,
        );
      } else {
        console.error(
          String(error),
        );
      }

      process.exitCode = 1;

      shutdownController.unregister();
    },
  );
}

if (
  process.env.NODE_ENV !==
  "test"
) {
  startImporter();
}