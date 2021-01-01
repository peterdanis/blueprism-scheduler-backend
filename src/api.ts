import express from "express";
// const miscRouter = require("./routes/misc");
// const setupAuth = require("./utils/auth");
// const setupLog = require("./utils/logging");

interface CustomError extends Error {
  statusCode: number;
}

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

// Route handlers
// app.use("/", miscRouter);
// app.use("/processes", processesRouter);

// 404 handler
app.use("*", (req, res, next) => {
  if (req.baseUrl.match(/\/api-spec/)) {
    next();
  } else {
    res.status(404);
    next("Not Found");
  }
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
