
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const WaitlistSection = () => {
    const [email, setEmail] = useState('');
    const [insight, setInsight] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Formspree ID placeholder - User to replace this
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/FORM_ID";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    insight
                })
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                // Fallback for demo/dev if endpoint is invalid (404)
                // In production with real ID, this would trigger error handling
                // For this task, we assume the user will replace the ID.
                // However, if the user tests without replacing, we might want to simulate success?
                // The prompt says: "The solution must work immediately after: Replacing FORM_ID..."
                // So I'll just check valid response.
                // Actually, if it fails, I should validly show error or maybe simulate success for "demo" purpose?
                // Prompt says "Assume a Formspree endpoint... Form submits via POST".
                // If I use a fake ID, it returns 404.
                // I will strictly follow logic.
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mock avatars for social proof
    const avatars = [
        { bg: 'bg-emerald-500', initial: 'AK' },
        { bg: 'bg-blue-500', initial: 'RS' },
        { bg: 'bg-purple-500', initial: 'DL' },
        { bg: 'bg-amber-500', initial: 'MJ' },
        { bg: 'bg-rose-500', initial: 'TV' },
    ];

    return (
        <section className="bg-[#0B0F14] py-24 px-6 relative border-t border-white/5">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Join the SynchroChain Waitlist
                    </h2>
                    <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                        We are building an early-stage research system for deterministic coordination.
                        Join us to validate the future of robust distributed systems.
                    </p>
                </div>

                {/* Form Area */}
                <div className="bg-[#11161d] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleSubmit}
                                className="space-y-6 relative z-10"
                            >
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-slate-300 uppercase tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="researcher@institute.edu"
                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-sky-500/50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="insight" className="text-sm font-bold text-slate-300 uppercase tracking-wider">Early Insight <span className="text-slate-500 normal-case font-normal">(Optional)</span></label>
                                    <textarea
                                        id="insight"
                                        placeholder="What interests you about deterministic coordination?"
                                        className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        value={insight}
                                        onChange={(e) => setInsight(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <div className="text-rose-400 text-sm bg-rose-900/10 border border-rose-500/20 p-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-6 text-lg tracking-wide uppercase shadow-lg shadow-sky-900/20"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                        </span>
                                    ) : (
                                        "Join Waitlist"
                                    )}
                                </Button>

                                <p className="text-center text-xs text-slate-600">
                                    No spam. No tracking. Pure research updates.
                                </p>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-10 space-y-6"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Request Received</h3>
                                    <p className="text-slate-400 max-w-md mx-auto">
                                        You’re on the waitlist. We’ll notify you as SynchroChain progresses.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Traction & Social Proof */}
                <div className="mt-10 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center -space-x-3">
                        {avatars.map((avatar, i) => (
                            <div
                                key={i}
                                className={`w-10 h-10 rounded-full border-2 border-[#0B0F14] flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${avatar.bg}`}
                            >
                                {avatar.initial}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-[#0B0F14] bg-[#1c232d] flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-lg">
                            +12
                        </div>
                    </div>
                    <div className="text-center px-4 py-2 bg-[#11161d] border border-white/5 rounded-full">
                        <p className="text-sm font-semibold text-slate-300">
                            <span className="text-sky-400 font-bold">20+ people</span> have joined the SynchroChain waitlist
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};
