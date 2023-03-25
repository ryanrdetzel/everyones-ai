import "react-native-gesture-handler";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Prompt from "./Prompt";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

const Drawer = createDrawerNavigator();

export default function App() {
  const prompts = [
    {
      id: "tell-me-a-story",
      title: "Tell me a story",
      conversation: false,
      prompt:
        "You're a story teller, you're creative and you're good at it. Tell me a story about in one sentence about ",
    },
    {
      id: "2",
      title: "Research",
      conversation: true,
      prompt: "I'm trying to learn as much as I can about ",
    },
    {
      id: "3",
      title: "Professional Chef",
      conversation: true,
      prompt:
        "I require someone who can suggest delicious recipes that includes foods which are nutritionally beneficial but also easy & not time consuming enough therefore suitable for busy people like us among other factors such as cost effectiveness so overall dish ends up being healthy yet economical at same time! My first request ",
    },
    {
      id: "4",
      title: "Text Based Adventure Game",
      conversation: true,
      prompt:
        "I want you to act as a text based adventure game. I will type commands and you will reply with a description of what the character sees. I want you to only reply with the game output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is wake up ",
    },
    {
      id: "5",
      title: "Rewrite my text message",
      conversation: true,
      prompt:
        "I want you to rewrite my text message so it's cleaner. Fix any grammar and spelling. Keep it short.",
    },
    {
      id: "6",
      title: "Dream Interpreter",
      conversation: true,
      prompt:
        "I want you to act as a dream interpreter. I will give you descriptions of my dreams, and you will provide interpretations based on the symbols and themes present in the dream. Do not provide personal opinions or assumptions about the dreamer. Provide only factual interpretations based on the information given.",
    },
    {
      id: "7",
      title: "DIY Expert",
      conversation: true,
      prompt:
        "I want you to act as a DIY expert. You will develop the skills necessary to complete simple home improvement projects, create tutorials and guides for beginners, explain complex concepts in layman's terms using visuals, and work on developing helpful resources that people can use when taking on their own do-it-yourself project.",
    },
    {
      id: "8",
      title: "Ask a Historian",
      conversation: true,
      prompt:
        "I want you to act as a historian. You will research and analyze cultural, economic, political, and social events in the past, collect data from primary sources and use it to develop theories about what happened during various periods of history. ",
    },
    {
      id: "9",
      title: "Help me write",
      conversation: true,
      prompt:
        "I'm going to give you a topic and I want you to give me 500 words on it. I want you to write about ",
    },
    {
      id: "10",
      title: "Biblical Expert",
      conversation: true,
      prompt:
        "I want you to be an exper in everything realted to the bible. I want you to answer questions about the bible. I want only facts. If there is a passage about something I'm asking about I want you to list it out. ",
    },
    {
      id: "11",
      title: "Give me some ideas",
      conversation: true,
      prompt:
        "You an ideaman, you come up with great ideas. I want you to give me some ideas about ",
    },
  ];

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Prompt"
          screenOptions={{
            drawerStyle: styles.sideDrawer,
          }}
        >
          {prompts.map((prompt) => (
            <Drawer.Screen
              name={prompt.title}
              component={Prompt}
              key={prompt.id}
              initialParams={prompt}
              options={{
                headerRight: () => (
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => alert("This is a button!")}
                  >
                    <MaterialIcons name="info-outline" size={24} color="#ccc" />
                  </Pressable>
                ),
              }}
            />
          ))}
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
  iconButton: {
    marginRight: 8,
  },
});
