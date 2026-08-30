import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { createApiApp } from "./src/api/app.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);
  const HOST = process.env.HOST ?? "0.0.0.0";

  // Create API backend app
  const apiApp = createApiApp();

  // Mount API backend app (handles /api/*)
  app.use(apiApp);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n================================`);
    console.log(` SutraSparsh Full-Stack Platform`);
    console.log(`================================`);
    console.log(`Server listening on http://${HOST}:${PORT}\n`);
  });

  server.on("error", (error: Error) => {
    console.error("SutraSparsh server error:", error);
  });
}

startServer();
