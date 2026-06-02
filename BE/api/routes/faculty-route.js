import express from "express";
import { getAllFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from "../controllers/faculty-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllFaculties);
router.get("/:id", getFacultyById);

// Admin-only routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createFaculty);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateFaculty);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteFaculty);

export default router;
