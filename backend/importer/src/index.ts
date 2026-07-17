import { bootstrap } from "./bootstrap.js";

bootstrap().catch((error) => {
  console.error("");
  console.error("Fatal startup error");
  console.error("");

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }

  process.exit(1);
});