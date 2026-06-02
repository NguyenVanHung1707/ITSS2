import express from "express";
import {
  toggleVote,
  getDocumentVotes,
  deleteVote,
  getRecentVotes,
  toggleVoteCompat,
  getDocumentVotesCompat,
  getAllCommentsCompat,
  getBooksWithCommentsCompat,
  getSentimentStatsCompat,
  getModerationModeCompat,
  updateModerationModeCompat,
  noOpBulkCompat,
  approveCommentCompat,
  rejectCommentCompat,
  updateCommentStatusCompat
} from "../controllers/vote-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public route to view stats and comments
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllCommentsCompat);
router.get("/moderation-mode", authenticate, authorizeRoles("ADMIN"), getModerationModeCompat);
router.put("/moderation-mode", authenticate, authorizeRoles("ADMIN"), updateModerationModeCompat);
router.get("/documents-with-votes", authenticate, authorizeRoles("ADMIN"), getBooksWithCommentsCompat);
router.get("/books-with-comments", authenticate, authorizeRoles("ADMIN"), getBooksWithCommentsCompat);
router.get("/sentiment-stats", authenticate, authorizeRoles("ADMIN"), getSentimentStatsCompat);
router.post("/bulk-check-pending", authenticate, authorizeRoles("ADMIN"), noOpBulkCompat);
router.post("/bulk-approve", authenticate, authorizeRoles("ADMIN"), noOpBulkCompat);
router.post("/bulk-reject", authenticate, authorizeRoles("ADMIN"), noOpBulkCompat);
router.post("/bulk-classify", authenticate, authorizeRoles("ADMIN"), noOpBulkCompat);
router.get("/document/:documentId", getDocumentVotes);
router.get("/documents/:documentId/votes", getDocumentVotesCompat);
router.get("/books/:documentId/comments", getDocumentVotesCompat);

// Authenticated toggle, update and delete
router.post("/", authenticate, toggleVote);
router.post("/documents/:documentId/votes", authenticate, toggleVoteCompat);
router.post("/books/:documentId/comments", authenticate, toggleVoteCompat);
router.put("/:id", authenticate, toggleVoteCompat);
router.patch("/:id/approve", authenticate, authorizeRoles("ADMIN"), approveCommentCompat);
router.patch("/:id/reject", authenticate, authorizeRoles("ADMIN"), rejectCommentCompat);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateCommentStatusCompat);
router.delete("/:id", authenticate, deleteVote);

// Admin moderation log route
router.get("/admin/recent", authenticate, authorizeRoles("ADMIN"), getRecentVotes);

export default router;
