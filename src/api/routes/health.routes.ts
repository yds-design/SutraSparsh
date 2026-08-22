import {
  Router,
  type Request,
  type Response,
} from "express";

const router = Router();

router.get(
  "/health",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        service: "sutrasparsh-backend",
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export default router;