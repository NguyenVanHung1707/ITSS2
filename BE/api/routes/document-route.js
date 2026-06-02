import express from "express";
import {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  approveDocument,
  rejectDocument,
  getPendingDocuments,
  incrementDownloadCounter,
  deleteDocument,
  updateDocument,
  getDocumentChapters,
  submitDocumentLink,
  getPendingDocumentLinks,
  approveDocumentLink,
  rejectDocumentLink
} from "../controllers/document-controller.js";
import { authenticate, optionalAuth, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();


// Student Upload Route (require login)
router.post("/upload", authenticate, uploadDocument);
router.post("/:id/links", authenticate, submitDocumentLink);

// Admin workflow routes (require ADMIN role)
router.get("/admin/pending", authenticate, authorizeRoles("ADMIN"), getPendingDocuments);
router.get("/admin/link-submissions", authenticate, authorizeRoles("ADMIN"), getPendingDocumentLinks);
router.put("/admin/link-submissions/:linkId/approve", authenticate, authorizeRoles("ADMIN"), approveDocumentLink);
router.put("/admin/link-submissions/:linkId/reject", authenticate, authorizeRoles("ADMIN"), rejectDocumentLink);
router.put("/admin/:id/approve", authenticate, authorizeRoles("ADMIN"), approveDocument);
router.put("/admin/:id/reject", authenticate, authorizeRoles("ADMIN"), rejectDocument);
router.put("/admin/:id", authenticate, authorizeRoles("ADMIN"), updateDocument);
router.delete("/admin/:id", authenticate, authorizeRoles("ADMIN"), deleteDocument);

// Public routes
router.get("/", optionalAuth, getAllDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/chapters", getDocumentChapters);
router.put("/:id/download", incrementDownloadCounter);

export default router;
