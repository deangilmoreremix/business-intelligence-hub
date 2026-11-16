// Test-environment stubs for browser APIs that jsdom/node do not provide.
const g = globalThis as Record<string, any>;
if (typeof g.ResizeObserver === 'undefined') {
  g.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
}
if (typeof g.HTMLCanvasElement !== 'undefined') {
  g.HTMLCanvasElement.prototype.getContext = () => null;
}
