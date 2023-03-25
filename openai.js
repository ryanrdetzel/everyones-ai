import AsyncStorage from "@react-native-async-storage/async-storage";

import { getSettings } from "./Settings";

export async function chatRequest(system, params, messages) {
  const isConversation = params.conversation;

  const settings = await getSettings();

  if (settings === null || !settings.openaiKey || settings.openaiKey === "") {
    return {
      error: "No API key set, please check your settings.",
    };
  }

  const cleanMessages = messages.map((message) => {
    return {
      role: message.role,
      content: message.content,
    };
  });

  const onlySystem = cleanMessages.filter((message) => {
    return message.role === "system";
  });

  const filteredMessages = !isConversation
    ? onlySystem.concat(cleanMessages[cleanMessages.length - 1])
    : cleanMessages;

  const payload = {
    model: "gpt-3.5-turbo",
    messages: filteredMessages,
    temperature: 0.7,
    max_tokens: 100,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + settings.openaiKey,
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    const content = json.choices[0].message.content;
    return { content };
  } catch (error) {
    return {
      error: "Could not connect to OpenAI API",
    };
  }
}
