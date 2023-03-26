import "react-native-gesture-handler";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import Prompt from "./Prompt";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import Settings from "./Settings";
import Prompts from "./Prompts";

const Drawer = createDrawerNavigator();

export const getEnabledPrompts = async () => {
  try {
    const value = await AsyncStorage.getItem("prompts");
    if (value !== null) {
      const promptsObj = JSON.parse(value);
      // convert a prompts object to an array
      return Object.keys(promptsObj).map((key) => {
        return { ...promptsObj[key] };
      });
    }
  } catch (e) {
    console.log("error getting " + e);
  }
  return {};
};

export default function App() {
  const [prompts, setPrompts] = React.useState([]);

  const updatePromps = async () => {
    const p = await getEnabledPrompts();
    const sortedPrompts = p.sort((a, b) => a.title.localeCompare(b.title));
    setPrompts(sortedPrompts);
  };

  return (
    <ActionSheetProvider>
      <NavigationContainer onStateChange={(state) => updatePromps()}>
        <Drawer.Navigator
          initialRouteName="tell-me-a-story"
          screenOptions={{
            swipeEdgeWidth: 250,
          }}
        >
          <Drawer.Screen
            name="Settings"
            component={Settings}
            key="settings"
            options={{
              drawerItemStyle: styles.settingsDrawerLabel,
              drawerLabelStyle: { fontWeight: "bold" },
              drawerIcon: ({ focused, size }) => (
                <MaterialIcons name="settings" size={size} color="#ccc" />
              ),
            }}
          />
          <Drawer.Screen
            name="Prompts"
            component={Prompts}
            key="prompts"
            options={{
              drawerItemStyle: styles.promptsDrawerLabel,
              drawerLabelStyle: { fontWeight: "bold" },
              drawerIcon: ({ focused, size }) => (
                <MaterialCommunityIcons name="robot" size={size} color="#ccc" />
              ),
            }}
          />
          <Drawer.Group>
            {prompts.map((prompt) => (
              <Drawer.Screen
                name={prompt.id}
                component={Prompt}
                key={prompt.id}
                initialParams={prompt}
                options={{
                  title: prompt.title,
                  headerRight: () => (
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => alert("This is a button!")}
                    >
                      <MaterialIcons
                        name="info-outline"
                        size={24}
                        color="#ccc"
                      />
                    </Pressable>
                  ),
                }}
              />
            ))}
          </Drawer.Group>
        </Drawer.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 2,
  },
  settingsDrawerLabel: {
    backgroundColor: "#f3f4f6",
    marginBottom: 0,
  },
  promptsDrawerLabel: {
    backgroundColor: "#f3f4f6",
    marginBottom: 20,
  },
  iconButton: {
    marginRight: 8,
  },
});
