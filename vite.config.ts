import { defineConfig, loadEnv, Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function queryOpenRouter(
  apiKey: string,
  models: string[],
  messages: unknown[]
): Promise<string | null> {
  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Hera Asistente MiPyme',
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 420,
          messages,
        }),
      });

      if (!response.ok) continue;
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      // Probar siguiente modelo gratuito de respaldo
    }
  }
  return null;
}

function openRouterDevProxy(env: Record<string, string>): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/assistant-chat' || req.method !== 'POST') {
      next();
      return;
    }

    const apiKey = (env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '').trim();
    if (!apiKey) {
      res.statusCode = 501;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ configured: false }));
      return;
    }

    try {
      const payload = await readJsonBody(req);
      const messages = Array.isArray(payload.messages) ? payload.messages : [];
      if (messages.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing messages' }));
        return;
      }

      const preferredModel = (
        env.OPENROUTER_MODEL ||
        process.env.OPENROUTER_MODEL ||
        'meta-llama/llama-3.3-70b-instruct:free'
      ).trim();

      const candidateModels = Array.from(
        new Set([
          preferredModel,
          'google/gemma-3-27b-it:free',
          'openrouter/free',
        ])
      );

      const reply = await queryOpenRouter(apiKey, candidateModels, messages);
      if (!reply) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'OpenRouter did not return a reply' }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ reply }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Proxy error',
        })
      );
    }
  };

  return {
    name: 'openrouter-server-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga explícita de variables de entorno desde la raíz del proyecto
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
      openRouterDevProxy(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Garantiza lectura incluso si algún módulo accede vía process.env
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
  };
});
