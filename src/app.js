import express, { json } from "express";
import cors from "cors";
import healthCheckRouter from "./routes/health-check.routes.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

const app = express();

// basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser())

// cors configurations
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:8080/",
    credentials: true,
    methods: ["GET", "DELETE", "PATCH", "PUT", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

// routes configurations
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app.get("/", (req, res) => {
  res.send("Hello Wolrd");
});

export default app;
