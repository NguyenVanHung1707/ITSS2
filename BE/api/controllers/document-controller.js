import Document from "../models/document-model.js";
import Faculty from "../models/faculty-model.js";
import Course from "../models/course-model.js";
import DocumentLink from "../models/document_link-model.js";
import Vote from "../models/vote-model.js";
import { User } from "../models/user-model.js";
import { logSearchQuery } from "./search_history-controller.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

// Setup relations dynamically if needed
if (!Document.associations.faculty) {
  Document.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
}
if (!Document.associations.course) {
  Document.belongsTo(Course, { foreignKey: "course_id", as: "course" });
}
if (!Document.associations.links) {
  Document.hasMany(DocumentLink, { foreignKey: "document_id", as: "links" });
}
if (!DocumentLink.associations.document) {
  DocumentLink.belongsTo(Document, { foreignKey: "document_id", as: "document" });
}
if (!DocumentLink.associations.uploader) {
  DocumentLink.belongsTo(User, { foreignKey: "user_id", as: "uploader" });
}
if (!Document.associations.votes) {
  Document.hasMany(Vote, { foreignKey: "document_id", as: "votes" });
}

// 1. Get all public approved documents (with search & filters)
export const getAllDocuments = async (req, res) => {
  try {
    const { facultyId, courseId, type, page = 1, limit = 10, keyword, q, sort } = req.query;
    const offset = (page - 1) * limit;

    // Filter by status APPROVED and soft delete
    const where = { is_deleted: 0, status: "APPROVED" };

    if (facultyId) {
      where.faculty_id = facultyId;
    }
    if (courseId) {
      where.course_id = courseId;
    }
    const legacyPriceTypes = new Set(["FREE", "PREMIUM"]);
    if (type && !legacyPriceTypes.has(type)) {
      where.type = type;
    }

    const searchTerm = keyword || q;
    if (searchTerm && searchTerm.trim()) {
      const trimmed = searchTerm.trim();
      where[Op.or] = [
        { title: { [Op.iLike]: `%${trimmed}%` } },
        { summary: { [Op.iLike]: `%${trimmed}%` } },
        { '$course.code$': { [Op.iLike]: `%${trimmed}%` } },
        { '$course.name$': { [Op.iLike]: `%${trimmed}%` } },
        { '$faculty.code$': { [Op.iLike]: `%${trimmed}%` } },
        { '$faculty.name$': { [Op.iLike]: `%${trimmed}%` } }
      ];

      // Log user search history if authenticated
      if (req.user && req.user.user_id) {
        logSearchQuery(req.user.user_id, searchTerm).catch(err =>
          console.error("Failed to log search in background:", err)
        );
      }
    }

    // Include relations
    const include = [
      {
        model: Faculty,
        as: "faculty",
        attributes: ["id", "name", "code"]
      },
      {
        model: Course,
        as: "course",
        attributes: ["id", "name", "code"]
      }
    ];

    // Sorting order
    let order = [["created_at", "DESC"]]; // Default: Newest
    if (sort) {
      switch (sort) {
        case "oldest":
          order = [["created_at", "ASC"]];
          break;
        case "a-z":
          order = [["title", "ASC"]];
          break;
        case "z-a":
          order = [["title", "DESC"]];
          break;
        case "downloads":
          order = [["download_count", "DESC"]];
          break;
        case "helpful":
          // Sort by upvote count
          order = [[sequelize.literal('(SELECT COUNT(*) FROM votes WHERE votes.document_id = documents.id AND votes.is_helpful = true)'), 'DESC']];
          break;
        case "newest":
        default:
          order = [["created_at", "DESC"]];
      }
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include,
      subQuery: false,
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM document_links WHERE document_links.document_id = documents.id AND document_links.status = 'APPROVED')"
            ),
            "link_count"
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM votes WHERE votes.document_id = documents.id AND votes.is_helpful = true)"
            ),
            "helpful_count"
          ]
        ]
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      order: order
    });

    res.json({
      success: true,
      data: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        documents: rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách tài liệu",
      error: error.message
    });
  }
};

// 2. Get document details by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, is_deleted: 0 },
      include: [
        {
          model: Faculty,
          as: "faculty",
          attributes: ["id", "name", "code"]
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "name", "code"]
        },
        {
          model: DocumentLink,
          as: "links",
          where: { status: "APPROVED" },
          required: false,
          attributes: ["id", "title", "drive_link", "status"]
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM votes WHERE votes.document_id = documents.id AND votes.is_helpful = true)"
            ),
            "helpful_count"
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM votes WHERE votes.document_id = documents.id AND votes.is_helpful = false)"
            ),
            "unhelpful_count"
          ]
        ]
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu"
      });
    }

    if (document.links) {
      document.links.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: 'base' }));
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết tài liệu",
      error: error.message
    });
  }
};

// 3. User Contributed Upload (UGC - Default PENDING)
export const uploadDocument = async (req, res) => {
  try {
    const { title, facultyId, courseId, type, summary, image_url, links } = req.body;
    const userId = req.user.user_id;

    if (!title || !links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tiêu đề tài liệu hoặc danh sách liên kết tải file"
      });
    }

    // Create Document Collection in PENDING state
    const document = await Document.create({
      title,
      faculty_id: facultyId || null,
      course_id: courseId || null,
      type: type || "Khác",
      summary,
      image_url,
      user_id: userId,
      status: "PENDING"
    });

    // Create Google Drive document links
    const linksData = links.map(link => ({
      document_id: document.id,
      title: link.title || "Tài liệu",
      drive_link: link.drive_link
    }));

    await DocumentLink.bulkCreate(linksData);

    const documentWithDetails = await Document.findByPk(document.id, {
      include: [
        { model: Faculty, as: "faculty", attributes: ["name", "code"] },
        { model: Course, as: "course", attributes: ["name", "code"] },
        { model: DocumentLink, as: "links" }
      ]
    });

    res.status(201).json({
      success: true,
      data: documentWithDetails,
      message: "Gửi đóng góp tài liệu thành công. Vui lòng chờ quản trị viên kiểm duyệt!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi gửi đóng góp tài liệu",
      error: error.message
    });
  }
};

// 4. Admin Approvals Workflow
export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, facultyId, courseId, type, summary } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu kiểm duyệt"
      });
    }

    // Update metadata and change status to APPROVED
    await document.update({
      title: title || document.title,
      faculty_id: facultyId !== undefined ? facultyId : document.faculty_id,
      course_id: courseId !== undefined ? courseId : document.course_id,
      type: type || document.type,
      summary: summary !== undefined ? summary : document.summary,
      status: "APPROVED"
    });

    res.json({
      success: true,
      message: "Duyệt tài liệu thành công!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi duyệt tài liệu",
      error: error.message
    });
  }
};

// 5. Admin Rejects UGC Submissions
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu kiểm duyệt"
      });
    }

    await document.update({ status: "REJECTED" });

    res.json({
      success: true,
      message: "Đã từ chối đóng góp tài liệu"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi từ chối tài liệu",
      error: error.message
    });
  }
};

// User submits a new link for an existing approved document.
export const submitDocumentLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, drive_link } = req.body;

    if (!title || !drive_link) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên tài liệu hoặc liên kết Google Drive"
      });
    }

    const document = await Document.findOne({
      where: { id, is_deleted: 0, status: "APPROVED" }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu đã duyệt"
      });
    }

    const link = await DocumentLink.create({
      document_id: document.id,
      title,
      drive_link,
      status: "PENDING",
      user_id: req.user.user_id
    });

    res.status(201).json({
      success: true,
      data: link,
      message: "Đã gửi tài liệu bổ sung. Vui lòng chờ admin kiểm duyệt."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi gửi tài liệu bổ sung",
      error: error.message
    });
  }
};

export const getPendingDocumentLinks = async (req, res) => {
  try {
    const links = await DocumentLink.findAll({
      where: { status: "PENDING" },
      include: [
        {
          model: Document,
          as: "document",
          attributes: ["id", "title", "type", "faculty_id", "course_id"],
          include: [
            { model: Faculty, as: "faculty", attributes: ["id", "name", "code"] },
            { model: Course, as: "course", attributes: ["id", "name", "code"] }
          ]
        },
        {
          model: User,
          as: "uploader",
          attributes: ["user_id", "full_name", "email"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách tài liệu bổ sung chờ duyệt",
      error: error.message
    });
  }
};

export const approveDocumentLink = async (req, res) => {
  try {
    const link = await DocumentLink.findByPk(req.params.linkId);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu bổ sung"
      });
    }

    await link.update({
      status: "APPROVED",
      reviewed_at: new Date(),
      rejection_reason: null
    });

    res.json({
      success: true,
      data: link,
      message: "Đã duyệt tài liệu bổ sung"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi duyệt tài liệu bổ sung",
      error: error.message
    });
  }
};

export const rejectDocumentLink = async (req, res) => {
  try {
    const link = await DocumentLink.findByPk(req.params.linkId);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu bổ sung"
      });
    }

    await link.update({
      status: "REJECTED",
      reviewed_at: new Date(),
      rejection_reason: req.body?.reason || null
    });

    res.json({
      success: true,
      data: link,
      message: "Đã từ chối tài liệu bổ sung"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi từ chối tài liệu bổ sung",
      error: error.message
    });
  }
};

// 6. Admin Get Pending Submissions
export const getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { status: "PENDING", is_deleted: 0 },
      include: [
        { model: Faculty, as: "faculty", attributes: ["name", "code"] },
        { model: Course, as: "course", attributes: ["name", "code"] },
        { model: DocumentLink, as: "links" }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách tài liệu chờ duyệt",
      error: error.message
    });
  }
};

// 7. Increment Document Download Counter
export const incrementDownloadCounter = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Tài liệu không tồn tại"
      });
    }

    await document.increment("download_count", { by: 1 });

    res.json({
      success: true,
      message: "Tăng lượt tải thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tăng lượt tải",
      error: error.message
    });
  }
};

// 8. Delete document (Soft delete)
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu"
      });
    }

    await document.update({ is_deleted: 1 });

    res.json({
      success: true,
      message: "Xóa tài liệu thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa tài liệu",
      error: error.message
    });
  }
};

// 9. Update document metadata directly
export const updateDocument = async (req, res) => {
  try {
    const { title, facultyId, courseId, type, summary, image_url } = req.body;
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu"
      });
    }

    await document.update({
      title,
      faculty_id: facultyId,
      course_id: courseId,
      type,
      summary,
      image_url
    });

    const updated = await Document.findByPk(document.id, {
      include: [
        { model: Faculty, as: "faculty", attributes: ["name", "code"] },
        { model: Course, as: "course", attributes: ["name", "code"] }
      ]
    });

    res.json({
      success: true,
      data: updated,
      message: "Cập nhật tài liệu thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật tài liệu",
      error: error.message
    });
  }
};

// 10. Get all links of a document formatted as chapters
export const getDocumentChapters = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu"
      });
    }

    const links = await DocumentLink.findAll({
      where: { document_id: id, status: "APPROVED" },
      order: [["id", "ASC"]]
    });

    // Sort links naturally by title (e.g. Week 2 before Week 10)
    links.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: 'base' }));

    // Map fields so frontend receives expected chapter schema
    const chapters = links.map((link, index) => ({
      id: link.id,
      document_id: link.document_id,
      bookId: link.document_id, // compatibility
      title: link.title || `Phần ${index + 1}`,
      chapter_number: index + 1,
      drive_link: link.drive_link,
      content: "HUST Document content" // placeholder content
    }));

    res.json(chapters); // return directly to match frontend expectations
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh mục tài liệu",
      error: error.message
    });
  }
};
