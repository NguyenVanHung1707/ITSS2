import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const DocumentLink = sequelize.define("document_links", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  document_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  title: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  drive_link: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    allowNull: false,
    defaultValue: "APPROVED"
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
}, {
  freezeTableName: true,
  timestamps: false
});

export default DocumentLink;
