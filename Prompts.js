import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Linking,
  Pressable,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { prompts, initialPrompts } from "./prompt-data";

export const saveEnabledPrompts = async (value) => {
  const data = JSON.stringify(value);
  try {
    await AsyncStorage.setItem("prompts", data);
  } catch (e) {}
};

export const getEnabledPrompts = async () => {
  try {
    const value = await AsyncStorage.getItem("prompts");
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.log("error getting " + e);
  }
  return {};
};

function PublicPrompList({ enabledPrompts }) {
  const [updatedEnabledPrompts, setUpdatedEnabledPrompts] = React.useState({});
  const [currentPrompts, setCurrentPrompts] = React.useState(prompts);

  React.useEffect(() => {
    setUpdatedEnabledPrompts(enabledPrompts);
  }, [enabledPrompts]);

  React.useEffect(() => {
    const newCurrentPrompts = currentPrompts.map((p) => {
      return {
        ...p,
        enabled: p.id in updatedEnabledPrompts,
      };
    });
    setCurrentPrompts(newCurrentPrompts);
  }, [updatedEnabledPrompts]);

  const togglePrompt = (prompt) => {
    let updateStated = { ...updatedEnabledPrompts };
    if (prompt.id in updatedEnabledPrompts) {
      delete updateStated[prompt.id];
    } else {
      updateStated = {
        ...updatedEnabledPrompts,
        [prompt.id]: prompt,
      };
    }
    saveEnabledPrompts(updateStated);
    setUpdatedEnabledPrompts(updateStated);
  };

  return (
    <ScrollView style={styles.scrollView} scrollIndicatorInsets={{ right: 1 }}>
      {/* <View> */}
      {currentPrompts.map((prompt) => {
        return (
          <Pressable
            key={prompt.id}
            onPress={() => togglePrompt(prompt)}
            style={({ pressed }) => [
              {
                padding: 20,
                marginBotton: 10,
                backgroundColor: pressed
                  ? "#f3f4f6"
                  : prompt.enabled
                  ? "#e0f2fe"
                  : "white",
              },
              styles.wrapperCustom,
            ]}
          >
            <Text style={{ fontWeight: 600 }}>
              {prompt.title}{" "}
              {prompt.enabled && (
                <MaterialCommunityIcons
                  name="checkbox-marked-circle-outline"
                  size={14}
                  color="#075985"
                />
              )}
            </Text>

            <Text>{prompt.prompt}</Text>
          </Pressable>
        );
      })}
      {/* </View> */}
    </ScrollView>
  );
}

export default function Prompts({ navigation }) {
  const [enabledPrompts, setEnabledPrompts] = React.useState({});

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      let tmpPromptObj = await getEnabledPrompts();
      setEnabledPrompts(tmpPromptObj);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={{ paddingBottom: 0, margin: 20 }}>
        A prompt is a specific text input provided by the app that serves as the
        basis for the AI. It's a simple brief instruction or a starting point
        given to guide creative or analytical thinking.{"\n\n"}
        <Text style={{ fontWeight: 600 }}>
          Tap a prompt below to add it to your favorites list{" "}
        </Text>
      </Text>
      <PublicPrompList enabledPrompts={enabledPrompts} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    // flex: 1,
    backgroundColor: "#fff",
    // marginBottom: 30,
  },
  container: {
    flex: 1,
    fontSize: 18,
  },
  apiKeyInput: {
    marginTop: 8,
    padding: 4,
    fontSize: 20,
    backgroundColor: "#fff",
  },
});
