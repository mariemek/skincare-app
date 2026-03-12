import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

/*
Displays one product inside the product list
*/
export default function ProductCard({ product, deleteProduct }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {product.name}
        </Text>

        <Text style={styles.brand}>{product.brand}</Text>

        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => deleteProduct(product.id)}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={16} color="#EF5B6C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1D5E0",
  },

  imageWrapper: {
    marginRight: 12,
  },

  image: {
    width: 54,
    height: 54,
    borderRadius: 10,
  },

  placeholderImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#F2EAEE",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F2A2D",
    marginBottom: 4,
  },

  brand: {
    fontSize: 13,
    color: "#9A7F89",
    marginBottom: 6,
  },

  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "#FDE7EF",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D4668F",
  },

  deleteButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});