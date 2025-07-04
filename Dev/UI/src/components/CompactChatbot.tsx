import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface CompactChatbotProps {
  className?: string;
}

export const CompactChatbot: React.FC<CompactChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      content: 'Hi! I\'m here to help with your healthcare questions. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simple bot responses
    setTimeout(() => {
      let botResponse = '';
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('wait time') || lowerInput.includes('emergency')) {
        botResponse = 'Current emergency wait times: MediCare Hospital (45 min), St. Mary\'s Emergency (32 min), General Hospital ER (58 min). Would you like directions to the nearest one?';
      } else if (lowerInput.includes('appointment') || lowerInput.includes('book')) {
        botResponse = 'I can help you find available appointments. Would you like me to check our scheduling system or find walk-in clinics nearby?';
      } else if (lowerInput.includes('location') || lowerInput.includes('address')) {
        botResponse = 'I can help you find our hospital locations and provide directions. Which service are you looking for?';
      } else if (lowerInput.includes('hours') || lowerInput.includes('open')) {
        botResponse = 'Our Emergency Department is open 24/7. Regular clinic hours are 8 AM - 6 PM, Monday through Friday. How can I help you today?';
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = 'Hello! I\'m your healthcare assistant. I can help with wait times, appointments, directions, and general hospital information. What do you need help with?';
      } else {
        botResponse = 'I\'m here to help with hospital information, wait times, appointments, and directions. What would you like to know?';
      }

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Chat icon when closed
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 left-6 z-[9999] ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative animate-pulse"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        </button>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 left-6 z-[9999] ${className}`}>
        <div className="w-80 bg-white rounded-t-xl shadow-2xl border border-gray-200">
          <div className="p-3 bg-blue-500 text-white rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Healthcare Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full chat window
  return (
    <div className={`fixed bottom-6 left-6 z-[9999] ${className}`}>
      <div className="w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-3 bg-blue-500 text-white rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <div>
              <div className="font-semibold text-sm">Healthcare Assistant</div>
              <div className="text-xs text-blue-100">Online now</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-blue-600 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'bot' 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-blue-500 text-white'
              }`}>
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'bot' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};