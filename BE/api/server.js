import express from "express";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "./models/index.js";
import sequelize from "./config/db-config.js";
import authRoutes from "./routes/auth-route.js";
import userRoutes from "./routes/user-route.js";
import documentRoutes from "./routes/document-route.js";
import courseRoutes from "./routes/course-route.js";
import facultyRoutes from "./routes/faculty-route.js";
import voteRoutes from "./routes/vote-route.js";
import bookshelfRoutes from "./routes/bookshelf-route.js";
import chaptersRoutes from "./routes/chapters-route.js";
import searchHistoryRoutes from "./routes/search_history-route.js";
import statsRoutes from "./routes/stats-route.js";
import { seedDatabase } from "./config/seeder.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const DB_SYNC = process.env.DB_SYNC || "alter"; // options: 'alter' | 'force' | 'none'

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [
      "http://localhost",
      "http://localhost:80",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1",
      "http://127.0.0.1:80",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  if (process.env.NODE_ENV !== "production") {
    try {
      const { protocol, hostname } = new URL(origin);
      return (
        (protocol === "http:" || protocol === "https:") &&
        (hostname === "localhost" || hostname === "127.0.0.1")
      );
    } catch {
      return false;
    }
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/admin/stats", statsRoutes);

// Backward compatibility routes mapping older book-sharing entities
app.use("/api/books", documentRoutes);
app.use("/api/authors", facultyRoutes);
app.use("/api/subjects", courseRoutes);
app.use("/api/comments", voteRoutes);
app.use("/api/bookshelf", bookshelfRoutes);
app.use("/api/chapters", chaptersRoutes);

// Public stats route
import StatsController from "./controllers/stats-controller.js";
app.get("/api/public/stats", StatsController.getPublicStats);

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      message: "HUST Study Document API is running",
      database: "Connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "HUST Study Document API is running but database is disconnected",
      database: "Disconnected",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models to database
    if (DB_SYNC !== "none") {
      const syncOptions = DB_SYNC === "force" ? { force: true } : { alter: true };
      await sequelize.sync(syncOptions);
      console.log(
        `Sequelize sync completed with option: ${DB_SYNC} (${JSON.stringify(syncOptions)})`
      );
    } else {
      console.log("Sequelize sync skipped (DB_SYNC=none).");
    }

    // Seed database with default HUST data if empty
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
