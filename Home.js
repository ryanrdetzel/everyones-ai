import React from "react";
import { StyleSheet, View, Text, TextInput, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

import { getSettings } from "./Settings";

export default function Home({ navigation }) {
  const localImage = require("./assets/icon.png");
  const [apiSet, setApiSet] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const settings = await getSettings();

      if (
        settings === null ||
        !settings.openaiKey ||
        settings.openaiKey === ""
      ) {
        setApiSet(false);
      } else {
        setApiSet(true);
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Everyone's AI</Text>
      <Image source={localImage} style={styles.logo} />
      <Text style={styles.intro}>
        Making artificial intelligence accessible to all
      </Text>

      {apiSet && (
        <Text
          style={{ color: "#0284c7", paddingBottom: 20, fontSize: 18 }}
          onPress={() => navigation.openDrawer()}
        >
          Choose a prompt
        </Text>
      )}

      {!apiSet && (
        <>
          <Text
            style={{
              padding: 20,
              textAlign: "center",
              fontWeight: 500,
              color: "#ef4444",
            }}
          >
            This app requires an OpenAI account to use. Please setup your API
            key in the settings.
          </Text>
          <Text
            style={{ color: "#0284c7", paddingBottom: 20, fontSize: 18 }}
            onPress={() => navigation.navigate("Settings")}
          >
            Goto Settings
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    fontSize: 18,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: 600,
    paddingBottom: 20,
  },
  intro: {
    fontSize: 20,
    padding: 40,
    textAlign: "center",
    color: "#6b7280",
  },
  logo: {
    width: 250,
    height: 250,
  },
});
