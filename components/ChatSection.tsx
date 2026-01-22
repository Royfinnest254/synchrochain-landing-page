import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Sparkles, Layers } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `You are the SynchroChain Assistant, an expert on the SynchroChain research prototype. You help visitors understand the project.

KEY FACTS ABOUT SYNCHROCHAIN:
- SynchroChain is a research prototype exploring correctness-first distributed execution
- It is NOT a blockchain or cryptocurrency - no proof-of-work, proof-of-stake, or tokens
- The "chain" refers to the hash-linked event log structure, not a distributed ledger
- Focus: Coordination before consensus, correctness over throughput

CORE PRINCIPLES:
1. At-most-once execution: Tasks never run twice. Duplicates blocked at intake.
2. Deterministic blocking: When safety cannot be verified, the system waits. No silent corruption.
3. Full audit trail: Every state transition logged immutably. Complete history reconstructable.

HOW IT WORKS:
1. Task submission through single coordination point with deduplication
2. Binary matrix assignment - each task maps to exactly one node
3. Execution with hash-chained logging (SHA-256 linked events)
4. Fault handling triggers safe-wait states, no automatic retries

TECHNICAL CAPABILITIES:
- Hash-chained logs with SHA-256 linked events
- Binary assignment matrix for single-assignment invariant
- 6 formal task states with deterministic transitions
- 12 invariants enforced always
- 3 fault modes handled safely
- 100% reconstructable from logs

PROJECT STATUS:
- Research prototype, not production-ready
- Started late 2023 by Roy Chumba
- Licensed under MIT
- Currently version 1.1 Research Preview

TONE: Be helpful, concise, and technically accurate. If asked about things outside SynchroChain, politely redirect to the project. Keep responses brief but informative.`;

export const ChatSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage },
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                    background: '#0a0a0b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-5 h-5 text-white/70" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle className="w-5 h-5 text-white/70" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 right-6 z-50 w-[360px] h-[480px] rounded-xl overflow-hidden flex flex-col"
                        style={{
                            background: '#0a0a0b',
                            border: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.04]"
                        >
                            <div className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center">
                                <Layers className="w-4 h-4 text-white/80" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium text-sm tracking-tight">SynchroChain</h3>
                                <p className="text-white/30 text-xs">Ask about the project</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white/40" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-12 h-12 mb-4 bg-white/[0.04] rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white/40" />
                                    </div>
                                    <p className="text-white/30 text-sm mb-6">
                                        Questions about SynchroChain?
                                    </p>
                                    <div className="space-y-2 w-full">
                                        {['What is SynchroChain?', 'How does it work?', 'Is this a blockchain?'].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => {
                                                    setInput(q);
                                                    inputRef.current?.focus();
                                                }}
                                                className="block w-full text-left px-4 py-2.5 text-sm text-white/50 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-all border border-white/[0.04] hover:border-white/[0.08]"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                                            ? 'bg-white/[0.08] text-white rounded-2xl rounded-br-md'
                                            : 'bg-white/[0.02] text-white/70 rounded-2xl rounded-bl-md border border-white/[0.04]'
                                        }`}>
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/[0.04]">
                            <div className="flex gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask a question..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors disabled:opacity-50"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="w-11 h-11 rounded-lg flex items-center justify-center transition-all border border-white/[0.06] hover:border-white/[0.12] disabled:opacity-30 disabled:hover:border-white/[0.06]"
                                    style={{
                                        background: input.trim() && !isLoading
                                            ? 'rgba(255,255,255,0.08)'
                                            : 'rgba(255,255,255,0.02)',
                                    }}
                                >
                                    {isLoading
                                        ? <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                                        : <Send className="w-4 h-4 text-white/60" />
                                    }
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
