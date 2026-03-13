import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

import Tabs from "./navigation/Tabs";
import LoginScreen from "./screens/LoginScreen";
import { syncUserDataToSQLite } from "./services/syncUserData";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          await syncUserDataToSQLite();
        } catch (error) {
          console.log("Sync error:", error.message);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <Tabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}