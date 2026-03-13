import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { db } from "../database/db";
import ProductCard from "../components/ProductCard";
import { lightColors, darkColors } from "../theme/colors";
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
} from "../services/firestoreService";

export default function ProductsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

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

    try {
      const newProduct = {
        id: Date.now(),
        name,
        brand,
        category,
        image,
        instructions,
        createdAt: new Date().toISOString(),
      };

      await db.runAsync(
        "INSERT INTO products (id, name, brand, category, image) VALUES (?, ?, ?, ?, ?)",
        [
          newProduct.id,
          newProduct.name,
          newProduct.brand,
          newProduct.category,
          newProduct.image,
        ],
      );

      await saveProductToFirestore(newProduct);

      loadProducts();
      setName("");
      setBrand("");
      setCategory("Cleanser");
      setImage(null);
      setInstructions("");
      setShowForm(false);

      console.log("Product saved locally and in Firestore");
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await db.runAsync("DELETE FROM products WHERE id = ?", [id]);

      await deleteProductFromFirestore(id);

      loadProducts();
    } catch (error) {
      console.log(error.message);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
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
          <Feather name="search" size={16} color={colors.placeholder} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={colors.placeholder}
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
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Brand</Text>
              <TextInput
                placeholder="e.g., The Ordinary"
                placeholderTextColor={colors.placeholder}
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
                placeholderTextColor={colors.placeholder}
                value={instructions}
                onChangeText={setInstructions}
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={addProduct}
              >
                <Text style={styles.primaryButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },

    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    addButtonText: {
      color: colors.badgeText,
      fontSize: 24,
      lineHeight: 24,
      fontWeight: "500",
      marginTop: -2,
    },

    searchWrapper: {
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
    },

    listContent: {
      paddingBottom: 24,
    },

    modalSafeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },

    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },

    closeButtonText: {
      fontSize: 16,
      color: colors.text,
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
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
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
      color: colors.placeholder,
      marginBottom: 4,
    },

    photoText: {
      fontSize: 15,
      color: colors.placeholder,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.subtext,
      marginBottom: 8,
      marginTop: 4,
    },

    input: {
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.text,
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
      backgroundColor: colors.softPink,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
    },

    categoryOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    categoryOptionText: {
      color: colors.text,
      fontWeight: "500",
      fontSize: 13,
    },

    categoryOptionTextActive: {
      color: colors.badgeText,
      fontWeight: "700",
    },

    textArea: {
      minHeight: 100,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingTop: 14,
      fontSize: 14,
      color: colors.text,
      marginBottom: 20,
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },

    primaryButton: {
      height: 50,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    primaryButtonText: {
      color: colors.badgeText,
      fontWeight: "700",
      fontSize: 15,
    },
  });
