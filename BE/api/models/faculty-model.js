import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Faculty = sequelize.define("faculties", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING(150), 
    allowNull: false 
  },
  code: { 
    type: DataTypes.STRING(20), 
    unique: true, 
    allowNull: false 
  },
  is_deleted: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
}, {
  timestamps: false
});

export default Faculty;
