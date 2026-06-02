import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Document = sequelize.define("documents", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  title: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  faculty_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  course_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  type: { 
    type: DataTypes.ENUM('Slide', 'Đề thi', 'Đề cương', 'Bài tập', 'Khác'), 
    allowNull: false, 
    defaultValue: 'Khác' 
  },
  download_count: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  summary: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  image_url: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  status: { 
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), 
    allowNull: false, 
    defaultValue: 'PENDING' 
  },
  user_id: { 
    type: DataTypes.UUID, 
    allowNull: true 
  },
  is_deleted: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  created_at: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
}, {
  timestamps: false
});

Document.prototype.toJSON = function () {
  const values = { ...this.get() };
  
  // Add compatibility fields for older book-sharing UI
  if (values.faculty) {
    values.author = values.faculty;
  } else if (values.faculty_id) {
    values.author = { name: `Khoa/Viện ID ${values.faculty_id}` };
  } else {
    values.author = { name: "Đại cương / Khác" };
  }
  
  if (values.course) {
    values.subject = values.course;
  } else if (values.course_id) {
    values.subject = { name: `Học phần ID ${values.course_id}` };
  } else {
    values.subject = { name: "Chung" };
  }

  values.document_count = values.link_count ?? values.links?.length ?? 0;
  
  values.imageUrl = values.image_url;
  
  values.type_raw = values.type;
  
  return values;
};

export default Document;
