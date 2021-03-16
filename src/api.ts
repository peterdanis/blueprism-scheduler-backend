// import { format, transports } from "winston";
import CustomError from "./utils/customError";
import express from "express";
import jobLogsRouter from "./routes/jobLogs";
import jobsRouter from "./routes/jobs";
import log from "./utils/logger";
import path from "path";
import runtimeResourcesRouter from "./routes/runtimeResources";
import schedulesRouter from "./routes/schedules";
import usersRouter from "./routes/users";

const app = express();

// Setup logging and rate limiter
// setupLog(app);
// setupRateLimiter(app);
// setupAuth(app);
// setupSwagger(app);

// Disable headers
app.disable("etag");
app.disable("x-powered-by");

// Use JSON and logging middlewares
app.use(express.json());
app.use((req, res, next) => {
  const { url } = req;
  res.on("finish", () => {
    log.info(`HTTP ${req.method} ${url} ${res.statusCode}`, {
      bodyProperties: req.body ? Object.keys(req.body) : [],
      ip: req.ip,
      method: req.method,
      statusCode: res.statusCode,
      url,
    });
  });
  next();
});

// Serve static files from the React app
app.use(express.static(path.join("webapp")));

// Route handlers
app.use("/api/jobs", jobsRouter);
app.use("/api/jobLogs", jobLogsRouter);
app.use("/api/runtimeResources", runtimeResourcesRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/users", usersRouter);

// Route everything else to React app
app.get("*", (req, res) => {
  res.sendFile("index.html", {
    root: path.join("webapp"),
  });
});

// Error handler
app.use(
  (
    error: CustomError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    if (error.statusCode || res.statusCode >= 400) {
      res.status(error.statusCode || res.statusCode);
    } else {
      res.status(500);
    }
    res.json({ error: error.message || error });
  },
);

export default app;
