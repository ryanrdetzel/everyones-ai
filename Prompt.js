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

  const params = route.params.prompt;

  const newConversation = () => {
    setChatHistory([
      {
        id: uuid.v4(),
        content: params.prompt,
        role: "system",
      },
    ]);
  };

  const tellMeMore = () => {
    sendChat(null, "Continue your thought");
  };

  const resendMessage = async (message) => {
    // Remove this message from the chat history and then send it again
    const filtered = chatHistory.filter((i) => i.id !== message.id);
    setChatHistory(filtered);
    setText(message.content);
    textRef.current?.focus();
  };

  const sendChat = async (e, forceMessage) => {
    setIsWorking(true);

    const messageText = forceMessage || text;
    const filtered = chatHistory.filter((i) => i.role !== "app");

    const newMessages = [
      ...filtered,
      {
        id: uuid.v4(),
        content: messageText,
        role: "user",
      },
    ];
    setChatHistory(newMessages);

    setText("");
    Keyboard.dismiss();

    const response = await chatRequest(text, params, newMessages);
    if (response.content) {
      setChatHistory((prevState) => [
        ...prevState,
        {
          id: uuid.v4(),
          content: response.content,
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
            content: response.error,
            role: "app",
            type: "error",
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
      scrollRef.current?.scrollToEnd({ animated: false });
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
      {chatHistory.length <= 1 && (
        <Text key="first" style={styles.topMessage}>
          <Text style={{ fontWeight: 600 }}>Prompt</Text>
          {"\n\n"}
          {params.prompt}
        </Text>
      )}
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
                case "assistant":
                  chatStyle = styles.chatRec;
                  break;
                case "app":
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
        {chatHistory.length > 1 && !isWorking && (
          <View style={styles.newConvoButton}>
            <Button
              title="Start new conversation"
              disabled={isWorking}
              onPress={newConversation}
              style={{ fontSize: 12 }}
            />
            <Button
              title="Tell me more"
              disabled={isWorking}
              onPress={tellMeMore}
            />
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
          {/* <Button
            title="Clear History"
            disabled={isWorking}
            onPress={newConversation}
          /> */}
          <Button
            title="Send Message"
            disabled={isWorking}
            onPress={sendChat}
          />
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
    padding: 25,
    // margin: 20,
    paddingVertical: 30,
    fontSize: 16,
    verticalAlign: "middle",
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
    textAlign: "left",
  },
  newConvoButton: {
    marginBottom: 5,
    marginHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 30,
    paddingHorizontal: 15,
    paddingTop: 10,
    marginLeft: "auto",
  },
  chatSend: {
    backgroundColor: "#e0f2fe",
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
