export type EventListener<T> = (data: T) => void

export type Event<T> = ReturnType<typeof createEvent<T>>

export function createEvent<T>() {
  const listeners = new Set<EventListener<T>>()
  const emit = (data: T) => {
    for (const listener of listeners) {
      listener(data)
    }
  }
  const subscribe = (listener: EventListener<T>) => listeners.add(listener);
  const unsubscribe = (listener: EventListener<T>) => listeners.delete(listener);
  const clear = () => listeners.clear();
  return { subscribe, unsubscribe, clear, emit };
}