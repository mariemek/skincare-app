import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Feather } from "@expo/vector-icons";
import { db } from "../database/db";
import { lightColors, darkColors } from "../theme/colors";

export default function ScheduleScreen() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

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
                    <Feather name="sun" size={14} color={colors.primary} />
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
                    <Feather name="moon" size={14} color={colors.primary} />
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

    title: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },

    scrollContent: {
      paddingBottom: 24,
    },

    dayCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
    },

    dayTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
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
      color: colors.subtext,
    },

    sectionSpacing: {
      marginTop: 14,
    },

    plusText: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: "500",
    },

    emptyText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.emptyText,
      fontStyle: "italic",
    },

    scheduledItem: {
      marginTop: 8,
      backgroundColor: colors.softPink,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    scheduledItemText: {
      fontSize: 13,
      color: colors.text,
    },

    removeText: {
      fontSize: 16,
      color: colors.subtext,
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
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    closeText: {
      fontSize: 24,
      color: colors.text,
    },

    modalBody: {
      flex: 1,
      paddingHorizontal: 20,
    },

    modalLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.subtext,
      marginBottom: 12,
    },

    productOption: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },

    productOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    productOptionName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },

    productOptionNameSelected: {
      color: colors.badgeText,
    },

    productOptionCategory: {
      fontSize: 13,
      color: colors.subtext,
    },

    productOptionCategorySelected: {
      color: colors.badgeText,
    },

    modalFooter: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },

    addToScheduleButton: {
      height: 50,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    addToScheduleButtonText: {
      color: colors.badgeText,
      fontWeight: "700",
      fontSize: 15,
    },
  });