// src/App.js
import React from 'react';
import ChatBot from './components/ChatBot';
import './App.css';
import NavigationBar from './components/NavigationBar';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <ChatBot />
    </div>
  );
}

export default App;
