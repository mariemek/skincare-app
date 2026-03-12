import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { db } from "../database/db";
import { lightColors, darkColors } from "../theme/colors";

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [productCount, setProductCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const productResult = await db.getFirstAsync(
      "SELECT COUNT(*) as count FROM products"
    );

    const scheduleResult = await db.getFirstAsync(
      "SELECT COUNT(*) as count FROM schedule"
    );

    setProductCount(productResult?.count ?? 0);
    setScheduledCount(scheduleResult?.count ?? 0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.iconCircle}>
              <Feather name="box" size={18} color={colors.primary} />
            </View>

            <Text style={styles.statNumber}>{productCount}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.iconCircle}>
              <Feather name="calendar" size={18} color={colors.primary} />
            </View>

            <Text style={styles.statNumber}>{scheduledCount}</Text>
            <Text style={styles.statLabel}>Scheduled Items</Text>
          </View>
        </View>

        <View style={styles.journeyCard}>
          <Text style={styles.journeyTitle}>↗ Your Skincare Journey</Text>

          <Text style={styles.journeyText}>
            Build a consistent skincare routine by adding your favorite
            products and scheduling them throughout the week. Track your
            progress daily and watch your skin transform!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Skincare Tips</Text>

        <View style={styles.tipCard}>
          <Feather
            name="check-circle"
            size={16}
            color={colors.primary}
            style={styles.tipIcon}
          />
          <Text style={styles.tipText}>
            Always apply products from thinnest to thickest consistency
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Feather
            name="check-circle"
            size={16}
            color={colors.primary}
            style={styles.tipIcon}
          />
          <Text style={styles.tipText}>
            Wait 30-60 seconds between applying different products
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Feather
            name="check-circle"
            size={16}
            color={colors.primary}
            style={styles.tipIcon}
          />
          <Text style={styles.tipText}>
            Sunscreen should be the last step in your morning routine
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Feather
            name="check-circle"
            size={16}
            color={colors.primary}
            style={styles.tipIcon}
          />
          <Text style={styles.tipText}>
            Consistency is key - stick to your routine for best results
          </Text>
        </View>
      </ScrollView>
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
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 28,
    },

    title: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },

    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    statCard: {
      width: "48.2%",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
    },

    iconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.softPink,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },

    statLabel: {
      fontSize: 12,
      color: colors.subtext,
    },

    journeyCard: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 18,
    },

    journeyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
    },

    journeyText: {
      fontSize: 13,
      lineHeight: 22,
      color: colors.subtext,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 12,
    },

    tipCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "flex-start",
    },

    tipIcon: {
      marginTop: 1,
      marginRight: 10,
    },

    tipText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 21,
      color: colors.text,
    },
  });