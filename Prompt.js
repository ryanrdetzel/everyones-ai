import React from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { chatRequest } from "./openai";
import AsyncStorage from "@react-native-async-storage/async-storage";

import uuid from "react-native-uuid";

const storeData = async (key, value) => {
  const data = JSON.stringify(value);
  console.log(`Saving ${key} ` + data);
  try {
    await AsyncStorage.setItem(key, data);
  } catch (e) {
    console.log("error saving " + e);
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(`Found ${key}: ` + value);
      return JSON.parse(value);
    }
  } catch (e) {
    console.log("error getting " + e);
  }
  return [];
};

export default function Prompt({ navigation, route }) {
  const [text, setText] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);

  const [chatHistory, setChatHistory] = React.useState([]);

  const [selectedId, setSelectedId] = React.useState();
  const height = useHeaderHeight();

  const scrollRef = React.useRef();
  const params = route.params;

  const newConversation = () => {
    setChatHistory([
      {
        id: uuid.v4(),
        content: params.prompt,
        role: "system",
      },
    ]);
  };

  const sendChat = async () => {
    setIsWorking(true);
    const newMessages = [
      ...chatHistory,
      {
        id: uuid.v4(),
        content: text,
        role: "user",
      },
    ];
    setChatHistory(newMessages);

    setText("");
    Keyboard.dismiss();

    // Save history to local storage
    const response = await chatRequest(text, params, newMessages);

    setChatHistory((prevState) => [
      ...prevState,
      {
        id: uuid.v4(),
        content: response,
        role: "assistant",
      },
    ]);

    setIsWorking(false);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  React.useEffect(() => {
    if (chatHistory.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
      console.log(" *********** CHAT HISTORY CHANGE");
      console.log(chatHistory);
      storeData(`history-${params.id}-current`, chatHistory);
    }
  }, [chatHistory]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      scrollRef.current?.scrollToEnd({ animated: true });
      let getHistory = await getData(`history-${params.id}-current`);
      if (getHistory.length === 0) {
        newConversation();
      } else {
        setChatHistory(getHistory);
      }
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.container1}>
      <Text key="first" style={styles.topMessage}>
        {params.conversation &&
          "This is a conversation, each new message is a response to the previous message. "}
        {!params.conversation &&
          "Each message is indepedent of the previous message."}
      </Text>
      <ScrollView
        style={styles.scrollView}
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        <View style={{ flexGrow: 1, flex: 1 }}>
          {chatHistory
            .filter((i) => i.role !== "system")
            .map((item) => {
              const chatStyle =
                item.role === "user" ? styles.chatSend : styles.chatRec;
              return (
                <View key={item.id} style={chatStyle}>
                  <Text style={styles.item}>{item.content}</Text>
                </View>
              );
            })}
        </View>
        {isWorking && (
          <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollView>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={height}>
        <TextInput
          multiline={true}
          numberOfLines={20}
          style={styles.input}
          onChangeText={(e) => {
            if (!isWorking) {
              setText(e);
            }
          }}
          value={text}
        />
        <View style={styles.buttons}>
          <Button
            title="Clear"
            disabled={isWorking}
            onPress={newConversation}
          />
          <Button title="Send" disabled={isWorking} onPress={sendChat} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topMessage: {
    padding: 10,
    fontSize: 14,
    textAlign: "center",
  },
  container1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 2,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 10,
    fontSize: 18,
  },
  item: {
    padding: 10,
    fontSize: 18,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  chatSend: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  chatRec: {
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
});
