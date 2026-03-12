import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("skincare.db");

/*
Creates all app tables when the app starts.
Also inserts starter products the first time the app opens.
*/
export const createTables = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      brand TEXT,
      category TEXT,
      image TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT,
      timeOfDay TEXT,
      productId INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS completion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheduleId INTEGER,
      selectedDate TEXT,
      completed INTEGER
    );
  `);

  const result = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM products"
  );

  if (result.count === 0) {
    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["Gentle Foaming Cleanser", "LuxeGlow", "Cleanser", ""]
    );

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["Vitamin C Serum", "RadiantSkin", "Serum", ""]
    );

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["Hyaluronic Acid Moisturizer", "HydraLux", "Moisturizer", ""]
    );

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["Retinol Night Cream", "YouthRevive", "Night Cream", ""]
    );

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["LED Face Mask", "GlowTech", "Device", ""]
    );

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      ["Exfoliating Toner", "PureBalance", "Toner", ""]
    );
  }
};