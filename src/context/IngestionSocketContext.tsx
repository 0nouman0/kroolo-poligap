"use client";
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

interface IngestionProgress {
  progress: number;
  currentService?: string;
  totalServices?: number;
  completedServices?: number;
  message?: string;
  status: "idle" | "connecting" | "in_progress" | "completed" | "error";
  error?: string;
  lastEvent?: any;
}

interface IngestionSocketContextType extends IngestionProgress {
  connect: (sessionId: string) => void;
  disconnect: () => void;
  connected: boolean;
  rawWebSocket: WebSocket | null;
}

const IngestionSocketContext = createContext<
  IngestionSocketContextType | undefined
>(undefined);

const WS_BASE = DJANGO_API_ROUTES.INGESTION_WEBSOCKET;

export const IngestionSocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<IngestionProgress>({
    progress: 0,
    status: "idle",
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
    wsRef.current?.close();
    setConnected(false);
  }, []);

  const resetHeartbeatTimeout = useCallback(() => {
    if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
    heartbeatTimeout.current = setTimeout(() => {
      setState((s) => ({
        ...s,
        status: "error",
        error: "WebSocket heartbeat lost",
      }));
      cleanup();
    }, 40000);
  }, [cleanup]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    heartbeatInterval.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
      }
    }, 25000);
  }, []);

  const connect = useCallback(
    (sessionId: string) => {
      cleanup();
      sessionIdRef.current = sessionId;
      setState((s) => ({ ...s, status: "connecting", error: undefined }));
      const ws = new WebSocket(`${WS_BASE}/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setState((s) => ({ ...s, status: "in_progress" }));
        startHeartbeat();
        resetHeartbeatTimeout();
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((s) => ({ ...s, lastEvent: data }));
          switch (data.type) {
            case "connection":
              setState((s) => ({ ...s, status: "in_progress" }));
              break;
            case "progress":
              // Fix: Handle the correct message format from FastAPI
              const progressData = data.progress || {};
              setState((s) => ({
                ...s,
                progress:
                  progressData.processed_items && progressData.total_items
                    ? Math.round(
                        (progressData.processed_items /
                          progressData.total_items) *
                          100
                      )
                    : s.progress,
                currentService: progressData.current_service,
                totalServices: progressData.total_services,
                completedServices: progressData.completed_services,
                message: data.message,
                status: "in_progress",
              }));
              break;
            case "completion":
              setState((s) => ({
                ...s,
                progress: 100,
                status: "completed",
                message: data.summary || data.message,
              }));
              break;
            case "error":
              setState((s) => ({
                ...s,
                error: data.message || data.error,
                status: "error",
              }));
              break;
            case "heartbeat":
              resetHeartbeatTimeout();
              break;
            default:
              break;
          }
        } catch (e) {
          setState((s) => ({
            ...s,
            error: "Invalid WebSocket message",
            status: "error",
          }));
        }
      };
      ws.onerror = () => {
        setState((s) => ({ ...s, error: "WebSocket error", status: "error" }));
      };
      ws.onclose = () => {
        setConnected(false);
        cleanup();
      };
    },
    [cleanup, resetHeartbeatTimeout, startHeartbeat]
  );

  const disconnect = useCallback(() => {
    cleanup();
    setState((s) => ({ ...s, status: "idle" }));
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // @todo memoize this
  const value: IngestionSocketContextType = {
    ...state,
    connect,
    disconnect,
    connected,
    rawWebSocket: wsRef.current,
  };

  return (
    <IngestionSocketContext.Provider value={value}>
      {children}
    </IngestionSocketContext.Provider>
  );
};

export function useIngestionSocket() {
  const ctx = useContext(IngestionSocketContext);
  if (!ctx)
    throw new Error(
      "useIngestionSocket must be used within IngestionSocketProvider"
    );
  return ctx;
}
