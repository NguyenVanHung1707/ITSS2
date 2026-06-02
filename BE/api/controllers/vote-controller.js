import Vote from "../models/vote-model.js";
import Document from "../models/document-model.js";
import { User } from "../models/user-model.js";

// Toggle or submit helpfulness vote for a document
export const toggleVote = async (req, res) => {
  try {
    const { documentId, isHelpful, commentText } = req.body;
    const userId = req.user.user_id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID tài liệu để đánh giá"
      });
    }

    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Tài liệu không tồn tại"
      });
    }

    // Check if user already voted on this document
    const existingVote = await Vote.findOne({
      where: { user_id: userId, document_id: documentId }
    });

    if (existingVote) {
      // Update existing vote
      await existingVote.update({
        is_helpful: isHelpful !== undefined ? isHelpful : existingVote.is_helpful,
        comment_text: commentText !== undefined ? commentText : existingVote.comment_text
      });

      return res.json({
        success: true,
        data: existingVote,
        message: "Cập nhật đánh giá hữu ích thành công!"
      });
    }

    // Create new vote
    const vote = await Vote.create({
      user_id: userId,
      document_id: documentId,
      is_helpful: isHelpful !== undefined ? isHelpful : true,
      comment_text: commentText || null
    });

    res.status(201).json({
      success: true,
      data: vote,
      message: "Cảm ơn bạn đã bình chọn tài liệu học tập!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi thực hiện bình chọn hữu ích",
      error: error.message
    });
  }
};

// Get upvotes / helpfulness summary for a document
export const getDocumentVotes = async (req, res) => {
  try {
    const { documentId } = req.params;

    const upvotesCount = await Vote.count({
      where: { document_id: documentId, is_helpful: true }
    });

    const downvotesCount = await Vote.count({
      where: { document_id: documentId, is_helpful: false }
    });

    // Fetch review comments
    const reviews = await Vote.findAll({
      where: { document_id: documentId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["full_name", "email"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({
      success: true,
      data: {
        upvotes: upvotesCount,
        downvotes: downvotesCount,
        reviews: reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thống kê bình chọn tài liệu",
      error: error.message
    });
  }
};

// Remove a vote
export const deleteVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const where = { vote_id: id };
    if (req.user.role !== "ADMIN") {
      where.user_id = userId;
    }

    const vote = await Vote.findOne({ where });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt bình chọn của bạn"
      });
    }

    await vote.destroy();

    res.json({
      success: true,
      message: "Đã hủy bình chọn tài liệu thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hủy bình chọn",
      error: error.message
    });
  }
};

// Admin list recent reviews
export const getRecentVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["full_name", "email"]
        },
        {
          model: Document,
          as: "document",
          attributes: ["id", "title"]
        }
      ],
      order: [["created_at", "DESC"]],
      limit: 50
    });

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy lượt bình chọn gần đây",
      error: error.message
    });
  }
};

const formatVoteAsComment = (vote) => ({
  comment_id: vote.vote_id,
  content: vote.comment_text || "",
  rating: vote.rating || (vote.is_helpful ? 5 : 1),
  status: "APPROVED",
  sentiment: vote.is_helpful ? "POSITIVE" : "NEGATIVE",
  created_at: vote.created_at,
  user: vote.user
    ? {
        user_id: vote.user.user_id,
        full_name: vote.user.full_name,
        email: vote.user.email,
      }
    : null,
  book: vote.document
    ? {
        id: vote.document.id,
        title: vote.document.title,
      }
    : null,
});

export const getAllCommentsCompat = async (req, res) => {
  try {
    const { limit = 50, bookId, documentId } = req.query;
    const where = {};
    if (documentId || bookId) where.document_id = documentId || bookId;

    const votes = await Vote.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: Document,
          as: "document",
          attributes: ["id", "title"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit, 10),
    });

    res.json({
      success: true,
      data: {
        votes: votes.map(formatVoteAsComment),
        comments: votes.map(formatVoteAsComment),
        total: votes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lá»—i láº¥y danh sÃ¡ch bÃ¬nh luá»‡n",
      error: error.message,
    });
  }
};

export const getBooksWithCommentsCompat = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const votes = await Vote.findAll({
      include: [
        {
          model: Document,
          as: "document",
          attributes: ["id", "title", "image_url"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit, 10),
    });
    const seen = new Set();
    const documents = votes
      .map((vote) => vote.document)
      .filter((document) => {
        if (!document || seen.has(document.id)) return false;
        seen.add(document.id);
        return true;
      });

    res.json({
      success: true,
      data: {
        documents,
        books: documents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lá»—i láº¥y tÃ i liá»‡u cÃ³ bÃ¬nh luá»‡n",
      error: error.message,
    });
  }
};

export const getSentimentStatsCompat = async (req, res) => {
  try {
    const { bookId, documentId } = req.query;
    const where = documentId || bookId ? { document_id: documentId || bookId } : {};
    const [positive, negative, total] = await Promise.all([
      Vote.count({ where: { ...where, is_helpful: true } }),
      Vote.count({ where: { ...where, is_helpful: false } }),
      Vote.count({ where }),
    ]);
    const neutral = Math.max(total - positive - negative, 0);

    res.json({
      success: true,
      data: { positive, neutral, negative, total },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lá»—i láº¥y thá»‘ng kÃª cáº£m xÃºc",
      error: error.message,
    });
  }
};

export const getModerationModeCompat = async (req, res) => {
  res.json({ success: true, data: { mode: "DEFAULT" }, mode: "DEFAULT" });
};

export const updateModerationModeCompat = async (req, res) => {
  res.json({ success: true, data: { mode: req.body?.mode || "DEFAULT" } });
};

export const noOpBulkCompat = async (req, res) => {
  res.json({ success: true, data: { processed: 0, spamDetected: 0 } });
};

export const approveCommentCompat = async (req, res) => {
  res.json({ success: true, data: { comment_id: req.params.id, status: "APPROVED" } });
};

export const rejectCommentCompat = async (req, res) => {
  res.json({ success: true, data: { comment_id: req.params.id, status: "REJECTED" } });
};

export const updateCommentStatusCompat = async (req, res) => {
  res.json({ success: true, data: { comment_id: req.params.id, status: req.body?.status || "APPROVED" } });
};

export const deleteCommentCompat = async (req, res) => {
  try {
    await Vote.destroy({ where: { vote_id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lá»—i xÃ³a bÃ¬nh luá»‡n",
      error: error.message,
    });
  }
};

// Toggle/Submit vote compat for older reviews UI (POST /api/comments/books/:documentId/comments or PUT /api/comments/:id)
export const toggleVoteCompat = async (req, res) => {
  try {
    const { rating, content } = req.body;
    const { documentId, id } = req.params; // documentId for POST, id for PUT
    const userId = req.user.user_id;

    let targetDocId = documentId;
    let voteId = id;

    if (voteId) {
      // PUT request
      const existingVote = await Vote.findOne({
        where: { vote_id: voteId, user_id: userId }
      });
      if (!existingVote) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá"
        });
      }

      await existingVote.update({
        rating: rating !== undefined ? rating : existingVote.rating,
        comment_text: content !== undefined ? content : existingVote.comment_text,
        is_helpful: rating !== undefined ? (rating >= 3) : existingVote.is_helpful
      });

      return res.json({
        success: true,
        data: existingVote,
        message: "Cập nhật đánh giá thành công!"
      });
    }

    // POST request
    if (!targetDocId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID tài liệu để đánh giá"
      });
    }

    const document = await Document.findByPk(targetDocId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Tài liệu không tồn tại"
      });
    }

    // Check if already voted
    const existingVote = await Vote.findOne({
      where: { user_id: userId, document_id: targetDocId }
    });

    if (existingVote) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá tài liệu này trước đó."
      });
    }

    const vote = await Vote.create({
      user_id: userId,
      document_id: targetDocId,
      rating: rating || 5,
      comment_text: content || null,
      is_helpful: rating ? (rating >= 3) : true
    });

    res.status(201).json({
      success: true,
      data: vote,
      message: "Gửi đánh giá thành công!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi thực hiện đánh giá",
      error: error.message
    });
  }
};

// Get comments list compat for older reviews UI (GET /api/comments/books/:documentId/comments)
export const getDocumentVotesCompat = async (req, res) => {
  try {
    const { documentId } = req.params;

    const votes = await Vote.findAll({
      where: { document_id: documentId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name", "email"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // Format into what React FE's ReviewsSection expects
    const formattedComments = votes.map(v => ({
      comment_id: v.vote_id,
      content: v.comment_text || "",
      rating: v.rating || (v.is_helpful ? 5 : 1),
      created_at: v.created_at,
      status: "APPROVED", // Auto-approved since we bypass premium restrictions
      user: {
        user_id: v.user?.user_id || "",
        full_name: v.user?.full_name || "Ẩn danh",
        email: v.user?.email || ""
      }
    }));

    // Calculate average rating
    const totalCount = votes.length;
    let averageRating = 0;
    if (totalCount > 0) {
      const sum = votes.reduce((acc, v) => acc + (v.rating || (v.is_helpful ? 5 : 1)), 0);
      averageRating = (sum / totalCount).toFixed(1);
    }

    res.json({
      success: true,
      data: {
        votes: formattedComments,
        comments: formattedComments,
        averageRating: Number(averageRating),
        totalComments: totalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách bình chọn",
      error: error.message
    });
  }
};
