// src/components/ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { BsDownload, BsTrash, BsDashSquare, BsChatDotsFill } from 'react-icons/bs';
import db from '../db';
import '../App.css'; // Import the CSS file

const RASA_ENDPOINT = "http://localhost:5005/webhooks/rest/webhook";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = sessionStorage.getItem('currentUser');

  // Load chat history from IndexedDB for the current user on mount
  useEffect(() => {
    if (currentUser) {
      db.chatHistory.where('username').equals(currentUser).first().then(record => {
        if (record && record.messages && record.messages.length > 0) {
          setMessages(record.messages);
        } else {
          setMessages([{
            sender: 'bot',
            text: 'Welcome to our chat! How can I help you today?',
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }
      });
    }
  }, [currentUser]);

  // Save chat history to IndexedDB and auto-scroll whenever messages update
  useEffect(() => {
    if (currentUser) {
      db.chatHistory.where('username').equals(currentUser).first().then(record => {
        if (record) {
          db.chatHistory.update(record.id, { messages });
        } else {
          db.chatHistory.add({ username: currentUser, messages });
        }
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentUser]);

  const addMessage = (message) => {
    if (!message.timestamp) {
      message.timestamp = new Date().toLocaleTimeString();
    }
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };
    addMessage(userMessage);

    try {
      const response = await axios.post(RASA_ENDPOINT, { sender: 'user', message: userInput });
      const botMessages = response.data.map(msg => ({
        sender: 'bot',
        ...msg,
        timestamp: new Date().toLocaleTimeString(),
      }));
      botMessages.forEach(msg => addMessage(msg));
    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      addMessage({
        sender: 'bot',
        text: "Error communicating with the server.",
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    setUserInput('');
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  };

  const handleTextAreaChange = (e) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadChatHistory = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "chatHistory.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearChatHistory = () => {
    if (currentUser) {
      db.chatHistory.where('username').equals(currentUser).modify({ messages: [] });
    }
    setMessages([]);
  };

  const toggleMinimize = () => {
    setMinimized(prev => !prev);
  };

  // Full chat UI view (when not minimized)
  const fullChatUI = (
    <Container className="my-4" style={{ position: 'fixed', bottom: '20px', right: '20px', maxWidth: '500px', zIndex: 9999 }}>
      <Row>
        <Col>
          <div className="chat-container border rounded bg-white shadow">
            {/* Chat Header */}
            <div className="chat-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Talk2MeBot</h5>
              <Button variant="light" size="sm" onClick={toggleMinimize}>
                <BsDashSquare />
              </Button>
            </div>
            {/* Chat Body */}
            <div className="chat-body d-flex flex-column">
              {/* Scrollable messages area */}
              <div className="chat-messages p-3 flex-grow-1 overflow-auto">
                {messages.map((msg, index) => (
                  <Message key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Chat Input Area */}
              <div className="chat-input">
                <div className="input-wrapper">
                  <Form className="w-100">
                    <Form.Group controlId="chatInput">
                      <Form.Control 
                        as="textarea"
                        rows={3}
                        ref={textAreaRef}
                        placeholder="Type your message..."
                        value={userInput}
                        onChange={handleTextAreaChange}
                        onKeyDown={handleKeyDown}
                        style={{ resize: 'none', overflow: 'hidden' }}
                      />
                    </Form.Group>
                  </Form>
                </div>
                <div className="chat-buttons">
                  <Button variant="secondary" onClick={downloadChatHistory}>
                    <BsDownload size={20} />
                  </Button>
                  <Button variant="danger" onClick={clearChatHistory}>
                    <BsTrash size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );

  const minimizedView = (
    <div className="chat-minimized" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      <Button variant="primary" onClick={toggleMinimize} style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0 }}>
        <BsChatDotsFill size={30} />
      </Button>
    </div>
  );

  return (
    <>
      {minimized ? minimizedView : fullChatUI}
    </>
  );
}

export default ChatBot;




// this is sample code xzsdf jdopsf  asdf asod 