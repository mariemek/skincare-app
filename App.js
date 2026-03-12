import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";

import Tabs from "./navigation/Tabs";
import { createTables } from "./database/db";

export default function App() {

  useEffect(() => {
    createTables();
  }, []);

  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}