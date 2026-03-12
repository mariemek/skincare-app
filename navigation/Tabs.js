import React from "react";
import { useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ProductsScreen from "../screens/ProductsScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { lightColors, darkColors } from "../theme/colors";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          height: 68,
          paddingTop: 10,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },

        tabBarItemStyle: {
          paddingVertical: 4,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,

        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          if (route.name === "Products") iconName = "box";
          if (route.name === "Schedule") iconName = "calendar";
          if (route.name === "Profile") iconName = "user";

          return <Feather name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}