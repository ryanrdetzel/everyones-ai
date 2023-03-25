import React from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
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
      <Text>OpenAI API Key</Text>
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
    padding: 2,
    fontSize: 18,
    backgroundColor: "#fff",
  },
});
