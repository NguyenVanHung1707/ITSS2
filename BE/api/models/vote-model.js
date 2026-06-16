import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Vote = sequelize.define("Vote", {
  vote_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: "vote_id"
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "user_id"
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "document_id"
  },
  is_helpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_helpful"
  },
  is_reading: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "is_reading"
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "comment_text"
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
    field: "rating"
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: "created_at"
  }
}, {
  tableName: "votes",
  timestamps: false,
  underscored: true
});

export default Vote;
