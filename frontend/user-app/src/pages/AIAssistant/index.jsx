import React, { useState } from 'react';
import { Card, Button, Avatar } from '../../../../shared/components/Common';
import { FiSend } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

export default function AIAssistant() {
  const { products, addToCart } = useApp();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am Mahaveer AI Assistant. Ask me to find products, recommend styling, or get details!',
      products: []
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const prompts = [
    'Recommend a sofa',
    'Best dining tables',
    'Show modern tables'
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text, products: [] }]);
    setInputVal('');

    setTimeout(() => {
      let reply = "I can help with styling and selections! Try asking about 'sofas' or 'dining tables'.";
      let recommendedProducts = [];

      const normalizedText = text.toLowerCase();
      if (normalizedText.includes('sofa')) {
        reply = 'Here are our premium modern sofas that will elevate your living room comfort:';
        recommendedProducts = products.filter((p) => p.category.toLowerCase() === 'sofa').slice(0, 3);
      } else if (normalizedText.includes('dining') || normalizedText.includes('chair')) {
        reply = 'Here are some of our popular chairs and dining selections:';
        recommendedProducts = products.filter((p) => p.category.toLowerCase() === 'chair' || p.category.toLowerCase() === 'dining').slice(0, 3);
      } else if (normalizedText.includes('table')) {
        reply = 'Check out these contemporary table selections:';
        recommendedProducts = products.filter((p) => p.category.toLowerCase() === 'table').slice(0, 3);
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, products: recommendedProducts }
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-1">AI Styling Assistant</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Your personal luxury furniture expert</p>
      </div>

      <Card className="flex flex-col h-[550px] p-0 overflow-hidden bg-white border border-gray-100 shadow-premium">
        {/* Chat Messages Log */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-5 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar name={msg.sender === 'user' ? 'Me' : 'AI'} size="sm" />
              <div className="flex flex-col gap-2 max-w-[75%]">
                <div
                  className={`p-3.5 rounded-large text-sm font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Recommendations Carousel */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin pt-2">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="w-48 bg-white border border-gray-150 rounded-large overflow-hidden shadow-sm flex-shrink-0 flex flex-col justify-between"
                      >
                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex-grow flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-xs text-gray-800 truncate">{prod.name}</h5>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mt-0.5">{prod.category}</span>
                            <div className="text-xs font-extrabold text-gray-900 mt-1">₹{prod.price.toLocaleString()}</div>
                          </div>
                          <Button
                            onClick={() => {
                              addToCart(prod, 1);
                              toast.success(`Added ${prod.name} to cart`);
                            }}
                            size="sm"
                            className="w-full text-[10px] py-1.5 mt-2.5"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Prompts */}
        <div className="px-4 py-3 bg-white flex gap-2 flex-wrap border-t border-gray-100">
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-xs bg-gray-50 border border-gray-200 hover:border-primary hover:text-primary transition-all px-3.5 py-1.5 rounded-full text-gray-600 font-bold shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
          <input
            type="text"
            placeholder="Ask AI Assistant about products..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 font-medium"
          />
          <Button onClick={() => handleSend(inputVal)}>
            <FiSend size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}