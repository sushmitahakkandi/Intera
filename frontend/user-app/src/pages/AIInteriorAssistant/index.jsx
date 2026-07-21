import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare, FiSave, FiClock, FiTrash2, FiDownload,
  FiZap, FiRefreshCw, FiPlus, FiChevronRight, FiArrowLeft
} from 'react-icons/fi';
import AIChat from '../../components/AI/AIChat';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROOM_BUNDLES = [
  { key: 'Living Room', label: '🛋️ Living Room', budget: 120000 },
  { key: 'Bedroom', label: '🛏️ Bedroom', budget: 90000 },
  { key: 'Dining Room', label: '🍽️ Dining Room', budget: 80000 },
  { key: 'Office', label: '💼 Office', budget: 60000 },
];

const SUGGESTED_QUESTIONS = [
  'Recommend sofas for a modern living room',
  'Create a bedroom bundle for ₹90,000',
  'Compare your top 2 dining tables',
  'What furniture suits walnut flooring?',
];

export default function AIInteriorAssistant() {
  const { user, token, cartItems, wishlistItems } = useApp();

  // Chat State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Session History State
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Auth Headers
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch session history for logged-in users
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/api/assistant/sessions`, {
        headers: authHeaders
      });
      setSessionHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load session history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Send message to backend
  const handleSendMessage = async (messageData) => {
    if (!messageData.text && !messageData.image) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message immediately
    const userMsg = { sender: 'user', text: messageData.text, image: messageData.image || null, timestamp };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/assistant/chat`,
        {
          message: messageData.text,
          sessionId,
          cartItems: cartItems.map(c => ({ id: c.id, name: c.name, price: c.price })),
          wishlistItems: wishlistItems.map(w => ({ id: w.id, name: w.name }))
        },
        { headers: authHeaders }
      );

      const { reply, suggestedProducts: products, explainableAI: scores, comparisonTable, budgetPackage, session } = res.data;

      // Save session ID for continuity
      if (session?._id) setSessionId(session._id);

      // Build AI message object
      const aiMsg = {
        sender: 'ai',
        text: reply || 'I have updated your recommendations below.',
        timestamp,
        products: products || [],
        explainableAI: scores || {},
        comparisonTable: comparisonTable || null,
        budgetPackage: budgetPackage || null
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Assistant chat error:', err);
      const errMsg = {
        sender: 'ai',
        text: 'I apologize — I encountered an issue processing your request. Please try again in a moment.',
        timestamp
      };
      setMessages(prev => [...prev, errMsg]);
      toast.error('Failed to reach the AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save current session
  const handleSaveSession = async () => {
    if (!sessionId) {
      toast.error('No active session to save. Start a conversation first.');
      return;
    }
    toast.success('Session saved to your profile!');
    fetchHistory();
  };

  // Delete a saved session
  const handleDeleteSession = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/assistant/sessions/${id}`, { headers: authHeaders });
      setSessionHistory(prev => prev.filter(s => s._id !== id));
      if (sessionId === id) {
        setMessages([]);
        setSessionId(null);
      }
      toast.success('Session removed.');
    } catch {
      toast.error('Could not delete session.');
    }
  };

  // Restore a previous session
  const handleRestoreSession = (sess) => {
    setMessages(sess.messages.map(m => ({
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
      products: m.products || [],
      explainableAI: m.confidenceScores || {},
      comparisonTable: m.comparisonTable || null,
      budgetPackage: m.budgetPackage || null
    })));
    setSessionId(sess._id);
    toast.success('Previous session restored!');
  };

  // Export chat as text file
  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error('No chat history to export.');
      return;
    }
    const chatText = messages.map(m =>
      `[${m.timestamp}] ${m.sender === 'ai' ? 'Assistant' : 'You'}: ${m.text}`
    ).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahaveer-consultation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat transcript downloaded!');
  };

  // Start a new session
  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    toast.success('New conversation started.');
  };

  // Fire a smart bundle query
  const handleBundleQuery = (bundle) => {
    handleSendMessage({
      text: `Create a complete ${bundle.key} furniture bundle within ₹${bundle.budget.toLocaleString('en-IN')} budget`
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* Sidebar - Left Section */}
      <div className="w-80 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800 flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <FiMessageSquare className="text-primary text-base" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-white uppercase">Virtual Concierge</h2>
            <p className="text-[10px] text-gray-400 font-bold">Mahaveer Smart Studio</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="px-4 py-2.5 bg-gray-950/40 border-b border-gray-800 flex items-center">
          <Link
            to="/ai-decor"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors py-1.5 px-2.5 rounded hover:bg-gray-800/40 w-full"
          >
            <FiArrowLeft size={13} className="text-primary" /> Back to Command Center
          </Link>
        </div>

        {/* Sidebar Action: New Chat */}
        <div className="p-4">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 px-4 rounded-large transition-all duration-200 shadow-md hover:scale-[1.01]"
          >
            <FiPlus size={14} /> New Consultation
          </button>
        </div>

        {/* Sidebar Scrollable Section */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-800" data-lenis-prevent>
          
          {/* Quick Room Packages */}
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2 px-1">
              Quick Room Budgets
            </span>
            <div className="space-y-1.5">
              {ROOM_BUNDLES.map((bundle) => (
                <button
                  key={bundle.key}
                  onClick={() => handleBundleQuery(bundle)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-300 hover:text-white bg-gray-800/40 hover:bg-gray-800/80 p-2.5 rounded-large transition-all border border-gray-800/50"
                >
                  <span>{bundle.label}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                    <span>₹{(bundle.budget / 1000)}k</span>
                    <FiChevronRight size={10} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Consultation History */}
          {token && (
            <div>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2 px-1 flex items-center gap-1.5">
                <FiClock size={11} className="text-primary" /> Recent consultations
              </span>
              <div className="space-y-1">
                {loadingHistory ? (
                  <p className="text-[11px] text-gray-500 font-semibold p-2 text-center">Loading history...</p>
                ) : sessionHistory.length === 0 ? (
                  <p className="text-[11px] text-gray-500 font-semibold p-2 text-center">No saved chats.</p>
                ) : (
                  sessionHistory.map(sess => {
                    const isActive = sess._id === sessionId;
                    return (
                      <div
                        key={sess._id}
                        className={`flex items-center justify-between p-2 rounded-large group transition-all ${
                          isActive
                            ? 'bg-gray-800 text-white border border-gray-700'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                        }`}
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer py-1"
                          onClick={() => handleRestoreSession(sess)}
                        >
                          <p className="text-xs font-bold truncate pr-2">{sess.title || 'Saved Chat'}</p>
                          <p className="text-[9px] text-gray-500 font-semibold mt-0.5">
                            {sess.messages.length} msgs · {new Date(sess.updatedAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(sess._id)}
                          className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 text-center flex-shrink-0">
          <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">
            Mahaveer Furniture Hub
          </p>
        </div>

      </div>

      {/* Main Chat Panel - Right Section */}
      <div className="flex-1 flex flex-col h-full bg-[#FCFCFC] overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            {sessionId ? (
              <span className="text-[10px] text-gray-400 font-bold bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                Session: {sessionId.slice(-8).toUpperCase()}
              </span>
            ) : (
              <span className="text-[10px] text-primary font-bold bg-primary-light/10 border border-primary-light/20 px-2 py-0.5 rounded">
                New consultation
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSession}
              className="flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold py-1.5 px-3 rounded-large transition-all"
              title="Save current chat session"
            >
              <FiSave size={12} /> Save
            </button>
            <button
              onClick={handleExportChat}
              className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary text-xs font-bold py-1.5 px-3 rounded-large transition-all"
              title="Download chat transcript"
            >
              <FiDownload size={12} /> Export
            </button>
          </div>
        </div>

        {/* Full-Height Chat Component */}
        <div className="flex-1 overflow-hidden relative">
          <AIChat
            messages={messages}
            onSendMessage={handleSendMessage}
            suggestedQuestions={SUGGESTED_QUESTIONS}
            user={user}
            isLoading={isLoading}
          />
        </div>

      </div>

    </div>
  );
}
