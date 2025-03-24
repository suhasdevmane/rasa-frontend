// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

function App() {
  const currentUser = sessionStorage.getItem('currentUser');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Protect the chat route */}
        <Route path="/chat" element={currentUser ? <ChatBot /> : <Navigate to="/login" />} />
        {/* Redirect any unknown path to the login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
