import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightColors, darkColors } from "../theme/colors";
import { Feather } from "@expo/vector-icons";

import { db } from "../database/db";

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routineItems, setRoutineItems] = useState([]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  /*
  Builds a short horizontal calendar starting from today
  */
  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }

    return days;
  }, []);

  useEffect(() => {
    loadRoutineForDate();
  }, [selectedDate]);

  const getDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadRoutineForDate = async () => {
    const dayName = getDayName(selectedDate);
    const dateKey = getDateKey(selectedDate);

    const result = await db.getAllAsync(
      `
      SELECT
        schedule.id as scheduleId,
        schedule.timeOfDay,
        products.name,
        products.brand,
        products.category,
        COALESCE(completion.completed, 0) as completed
      FROM schedule
      JOIN products ON products.id = schedule.productId
      LEFT JOIN completion
        ON completion.scheduleId = schedule.id
        AND completion.selectedDate = ?
      WHERE schedule.day = ?
      ORDER BY schedule.id ASC
      `,
      [dateKey, dayName]
    );

    setRoutineItems(result);
  };

  const toggleComplete = async (scheduleId, currentCompleted) => {
    const dateKey = getDateKey(selectedDate);
    const newCompleted = currentCompleted ? 0 : 1;

    const existing = await db.getFirstAsync(
      `
      SELECT id
      FROM completion
      WHERE scheduleId = ? AND selectedDate = ?
      `,
      [scheduleId, dateKey]
    );

    if (existing) {
      await db.runAsync(
        `
        UPDATE completion
        SET completed = ?
        WHERE id = ?
        `,
        [newCompleted, existing.id]
      );
    } else {
      await db.runAsync(
        `
        INSERT INTO completion (scheduleId, selectedDate, completed)
        VALUES (?, ?, ?)
        `,
        [scheduleId, dateKey, newCompleted]
      );
    }

    loadRoutineForDate();
  };

  const morningItems = routineItems.filter(
    (item) => item.timeOfDay === "morning"
  );

  const eveningItems = routineItems.filter(
    (item) => item.timeOfDay === "evening"
  );

  const completedCount = routineItems.filter(
    (item) => item.completed === 1
  ).length;

  const totalCount = routineItems.length;

  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const progressWidth = `${progressPercent}%`;

  const headerDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const today = new Date();
  const hasRoutine = routineItems.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateLabel}>{headerDate}</Text>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Your Routine</Text>

          <View style={styles.percentBadge}>
            <Feather name="sun" size={12} color="#FFFFFF" />
            <Text style={styles.percentBadgeText}>{progressPercent}%</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarRow}
        >
          {calendarDays.map((date, index) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();

            const isToday =
              date.toDateString() === today.toDateString();

            const shortDay = date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            const dayNumber = date.getDate();

            return (
              <Animated.View
                key={index}
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardSelected,
                    !isSelected && isToday && styles.dayCardToday,
                  ]}
                  onPress={() => {
                    animatePress();
                    setSelectedDate(date);
                  }}
                >
                  <Text
                    style={[
                      styles.dayCardLabel,
                      isSelected && styles.dayCardLabelSelected,
                      isToday && !isSelected && styles.dayCardLabelToday,
                    ]}
                  >
                    {shortDay}
                  </Text>

                  <Text
                    style={[
                      styles.dayCardNumber,
                      isSelected && styles.dayCardNumberSelected,
                      isToday && !isSelected && styles.dayCardNumberToday,
                    ]}
                  >
                    {dayNumber}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        {hasRoutine ? (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Today's Progress</Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[styles.progressBarFill, { width: progressWidth }]}
                />
              </View>

              <Text style={styles.progressText}>
                {completedCount} of {totalCount} completed
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Morning Routine</Text>

            {morningItems.length === 0 ? (
              <Text style={styles.emptyText}>No products scheduled</Text>
            ) : (
              morningItems.map((item) => (
                <TouchableOpacity
                  key={item.scheduleId}
                  style={[
                    styles.routineCard,
                    item.completed === 1 && styles.routineCardCompleted,
                  ]}
                  onPress={() =>
                    toggleComplete(item.scheduleId, item.completed)
                  }
                >
                  <View style={styles.checkCircle}>
                    {item.completed === 1 ? (
                      <Feather name="check" size={12} color="#D4668F" />
                    ) : null}
                  </View>

                  <View style={styles.routineInfo}>
                    <Text
                      style={[
                        styles.routineName,
                        item.completed === 1 && styles.routineNameCompleted,
                      ]}
                    >
                      {item.name}
                    </Text>

                    <Text style={styles.routineMeta}>
                      {item.category} • {item.brand}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
              Evening Routine
            </Text>

            {eveningItems.length === 0 ? (
              <Text style={styles.emptyText}>No products scheduled</Text>
            ) : (
              eveningItems.map((item) => (
                <TouchableOpacity
                  key={item.scheduleId}
                  style={[
                    styles.routineCard,
                    item.completed === 1 && styles.routineCardCompleted,
                  ]}
                  onPress={() =>
                    toggleComplete(item.scheduleId, item.completed)
                  }
                >
                  <View style={styles.checkCircle}>
                    {item.completed === 1 ? (
                      <Feather name="check" size={12} color="#D4668F" />
                    ) : null}
                  </View>

                  <View style={styles.routineInfo}>
                    <Text
                      style={[
                        styles.routineName,
                        item.completed === 1 && styles.routineNameCompleted,
                      ]}
                    >
                      {item.name}
                    </Text>

                    <Text style={styles.routineMeta}>
                      {item.category} • {item.brand}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <View style={styles.emptyStateWrapper}>
            <Text style={styles.emptyStateTitle}>
              No routine scheduled for this day.
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Add products to your schedule to get started!
            </Text>
          </View>
        )}
      </ScrollView>
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
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },

  dateLabel: {
    fontSize: 14,
    color: "#9C7D88",
    marginBottom: 4,
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

  percentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4668F",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  percentBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  calendarRow: {
    paddingBottom: 14,
  },

  dayCard: {
    width: 52,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  dayCardSelected: {
    backgroundColor: "#D4668F",
    borderColor: "#D4668F",
  },

  dayCardToday: {
    borderWidth: 2,
    borderColor: "#D4668F",
    backgroundColor: "#FFF8FB",
  },

  dayCardLabel: {
    fontSize: 12,
    color: "#9A7F89",
    marginBottom: 5,
  },

  dayCardLabelSelected: {
    color: "#FFFFFF",
  },

  dayCardLabelToday: {
    color: "#D4668F",
  },

  dayCardNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F2A2D",
    lineHeight: 24,
  },

  dayCardNumberSelected: {
    color: "#FFFFFF",
  },

  dayCardNumberToday: {
    color: "#D4668F",
  },

  progressCard: {
    backgroundColor: "#FDF0F5",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  progressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F2A2D",
    marginBottom: 12,
  },

  progressBarBackground: {
    height: 7,
    backgroundColor: "#EFCEDB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#D4668F",
    borderRadius: 999,
  },

  progressText: {
    fontSize: 13,
    color: "#9A7F89",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F2A2D",
    marginBottom: 12,
  },

  sectionSpacing: {
    marginTop: 4,
  },

  emptyText: {
    fontSize: 14,
    color: "#D2A8B6",
    fontStyle: "italic",
    marginBottom: 14,
  },

  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1D5E0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },

  routineCardCompleted: {
    borderColor: "#7AA2FF",
  },

  checkCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    borderWidth: 1.5,
    borderColor: "#D89AB2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  routineInfo: {
    flex: 1,
  },

  routineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2F2A2D",
    marginBottom: 4,
  },

  routineNameCompleted: {
    textDecorationLine: "line-through",
    color: "#8B7B82",
  },

  routineMeta: {
    fontSize: 13,
    color: "#9A7F89",
  },

  emptyStateWrapper: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9A5C72",
    textAlign: "center",
    marginBottom: 8,
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: "#D2A8B6",
    textAlign: "center",
    lineHeight: 20,
  },
});