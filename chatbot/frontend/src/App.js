import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { PaperAirplaneIcon, UserCircleIcon, Cog6ToothIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const AVAILABLE_MODELS = {
  'llama-3.1-8b-instant': 'LLaMA 3.1 8B Instant',  // Primary Choice ✅
  'llama3-8b-8192': 'LLaMA 3 8B 8192',            // High Token Limit & Speed ⚡
  'gemma2-9b-it': 'Gemma 2 9B IT',                // Fine-tuned for Instructions 🎯
  'llama-guard-3-8b': 'LLaMA Guard 3 8B',         // Security & Privacy 🔒
  'llama-3.2-3b-preview': 'LLaMA 3.2 3B Preview', // Lightweight & Backup Model 🔁
  'qwen-2.5-32b': 'Qwen 2.5 32B',                 // General Purpose Model 🛡️
};


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [patientId, setPatientId] = useState('67e15c7763ec5e8bd20d8192'); // Default patient ID
  const [userId, setUserId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [currentModel, setCurrentModel] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          patient_id: patientId,
          user_id: userId,
          history: messages
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const assistantMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentModel(data.model_used || '');
        if (!data.is_medical) {
          setError("Please ask a medical-related question.");
        }
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error:', err);
    }

    setIsLoading(false);
  };

  // Error notification component
  const ErrorNotification = ({ message }) => (
    <div className="error-notification">
      <div className="glass-morphism border-l-4 border-red-400 p-4 rounded shadow-lg">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {error && <ErrorNotification message={error} />}
      
      {/* Sidebar */}
      <div className={`sidebar ${showSettings ? 'open' : ''}`}>
        <div className="h-full glass-morphism p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Medical Assistant</h2>
            <button 
              onClick={() => setShowSettings(false)}
              className="md:hidden btn text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="settings-panel space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-lg"
                placeholder="Enter patient ID"
              />
              <p className="mt-1 text-xs text-gray-500">Default: 67e15c7763ec5e8bd20d8192</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-lg"
                placeholder="Enter doctor ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-lg"
              >
                {Object.entries(AVAILABLE_MODELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass-morphism border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Medical Chat Assistant</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Model: {AVAILABLE_MODELS[currentModel] || 'Loading...'}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="md:hidden btn p-2 rounded-lg hover:bg-gray-100"
            >
              <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-enter fade-enter-active`}
            >
              <div
                className={`message-bubble flex max-w-[80%] ${
                  message.role === 'user'
                    ? 'user-message'
                    : message.role === 'error'
                    ? 'bg-red-500 text-white'
                    : 'glass-morphism'
                } rounded-2xl px-6 py-4`}
              >
                {message.role !== 'user' && (
                  <UserCircleIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                )}
                <div className={`message-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start fade-enter fade-enter-active">
              <div className="message-bubble glass-morphism rounded-2xl px-6 py-4">
                <div className="flex items-center">
                  <UserCircleIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <div className="typing-indicator flex">
                    <div className="h-2 w-2"></div>
                    <div className="h-2 w-2"></div>
                    <div className="h-2 w-2"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass-morphism border-t p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1 px-4 py-3 rounded-xl"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="send-button px-6 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App; 