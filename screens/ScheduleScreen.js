import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { db } from "../database/db";

export default function ScheduleScreen() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [products, setProducts] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    loadProducts();
    loadSchedule();
  }, []);

  const loadProducts = () => {
    db.getAllAsync("SELECT * FROM products ORDER BY id ASC").then((result) => {
      setProducts(result);
    });
  };

  const loadSchedule = () => {
    db.getAllAsync(`
      SELECT
        schedule.id,
        schedule.day,
        schedule.timeOfDay,
        schedule.productId,
        products.name,
        products.category
      FROM schedule
      JOIN products ON products.id = schedule.productId
      ORDER BY schedule.id ASC
    `).then((result) => {
      setScheduleItems(result);
    });
  };

  const openAddModal = (day, timeOfDay) => {
    setSelectedDay(day);
    setSelectedTime(timeOfDay);
    setSelectedProductId(null);
    setShowModal(true);
  };

  const addToSchedule = async () => {
    if (!selectedProductId) return;

    await db.runAsync(
      "INSERT INTO schedule (day,timeOfDay,productId) VALUES (?,?,?)",
      [selectedDay, selectedTime, selectedProductId]
    );

    setShowModal(false);
    setSelectedProductId(null);
    loadSchedule();
  };

  const removeScheduledItem = async (id) => {
    await db.runAsync("DELETE FROM schedule WHERE id = ?", [id]);
    loadSchedule();
  };

  const getItemsForSection = (day, timeOfDay) => {
    return scheduleItems.filter(
      (item) => item.day === day && item.timeOfDay === timeOfDay
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Weekly Schedule</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {days.map((day) => {
            const morningItems = getItemsForSection(day, "morning");
            const eveningItems = getItemsForSection(day, "evening");

            return (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day}</Text>

                <View style={styles.sectionRow}>
                  <View style={styles.sectionLabelRow}>
                    <Feather name="sun" size={14} color="#D4668F" />
                    <Text style={styles.sectionTitle}>Morning</Text>
                  </View>

                  <TouchableOpacity onPress={() => openAddModal(day, "morning")}>
                    <Text style={styles.plusText}>+</Text>
                  </TouchableOpacity>
                </View>

                {morningItems.length === 0 ? (
                  <Text style={styles.emptyText}>No products</Text>
                ) : (
                  morningItems.map((item) => (
                    <View key={item.id} style={styles.scheduledItem}>
                      <Text style={styles.scheduledItemText}>{item.name}</Text>

                      <TouchableOpacity
                        onPress={() => removeScheduledItem(item.id)}
                      >
                        <Text style={styles.removeText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <View style={[styles.sectionRow, styles.sectionSpacing]}>
                  <View style={styles.sectionLabelRow}>
                    <Feather name="moon" size={14} color="#D4668F" />
                    <Text style={styles.sectionTitle}>Evening</Text>
                  </View>

                  <TouchableOpacity onPress={() => openAddModal(day, "evening")}>
                    <Text style={styles.plusText}>+</Text>
                  </TouchableOpacity>
                </View>

                {eveningItems.length === 0 ? (
                  <Text style={styles.emptyText}>No products</Text>
                ) : (
                  eveningItems.map((item) => (
                    <View key={item.id} style={styles.scheduledItem}>
                      <Text style={styles.scheduledItemText}>{item.name}</Text>

                      <TouchableOpacity
                        onPress={() => removeScheduledItem(item.id)}
                      >
                        <Text style={styles.removeText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>

        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add to {selectedDay} {selectedTime}
              </Text>

              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Select a product</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {products.map((product) => {
                  const isSelected = selectedProductId === product.id;

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productOption,
                        isSelected && styles.productOptionSelected,
                      ]}
                      onPress={() => setSelectedProductId(product.id)}
                    >
                      <Text
                        style={[
                          styles.productOptionName,
                          isSelected && styles.productOptionNameSelected,
                        ]}
                      >
                        {product.name}
                      </Text>

                      <Text
                        style={[
                          styles.productOptionCategory,
                          isSelected && styles.productOptionCategorySelected,
                        ]}
                      >
                        {product.category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.addToScheduleButton}
                onPress={addToSchedule}
              >
                <Text style={styles.addToScheduleButtonText}>
                  Add to Schedule
                </Text>
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

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2F2A2D",
    marginBottom: 16,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  dayCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  dayTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2F2A2D",
    marginBottom: 14,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#9A5C72",
  },

  sectionSpacing: {
    marginTop: 14,
  },

  plusText: {
    fontSize: 18,
    color: "#D4668F",
    fontWeight: "500",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: "#D2A8B6",
    fontStyle: "italic",
  },

  scheduledItem: {
    marginTop: 8,
    backgroundColor: "#F8EAF0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scheduledItemText: {
    fontSize: 13,
    color: "#2F2A2D",
  },

  removeText: {
    fontSize: 16,
    color: "#C79AAA",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#2F2A2D",
  },

  closeText: {
    fontSize: 24,
    color: "#2F2A2D",
  },

  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9A5C72",
    marginBottom: 12,
  },

  productOption: {
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  productOptionSelected: {
    backgroundColor: "#C95D83",
    borderColor: "#2E6BFF",
  },

  productOptionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2F2A2D",
    marginBottom: 4,
  },

  productOptionNameSelected: {
    color: "#FFFFFF",
  },

  productOptionCategory: {
    fontSize: 13,
    color: "#9A7F89",
  },

  productOptionCategorySelected: {
    color: "#FDE7EF",
  },

  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#F0DDE5",
    backgroundColor: "#FFF8FB",
  },

  addToScheduleButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D9A0B5",
    alignItems: "center",
    justifyContent: "center",
  },

  addToScheduleButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});