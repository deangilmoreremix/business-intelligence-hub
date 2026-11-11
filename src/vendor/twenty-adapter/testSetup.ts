// jsdom has no layout engine: give charts a fixed size so they actually draw.
class FakeResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe(target: Element) {
    const entry = { target, contentRect: { width: 600, height: 400, top: 0, left: 0, right: 600, bottom: 400, x: 0, y: 0 } } as ResizeObserverEntry;
    queueMicrotask(() => this.cb([entry], this as unknown as ResizeObserver));
  }
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = FakeResizeObserver;
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 600 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 400 });
HTMLElement.prototype.getBoundingClientRect = () => ({ width: 600, height: 400, top: 0, left: 0, right: 600, bottom: 400, x: 0, y: 0, toJSON: () => ({}) });
