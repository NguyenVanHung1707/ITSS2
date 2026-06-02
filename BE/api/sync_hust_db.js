import sequelize from "./config/db-config.js";
import "./models/index.js";

async function run() {
  try {
    console.log("Connecting to database and verifying model sync...");
    await sequelize.authenticate();
    console.log("Database connection successful. Syncing models...");
    
    // Force sync models to cleanly create HUST tables
    await sequelize.sync({ alter: true });
    console.log("✅ All HUST tables created and synced successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Database sync error:", err);
    process.exit(1);
  }
}

run();
