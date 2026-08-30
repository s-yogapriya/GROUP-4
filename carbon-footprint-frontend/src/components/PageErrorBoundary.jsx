import React from 'react';

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected page error.' };
  }

  componentDidCatch(error) {
    // Keep the UI usable instead of leaving a blank page after a render-time exception.
    console.error('EcoTrack page error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900 p-6 text-slate-100">
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6">
          <h2 className="text-lg font-bold text-white">This page could not be displayed.</h2>
          <p className="mt-2 text-sm text-slate-400">{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
