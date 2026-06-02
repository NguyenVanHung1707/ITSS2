import sequelize from "./config/db-config.js";

async function run() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection successful. Executing drops for old ITSS2 tables...");
    
    const tables = [
      "bookshelf_items",
      "bookshelves",
      "user_bookshelves",
      "book_bookshelves",
      "book_subjects",
      "comments",
      "chapters",
      "books",
      "authors",
      "subjects"
    ];

    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
      console.log(`✅ Dropped table ${table} successfully.`);
    }

    console.log("Database clean up completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database drop error:", err);
    process.exit(1);
  }
}

run();
