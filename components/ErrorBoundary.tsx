import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null, errorInfo: null };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-8">
                        <div className="max-w-xl text-center">
                            <h1 className="text-2xl font-semibold mb-4 text-red-400">
                                Something went wrong
                            </h1>
                            <p className="text-white/60 mb-6">
                                The application encountered an error while rendering.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left">
                                <p className="text-sm font-mono text-red-300 mb-2">
                                    {this.state.error?.message}
                                </p>
                                <pre className="text-xs text-white/40 overflow-auto max-h-40">
                                    {this.state.error?.stack}
                                </pre>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
