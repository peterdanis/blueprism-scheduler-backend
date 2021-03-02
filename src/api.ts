import CustomError from "./utils/customError";
import express from "express";
import jobsRouter from "./routes/jobs";
import path from "path";
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

// Use JSON middleware
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join("webapp")));

// Route handlers
app.use("/api/jobs", jobsRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/users", usersRouter);

// Route everything else to React app
app.get("*", (req, res) => {
  res.sendFile(path.join("webapp", "index.html"));
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
