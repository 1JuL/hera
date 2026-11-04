import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('example@gmail.com');
  const [password, setPassword] = useState('********');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de autenticación (fiel a auth.js del prototipo)
    navigate('/inicio');
  };

  const handleSocialLogin = () => {
    navigate('/inicio');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Columna Izquierda: Formulario de Autenticación */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-14">
        <h2 className="font-brand text-2xl md:text-3xl font-bold text-[#163A2B] mb-8 select-none">
          Senzaccento
        </h2>

        <div className="w-full max-w-[320px]">
          <h1 className="text-2xl md:text-[26px] font-bold text-center text-[#1E1E1E] mb-1">
            Sign In
          </h1>
          <p className="text-xs text-[#666666] text-center mb-6">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              className="text-[#163A2B] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Create now
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#666666] mb-1.5 font-medium">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#163A2B] focus:border-[#163A2B] bg-white text-[#1E1E1E]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#666666] mb-1.5 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#163A2B] focus:border-[#163A2B] bg-white text-[#1E1E1E]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#163A2B] hover:bg-[#112D21] text-white py-2.5 px-4 rounded-full font-semibold text-sm transition-colors cursor-pointer mt-3 shadow-xs"
            >
              Sign in
            </button>
          </form>

          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F9FAF9] text-[#1E1E1E] border border-[#E0E0E0] py-2.5 px-4 rounded-md text-[13px] font-medium transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F9FAF9] text-[#1E1E1E] border border-[#E0E0E0] py-2.5 px-4 rounded-md text-[13px] font-medium transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Fondo de Marca institucional */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-10 text-white"
        style={{
          backgroundColor: '#0E261C',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #1D4B37 0%, #0E291E 70%)',
        }}
      >
        <div className="text-right text-sm font-medium opacity-90 cursor-pointer hover:opacity-100 transition-opacity">
          Support
        </div>
        <div className="text-xs opacity-70">
          © 2026 Senzaccento Inc.
        </div>
      </div>
    </div>
  );
};

