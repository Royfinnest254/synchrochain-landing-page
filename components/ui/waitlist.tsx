
"use client"
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { InView } from 'react-intersection-observer';
import { Check, ArrowRight, Mail, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

type Mode = 'light' | 'dark';

interface Props {
    mode?: Mode;
}

// Honest Status Component (Static)
const StatusIndicator = ({ mode }: { mode: Mode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex items-center gap-2 text-xs font-mono mt-6 justify-center",
                mode === 'dark' ? "text-slate-500" : "text-gray-500"
            )}
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={cn("font-medium", mode === 'dark' ? "text-slate-400" : "text-gray-600")}>
                Accepting researchers
            </span>
        </motion.div>
    );
};

export const Waitlist = ({ mode = 'dark' }: Props) => {
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isNoteFocused, setIsNoteFocused] = useState(false);

    // Formspree Integration
    const FORMSPREE_ID = "mlgeynng";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (email.trim() === '' || !email.includes('@')) {
            return;
        }

        try {
            // Submit to Formspree
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    message: note
                })
            });

            if (response.ok) {
                setSubmitted(true);
                setEmail('');
                setNote('');
            } else {
                console.error("Submission failed");
                alert("Something went wrong. Please check the connection.");
            }
        } catch (error) {
            console.error("Network error", error);
            alert("Network error. Please try again.");
        }
    };

    const isEmailValid = email.trim() !== '' && email.includes('@');

    return (
        <div className="flex justify-center items-center w-full py-10">
            <InView triggerOnce threshold={0.5}>
                {({ inView, ref }) => (
                    <div
                        ref={ref}
                        className={cn(
                            "w-full max-w-md mx-auto rounded-2xl transition-all duration-500 z-50 overflow-hidden relative",
                            mode === 'dark'
                                ? 'bg-[#0B0F14]/80 border border-white/10 shadow-2xl shadow-sky-900/10 backdrop-blur-md'
                                : 'bg-white shadow-xl'
                        )}
                    >
                        {/* Background Glow Effect */}
                        {mode === 'dark' && (
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        )}

                        <div className={submitted ? 'p-8' : 'p-8'}>
                            {!submitted ? (
                                <div>
                                    <div className="text-center space-y-3">
                                        <motion.h2
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -10 }}
                                            transition={{ duration: 0.5 }}
                                            className={cn(
                                                "text-2xl md:text-3xl font-bold tracking-tight",
                                                mode === 'dark' ? 'text-white' : 'text-gray-900'
                                            )}
                                        >
                                            Join the Waitlist
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: inView ? 1 : 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            className={cn(
                                                "text-sm leading-relaxed",
                                                mode === 'dark' ? 'text-slate-400' : 'text-gray-500'
                                            )}
                                        >
                                            Be the first to validate the future of deterministic coordination. <br />
                                            Enter your email to get early access.
                                        </motion.p>
                                    </div>

                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 10 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="flex flex-col gap-4 mt-8 relative"
                                        onSubmit={handleSubmit}
                                    >
                                        {/* Email Field */}
                                        <div className="relative w-full flex items-center">
                                            <Mail className={cn("absolute left-3 w-4 h-4", mode === 'dark' ? "text-slate-500" : "text-gray-400")} />
                                            <input
                                                type="email"
                                                placeholder="researcher@synchrochain.io"
                                                className={cn(
                                                    "flex-1 w-full rounded-lg py-3 pl-10 pr-4 text-sm leading-tight focus:outline-none transition-all border",
                                                    mode === 'dark'
                                                        ? "bg-[#11161d] border-white/10 text-white placeholder:text-slate-600 focus:border-sky-500/50"
                                                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500/50"
                                                )}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        {/* Note Field */}
                                        <div className="relative w-full">
                                            <div className="relative">
                                                <MessageSquare className={cn("absolute left-3 top-3 w-4 h-4", mode === 'dark' ? "text-slate-500" : "text-gray-400")} />
                                                <textarea
                                                    placeholder="Add a note or insight (optional)..."
                                                    className={cn(
                                                        "w-full rounded-lg py-3 pl-10 pr-4 text-sm leading-tight focus:outline-none transition-all border resize-none min-h-[80px]",
                                                        mode === 'dark'
                                                            ? "bg-[#11161d] border-white/10 text-white placeholder:text-slate-600 focus:border-sky-500/50"
                                                            : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500/50"
                                                    )}
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    onFocus={() => setIsNoteFocused(true)}
                                                    onBlur={() => setIsNoteFocused(false)}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={!isEmailValid}
                                            whileHover={isEmailValid ? { scale: 1.01 } : {}}
                                            whileTap={isEmailValid ? { scale: 0.99 } : {}}
                                            className={cn(
                                                "w-full py-3 px-6 rounded-lg font-bold text-sm focus:outline-none transition-all flex items-center justify-center gap-2",
                                                !isEmailValid
                                                    ? (mode === 'dark' ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed" : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed")
                                                    : (mode === 'dark' ? "bg-sky-600 text-white border border-sky-500 hover:bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-black text-white hover:bg-gray-800 border-black")
                                            )}
                                        >
                                            Join Waitlist <ArrowRight className="w-3 h-3" />
                                        </motion.button>
                                    </motion.form>

                                    {/* Status Indicator */}
                                    <StatusIndicator mode={mode} />
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-center py-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                        className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl",
                                            mode === 'dark' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-green-100 text-green-600"
                                        )}
                                    >
                                        <Check className="w-8 h-8" strokeWidth={3} />
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={cn(
                                            "text-xl font-bold mb-3",
                                            mode === 'dark' ? 'text-white' : 'text-gray-900'
                                        )}
                                    >
                                        You're on the list.
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className={cn(
                                            "text-sm",
                                            mode === 'dark' ? 'text-slate-400' : 'text-gray-500'
                                        )}
                                    >
                                        We'll notify you when the protocol is ready for testing.
                                    </motion.p>

                                    {/* Show status even after success */}
                                    <div className="mt-8 opacity-50">
                                        <StatusIndicator mode={mode} />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </InView>
        </div>
    );
};
