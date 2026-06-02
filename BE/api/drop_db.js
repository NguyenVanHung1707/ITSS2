import sequelize from "./config/db-config.js";

async function run() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection successful. Executing drops...");
    
    await sequelize.query("DROP TABLE IF EXISTS subscriptions CASCADE;");
    console.log("✅ Dropped subscriptions table successfully.");
    
    await sequelize.query("ALTER TABLE users DROP COLUMN IF EXISTS tier;");
    console.log("✅ Dropped tier column from users table successfully.");
    
    await sequelize.query("DROP TYPE IF EXISTS enum_users_tier CASCADE;");
    console.log("✅ Dropped enum_users_tier type successfully.");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Database drop error:", err);
    process.exit(1);
  }
}

run();
