import "react-native-gesture-handler";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import Prompt from "./Prompt";
import Settings from "./Settings";
import Prompts from "./Prompts";
import Home from "./Home";

const Drawer = createDrawerNavigator();

const generalPrompt = {
  id: "general-chat",
  title: "General Chat",
  prompt:
    "You're the smartest AI in the world. You know everything and respond to everything. Lets chat.",
  enabled: true,
};

export const getEnabledPrompts = async () => {
  try {
    const value = await AsyncStorage.getItem("prompts");
    if (value !== null) {
      const promptsObj = JSON.parse(value);
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
    const allArompts = await getEnabledPrompts();
    const sortedPrompts = allArompts
      .filter((p) => p && p.title)
      .sort((a, b) => a?.title.localeCompare(b?.title));
    setPrompts(allArompts);
  };

  return (
    <ActionSheetProvider>
      <NavigationContainer onStateChange={(state) => updatePromps()}>
        <Drawer.Navigator
          initialRouteName="home"
          screenOptions={{
            swipeEdgeWidth: 250,
          }}
        >
          <Drawer.Screen
            name="Home"
            component={Home}
            key="home"
            options={{
              drawerItemStyle: styles.settingsDrawerLabel,
              drawerIcon: ({ focused, size }) => (
                <MaterialIcons name="home" size={size} color="#ccc" />
              ),
            }}
          />

          <Drawer.Screen
            name="Settings"
            component={Settings}
            key="settings"
            options={{
              drawerItemStyle: styles.settingsDrawerLabel,
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
              drawerLabelStyle: {},
              drawerIcon: ({ focused, size }) => (
                <MaterialCommunityIcons name="robot" size={size} color="#ccc" />
              ),
            }}
          />
          <Drawer.Group>
            <Drawer.Screen
              name={generalPrompt.id}
              component={Prompt}
              key={generalPrompt.id}
              initialParams={{ prompt: generalPrompt }}
              options={{
                title: generalPrompt.title,
              }}
            />
            {prompts.map((prompt) => (
              <Drawer.Screen
                name={prompt.id}
                component={Prompt}
                key={prompt.id}
                initialParams={{ prompt }}
                options={{
                  title: prompt.title,
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
