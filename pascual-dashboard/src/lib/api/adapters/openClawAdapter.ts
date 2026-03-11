/**
 * OpenClaw Gateway Adapter
 *
 * Proporciona conexión WebSocket al gateway de agentes con
 * auto-reconexión y fallback a eventos locales cuando no está disponible.
 */

import {
  OpenClawConfig,
  OpenClawEventType,
  OpenClawMessage,
  AgentId,
  DEFAULT_OPENCLAW_CONFIG,
} from "./types";

// ============================================================================
// TIPOS
// ============================================================================

type EventHandler<T = unknown> = (message: OpenClawMessage<T>) => void;

interface PendingMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

// ============================================================================
// OPENCLAW ADAPTER
// ============================================================================

class OpenClawAdapterClass {
  private config: OpenClawConfig;
  private ws: WebSocket | null = null;
  private connected = false;
  private connecting = false;
  private messageQueue: PendingMessage[] = [];
  private handlers: Map<OpenClawEventType, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config?: Partial<OpenClawConfig>) {
    this.config = { ...DEFAULT_OPENCLAW_CONFIG, ...config };
  }

  // ==========================================================================
  // CONEXIÓN
  // ==========================================================================

  /**
   * Intenta conectar al gateway WebSocket
   */
  async connect(): Promise<boolean> {
    if (this.connected || this.connecting) {
      return this.connected;
    }

    // Solo intentar en el cliente (browser)
    if (typeof window === "undefined") {
      console.log("[OpenClaw] Server-side, using local events");
      return false;
    }

    this.connecting = true;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log("[OpenClaw] Connected to gateway");
          this.connected = true;
          this.connecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: OpenClawMessage = JSON.parse(event.data);
            this.dispatchMessage(message);
          } catch (error) {
            console.warn("[OpenClaw] Invalid message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.warn("[OpenClaw] WebSocket error:", error);
        };

        this.ws.onclose = () => {
          console.log("[OpenClaw] Connection closed");
          this.handleDisconnect();
          if (!this.connected) {
            resolve(false);
          }
        };

        // Timeout de conexión
        setTimeout(() => {
          if (this.connecting) {
            console.log("[OpenClaw] Connection timeout");
            this.ws?.close();
            this.connecting = false;
            resolve(false);
          }
        }, 5000);
      } catch (error) {
        console.log("[OpenClaw] Failed to create WebSocket:", error);
        this.connecting = false;
        resolve(false);
      }
    });
  }

  /**
   * Desconecta del gateway
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.stopReconnect();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.connecting = false;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  // ==========================================================================
  // ENVÍO DE MENSAJES
  // ==========================================================================

  /**
   * Envía un mensaje al gateway o dispara evento local
   */
  emit<T = unknown>(type: OpenClawEventType, payload: T, agentId?: AgentId): void {
    const message: OpenClawMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      agentId,
    };

    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      // Enviar por WebSocket
      this.ws.send(JSON.stringify(message));
    } else if (this.config.useFallback) {
      // Fallback: disparar evento local
      this.dispatchLocalEvent(message);

      // Encolar para enviar cuando reconecte
      this.messageQueue.push({
        type,
        payload,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Suscribirse a eventos del gateway
   */
  on<T = unknown>(type: OpenClawEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as EventHandler);

    // También escuchar eventos locales (fallback)
    if (typeof window !== "undefined") {
      const localHandler = (event: Event) => {
        const customEvent = event as CustomEvent<OpenClawMessage<T>>;
        handler(customEvent.detail);
      };
      window.addEventListener(`openclaw:${type}`, localHandler);

      // Retornar función de limpieza
      return () => {
        this.handlers.get(type)?.delete(handler as EventHandler);
        window.removeEventListener(`openclaw:${type}`, localHandler);
      };
    }

    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler);
    };
  }

  /**
   * Desuscribirse de un tipo de evento
   */
  off(type: OpenClawEventType, handler?: EventHandler): void {
    if (handler) {
      this.handlers.get(type)?.delete(handler);
    } else {
      this.handlers.delete(type);
    }
  }

  // ==========================================================================
  // HELPERS INTERNOS
  // ==========================================================================

  private dispatchMessage(message: OpenClawMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error("[OpenClaw] Handler error:", error);
        }
      });
    }
  }

  private dispatchLocalEvent<T>(message: OpenClawMessage<T>): void {
    if (typeof window !== "undefined") {
      const event = new CustomEvent(`openclaw:${message.type}`, {
        detail: message,
      });
      window.dispatchEvent(event);
    }
  }

  private handleDisconnect(): void {
    this.connected = false;
    this.stopHeartbeat();

    // Auto-reconexión si está habilitada
    if (this.config.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(
      `[OpenClaw] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(msg));
      }
    }
  }
}

// Exportar singleton
export const openClawAdapter = new OpenClawAdapterClass();

// También exportar la clase para casos que necesiten múltiples instancias
export { OpenClawAdapterClass };
