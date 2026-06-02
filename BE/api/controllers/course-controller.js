import Course from "../models/course-model.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { is_deleted: 0 },
      order: [["code", "ASC"]]
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách học phần", error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy học phần" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết học phần", error: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Thiếu tên hoặc mã học phần" });
    }
    const course = await Course.create({ name, code });
    res.status(201).json({ success: true, data: course, message: "Tạo học phần thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo học phần", error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { name, code } = req.body;
    const course = await Course.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy học phần" });
    }
    await course.update({ name, code });
    res.json({ success: true, data: course, message: "Cập nhật học phần thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật học phần", error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id, is_deleted: 0 }
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy học phần" });
    }
    await course.update({ is_deleted: 1 });
    res.json({ success: true, message: "Xóa học phần thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa học phần", error: error.message });
  }
};
