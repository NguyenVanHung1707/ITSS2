import Faculty from "../models/faculty-model.js";

export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      where: { is_deleted: 0 },
      order: [["name", "ASC"]]
    });
    res.json({ success: true, data: faculties });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách khoa viện", error: error.message });
  }
};

export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khoa viện" });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết khoa viện", error: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Thiếu tên hoặc mã khoa viện" });
    }
    const faculty = await Faculty.create({ name, code });
    res.status(201).json({ success: true, data: faculty, message: "Tạo khoa viện thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo khoa viện", error: error.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { name, code } = req.body;
    const faculty = await Faculty.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khoa viện" });
    }
    await faculty.update({ name, code });
    res.json({ success: true, data: faculty, message: "Cập nhật khoa viện thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật khoa viện", error: error.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khoa viện" });
    }
    await faculty.update({ is_deleted: 1 });
    res.json({ success: true, message: "Xóa khoa viện thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa khoa viện", error: error.message });
  }
};
