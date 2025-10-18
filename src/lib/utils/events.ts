type EventHandler<T = any> = (payload: T) => void;
const listeners = new Map<string, EventHandler[]>();

export function emitEvent<T>(event: string, data: T) {
  listeners.get(event)?.forEach((fn) => fn(data));
}

export function onEvent<T>(event: string, fn: EventHandler<T>) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event)!.push(fn);
  return () => {
    listeners.set(
      event,
      listeners.get(event)!.filter((f) => f !== fn),
    );
  };
}
