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

const prompts = [
  {
    id: "tell-me-a-story",
    title: "Tell me a story",
    enabled: true,
    intro:
      "The AI will tell you a story.\nGive details, ask questions, be creative!",
    prompt:
      "You're a story teller, you're creative and you're good at it. Tell me a story about in one sentence about ",
  },
  {
    id: "2",
    title: "Research",
    enabled: true,
    intro:
      "The AI is your personal research assistant. Define what you want it to research, follow up with questions, and it will provide you with the information you need.",
    prompt: "I'm trying to learn as much as I can about ",
  },
  {
    id: "3",
    title: "Professional Chef",
    enabled: false,
    prompt:
      "I require someone who can suggest delicious recipes that includes foods which are nutritionally beneficial but also easy & not time consuming enough therefore suitable for busy people like us among other factors such as cost effectiveness so overall dish ends up being healthy yet economical at same time! My first request ",
  },
  {
    id: "4",
    title: "Text Based Adventure Game",
    enabled: false,
    prompt:
      "I want you to act as a text based adventure game. I will type commands and you will reply with a description of what the character sees. I want you to only reply with the game output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is wake up ",
  },
  {
    id: "5",
    title: "Rewrite my text message",
    enabled: false,
    prompt:
      "I want you to rewrite my text message so it's cleaner. Fix any grammar and spelling. Keep it short.",
  },
  {
    id: "6",
    title: "Dream Interpreter",
    enabled: true,
    prompt:
      "I want you to act as a dream interpreter. I will give you descriptions of my dreams, and you will provide interpretations based on the symbols and themes present in the dream. Do not provide personal opinions or assumptions about the dreamer. Provide only factual interpretations based on the information given.",
  },
  {
    id: "7",
    title: "DIY Expert",
    enabled: true,
    intro: "DIY",
    prompt:
      "I want you to act as a DIY expert. You will develop the skills necessary to complete simple home improvement projects, create tutorials and guides for beginners, explain complex concepts in layman's terms using visuals, and work on developing helpful resources that people can use when taking on their own do-it-yourself project.",
  },
  {
    id: "8",
    title: "Ask a Historian",
    enabled: true,
    prompt:
      "I want you to act as a historian. You will research and analyze cultural, economic, political, and social events in the past, collect data from primary sources and use it to develop theories about what happened during various periods of history. ",
  },
  {
    id: "9",
    title: "Help me write",
    enabled: true,
    prompt:
      "I'm going to give you a topic and I want you to give me 500 words on it. I want you to write about ",
  },
  {
    id: "10",
    title: "Biblical Expert",
    enabled: true,
    prompt:
      "I want you to be an exper in everything realted to the bible. I want you to answer questions about the bible. I want only facts. If there is a passage about something I'm asking about I want you to list it out. ",
  },
  {
    id: "11",
    title: "Give me some ideas",
    enabled: true,
    prompt:
      "You an ideaman, you come up with great ideas. I want you to give me some ideas about ",
  },
];

const saveEnabledPrompts = async (value) => {
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
    <ScrollView style={styles.scrollView}>
      <View>
        {currentPrompts.map((prompt) => {
          // const enabled = updatedEnabledPrompts[prompt.id];
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
      </View>
    </ScrollView>
  );
}

export default function Prompts({ navigation }) {
  const [enabledPrompts, setEnabledPrompts] = React.useState({});

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const tmpPromptObj = await getEnabledPrompts();
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
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 30,
  },
  container: {
    flex: 1,
    // margin: 10,
    fontSize: 18,
  },
  apiKeyInput: {
    marginTop: 8,
    padding: 4,
    fontSize: 20,
    backgroundColor: "#fff",
  },
});
