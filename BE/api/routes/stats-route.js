import express from "express";
import StatsController from "../controllers/stats-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// All stats routes require admin authentication
router.use(authenticate, authorizeRoles("ADMIN"));

// GET /api/admin/stats - Dashboard overview
router.get("/", StatsController.getDashboardStats);

// GET /api/admin/stats/registrations - User registration trend
router.get("/registrations", StatsController.getUserRegistrationStats);

// GET /api/admin/stats/documents-by-course - Documents distribution by course
router.get("/documents-by-course", StatsController.getBooksBySubject);

// GET /api/admin/stats/recent-users - Recent registered users
router.get("/recent-users", StatsController.getRecentUsers);

// GET /api/admin/stats/recent-votes - Recent votes
router.get("/recent-votes", StatsController.getRecentComments);

// GET /api/admin/stats/top-documents - Top documents by download
router.get("/top-documents", StatsController.getTopBooks);

// GET /api/admin/stats/user-tiers - User tier distribution
router.get("/user-tiers", StatsController.getUserTierStats);

export default router;
