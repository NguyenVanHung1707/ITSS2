import { User } from "../models/user-model.js";
import Document from "../models/document-model.js";
import Vote from "../models/vote-model.js";
import Course from "../models/course-model.js";
import Faculty from "../models/faculty-model.js";
import sequelize from "../config/db-config.js";
import { Op, fn, col } from "sequelize";

class StatsController {
  // Get dashboard overview stats
  static async getDashboardStats(req, res) {
    try {
      // Total users
      const totalUsers = await User.count({
        where: { is_deleted: 0 }
      });

      // Total documents
      const totalDocuments = await Document.count({ where: { is_deleted: 0 } });

      // Total votes
      const totalVotes = await Vote.count();

      // Users registered in last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const newUsers24h = await User.count({
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: yesterday
          }
        }
      });

      // Users registered in last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const newUsersWeek = await User.count({
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: lastWeek
          }
        }
      });

      // Total faculties
      const totalFaculties = await Faculty.count({ where: { is_deleted: 0 } });

      // Total courses
      const totalCourses = await Course.count({ where: { is_deleted: 0 } });

      res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            newLast24h: newUsers24h,
            newLastWeek: newUsersWeek,
            premium: 0,
            free: totalUsers
          },
          documents: {
            total: totalDocuments,
            free: totalDocuments,
            premium: 0
          },
          books: {
            total: totalDocuments,
            free: totalDocuments,
            premium: 0
          },
          votes: {
            total: totalVotes
          },
          comments: {
            total: totalVotes
          },
          faculties: {
            total: totalFaculties
          },
          authors: {
            total: totalFaculties
          },
          courses: {
            total: totalCourses
          },
          subjects: {
            total: totalCourses
          }
        }
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get user registration stats by period
  static async getUserRegistrationStats(req, res) {
    try {
      const { period = "30" } = req.query; // days
      const days = parseInt(period) || 30;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily registration count
      const registrations = await User.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('user_id')), 'count']
        ],
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: startDate
          }
        },
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'ASC']],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          period: days,
          registrations
        }
      });
    } catch (error) {
      console.error("Get user registration stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get documents by course distribution
  static async getBooksBySubject(req, res) {
    try {
      const stats = await sequelize.query(`
        SELECT c.name, COUNT(d.id) as count
        FROM courses c
        LEFT JOIN documents d ON c.id = d.course_id AND d.is_deleted = 0
        WHERE c.is_deleted = 0
        GROUP BY c.id, c.name
        ORDER BY count DESC
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT });

      const total = stats.reduce((sum, s) => sum + parseInt(s.count || 0), 0);

      const distribution = stats.map(s => ({
        name: s.name,
        count: parseInt(s.count || 0),
        percent: total > 0 ? Math.round((parseInt(s.count || 0) / total) * 100) : 0
      }));

      res.status(200).json({
        success: true,
        data: {
          total,
          distribution
        }
      });
    } catch (error) {
      console.error("Get documents by course error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get recent users
  static async getRecentUsers(req, res) {
    try {
      const { limit = 5 } = req.query;

      const users = await User.findAll({
        where: { is_deleted: 0 },
        attributes: ["user_id", "email", "full_name", "role", "created_at"],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        raw: true
      });

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      console.error("Get recent users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get recent votes
  static async getRecentComments(req, res) {
    try {
      const { limit = 5 } = req.query;

      const comments = await sequelize.query(`
        SELECT 
          v.vote_id as comment_id,
          v.comment_text as content,
          CASE WHEN v.is_helpful = true THEN 5 ELSE 1 END as rating,
          v.created_at,
          u.full_name as user_name,
          u.email as user_email,
          d.title as book_title
        FROM votes v
        JOIN users u ON v.user_id = u.user_id
        JOIN documents d ON v.document_id = d.id
        WHERE u.is_deleted = 0 AND d.is_deleted = 0
        ORDER BY v.created_at DESC
        LIMIT :limit
      `, {
        replacements: { limit: parseInt(limit) },
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json({
        success: true,
        data: { votes: comments, comments }
      });
    } catch (error) {
      console.error("Get recent votes error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get top documents by download/popularity
  static async getTopBooks(req, res) {
    try {
      const { limit = 10 } = req.query;

      const documents = await Document.findAll({
        where: { is_deleted: 0, status: "APPROVED" },
        attributes: ["id", "title", "image_url", "download_count", "type"],
        order: [["download_count", "DESC"]],
        limit: parseInt(limit),
        raw: true
      });

      res.status(200).json({
        success: true,
        data: { documents, books: documents }
      });
    } catch (error) {
      console.error("Get top documents error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get user tier distribution (Simplified to 100% Free)
  static async getUserTierStats(req, res) {
    try {
      const freeUsers = await User.count({
        where: { is_deleted: 0 }
      });

      res.status(200).json({
        success: true,
        data: {
          total: freeUsers,
          free: {
            count: freeUsers,
            percent: 100
          },
          premium: {
            count: 0,
            percent: 0
          }
        }
      });
    } catch (error) {
      console.error("Get user tier stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get public stats for homepage
  static async getPublicStats(req, res) {
    try {
      const totalUsers = await User.count({
        where: { is_deleted: 0 }
      });

      const totalDocuments = await Document.count({ where: { is_deleted: 0, status: "APPROVED" } });

      const totalFaculties = await Faculty.count({ where: { is_deleted: 0 } });

      const totalReviews = await Vote.count();

      const downloadResult = await Document.findOne({
        where: { is_deleted: 0, status: "APPROVED" },
        attributes: [
          [fn('SUM', col('download_count')), 'totalDownloads']
        ],
        raw: true
      });

      const totalDownloads = downloadResult?.totalDownloads || 0;

      res.status(200).json({
        success: true,
        data: {
          documents: totalDocuments,
          books: totalDocuments,
          users: totalUsers,
          faculties: totalFaculties,
          authors: totalFaculties,
          avgRating: "4.8",
          totalReviews: totalReviews,
          totalReads: totalDownloads
        }
      });
    } catch (error) {
      console.error("Get public stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
}

export default StatsController;
