import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, Leaf } from 'lucide-react';

const PUBLIC_QUESTIONS = [
  { q: 'How do I register?', a: 'Click "Get Started & Register" on the home page. You\'ll complete a 3-step process: Personal Details, Address, and Government ID verification. After submission, an admin reviews and approves your account.' },
  { q: 'How do I login?', a: 'Click "User Login" in the top navigation or use the link at the bottom of the registration page. Enter your username/email and the password you received via email after admin approval.' },
  { q: 'What is EcoTrack?', a: 'EcoTrack is a Carbon Footprint Monitoring and Sustainability Analytics platform. It helps individuals and organizations track daily activities, calculate carbon emissions, set reduction goals, and receive personalized recommendations.' },
  { q: 'What is a carbon footprint?', a: 'A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) produced by human activities. It\'s measured in kg of CO2 equivalent (CO2e) and includes transport, electricity usage, food, and shopping.' },
  { q: 'How does EcoTrack calculate emissions?', a: 'EcoTrack uses emission factors tied to specific activity types. When you log an activity (e.g., driving 10 km), it multiplies the quantity by the emission factor for that activity type to calculate CO2e in kg.' },
  { q: 'What can I track in EcoTrack?', a: 'You can track activities across 4 categories: Transport (car, bus, bike, metro, flights), Electricity (grid, solar, generator), Food (veg, chicken, beef, vegan meals), and Shopping (electronics, clothes, furniture).' },
  { q: 'How can I reduce my carbon footprint?', a: 'Use public transport or cycle, reduce electricity consumption, choose plant-based meals more often, buy only what you need, and track your progress with EcoTrack goals and recommendations.' },
  { q: 'How do I contact support?', a: 'Reach out to the admin through the admin portal or email the system administrator for account-related issues including registration approval, password resets, or general queries.' },
];

const USER_QUESTIONS = [
  { q: 'How do I log a daily activity?', a: 'Go to "Log Daily Activity" from the sidebar. Select the category, activity type, enter the quantity and date, then save. Your emission is calculated automatically using the emission factor.' },
  { q: 'How is my carbon emission calculated?', a: 'Emission = Quantity × Emission Factor. For example, driving 10 km in a car with a factor of 0.21 kg/km produces 2.1 kg CO2e. Emission factors are maintained by the admin based on scientific data.' },
  { q: 'What are Categories?', a: 'Categories group related activities: Transport, Electricity, Food, and Shopping. Each category has multiple activity types and admin-set emission limits for monitoring high-emission behavior.' },
  { q: 'What are Activity Types?', a: 'Activity types are specific actions within a category. For example, under Transport: Car, Bus, Bike, Metro, Flight. Each has its own emission factor used to calculate your carbon output.' },
  { q: 'What is an Emission Factor?', a: 'An emission factor is a coefficient that converts activity data (e.g., km driven, kWh consumed) into greenhouse gas emissions (kg CO2e). It represents the environmental impact per unit of activity.' },
  { q: 'How do I check my Activity History?', a: 'Click "Activity History" in the sidebar. You can see all your logged activities with dates, categories, quantities, emission factors, and calculated carbon output. Use filters to narrow results.' },
  { q: 'What are Recommendations?', a: 'Recommendations are personalized suggestions based on your highest-emission categories. They provide actionable steps like using public transport, reducing food waste, or switching to energy-efficient appliances.' },
  { q: 'How do Goals & Targets work?', a: 'Set a monthly carbon emission target in "Goals & Targets". EcoTrack tracks your progress with a visual bar and status: ON TRACK, NEAR LIMIT, or TARGET EXCEEDED. You receive alerts when limits are breached.' },
  { q: 'What does my monthly target mean?', a: 'Your monthly target is the maximum CO2e (in kg) you aim to emit per month. If your total emissions stay below it, you\'re ON TRACK. If they exceed it, you receive an alert to review your activities.' },
  { q: 'Why did I receive an alert?', a: 'Alerts are generated when: (1) Your total monthly emissions exceed your personal target, or (2) A specific category exceeds the admin-set emission limit. Alerts appear as toasts and in Alert History.' },
  { q: 'How can I reduce my carbon footprint?', a: 'Use public transport or cycling, switch off unused appliances, choose plant-based meals, reduce food waste, reuse products, and plan purchases. Track your progress with EcoTrack goals and recommendations.' },
  { q: 'What are Articles?', a: 'Articles contain sustainability tips, environmental news, and educational content curated by admins. Browse them in the "Articles" section to learn more about reducing your environmental impact.' },
  { q: 'How do I view my reports?', a: 'Go to "Reports & Analytics" in the sidebar. You\'ll see detailed charts: daily/monthly/yearly trends, category breakdowns, sustainability score, tracking streak, and a CSV export option.' },
  { q: 'How can I update my profile?', a: 'Click "My Profile" in the sidebar. You can view your personal details and upload or change your profile photo. For other profile changes, contact the admin.' },
];

const ADMIN_QUESTIONS = [
  { q: 'How do I manage Categories?', a: 'Go to "Activity Categories" in the sidebar. You can create new categories with names, codes, and descriptions, or edit/deactivate existing ones. Categories organize activity types.' },
  { q: 'How do I add an Activity Type?', a: 'Navigate to "Activity Types" and click Add. Select the parent category, enter the activity name and unit (e.g., km, kWh, meals), and save. Each activity type needs an emission factor to be useful.' },
  { q: 'How do I manage Emission Factors?', a: 'Go to "Emission Factors" in the sidebar. Assign emission factors (kg CO2e per unit) to each activity type. These factors are used to calculate user emissions when they log activities.' },
  { q: 'How do I create an Article?', a: 'Navigate to "Articles" and click the create button. Enter the title, content, author, and cover image. Articles start as DRAFT and can be published when ready.' },
  { q: 'How do I publish an Article?', a: 'In "Articles", find the article you want to publish. Click the publish action to change its status from DRAFT to PUBLISHED. Published articles are visible to all users.' },
  { q: 'How do I hide an Article?', a: 'In "Articles", find the published article and change its status to HIDDEN. Hidden articles are no longer visible to users but remain in the system.' },
  { q: 'How do Alerts work?', a: 'Alerts are auto-generated when: (1) A user\'s category emissions exceed the admin-set emission limit, or (2) A user\'s total emissions exceed their personal monthly goal. They appear as real-time toasts.' },
  { q: 'How are user emissions calculated?', a: 'When a user logs an activity, the system multiplies the quantity by the emission factor assigned to that activity type. The result is the CO2e emission in kg for that activity.' },
  { q: 'What can I manage from the Admin Dashboard?', a: 'The Admin Dashboard provides: user management (approve/reject registrations), category management, activity type management, emission factor configuration, emission limits, article management, and activity log monitoring.' },
];

function MessageBubble({ msg, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-emerald-600 text-white rounded-br-md'
          : 'bg-slate-700/80 text-slate-200 rounded-bl-md'
      }`}>
        {msg}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const questions = user ? (isAdmin() ? ADMIN_QUESTIONS : USER_QUESTIONS) : PUBLIC_QUESTIONS;

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user
        ? `Hello ${user.firstName || 'there'}! I'm the EcoTrack Assistant. How can I help you today?`
        : "Hello! I'm the EcoTrack Assistant. How can I help you today?";
      setMessages([{ text: greeting, isUser: false }]);
    }
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages when user logs in/out so greeting updates
  useEffect(() => {
    setMessages([]);
  }, [user]);

  const handleQuestion = (question) => {
    setMessages(prev => [...prev, { text: question.q, isUser: true }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: question.a, isUser: false }]);
    }, 300);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    setMessages(prev => [...prev, { text: trimmed, isUser: true }]);

    // Simple keyword matching for free-form input
    const lower = trimmed.toLowerCase();
    const match = questions.find(q =>
      q.q.toLowerCase().includes(lower) ||
      lower.includes(q.q.toLowerCase().replace('?', '').replace('how do i ', '').replace('what is ', '').replace('what are ', ''))
    );
    setTimeout(() => {
      if (match) {
        setMessages(prev => [...prev, { text: match.a, isUser: false }]);
      } else {
        setMessages(prev => [...prev, {
          text: "I'm not sure about that specific question. Try one of the predefined questions below, or check the relevant section in the app for detailed information.",
          isUser: false
        }]);
      }
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[9999] w-[360px] max-w-[calc(100vw-2.5rem)] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
          style={{ maxHeight: 'min(520px, calc(100vh - 140px))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-white" />
              <span className="font-bold text-white text-sm">EcoTrack Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-emerald-700 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ minHeight: '200px', maxHeight: '300px' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg.text} isUser={msg.isUser} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined Questions */}
          <div className="border-t border-slate-700 px-4 py-2.5" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Quick Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.slice(0, 6).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(q)}
                  className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500 hover:bg-emerald-950/50 hover:text-emerald-300 transition-colors text-left"
                >
                  {q.q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-xl bg-emerald-600 p-2.5 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          open
            ? 'bg-slate-700 hover:bg-slate-600 rotate-0'
            : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 shadow-emerald-900/40'
        }`}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
}
