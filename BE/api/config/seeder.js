import bcrypt from "bcryptjs";
import { User } from "../models/user-model.js";
import Faculty from "../models/faculty-model.js";
import Course from "../models/course-model.js";
import Document from "../models/document-model.js";
import DocumentLink from "../models/document_link-model.js";

export const seedDatabase = async () => {
  try {
    console.log("Checking if database seeding is required...");

    // 1. Seed Faculties
    const facultyCount = await Faculty.count();
    let seededFaculties = [];
    if (facultyCount === 0) {
      console.log("Seeding faculties...");
      seededFaculties = await Faculty.bulkCreate([
        { name: "Trường Công nghệ Thông tin và Truyền thông (SoICT)", code: "SoICT" },
        { name: "Trường Điện - Điện tử (SEEE)", code: "SEEE" },
        { name: "Trường Cơ khí (SME)", code: "SME" },
        { name: "Trường Hóa và Khoa học sự sống (SLS)", code: "SLS" },
        { name: "Trường Vật liệu (SMS)", code: "SMS" },
        { name: "Viện Kinh tế và Quản lý (SEM)", code: "SEM" },
        { name: "Khoa Khoa học Giáo dục & Giáo dục Thể chất", code: "SESE" }
      ]);
      console.log(`✅ Seeded ${seededFaculties.length} faculties.`);
    } else {
      seededFaculties = await Faculty.findAll();
    }

    // 2. Seed Courses
    const courseCount = await Course.count();
    let seededCourses = [];
    if (courseCount === 0) {
      console.log("Seeding courses...");
      seededCourses = await Course.bulkCreate([
        { name: "Cơ sở dữ liệu", code: "IT3140" },
        { name: "Cấu trúc dữ liệu và giải thuật", code: "IT3011" },
        { name: "Toán rời rạc", code: "IT3020" },
        { name: "Dự án hệ thống thông tin", code: "IT3150" },
        { name: "Mạng máy tính", code: "IT3080" },
        { name: "Tin học đại cương", code: "IT1110" },
        { name: "Giải tích 1", code: "MI1111" },
        { name: "Giải tích 2", code: "MI1121" },
        { name: "Đại số", code: "MI1141" },
        { name: "Vật lý đại cương 1", code: "PH1110" }
      ]);
      console.log(`✅ Seeded ${seededCourses.length} courses.`);
    } else {
      seededCourses = await Course.findAll();
    }

    // 3. Seed Users
    const userCount = await User.count();
    let adminUser, studentUser;
    if (userCount === 0) {
      console.log("Seeding default users...");
      const adminPasswordHash = await bcrypt.hash("admin123", 10);
      const studentPasswordHash = await bcrypt.hash("student123", 10);

      adminUser = await User.create({
        email: "admin@hust.edu.vn",
        password_hash: adminPasswordHash,
        full_name: "HUST Admin",
        role: "ADMIN"
      });

      studentUser = await User.create({
        email: "student@sis.hust.edu.vn",
        password_hash: studentPasswordHash,
        full_name: "Nguyễn Văn Hùng",
        role: "USER"
      });

      console.log("✅ Seeded default users (admin@hust.edu.vn / admin123, student@sis.hust.edu.vn / student123).");
    } else {
      adminUser = await User.findOne({ where: { role: "ADMIN" } });
      studentUser = await User.findOne({ where: { role: "USER" } });
    }

    // 4. Seed Documents
    const documentCount = await Document.count();
    if (documentCount === 0 && studentUser) {
      console.log("Seeding default documents...");

      const soictFaculty = seededFaculties.find(f => f.code === "SoICT") || seededFaculties[0];
      const seeeFaculty = seededFaculties.find(f => f.code === "SEEE") || seededFaculties[1];
      
      const dbCourse = seededCourses.find(c => c.code === "IT3140") || seededCourses[0];
      const dsaCourse = seededCourses.find(c => c.code === "IT3011") || seededCourses[1];
      const dmCourse = seededCourses.find(c => c.code === "IT3020") || seededCourses[2];
      const caCourse = seededCourses.find(c => c.code === "MI1111") || seededCourses[6];

      // Document 1: Slide Cơ sở dữ liệu
      const doc1 = await Document.create({
        title: "Slide bài giảng Cơ sở dữ liệu HUST (IT3140)",
        faculty_id: soictFaculty ? soictFaculty.id : null,
        course_id: dbCourse ? dbCourse.id : null,
        type: "Slide",
        summary: "Bộ slide bài giảng chi tiết từ chương 1 đến chương 8 môn Cơ sở dữ liệu IT3140. Bao gồm mô hình thực thể liên kết ER, đại số quan hệ và chuẩn hóa cơ sở dữ liệu.",
        image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80",
        status: "APPROVED",
        user_id: studentUser.user_id,
        download_count: 142
      });

      await DocumentLink.create({
        document_id: doc1.id,
        title: "Slide bài giảng đầy đủ (Google Drive)",
        drive_link: "https://drive.google.com/file/d/1B7X6x2XGv_D3_rQ9tD_F4-0H/view"
      });

      // Document 2: Đề thi cấu trúc dữ liệu
      const doc2 = await Document.create({
        title: "Đề thi cuối kỳ Cấu trúc dữ liệu & Giải thuật SoICT kì 2022.2",
        faculty_id: soictFaculty ? soictFaculty.id : null,
        course_id: dsaCourse ? dsaCourse.id : null,
        type: "Đề thi",
        summary: "Bộ đề thi cuối kỳ môn Cấu trúc dữ liệu & Giải thuật kì 2022.2. Đề thi gồm các bài tập về Cây nhị phân tìm kiếm, Đồ thị, bảng băm và thuật toán sắp xếp.",
        image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80",
        status: "APPROVED",
        user_id: studentUser.user_id,
        download_count: 320
      });

      await DocumentLink.create({
        document_id: doc2.id,
        title: "Đề thi & Lời giải chi tiết (Google Drive)",
        drive_link: "https://drive.google.com/file/d/1yZ4gB7X_JkL4oQ-N_8dF5-1K/view"
      });

      // Document 3: Đề cương toán rời rạc
      const doc3 = await Document.create({
        title: "Đề cương lý thuyết và bài tập Toán rời rạc HUST",
        faculty_id: soictFaculty ? soictFaculty.id : null,
        course_id: dmCourse ? dmCourse.id : null,
        type: "Đề cương",
        summary: "Đề cương tổng hợp toàn bộ lý thuyết và bài tập mẫu môn Toán rời rạc IT3020. Hữu ích cho việc ôn thi cuối kỳ đại số boolean, đồ thị, bài toán đếm.",
        image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80",
        status: "APPROVED",
        user_id: studentUser.user_id,
        download_count: 85
      });

      await DocumentLink.create({
        document_id: doc3.id,
        title: "Tải Đề Cương (Google Drive)",
        drive_link: "https://drive.google.com/file/d/1b7G_x8V_dL5oP-T_9dF4-2L/view"
      });

      // Document 4: Giải tích 1
      const doc4 = await Document.create({
        title: "Bài tập lớn Giải tích 1 (MI1111) có lời giải chi tiết",
        faculty_id: null, // General Faculty / Academic office
        course_id: caCourse ? caCourse.id : null,
        type: "Bài tập",
        summary: "Tổng hợp các bài tập lớn Giải tích 1 kì 2023.1 có lời giải chi tiết từng chương: Giới hạn, Đạo hàm, Tích phân một biến và Chuỗi số.",
        image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        status: "APPROVED",
        user_id: studentUser.user_id,
        download_count: 247
      });

      await DocumentLink.create({
        document_id: doc4.id,
        title: "File Bài Tập Giải Tích 1",
        drive_link: "https://drive.google.com/file/d/1X5gB7M_DkL2oP-N_8dF4-3A/view"
      });

      console.log("✅ Seeded 4 default APPROVED documents.");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
};
