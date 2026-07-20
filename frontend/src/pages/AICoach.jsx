import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, TrendingUp, HelpCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export const AICoach = () => {
  const { apiRequest } = useAuth();
  
  const [messages, setMessages] = useState([
    { 
      _id: '1', 
      sender: 'ai', 
      text: 'Hello! I am your SmartSave AI advisor. I have analyzed your transactions and goals. Ask me anything about budgeting, category caps, or goal optimization!', 
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [forecast, setForecast] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial AI advice insights and 6-month forecast
    const fetchAIContent = async () => {
      try {
        const insightsList = await apiRequest('/api/ai/insights');
        const forecastData = await apiRequest('/api/ai/forecast');
        setInsights(insightsList);
        setForecast(forecastData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAIContent();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      _id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Package messages history
      const formattedHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      })).concat({ sender: 'user', text: userMsg.text });

      const res = await apiRequest('/api/ai/chat', 'POST', { messages: formattedHistory });
      
      setMessages(prev => [...prev, {
        _id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        _id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I apologize, I encountered a temporary connection issue. Please try again shortly.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Forecast Line Chart config
  const chartLabels = forecast.map(f => f.month);
  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Optimistic Projection',
        data: forecast.map(f => f.optimistic),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 1,
      },
      {
        label: 'Expected Projection',
        data: forecast.map(f => f.expected),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: true,
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: 'Pessimistic Projection',
        data: forecast.map(f => f.pessimistic),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#a1a1aa', font: { family: 'Outfit', size: 10 } } },
      tooltip: {
        backgroundColor: '#0c0c0f',
        borderColor: '#1e1e24',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#fafafa',
        padding: 10
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } } },
      y: { grid: { color: 'rgba(113, 113, 122, 0.08)' }, ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } } }
    }
  };

  const badgeColors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-brand-emerald',
    amber: 'bg-yellow-500/10 border-yellow-500/20 text-brand-gold',
    blue: 'bg-blue-500/10 border-blue-500/20 text-brand-blue',
    purple: 'bg-purple-500/10 border-purple-500/20 text-brand-purple'
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Intelligent Advisor</span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">AI Coach</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 items-stretch">
        
        {/* Left Span: AI Insights & Projections */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.length === 0 ? (
              [1, 2, 3].map((idx) => (
                <div key={idx} className="animate-pulse p-5 rounded-2xl bg-zinc-800 border border-zinc-700/40 h-28 flex flex-col justify-between">
                  <div className="w-1/2 h-3 bg-zinc-700 rounded"></div>
                  <div className="w-full h-8 bg-zinc-700 rounded mt-2"></div>
                </div>
              ))
            ) : (
              insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${badgeColors[insight.color] || badgeColors.emerald}`}>
                      {insight.badge}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 mt-2">{insight.title}</h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 6-Month Savings Forecast chart */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-96 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">6-Month Wealth Forecast</h4>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Projected balance trajectories</p>
              </div>
              <TrendingUp size={16} className="text-brand-blue" />
            </div>
            <div className="flex-1 w-full relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right Span: Conversation Chat */}
        <div className="rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 p-6 flex flex-col h-[600px] lg:h-auto">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/30 dark:border-zinc-800/30 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-brand-purple">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold">Coach Conversation</h4>
                <span className="text-[9px] text-brand-emerald font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
                  Online
                </span>
              </div>
            </div>
            <HelpCircle size={16} className="text-zinc-500 cursor-pointer" />
          </div>

          {/* Messages lists */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4.5 p-1">
            {messages.map((m) => (
              <div 
                key={m._id}
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.sender === 'user' ? 'bg-brand-emerald text-black' : 'bg-purple-500/15 text-brand-purple'
                }`}>
                  {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-emerald text-black font-semibold rounded-tr-none'
                    : 'bg-zinc-100 dark:bg-brand-cardDark border border-zinc-200/30 dark:border-brand-borderDark/30 rounded-tl-none text-zinc-800 dark:text-zinc-200'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`block text-[8px] mt-1 text-right ${m.sender === 'user' ? 'text-emerald-950' : 'text-zinc-500'}`}>{m.time}</span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 self-start max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-brand-purple flex items-center justify-center">
                  <Bot size={14} className="animate-spin" />
                </div>
                <div className="p-3 rounded-2xl text-xs bg-brand-cardDark border border-brand-borderDark text-zinc-500 italic rounded-tl-none">
                  SmartSave is reviewing your ledger...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 pt-4 border-t border-zinc-200/20 dark:border-zinc-800/20">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about budget or saving tips..."
              className="flex-1 p-3 rounded-xl bg-zinc-100 dark:bg-brand-cardDark border border-zinc-200/30 dark:border-zinc-800/30 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading}
              className="p-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black cursor-pointer transition-all shadow-glow-green"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
