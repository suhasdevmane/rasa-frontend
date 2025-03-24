// src/components/ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { BsDownload, BsTrash, BsDashSquare, BsChatDotsFill } from 'react-icons/bs';

const RASA_ENDPOINT = "http://localhost:5005/webhooks/rest/webhook"; // Update if needed

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load chat history on mount and add a welcome message if empty
  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      if (parsedHistory && parsedHistory.length > 0) {
        setMessages(parsedHistory);
      } else {
        setMessages([{
          sender: 'bot',
          text: 'Welcome to our chat! How can I help you today?',
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }
    } else {
      setMessages([{
        sender: 'bot',
        text: 'Welcome to our chat! How can I help you today?',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  }, []);

  // Save chat history to localStorage and auto-scroll whenever messages update
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    localStorage.removeItem('chatHistory');
    setMessages([]);
  };

  const toggleMinimize = () => {
    setMinimized(prev => !prev);
  };

  // Full chat UI view (when not minimized)
  const fullChatUI = (
    <Container 
      className="my-4" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        maxWidth: '400px', 
        zIndex: 9999 
      }}
    >
      <Row>
        <Col>
          <div className="chat-container border rounded bg-white shadow" style={{overflow: 'hidden' }}>
            {/* Chat Header */}
            <div className="chat-header d-flex justify-content-between align-items-center p-2 border-bottom">
              <h5 className="mb-0">Talk2MeBot</h5>
              <Button variant="light" size="sm" onClick={toggleMinimize}>
                <BsDashSquare />
              </Button>
            </div>
            {/* Chat Messages and Input */}
            <div className="chat-body" style={{ height: 'calc(100% - 50px)' }}>
              <div 
                className="chat-messages p-3" 
                style={{ height: '70%', overflowY: 'auto', backgroundColor: '#f5f5f5' }}
              >
                {messages.map((msg, index) => (
                  <Message key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input p-3 border-top d-flex align-items-end" style={{ height: '30%' }}>
                <Form className="w-100">
                  <Form.Group controlId="chatInput">
                    <Form.Control 
                      as="textarea"
                      rows={1}
                      ref={textAreaRef}
                      placeholder="Type your message..."
                      value={userInput}
                      onChange={handleTextAreaChange}
                      onKeyDown={handleKeyDown}
                      style={{ resize: 'none', overflow: 'hidden' }}
                    />
                  </Form.Group>
                </Form>
                <div className="ms-2 d-flex flex-column">
                  <Button variant="secondary" onClick={downloadChatHistory} className="mb-2 p-2">
                    <BsDownload size={20} />
                  </Button>
                  <Button variant="danger" onClick={clearChatHistory} className="p-2">
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

  // Minimized view: only a small floating button/icon
  const minimizedView = (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 9999 
    }}>
      <Button 
        variant="primary" 
        onClick={toggleMinimize} 
        style={{ 
          borderRadius: '50%', 
          width: '60px', 
          height: '60px', 
          padding: 0 
        }}
      >
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







// this is my test