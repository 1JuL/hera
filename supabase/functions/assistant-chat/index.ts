// Supabase Edge Function: Proxy seguro para OpenRouter RAG en producción
// Configura el secreto en Supabase:
//   supabase secrets set OPENROUTER_API_KEY="sk-or-v1-..."

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callOpenRouterWithFallback(
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
          'HTTP-Referer': 'https://hera.app',
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
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      // Continuar al siguiente modelo gratuito
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('OPENROUTER_API_KEY')?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ configured: false }), {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preferredModel =
      Deno.env.get('OPENROUTER_MODEL')?.trim() || 'meta-llama/llama-3.3-70b-instruct:free';

    const candidateModels = Array.from(
      new Set([
        preferredModel,
        'google/gemma-3-27b-it:free',
        'openrouter/free',
      ])
    );

    const reply = await callOpenRouterWithFallback(apiKey, candidateModels, messages);
    if (!reply) {
      return new Response(JSON.stringify({ error: 'OpenRouter unavailable' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Assistant error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
