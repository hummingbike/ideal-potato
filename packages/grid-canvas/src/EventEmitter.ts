type Listener<T> = (payload: T) => void;

export class EventEmitter<Events> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  /** Subscribes to an event. Returns an unsubscribe function. */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    let set = this.listeners[event];
    if (!set) {
      set = new Set();
      this.listeners[event] = set;
    }
    set.add(listener);
    return () => set?.delete(listener);
  }

  protected emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }
}
