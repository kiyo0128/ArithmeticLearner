import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

let listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(toast: Toast) {
  memoryState = [...memoryState, toast];
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function dismiss(toastId?: string) {
  if (toastId) {
    toastTimeouts.delete(toastId);
    memoryState = memoryState.filter((toast) => toast.id !== toastId);
  } else {
    memoryState = [];
  }
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function useToast() {
  const [state, setState] = useState<Toast[]>(memoryState);

  const toast = useCallback(
    ({
      title,
      description,
      action,
      variant = 'default',
      ...props
    }: Omit<Toast, 'id'>) => {
      const id = generateId();

      const update = (toastData: Partial<Toast>) => {
        memoryState = memoryState.map((toast) =>
          toast.id === id ? { ...toast, ...toastData } : toast
        );
        listeners.forEach((listener) => {
          listener(memoryState);
        });
      };

      const dismiss = () => {
        memoryState = memoryState.filter((toast) => toast.id !== id);
        listeners.forEach((listener) => {
          listener(memoryState);
        });
      };

      dispatch({
        id,
        title,
        description,
        action,
        variant,
        ...props,
      });

      return {
        id,
        dismiss,
        update,
      };
    },
    []
  );

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const unsubscribe = useCallback(() => {
    listeners = [];
  }, []);

  return {
    toast,
    toasts: state,
    dismiss,
    subscribe,
    unsubscribe,
  };
}