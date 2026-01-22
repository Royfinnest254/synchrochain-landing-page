import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Loader2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const WaitlistSection = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [interest, setInterest] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
    const [isCountLoading, setIsCountLoading] = useState(true);

    // Fetch initial count and subscribe to real-time updates
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('waitlist')
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.error('Error fetching waitlist count:', error);
                } else {
                    setWaitlistCount(count ?? 0);
                }
            } catch (err) {
                console.error('Failed to fetch waitlist count:', err);
            } finally {
                setIsCountLoading(false);
            }
        };

        fetchCount();

        // Subscribe to real-time inserts
        const channel = supabase
            .channel('waitlist-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'waitlist',
                },
                () => {
                    // Increment count on new insert
                    setWaitlistCount((prev) => (prev !== null ? prev + 1 : 1));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            // Upsert into Supabase (insert or update if email exists)
            const { error: supabaseError } = await supabase
                .from('waitlist')
                .upsert(
                    {
                        email,
                        name: name || null,
                        interest: interest || null,
                    },
                    { onConflict: 'email' }
                );

            if (supabaseError) {
                console.error('Supabase error:', supabaseError);
                throw supabaseError;
            }

            // Also send to Formspree for email notifications
            await fetch('https://formspree.io/f/xpwzgkrj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, interest }),
            }).catch(err => console.warn('Formspree notification failed:', err));

            setStatus('success');
            setEmail('');
            setName('');
            setInterest('');
        } catch (err) {
            console.error('Waitlist submission error:', err);
            setStatus('error');
        }
    };

    return (
        <section className="py-24 bg-[#0a0a0b]">
            <div className="max-w-2xl mx-auto px-6">

                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-3 text-xs text-white/40 uppercase tracking-[0.15em] mb-6">
                        <span className="w-6 h-px bg-white/20" />
                        Stay Updated
                        <span className="w-6 h-px bg-white/20" />
                    </span>
                    <h2 className="text-3xl font-light text-white mb-4">
                        Join the research preview
                    </h2>
                    <p className="text-white/50 max-w-md mx-auto mb-6">
                        Get notified about updates to the prototype, new research findings,
                        and early access to experimental features.
                    </p>

                    {/* Live Counter */}
                    <AnimatePresence mode="wait">
                        {isCountLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                                <span className="text-sm text-white/30 font-light tracking-wide">Loading...</span>
                            </motion.div>
                        ) : waitlistCount !== null && waitlistCount > 0 ? (
                            <motion.div
                                key="count"
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full overflow-hidden group cursor-default"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)',
                                    boxShadow: '0 0 30px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}
                            >
                                {/* Animated border gradient */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        padding: '1px',
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'xor',
                                        maskComposite: 'exclude',
                                    }}
                                />

                                {/* Subtle pulse animation on the icon */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-md animate-pulse" />
                                    <Users className="relative w-4 h-4 text-emerald-400" />
                                </div>

                                <span className="text-sm text-white/80 font-light tracking-wide">
                                    <motion.span
                                        key={waitlistCount}
                                        initial={{ opacity: 0, y: -15, scale: 1.2 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="inline-block font-semibold text-emerald-400 tabular-nums"
                                    >
                                        {waitlistCount.toLocaleString()}
                                    </motion.span>
                                    <span className="text-white/50">
                                        {' '}{waitlistCount === 1 ? 'person' : 'people'} on the waitlist
                                    </span>
                                </span>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-8 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                    >
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">You're on the list</h3>
                        <p className="text-white/50 text-sm">
                            We'll notify you when there are updates to the research.
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                    Email <span className="text-white/60">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                                What interests you most?
                            </label>
                            <select
                                value={interest}
                                onChange={(e) => setInterest(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#0a0a0b]">Select an option...</option>
                                <option value="research" className="bg-[#0a0a0b]">Research findings</option>
                                <option value="prototype" className="bg-[#0a0a0b]">Prototype updates</option>
                                <option value="technical" className="bg-[#0a0a0b]">Technical deep dives</option>
                                <option value="investment" className="bg-[#0a0a0b]">Investment opportunities</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || !email}
                            className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    Join Waitlist
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {status === 'error' && (
                            <p className="text-red-400 text-sm text-center">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <p className="text-xs text-white/30 text-center pt-2">
                            We respect your privacy. No spam, unsubscribe anytime.
                        </p>
                    </form>
                )}
            </div>
        </section>
    );
};
