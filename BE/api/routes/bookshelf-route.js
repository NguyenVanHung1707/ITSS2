import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth-middleware.js";
import Vote from "../models/vote-model.js";
import Document from "../models/document-model.js";
import Faculty from "../models/faculty-model.js";
import Course from "../models/course-model.js";

const router = express.Router();

// GET /api/bookshelf?status=FAVORITE or status=READING
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { status = "FAVORITE" } = req.query;

    if (status === "READING") {
      const votes = await Vote.findAll({
        where: { user_id: userId, is_reading: true },
        include: [
          {
            model: Document,
            as: "document",
            where: { is_deleted: 0 },
            include: [
              { model: Faculty, as: "faculty", attributes: ["id", "name", "code"] },
              { model: Course, as: "course", attributes: ["id", "name", "code"] }
            ]
          }
        ]
      });

      const reading = votes
        .map(v => v.document)
        .filter(Boolean)
        .map(doc => {
          const d = doc.toJSON ? doc.toJSON() : doc;
          return {
            ...d,
            imageUrl: d.image_url || "/placeholder-book.svg",
            author: d.faculty?.name || "Khoa/Viện HUST"
          };
        });

      return res.json({
        success: true,
        data: {
          reading,
          total: reading.length
        }
      });
    }

    // FAVORITE -> Map to documents the user has voted as helpful
    const votes = await Vote.findAll({
      where: { user_id: userId, is_helpful: true },
      include: [
        {
          model: Document,
          as: "document",
          where: { is_deleted: 0 },
          include: [
            { model: Faculty, as: "faculty", attributes: ["id", "name", "code"] },
            { model: Course, as: "course", attributes: ["id", "name", "code"] }
          ]
        }
      ]
    });

    const favorites = votes
      .map(v => v.document)
      .filter(Boolean)
      .map(doc => {
        // Map to standard document format with compatibility fields
        const d = doc.toJSON ? doc.toJSON() : doc;
        return {
          ...d,
          imageUrl: d.image_url || "/placeholder-book.svg",
          author: d.faculty?.name || "Khoa/Viện HUST"
        };
      });

    res.json({
      success: true,
      data: {
        favorites,
        total: favorites.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tải tủ sách",
      error: error.message
    });
  }
});

// GET /api/bookshelf/books/:id/check
router.get("/books/:id/check", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const documentId = parseInt(req.params.id);

    if (!userId) {
      return res.json({
        success: true,
        data: {
          inBookshelf: false,
          statuses: [],
          isFavorite: false,
          isReading: false
        }
      });
    }

    const vote = await Vote.findOne({
      where: { user_id: userId, document_id: documentId }
    });

    res.json({
      success: true,
      data: {
        inBookshelf: !!vote,
        statuses: vote ? [vote.is_helpful && "FAVORITE", vote.is_reading && "READING"].filter(Boolean) : [],
        isFavorite: vote ? vote.is_helpful : false,
        isReading: vote ? vote.is_reading : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra trạng thái yêu thích và đang đọc",
      error: error.message
    });
  }
});

// Compatibility for the older reader UI. The current schema no longer stores
// reading progress, so return a stable empty state and accept saves as no-ops.
router.get("/books/:id/progress", authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      lastChapterId: null,
      lastReadScrollPosition: 0
    }
  });
});

router.put("/books/:id/progress", authenticate, async (req, res) => {
  res.json({
    success: true,
    message: "Reading progress ignored by current document backend",
    data: {
      lastChapterId: req.body?.chapter_id || req.body?.chapterId || null,
      lastReadScrollPosition: req.body?.scroll_position || req.body?.scrollPosition || 0
    }
  });
});

// POST /api/bookshelf/books/:id (Toggle/Add to favorite or reading)
router.post("/books/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const documentId = parseInt(req.params.id);
    const { status = "FAVORITE" } = req.body;

    const [vote, created] = await Vote.findOrCreate({
      where: { user_id: userId, document_id: documentId },
      defaults: {
        is_helpful: status === "FAVORITE",
        is_reading: status === "READING",
        rating: 5
      }
    });

    if (!created) {
      if (status === "FAVORITE") {
        vote.is_helpful = true;
      } else if (status === "READING") {
        vote.is_reading = true;
      }
      await vote.save();
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái ${status === "FAVORITE" ? "yêu thích" : "đang đọc"} thành công`,
      data: vote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật tủ sách",
      error: error.message
    });
  }
});

// DELETE /api/bookshelf/books/:id (Remove from favorite or reading)
router.delete("/books/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const documentId = parseInt(req.params.id);
    const { status = "FAVORITE" } = req.query;

    const vote = await Vote.findOne({
      where: { user_id: userId, document_id: documentId }
    });

    if (vote) {
      if (status === "FAVORITE") {
        vote.is_helpful = false;
      } else if (status === "READING") {
        vote.is_reading = false;
      }

      // If it is no longer favorited and no longer being read, delete the record
      if (!vote.is_helpful && !vote.is_reading) {
        await vote.destroy();
      } else {
        await vote.save();
      }
    }

    res.json({
      success: true,
      message: `Đã xóa trạng thái ${status === "FAVORITE" ? "yêu thích" : "đang đọc"} thành công`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa trạng thái trong tủ sách",
      error: error.message
    });
  }
});

export default router;
