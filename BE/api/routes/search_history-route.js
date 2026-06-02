import express from "express";
import { getRecentSearches, clearSearchHistory } from "../controllers/search_history-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Require user authentication
router.use(authenticate);

router.get("/", getRecentSearches);
router.delete("/", clearSearchHistory);

export default router;
