/**
 * API Route: Chat Streaming
 *
 * Endpoint SSE (Server-Sent Events) para streaming de respuestas de chat.
 * Usa el sistema de adaptadores para conectar con Ollama o Mock.
 *
 * POST /api/chat/stream
 * Body: { agentId: string, prompt: string, options?: StreamOptions }
 */

import { NextRequest } from "next/server";
import { getAgentAdapter, AgentId, StreamOptions, AGENT_CONFIGS } from "@/lib/api/adapters";

// ============================================================================
// TIPOS
// ============================================================================

interface ChatStreamRequest {
  agentId: AgentId;
  prompt: string;
  options?: StreamOptions;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

function validateRequest(body: unknown): ChatStreamRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { agentId, prompt, options } = body as Record<string, unknown>;

  if (!agentId || typeof agentId !== "string") {
    throw new Error("agentId is required");
  }

  if (!AGENT_CONFIGS[agentId as AgentId]) {
    throw new Error(`Invalid agentId: ${agentId}`);
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("prompt is required");
  }

  if (prompt.length > 10000) {
    throw new Error("prompt too long (max 10000 characters)");
  }

  return {
    agentId: agentId as AgentId,
    prompt,
    options: options as StreamOptions | undefined,
  };
}

// ============================================================================
// SSE HELPERS
// ============================================================================

function formatSSE(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function formatSSEError(error: string): string {
  return `data: ${JSON.stringify({ error })}\n\n`;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  // Parse body
  let body: ChatStreamRequest;
  try {
    const rawBody = await request.json();
    body = validateRequest(rawBody);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Invalid request",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { agentId, prompt, options } = body;

  // Crear stream de respuesta
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Obtener adaptador (Ollama o Mock)
        const adapter = await getAgentAdapter();

        // Enviar evento de inicio
        controller.enqueue(
          encoder.encode(
            formatSSE({
              type: "start",
              agentId,
              adapter: adapter.name,
              timestamp: Date.now(),
            })
          )
        );

        // Stream de generación
        for await (const chunk of adapter.generateStream(agentId, prompt, options)) {
          if (chunk.done) {
            // Enviar evento de finalización
            controller.enqueue(
              encoder.encode(
                formatSSE({
                  type: "done",
                  metadata: chunk.metadata,
                  timestamp: Date.now(),
                })
              )
            );
          } else {
            // Enviar chunk de contenido
            controller.enqueue(
              encoder.encode(
                formatSSE({
                  type: "chunk",
                  content: chunk.content,
                  metadata: chunk.metadata,
                })
              )
            );
          }
        }
      } catch (error) {
        // Enviar error
        controller.enqueue(
          encoder.encode(
            formatSSEError(
              error instanceof Error ? error.message : "Unknown error"
            )
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// ============================================================================
// HEALTH CHECK (GET)
// ============================================================================

export async function GET() {
  try {
    const adapter = await getAgentAdapter();
    const isHealthy = await adapter.healthCheck();
    const models = await adapter.getAvailableModels();

    return Response.json({
      status: isHealthy ? "healthy" : "degraded",
      adapter: adapter.name,
      models,
      timestamp: Date.now(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
