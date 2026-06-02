import sequelize from "../config/db-config.js";

// Import HUST models
import { User } from "./user-model.js";
import Faculty from "./faculty-model.js";
import Course from "./course-model.js";
import Document from "./document-model.js";
import DocumentLink from "./document_link-model.js";
import Vote from "./vote-model.js";
import SearchHistory from "./search_history-model.js";
import SystemSettings from "./system-settings-model.js";

// Setup document-portal associations
const setupAssociations = () => {
  // Document - Faculty (Many to One)
  Document.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
  Faculty.hasMany(Document, { foreignKey: "faculty_id", as: "documents" });

  // Document - Course (Many to One)
  Document.belongsTo(Course, { foreignKey: "course_id", as: "course" });
  Course.hasMany(Document, { foreignKey: "course_id", as: "documents" });

  // Document - DocumentLink (One to Many)
  Document.hasMany(DocumentLink, { foreignKey: "document_id", as: "links", onDelete: 'CASCADE' });
  DocumentLink.belongsTo(Document, { foreignKey: "document_id", as: "document" });
  DocumentLink.belongsTo(User, { foreignKey: "user_id", as: "uploader" });

  // User - Document (UGC uploads)
  Document.belongsTo(User, { foreignKey: "user_id", as: "uploader" });
  User.hasMany(Document, { foreignKey: "user_id", as: "documents" });

  // User - Vote - Document
  User.hasMany(Vote, { foreignKey: "user_id", as: "votes", onDelete: 'CASCADE' });
  Vote.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Document.hasMany(Vote, { foreignKey: "document_id", as: "votes", onDelete: 'CASCADE' });
  Vote.belongsTo(Document, { foreignKey: "document_id", as: "document" });

  // User - SearchHistory (One to Many)
  User.hasMany(SearchHistory, { foreignKey: "user_id", as: "searchHistories", onDelete: 'CASCADE' });
  SearchHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });
};

// Initialize associations
setupAssociations();

export {
  sequelize,
  User,
  Faculty,
  Course,
  Document,
  DocumentLink,
  Vote,
  SearchHistory,
  SystemSettings
};

export default {
  sequelize,
  User,
  Faculty,
  Course,
  Document,
  DocumentLink,
  Vote,
  SearchHistory,
  SystemSettings
};
