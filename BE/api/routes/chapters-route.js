import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";
import DocumentLink from "../models/document_link-model.js";

const router = express.Router();

// GET /api/chapters/:id
router.get("/:id", async (req, res) => {
  try {
    const link = await DocumentLink.findByPk(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương tài liệu"
      });
    }

    res.json({
      success: true,
      data: {
        id: link.id,
        title: link.title,
        drive_link: link.drive_link,
        book_id: link.document_id,
        chapter_number: 1,
        content: ""
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chương tài liệu",
      error: error.message
    });
  }
});

// POST /api/chapters
router.post("/", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const { title, drive_link, book_id, documentId } = req.body;
    const targetDocId = book_id || documentId;

    if (!targetDocId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã tài liệu (book_id/documentId)"
      });
    }

    const link = await DocumentLink.create({
      document_id: parseInt(targetDocId),
      title: title || "Tài liệu học tập",
      drive_link: drive_link || "#"
    });

    res.status(201).json({
      success: true,
      message: "Thêm chương mới thành công",
      data: {
        id: link.id,
        title: link.title,
        drive_link: link.drive_link,
        book_id: link.document_id,
        chapter_number: 1,
        content: ""
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi thêm chương tài liệu",
      error: error.message
    });
  }
});

// PUT /api/chapters/:id
router.put("/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const link = await DocumentLink.findByPk(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương tài liệu"
      });
    }

    const { title, drive_link } = req.body;
    await link.update({
      title: title || link.title,
      drive_link: drive_link || link.drive_link
    });

    res.json({
      success: true,
      message: "Cập nhật chương thành công",
      data: {
        id: link.id,
        title: link.title,
        drive_link: link.drive_link,
        book_id: link.document_id,
        chapter_number: 1,
        content: ""
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật chương tài liệu",
      error: error.message
    });
  }
});

// DELETE /api/chapters/:id
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const link = await DocumentLink.findByPk(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương tài liệu"
      });
    }

    await link.destroy();

    res.json({
      success: true,
      message: "Xóa chương tài liệu thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa chương tài liệu",
      error: error.message
    });
  }
});

export default router;
