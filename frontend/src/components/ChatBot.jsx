import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronDown } from 'lucide-react';

// FAQ knowledge base for dialysis-related questions
const FAQ_DATA = [
    {
        keywords: ['appointment', 'schedule', 'book'],
        question: 'How do I schedule an appointment?',
        answer: 'To schedule a dialysis appointment, contact the reception desk or ask your doctor during your next visit. Staff members can schedule appointments through the system dashboard.'
    },
    {
        keywords: ['dialysis', 'what', 'procedure'],
        question: 'What is dialysis?',
        answer: 'Dialysis is a treatment that filters waste and excess fluids from your blood when your kidneys can no longer do so. Our center offers hemodialysis sessions with state-of-the-art machines.'
    },
    {
        keywords: ['prepare', 'before', 'session'],
        question: 'How should I prepare for a session?',
        answer: 'Before your dialysis session: eat a light meal, wear comfortable clothing with easy arm access, bring any medications, and arrive 10 minutes early for check-in.'
    },
    {
        keywords: ['how long', 'duration', 'session length', 'hours'],
        question: 'How long does a dialysis session take?',
        answer: 'A typical hemodialysis session takes 3-4 hours. Your doctor will determine the exact duration based on your medical needs.'
    },
    {
        keywords: ['queue', 'wait', 'turn', 'line'],
        question: 'How does the queue system work?',
        answer: 'Our queue management system assigns you a position based on check-in time and priority. Emergency cases are prioritized. You can view your position in the Patient Portal.'
    },
    {
        keywords: ['bill', 'payment', 'cost', 'charge', 'insurance'],
        question: 'How do I view my bills?',
        answer: 'Go to the Billing section in your Patient Portal to view current and past bills. You can make payments online via UPI or at the reception desk.'
    },
    {
        keywords: ['ambulance', 'transport', 'pickup', 'ride'],
        question: 'Can I request an ambulance?',
        answer: 'Yes! Contact the reception desk to request ambulance transport. Our fleet management system will dispatch the nearest available ambulance and you can track it in real-time via the Patient Portal.'
    },
    {
        keywords: ['report', 'results', 'lab'],
        question: 'Where can I find my reports?',
        answer: 'Your medical reports and lab results are available in the Reports section of your Patient Portal. You can view and download them anytime.'
    },
    {
        keywords: ['emergency', 'urgent', 'help'],
        question: 'What do I do in an emergency?',
        answer: 'In an emergency, immediately alert the nearest staff member or call the hospital emergency line. Emergency cases are given top priority in our queue system.'
    },
    {
        keywords: ['password', 'login', 'account', '2fa', 'two factor'],
        question: 'How do I manage my account?',
        answer: 'You can reset your password from the login page. For staff accounts, Two-Factor Authentication (2FA) is mandatory for security. Contact the admin if you need account assistance.'
    },
    {
        keywords: ['contact', 'phone', 'email', 'reach'],
        question: 'How can I contact the hospital?',
        answer: 'You can reach us at reception@dialysis.com or call during business hours. For urgent matters, visit the reception desk directly.'
    },
    {
        keywords: ['machine', 'equipment'],
        question: 'What machines do you use?',
        answer: 'We use modern hemodialysis machines that are regularly maintained and sanitized. Machine status and availability can be viewed by authorized staff through the system.'
    }
];

const findAnswer = (input) => {
    const lower = input.toLowerCase();

    // Check for greetings
    if (/^(hi|hello|hey|good morning|good evening)/i.test(lower)) {
        return "Hello! I'm your DialysisTrack assistant. How can I help you today? You can ask me about appointments, billing, ambulance services, or anything related to your care.";
    }

    if (/^(thanks|thank you|ty)/i.test(lower)) {
        return "You're welcome! Feel free to ask if you have any more questions.";
    }

    if (/^(bye|goodbye)/i.test(lower)) {
        return "Goodbye! Take care and don't hesitate to reach out if you need anything.";
    }

    // Find best matching FAQ
    let bestMatch = null;
    let bestScore = 0;

    for (const faq of FAQ_DATA) {
        let score = 0;
        for (const keyword of faq.keywords) {
            if (lower.includes(keyword)) {
                score += keyword.length; // Longer keyword matches score higher
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
        }
    }

    if (bestMatch && bestScore > 0) {
        return bestMatch.answer;
    }

    return "I'm not sure about that. Here are some topics I can help with:\n• Appointments & scheduling\n• Dialysis procedures\n• Billing & payments\n• Ambulance services\n• Queue management\n• Medical reports\n\nPlease try rephrasing your question or contact the front desk for more help.";
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hi! I'm your DialysisTrack assistant. How can I help you today?",
            time: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;

        // Add user message
        const userMsg = { id: Date.now(), type: 'user', text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simulate typing delay
        setTimeout(() => {
            const answer = findAnswer(text);
            const botMsg = { id: Date.now() + 1, type: 'bot', text: answer, time: new Date() };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = [
        'How do I schedule an appointment?',
        'How does the queue work?',
        'Can I request an ambulance?',
        'Where can I find my reports?'
    ];

    return (
        <>
            {/* FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 group"
                    title="Chat with us"
                >
                    <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    {/* Pulse ring */}
                    <span className="absolute -inset-1 rounded-full bg-cyan-400 opacity-30 animate-ping" />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">DialysisTrack Assistant</h3>
                                <p className="text-cyan-100 text-xs">Online — Ask me anything</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-950">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end gap-1.5 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {msg.type === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.type === 'user'
                                        ? 'bg-cyan-500 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />

                        {/* Quick questions (show only at the start) */}
                        {messages.length <= 1 && (
                            <div className="space-y-2 mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick questions:</p>
                                {quickQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setInputValue(q);
                                            setTimeout(() => {
                                                const userMsg = { id: Date.now(), type: 'user', text: q, time: new Date() };
                                                setMessages(prev => [...prev, userMsg]);
                                                setTimeout(() => {
                                                    const answer = findAnswer(q);
                                                    const botMsg = { id: Date.now() + 1, type: 'bot', text: answer, time: new Date() };
                                                    setMessages(prev => [...prev, botMsg]);
                                                }, 600);
                                            }, 100);
                                            setInputValue('');
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="w-9 h-9 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <style>{`
            @keyframes animate-in {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-in { animation: animate-in 0.3s ease-out; }
          `}</style>
                </div>
            )}
        </>
    );
};

export default ChatBot;
