import { createApiApp } from "./app.js";
import type { Server } from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const app = createApiApp();

const server: Server = app.listen(
  PORT,
  HOST,
  () => {
    console.log("");
    console.log("================================");
    console.log(" SutraSparsh API");
    console.log("================================");
    console.log("");
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log("");
  },
);

server.on("error", (error: Error) => {
  console.error("SutraSparsh API server error.");
  console.error(error);
  process.exit(1);
});