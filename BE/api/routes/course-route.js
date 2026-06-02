import express from "express";
import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } from "../controllers/course-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Admin-only routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createCourse);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateCourse);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteCourse);

export default router;
