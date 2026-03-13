import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase/config";

export const saveProductToFirestore = async (product) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const productRef = doc(
    firestore,
    "users",
    user.uid,
    "products",
    String(product.id)
  );

  await setDoc(productRef, {
    id: product.id,
    name: product.name,
    category: product.category ?? "",
    brand: product.brand ?? "",
    notes: product.notes ?? "",
    createdAt: product.createdAt ?? new Date().toISOString(),
  });
};

export const saveScheduleToFirestore = async (scheduleItem) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const scheduleRef = doc(
    firestore,
    "users",
    user.uid,
    "schedule",
    String(scheduleItem.id)
  );

  await setDoc(scheduleRef, {
    id: scheduleItem.id,
    day: scheduleItem.day,
    time: scheduleItem.time ?? "",
    productId: scheduleItem.productId,
    stepName: scheduleItem.stepName ?? "",
    createdAt: scheduleItem.createdAt ?? new Date().toISOString(),
  });
};

export const getProductsFromFirestore = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const snapshot = await getDocs(
    collection(firestore, "users", user.uid, "products")
  );

  return snapshot.docs.map((docItem) => docItem.data());
};

export const getScheduleFromFirestore = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const snapshot = await getDocs(
    collection(firestore, "users", user.uid, "schedule")
  );

  return snapshot.docs.map((docItem) => docItem.data());
};

export const deleteProductFromFirestore = async (productId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  await deleteDoc(doc(firestore, "users", user.uid, "products", String(productId)));
};

export const deleteScheduleFromFirestore = async (scheduleId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  await deleteDoc(doc(firestore, "users", user.uid, "schedule", String(scheduleId)));
};