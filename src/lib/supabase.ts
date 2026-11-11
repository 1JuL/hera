import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

// Verifica si las variables son válidas y no son los valores por defecto
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder-url') &&
  !supabaseUrl.includes('tu-proyecto') &&
  !supabaseAnonKey.includes('placeholder-anon-key') &&
  !supabaseAnonKey.includes('tu-anon-key')
);

// Diagnóstico en consola de desarrollo para facilitar depuración
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.info('[Supabase] Variables de entorno detectadas correctamente.');
    console.info(`[Supabase] Conectando a URL: ${supabaseUrl}`);

    // Advertencia de seguridad informativa si se pegó una clave secret
    if (supabaseAnonKey.startsWith('sb_secret_')) {
      console.warn(
        '[Supabase] NOTA: La clave configurada inicia con "sb_secret_". En Supabase esta corresponde a la clave secreta (Service Role). Para máxima seguridad en el cliente web se recomienda usar la clave pública anon/publishable (Project Settings -> API).'
      );
    }
  } else {
    console.warn(
      '[Supabase] No se detectaron credenciales válidas en .env. Si acabas de editar el archivo .env, REINICIA el servidor de desarrollo (Ctrl + C y luego npm run dev) para que Vite cargue los cambios.'
    );
  }
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
