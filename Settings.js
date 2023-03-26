import React from "react";
import { StyleSheet, View, Text, TextInput, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const saveSettings = async (value) => {
  const data = JSON.stringify(value);

  try {
    await AsyncStorage.setItem("settings", data);
  } catch (e) {
    console.log("error saving " + e);
  }
};

export const getSettings = async () => {
  try {
    const value = await AsyncStorage.getItem("settings");
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.log("error getting " + e);
  }
  return {};
};

export default function Settings({ navigation }) {
  const [settings, setSettings] = React.useState({});

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setSettings(await getSettings());
    });
    return unsubscribe;
  }, [navigation]);

  const saveKey = (value) => {
    const newSettings = { ...settings, openaiKey: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <View style={styles.container}>
      <Text style={{ paddingBottom: 20 }}>
        This app requires an OpenAI account to use. You can create an account
        here:
      </Text>
      <Text
        style={{ color: "#0284c7", paddingBottom: 20 }}
        onPress={() => Linking.openURL("https://platform.openai.com/overview")}
      >
        OpenAI Developers
      </Text>
      <Text style={{ paddingBottom: 20 }}>
        Once you have an OpenAI account you can create an API key here:
      </Text>
      <Text
        style={{ color: "#0284c7", paddingBottom: 20 }}
        onPress={() =>
          Linking.openURL("https://platform.openai.com/account/api-keys")
        }
      >
        https://platform.openai.com/account/api-keys
      </Text>

      <Text>Paste your OpenAI API Key below</Text>
      <TextInput
        style={styles.apiKeyInput}
        onChangeText={saveKey}
        value={settings.openaiKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    fontSize: 18,
  },
  apiKeyInput: {
    marginTop: 8,
    padding: 4,
    fontSize: 20,
    backgroundColor: "#fff",
  },
});
