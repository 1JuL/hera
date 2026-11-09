import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Building, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Si ya está autenticado, redirigir a donde intentaba ir o a /inicio
  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/inicio';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(
            error.message.includes('Invalid login credentials')
              ? 'Correo electrónico o contraseña incorrectos.'
              : error.message
          );
          return;
        }

        const from = (location.state as any)?.from?.pathname || '/inicio';
        navigate(from, { replace: true });
      } else {
        // Modo Registro
        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        const { error, user: registeredUser } = await signUpWithEmail(
          email,
          password,
          businessName
        );

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // Si Supabase requiere confirmación por email
        if (registeredUser && !registeredUser.confirmed_at && isConfigured) {
          await Swal.fire({
            icon: 'info',
            title: '¡Cuenta creada!',
            text: 'Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor revísalo para activar tu cuenta.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#163A2B',
            customClass: { popup: 'rounded-2xl' },
          });
          setMode('signin');
        } else {
          const from = (location.state as any)?.from?.pathname || '/inicio';
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white">
      {/* Columna Izquierda: Formulario de Autenticación */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 md:p-14">
        <div className="w-full max-w-[360px]">
          {/* Logo y título de marca */}
          <div className="text-center mb-6">
            <span className="font-brand text-2xl sm:text-3xl font-bold text-[#163A2B] tracking-wide select-none block">
              Senzaccento
            </span>
            <span className="text-[11px] font-semibold text-[#86CEAB] bg-[#163A2B] px-2.5 py-0.5 rounded-full inline-block mt-1">
              Plataforma Hera
            </span>
          </div>

          {/* Aviso informativo si falta configurar .env */}
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Modo desarrollo local:</strong> No se han detectado variables de Supabase en <code>.env</code>. Puedes ingresar en modo prueba o configurar tus credenciales.
              </div>
            </div>
          )}

          {/* Selector de modo: Iniciar Sesión / Crear Cuenta */}
          <div className="flex p-1 bg-[#F4F6F4] rounded-xl border border-[#E0E0E0] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#163A2B] shadow-2xs'
                  : 'text-[#666666] hover:text-[#1E1E1E]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#163A2B] shadow-2xs'
                  : 'text-[#666666] hover:text-[#1E1E1E]'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] text-center mb-1 font-brand">
            {mode === 'signin' ? 'Bienvenido de nuevo' : 'Crea tu cuenta empresarial'}
          </h1>
          <p className="text-xs text-[#666666] text-center mb-6 leading-relaxed">
            {mode === 'signin'
              ? 'Ingresa tus credenciales para acceder a tus diagnósticos y mapa de oportunidades.'
              : 'Registra tu negocio para guardar tu progreso de diagnóstico y recibir recomendaciones.'}
          </p>

          {/* Mensaje de error si ocurre */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-[#4A5568] mb-1.5 font-semibold">
                  Nombre del negocio (Opcional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#888888] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Café La Casona"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#163A2B] focus:border-[#163A2B] bg-white text-[#1E1E1E]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-[#4A5568] mb-1.5 font-semibold">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888888] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#163A2B] focus:border-[#163A2B] bg-white text-[#1E1E1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#4A5568] mb-1.5 font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#163A2B] focus:border-[#163A2B] bg-white text-[#1E1E1E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#163A2B] hover:bg-[#112D21] text-white py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer mt-2 shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Ingresar a Hera' : 'Registrar mi negocio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-[#E0E0E0] flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">o</span>
            <div className="h-px bg-[#E0E0E0] flex-1" />
          </div>

          {/* Botón Google OAuth (El de Facebook fue eliminado según solicitud) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-[#F9FAF9] text-[#1E1E1E] border border-[#E0E0E0] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-[#163A2B]/40 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>

      {/* Columna Derecha: Fondo de Marca institucional */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{
          backgroundColor: '#0E261C',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #1D4B37 0%, #0E291E 70%)',
        }}
      >
        <div className="max-w-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#86CEAB] bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block mb-4">
            Autodiagnóstico TIC y Oportunidades
          </span>
          <h2 className="text-3xl font-bold font-brand text-white leading-tight mb-4">
            Impulsa la transformación digital de tu microempresa
          </h2>
          <p className="text-xs sm:text-sm text-[#D0E6DC] leading-relaxed mb-6">
            Identifica brechas tecnológicas, compara tu negocio con estándares nacionales y recibe rutas claras de adopción adaptadas a tu realidad operativa.
          </p>

          <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-[#D0E6DC]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#86CEAB]" />
              <span>Diagnóstico en 10 minutos con guardado automático</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#86CEAB]" />
              <span>Seguridad y privacidad bajo Ley 1581 de 2012</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#86CEAB]" />
              <span>Comparativas reales con datos de DANE EMICRON</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50 pt-8 border-t border-white/10 flex justify-between items-center">
          <span>© 2026 Senzaccento · Universidad de La Sabana</span>
          <span>Soporte y Privacidad</span>
        </div>
      </div>
    </div>
  );
};
