import React, { useRef, useEffect, useState, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import { FiSend, FiMic, FiMicOff, FiPaperclip, FiX, FiZap, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ACTIONS = [
  { label: '🛋️ Sofa recommendations', text: 'Recommend the best sofa for a modern living room' },
  { label: '💰 Budget ₹80k plan', text: 'Create a complete living room furniture plan within ₹80000 budget' },
  { label: '🔄 Compare sofas', text: 'Compare the top 2 sofas in your catalog' },
  { label: '🎨 Color advice', text: 'What furniture colors complement warm beige walls?' },
  { label: '📦 Bedroom bundle', text: 'Create a complete bedroom furniture bundle for me' },
  { label: '🚚 Delivery info', text: 'What are the delivery timelines and policies?' },
];

export default function AIChat({ messages = [], onSendMessage, suggestedQuestions = [], user, isLoading = false }) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Hide quick actions once conversation starts
  useEffect(() => {
    if (messages.length > 1) setShowQuickActions(false);
  }, [messages.length]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;
    onSendMessage({ text: inputText, image: selectedImage?.preview || null });
    setInputText('');
    setSelectedImage(null);
    setShowQuickActions(false);
  };

  const handleQuickAction = (text) => {
    onSendMessage({ text });
    setShowQuickActions(false);
  };

  const handleImageAttach = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Chat header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
          <h3 className="font-bold text-gray-800 text-sm">Interior Assistant AI</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] text-primary font-bold flex items-center gap-1">
              <FiLoader size={10} className="animate-spin" /> Thinking...
            </span>
          )}
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest bg-white border border-gray-100 px-2.5 py-1 rounded-full">
            Active Session
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20" data-lenis-prevent>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm font-bold text-gray-400 mb-6">
              Ask anything about styling, spacing, budget, or furniture!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(q)}
                  className="bg-white border border-gray-200 hover:border-primary text-gray-600 hover:text-primary text-xs font-semibold py-3 px-4 rounded-large text-left transition-all duration-200 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-4">
            {messages.map((msg, index) => (
              <ChatBubble key={index} message={msg} userName={user?.name || 'Customer'} />
            ))}

            {/* Typing / Loading Indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-[10px] font-extrabold">AI</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-large rounded-tl-none shadow-premium px-5 py-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Quick Action Pills */}
      <AnimatePresence>
        {showQuickActions && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-gray-50 bg-white flex-shrink-0"
          >
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-1 mb-1.5">
                <FiZap size={10} className="text-primary" />
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Quick Actions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.text)}
                    className="text-[10px] font-semibold text-gray-600 bg-gray-50 hover:bg-primary hover:text-white border border-gray-100 hover:border-primary px-2.5 py-1 rounded-full transition-all duration-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached image preview */}
      {selectedImage && (
        <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedImage.preview} alt="Attached Preview" className="w-10 h-10 object-cover rounded border border-gray-200" />
              <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{selectedImage.file.name}</span>
            </div>
            <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageAttach}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary-light/30 rounded-large transition-colors flex-shrink-0"
            title="Attach Room Image"
          >
            <FiPaperclip size={18} />
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-large transition-colors flex-shrink-0 ${
              isListening
                ? 'bg-red-50 text-red-500 animate-pulse'
                : 'text-gray-400 hover:text-primary hover:bg-primary-light/30'
            }`}
            title={isListening ? 'Stop Listening' : 'Voice Input'}
          >
            {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? '🎙️ Listening...' : 'Ask a question...'}
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-transparent focus:ring-2 focus:ring-primary rounded-large py-2.5 px-4 text-xs font-semibold focus:outline-none transition-all duration-200 focus:bg-white"
            disabled={isListening}
          />

          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="p-3 bg-primary hover:bg-primary-hover text-white rounded-large transition-colors shadow-md hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? <FiLoader size={16} className="animate-spin" /> : <FiSend size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
