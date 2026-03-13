import { db } from "../database/db";
import {
  getProductsFromFirestore,
  getScheduleFromFirestore,
} from "./firestoreService";

export const syncUserDataToSQLite = async () => {
  try {
    const products = await getProductsFromFirestore();
    const schedule = await getScheduleFromFirestore();

    await db.runAsync("DELETE FROM products");
    await db.runAsync("DELETE FROM schedule");

    for (const product of products) {
      await db.runAsync(
        "INSERT INTO products (id, name, category, brand, notes) VALUES (?, ?, ?, ?, ?)",
        [
          product.id,
          product.name ?? "",
          product.category ?? "",
          product.brand ?? "",
          product.notes ?? "",
        ]
      );
    }

    for (const item of schedule) {
      await db.runAsync(
        "INSERT INTO schedule (id, day, time, productId, stepName) VALUES (?, ?, ?, ?, ?)",
        [
          item.id,
          item.day ?? "",
          item.time ?? "",
          item.productId ?? null,
          item.stepName ?? "",
        ]
      );
    }

    console.log("Firestore data synced to SQLite");
  } catch (error) {
    console.log("Sync error:", error.message);
  }
};