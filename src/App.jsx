import { useState } from 'react'
import './App.css'

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react';

const APIKey = "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";

function Chatbot({ updateRelatedTopics }) {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am your chatbot!",
      sender: "ChatGPT"
    }
  ]);

  const handleSend = async(message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };
  
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await processMessageToPerplexity(newMessages);
    updateRelatedTopics(message);
  }

  async function processMessageToPerplexity(chatMessages) {
    const systemMessage = {
      role: "system",
      content: "Talk very concisely and cite 1 scholarly journal or source."
    };

    let apiMessages = chatMessages.map((messageObject) => {
      return messageObject.sender === "ChatGPT"
        ? { role: "assistant", content: messageObject.message }
        : { role: "user", content: messageObject.message };
    });

    if (apiMessages[0].role === "assistant" && apiMessages[0].content === "Hello, I am your chatbot!") {
      apiMessages.shift();
    }

    apiMessages.unshift(systemMessage);

    const apiRequestBody = {
      model: "mistral-7b-instruct",
      messages: apiMessages,
      max_tokens: 1024
    };

    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(data);

      setMessages([
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="chatbot">
      <h2>Chat with AI</h2>
      <div style={{height: "500px", width:"100%"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList 
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="Typing..."/> : null}
            >
              {messages.map((message, i) => (
                <Message 
                  key={i} 
                  model={{
                    message: message.message,
                    sentTime: "just now",
                    sender: message.sender,
                    direction: message.sender === "ChatGPT" ? "incoming" : "outgoing",
                    position: "single"
                  }}
                />
              ))}
            </MessageList>
            <MessageInput placeholder='Please type a message' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

function SearchResults({ updateRelatedTopics }) {
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDescription('');

    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a helpful assistant that provides detailed descriptions of topics related to elections and political science. Include citations to scholarly sources in your response." },
            { role: "user", content: `Provide a detailed description of "${query}" in the context of elections and political science. Include at least 3 citations to scholarly sources.` }
          ],
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        setDescription(data.choices[0].message.content);
        updateRelatedTopics(query);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-results">
      <h2>Searched for a Detailed Description</h2>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query"
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {description && (
        <div className="description">
          <h3>Description:</h3>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

function RelatedTopics({ topics }) {
  return (
    <div className="related-topics">
      <h2>Related Topics</h2>
      <ul>
        {topics.map((topic, index) => (
          <li key={index}>{topic}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [relatedTopics, setRelatedTopics] = useState([]);

  const updateRelatedTopics = async (query) => {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-7b-instruct",
          messages: [
            { role: "system", content: "Generate 3-5 related topics as bullet points based on the given query about elections or political science." },
            { role: "user", content: query }
          ],
          max_tokens: 256
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const topics = data.choices[0].message.content.split('\n').filter(topic => topic.trim() !== '');
        setRelatedTopics(topics);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error fetching related topics:", error);
    }
  };

  return (
    <div className="App">
      <h1>Election Information Center</h1>
      <div className="app-container">
        <Chatbot updateRelatedTopics={updateRelatedTopics} />
        <SearchResults updateRelatedTopics={updateRelatedTopics} />
        <RelatedTopics topics={relatedTopics} />
      </div>
    </div>
  );
}

export default App