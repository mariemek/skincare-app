import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { db } from "../database/db";
import ProductCard from "../components/ProductCard";

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Cleanser");
  const [image, setImage] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const categories = [
    "Cleanser",
    "Toner",
    "Serum",
    "Moisturizer",
    "Sunscreen",
    "Mask",
    "Device",
    "Night Cream",
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    db.getAllAsync("SELECT * FROM products ORDER BY id ASC").then((result) => {
      setProducts(result);
    });
  };

  const addProduct = async () => {
    if (!name.trim() || !brand.trim() || !category.trim()) return;

    await db.runAsync(
      "INSERT INTO products (name,brand,category,image) VALUES (?,?,?,?)",
      [name, brand, category, image]
    );

    loadProducts();
    setName("");
    setBrand("");
    setCategory("Cleanser");
    setImage(null);
    setInstructions("");
    setShowForm(false);
  };

  const deleteProduct = async (id) => {
    await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
    loadProducts();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Products</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#C7A8B5" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#C7A8B5"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductCard product={item} deleteProduct={deleteProduct} />
          )}
        />

        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <>
                    <Text style={styles.photoPlus}>＋</Text>
                    <Text style={styles.photoText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                placeholder="e.g., Vitamin C Serum"
                placeholderTextColor="#C7A8B5"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Brand</Text>
              <TextInput
                placeholder="e.g., The Ordinary"
                placeholderTextColor="#C7A8B5"
                value={brand}
                onChangeText={setBrand}
                style={styles.input}
              />

              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryOption,
                      category === item && styles.categoryOptionActive,
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === item && styles.categoryOptionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Usage Instructions</Text>
              <TextInput
                placeholder="How to use this product..."
                placeholderTextColor="#C7A8B5"
                value={instructions}
                onChangeText={setInstructions}
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.primaryButton} onPress={addProduct}>
                <Text style={styles.primaryButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8FB",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF8FB",
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2F2A2D",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D4668F",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "500",
    marginTop: -2,
  },

  searchWrapper: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    paddingHorizontal: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#4A4044",
  },

  listContent: {
    paddingBottom: 24,
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: "#FFF8FB",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2F2A2D",
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#4A75D1",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    fontSize: 16,
    color: "#2F2A2D",
    fontWeight: "600",
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  photoBox: {
    height: 190,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E8C9D5",
    backgroundColor: "#FDF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  photoPlus: {
    fontSize: 32,
    color: "#C9A7B4",
    marginBottom: 4,
  },

  photoText: {
    fontSize: 15,
    color: "#C09AAA",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8D596D",
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#4A4044",
    marginBottom: 16,
  },

  categoryRow: {
    paddingBottom: 8,
    marginBottom: 14,
  },

  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F7EDF1",
    borderWidth: 1,
    borderColor: "#EBD6DE",
    marginRight: 10,
  },

  categoryOptionActive: {
    backgroundColor: "#D96B95",
    borderColor: "#D96B95",
  },

  categoryOptionText: {
    color: "#6A5960",
    fontWeight: "500",
    fontSize: 13,
  },

  categoryOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  textArea: {
    minHeight: 100,
    borderRadius: 14,
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    paddingHorizontal: 14,
    paddingTop: 14,
    fontSize: 14,
    color: "#4A4044",
    marginBottom: 20,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#F0DDE5",
    backgroundColor: "#FFF8FB",
  },

  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D9A0B5",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});