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
  Pressable,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { chatRequest } from "./openai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Clipboard from "expo-clipboard";

import uuid from "react-native-uuid";

const storeData = async (key, value) => {
  const filtered = value.filter((i) => i.role !== "app");
  const data = JSON.stringify(filtered);

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
      return JSON.parse(value);
    }
  } catch (e) {
    console.log("error getting " + e);
  }
  return [];
};

export default function Prompt({ navigation, route }) {
  const [text, setText] = React.useState(null);
  const [isWorking, setIsWorking] = React.useState(false);

  const [chatHistory, setChatHistory] = React.useState([]);

  const [selectedId, setSelectedId] = React.useState();

  const { showActionSheetWithOptions } = useActionSheet();
  const height = useHeaderHeight();

  const scrollRef = React.useRef();
  const textRef = React.useRef();

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

  const resendMessage = async (message) => {
    // Remove this message from the chat history and then send it again
    const filtered = chatHistory.filter((i) => i.id !== message.id);
    setChatHistory(filtered);
    setText(message.content);
    textRef.current?.focus();
  };

  const sendChat = async () => {
    setIsWorking(true);

    // remove any app messages
    const filtered = chatHistory.filter((i) => i.role !== "app");

    const newMessages = [
      ...filtered,
      {
        id: uuid.v4(),
        content: text,
        role: "user",
      },
    ];
    setChatHistory(newMessages);

    setText("");
    Keyboard.dismiss();

    const response = await chatRequest(text, params, newMessages);
    if (response !== null) {
      setChatHistory((prevState) => [
        ...prevState,
        {
          id: uuid.v4(),
          content: response,
          role: "assistant",
        },
      ]);
    } else {
      setChatHistory((prevState) => {
        // Add canRefresh to the last user message and then add the error message
        const lastUserMessage = prevState[prevState.length - 1];
        lastUserMessage.canRefresh = true;
        const adjustedPrevState = prevState.slice(0, -1);

        return [
          ...adjustedPrevState,
          lastUserMessage,
          {
            id: uuid.v4(),
            content:
              "Sorry, there seems to be a problem with the server. Try again later.",
            role: "app",
          },
        ];
      });
    }

    setIsWorking(false);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  React.useEffect(() => {
    if (chatHistory.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
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

  const onPress = (item) => {
    const options = ["Delete", "Copy Message", "Edit Messsage", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 1: //Copy
            Clipboard.setStringAsync(item.content);
            break;
          case 1: //Edit
            setText(item.content);
            textRef.current?.focus();
            break;
          case destructiveButtonIndex:
            // Delete the message from the chat history
            const filtered = chatHistory.filter((i) => i.id !== item.id);
            setChatHistory(filtered);
            break;
          case cancelButtonIndex:
        }
      }
    );
  };

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
              let chatStyle = styles.chatSend;
              switch (item.role) {
                case "user":
                  chatStyle = styles.chatSend;
                  break;
                case "assistant":
                  chatStyle = styles.chatRec;
                  break;
                default:
                  chatStyle = styles.chatAppError;
              }
              return (
                <View key={item.id} style={chatStyle}>
                  <Pressable onLongPress={() => onPress(item)}>
                    <Text style={styles.item}>{item.content}</Text>
                  </Pressable>
                  {item.canRefresh && (
                    <Pressable
                      style={styles.refreshButton}
                      onPress={() => resendMessage(item)}
                    >
                      <MaterialIcons name="refresh" size={24} color="#ccc" />
                    </Pressable>
                  )}
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
          ref={textRef}
          style={styles.input}
          placeholder="Type your message..."
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
  refreshButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 2,
  },
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
  chatAppError: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
});
