// Supabase Edge Function: Síntesis de voz neuronal gratuita para Hera
// Prioridad:
// 1. ElevenLabs (si se configura el secreto ELEVENLABS_API_KEY en Supabase)
// 2. Microsoft Edge Neural TTS (es-CO-SalomeNeural, $0 ilimitado, sin API key)

import { EdgeTTS } from 'npm:@andresaya/edge-tts@^1.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_ELEVENLABS_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Sarah (multilingüe natural)
const DEFAULT_EDGE_VOICE = 'es-CO-SalomeNeural'; // Español Colombia natural

async function synthesizeWithElevenLabs(text: string): Promise<ArrayBuffer | null> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY')?.trim();
  if (!apiKey) return null;

  const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID')?.trim() || DEFAULT_ELEVENLABS_VOICE;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        language_code: 'es',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.78,
        },
      }),
    }
  );

  if (!response.ok) {
    console.warn(`ElevenLabs fallback status: ${response.status}`);
    return null;
  }

  return await response.arrayBuffer();
}

async function synthesizeWithEdgeNeural(text: string): Promise<Uint8Array> {
  const voice = Deno.env.get('EDGE_TTS_VOICE')?.trim() || DEFAULT_EDGE_VOICE;
  const tts = new EdgeTTS();

  await tts.synthesize(text, voice, {
    rate: '0%',
    pitch: '+0Hz',
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
  });

  return tts.toBuffer();
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

  try {
    const body = await req.json();
    const rawText = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Missing text parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limitar longitud por seguridad y latencia rápida
    const text = rawText.slice(0, 1200);

    // 1. Intentar ElevenLabs si hay secreto configurado
    try {
      const elevenAudio = await synthesizeWithElevenLabs(text);
      if (elevenAudio) {
        return new Response(elevenAudio, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch (err) {
      console.warn('ElevenLabs falló, usando Edge Neural TTS:', err);
    }

    // 2. Respaldo gratuito e ilimitado con voz neuronal colombiana
    const edgeAudio = await synthesizeWithEdgeNeural(text);
    return new Response(edgeAudio, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS synthesis error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
