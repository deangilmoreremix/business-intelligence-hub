import { Component, type ReactNode } from 'react';

export class WidgetErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidUpdate(prev: { resetKey?: string }) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (this.state.error) return <div role="alert" className="p-3 text-sm text-red-600">This widget could not be displayed: {this.state.error.message}</div>;
    return this.props.children;
  }
}
