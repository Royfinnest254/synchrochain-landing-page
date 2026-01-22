
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
                "flex items-center gap-3 text-xs font-mono mt-8 justify-center border-t border-research-border pt-6 w-full",
                "text-research-muted"
            )}
        >
            <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-research-blue"></span>
            </span>
            <span>
                Research Phase: Active
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
                            "w-full max-w-lg mx-auto transition-all duration-500 z-50 overflow-hidden relative",
                            "bg-research-panel border border-research-border rounded-none"
                        )}
                    >
                        <div className="p-10">
                            {!submitted ? (
                                <div>
                                    <div className="text-left space-y-4">
                                        <motion.h2
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -10 }}
                                            transition={{ duration: 0.5 }}
                                            className="text-2xl font-serif font-bold text-research-text"
                                        >
                                            Request Access
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: inView ? 1 : 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            className="text-sm leading-relaxed text-research-muted font-light max-w-sm"
                                        >
                                            SynchroChain is currently in closed research preview. <br />
                                            Leave your details to be notified when we expand the cohort.
                                        </motion.p>
                                    </div>

                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 10 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="flex flex-col gap-5 mt-8 relative"
                                        onSubmit={handleSubmit}
                                    >
                                        {/* Email Field */}
                                        <div className="relative w-full flex items-center group">
                                            <Mail className="absolute left-3 w-4 h-4 text-research-muted transition-colors group-focus-within:text-research-blue" />
                                            <input
                                                type="email"
                                                placeholder="academic_email@university.edu"
                                                className="flex-1 w-full bg-[#0B0C0E] border border-research-border text-research-text rounded-none py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-research-blue focus:bg-[#0f1114] transition-all duration-300 placeholder:text-gray-700 placeholder:opacity-50"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        {/* Note Field */}
                                        <div className="relative w-full group">
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-research-muted transition-colors group-focus-within:text-research-blue" />
                                                <textarea
                                                    placeholder="Research interests or affiliation (optional)..."
                                                    className="w-full bg-[#0B0C0E] border border-research-border text-research-text rounded-none py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-research-blue focus:bg-[#0f1114] transition-all duration-300 resize-none min-h-[80px] placeholder:text-gray-700 placeholder:opacity-50"
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
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "w-full py-3 px-6 rounded-none font-medium text-sm focus:outline-none transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide",
                                                !isEmailValid
                                                    ? "bg-[#0B0C0E] text-gray-700 border border-research-border cursor-not-allowed"
                                                    : "bg-research-blue text-[#0B0C0E] hover:bg-[#E2E4E8] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                                            )}
                                        >
                                            Submit Request
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
                                    className="text-left py-4"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-none flex items-center justify-center border border-research-blue text-research-blue">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-research-text">
                                            Request Recorded
                                        </h2>
                                    </div>

                                    <p className="text-sm text-research-muted leading-relaxed">
                                        We review applications manually. You will receive an email if your research profile matches our current testing phase.
                                    </p>

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
