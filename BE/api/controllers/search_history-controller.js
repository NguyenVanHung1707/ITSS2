import SearchHistory from "../models/search_history-model.js";

// Get unique recent searches of the user (limit 5)
export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const histories = await SearchHistory.findAll({
      where: { user_id: userId },
      attributes: ["search_query", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 30, // Get top 30 to filter uniques in js
      raw: true
    });

    // Clean duplicates to get unique queries
    const uniqueQueries = [];
    const seen = new Set();
    for (const h of histories) {
      const q = h.search_query.trim();
      if (q && !seen.has(q.toLowerCase())) {
        seen.add(q.toLowerCase());
        uniqueQueries.push(q);
      }
      if (uniqueQueries.length >= 5) break;
    }

    res.json({
      success: true,
      data: uniqueQueries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy lịch sử tìm kiếm",
      error: error.message
    });
  }
};

// Log a search query helper
export const logSearchQuery = async (userId, query) => {
  try {
    if (!userId || !query || !query.trim()) return;
    
    // Log query in search history
    await SearchHistory.create({
      user_id: userId,
      search_query: query.trim()
    });
  } catch (error) {
    console.error("Failed to log search query:", error);
  }
};

// Clear history
export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await SearchHistory.destroy({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      message: "Đã xóa lịch sử tìm kiếm thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa lịch sử tìm kiếm",
      error: error.message
    });
  }
};
