import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MessageList, Message, MessageInput, TypingIndicator, MainContainer } from "@chatscope/chat-ui-kit-react";
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import DashboardLayout from './components/DashboardLayout';  // Import the dashboard layout
import { messaging, getToken, onMessage } from './firebase-config';

const API_KEY = "sk-proj-9ohctNN2DMHwcBtkKXbCT3BlbkFJnltg82Pj7zjyQMe6AzI0";

const App = () => {

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
          console.log('FCM Token:', token);
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('Error getting permission for notifications', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initialMessages = JSON.parse(localStorage.getItem('chatMessages')) || [
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT"
    }
  ];

  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(initialMessages);

  const saveMessagesToLocalStorage = (messages) => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  };

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    saveMessagesToLocalStorage(newMessages);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old."
    };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        console.error("Failed to fetch from OpenAI API:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data && data.choices && data.choices.length > 0) {
        const newMessages = [
          ...chatMessages, {
            message: data.choices[0].message.content,
            sender: "ChatGPT"
          }
        ];
        setMessages(newMessages);
        setTyping(false);
        saveMessagesToLocalStorage(newMessages);
      } else {
        console.error("Unexpected response structure from OpenAI API", data);
      }
    } catch (error) {
      console.error("Error while communicating with OpenAI API", error);
    }
  }

  const clearMessages = () => {
    localStorage.removeItem('chatMessages');
    setMessages([]);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/dashboard" element={<DashboardLayout />} />  {/* Add the route for the dashboard layout */}
        </Routes>
        <div style={{ position: "relative", height: "800px", width: "700px" }}>
          <MainContainer>
            <ChatContainer>
              <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}>
                {messages.map((message, i) => (
                  <Message key={i} model={message} />
                ))}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
              <button onClick={clearMessages}>Terminate Chat Session</button>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </Router>
  );
};

export default App;



