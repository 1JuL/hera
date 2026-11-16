import React, { useEffect, useRef } from 'react';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  speechPulse: number;
  disabled?: boolean;
  onClick?: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isListening,
  isSpeaking,
  isMuted,
  speechPulse,
  disabled = false,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    isListening,
    isSpeaking,
    isMuted,
  });
  const energyRef = useRef(0.15);
  const targetEnergyRef = useRef(0.15);
  const pulseImpulseRef = useRef(0);

  useEffect(() => {
    stateRef.current = { isListening, isSpeaking, isMuted };
  }, [isListening, isSpeaking, isMuted]);

  useEffect(() => {
    if (speechPulse > 0) {
      pulseImpulseRef.current = Math.min(1, pulseImpulseRef.current + 0.65);
    }
  }, [speechPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 210;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let animId = 0;
    let time = 0;

    const render = () => {
      time += 0.025;
      const {
        isListening: listening,
        isSpeaking: speaking,
        isMuted: muted,
      } = stateRef.current;

      // Decaimiento suave del impulso por palabra/sílaba
      pulseImpulseRef.current *= 0.88;

      if (speaking) {
        targetEnergyRef.current = Math.min(
          1.3,
          0.55 +
            0.25 * Math.sin(time * 5.8) +
            0.18 * Math.cos(time * 9.4) +
            pulseImpulseRef.current * 0.45
        );
      } else if (listening) {
        targetEnergyRef.current = 0.58 + 0.14 * Math.sin(time * 3.6);
      } else {
        targetEnergyRef.current = 0.16 + 0.04 * Math.sin(time * 1.4);
      }

      energyRef.current += (targetEnergyRef.current - energyRef.current) * 0.14;
      const energy = energyRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const floatY = Math.sin(time * 1.3) * 3.2;
      const cy = size / 2 - 4 + floatY;
      const baseRadius = 60 + (speaking ? energy * 8.5 : listening ? energy * 5 : energy * 2.5);

      // 1. Sombra flotante semi-3D debajo de la esfera
      const shadowScale = 1 - floatY * 0.02 + energy * 0.06;
      ctx.save();
      ctx.translate(cx, size - 18);
      ctx.scale(shadowScale, 0.24);
      const shadowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 62);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.18)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Halo atmosférico externo
      const auraRadius = baseRadius * (1.42 + energy * 0.18);
      const auraGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, auraRadius);
      if (speaking) {
        auraGrad.addColorStop(0, 'rgba(252, 211, 77, 0.34)');
        auraGrad.addColorStop(0.55, 'rgba(134, 206, 171, 0.20)');
        auraGrad.addColorStop(1, 'rgba(134, 206, 171, 0)');
      } else if (listening) {
        auraGrad.addColorStop(0, 'rgba(134, 206, 171, 0.40)');
        auraGrad.addColorStop(0.6, 'rgba(52, 211, 153, 0.16)');
        auraGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      } else {
        auraGrad.addColorStop(0, muted ? 'rgba(248, 113, 113, 0.15)' : 'rgba(134, 206, 171, 0.18)');
        auraGrad.addColorStop(1, 'rgba(134, 206, 171, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Contorno orgánico de la esfera (deformación suave estilo ChatGPT Voice)
      const segments = 72;
      const buildSpherePath = (radiusScale = 1, phaseOffset = 0) => {
        ctx.beginPath();
        const wobbleAmp = speaking ? 4.8 * energy : listening ? 2.6 : 0.8;
        const speed = speaking ? 4.2 : 1.7;

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wave1 = Math.sin(theta * 3 + time * speed + phaseOffset) * wobbleAmp;
          const wave2 = Math.cos(theta * 5 - time * (speed * 1.25) + phaseOffset) * (wobbleAmp * 0.55);
          const wave3 = speaking
            ? Math.sin(theta * 7 + time * 7.2) * (1.8 * energy)
            : 0;
          const r = baseRadius * radiusScale + wave1 + wave2 + wave3;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      };

      // Recortar interior de la esfera 3D
      ctx.save();
      buildSpherePath(1, 0);
      ctx.clip();

      // 4. Sombreado volumétrico base 3D (luz superior izquierda)
      const lx = cx - baseRadius * 0.34;
      const ly = cy - baseRadius * 0.36;
      const bodyGrad = ctx.createRadialGradient(lx, ly, baseRadius * 0.08, cx, cy, baseRadius * 1.15);
      if (speaking) {
        bodyGrad.addColorStop(0, '#fef08a');
        bodyGrad.addColorStop(0.28, '#6ee7b7');
        bodyGrad.addColorStop(0.68, '#166534');
        bodyGrad.addColorStop(1, '#082418');
      } else if (listening) {
        bodyGrad.addColorStop(0, '#d1fae5');
        bodyGrad.addColorStop(0.32, '#86CEAB');
        bodyGrad.addColorStop(0.72, '#0f5132');
        bodyGrad.addColorStop(1, '#072216');
      } else {
        bodyGrad.addColorStop(0, '#a7f3d0');
        bodyGrad.addColorStop(0.35, '#3b7a5e');
        bodyGrad.addColorStop(0.78, '#123828');
        bodyGrad.addColorStop(1, '#071b12');
      }
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(cx - baseRadius - 20, cy - baseRadius - 20, baseRadius * 2 + 40, baseRadius * 2 + 40);

      // 5. Ondas internas fluidas (efecto plasma / nube en movimiento 3D)
      ctx.globalCompositeOperation = 'screen';
      const blobs = [
        {
          ox: Math.cos(time * (speaking ? 2.4 : 1.1)) * baseRadius * 0.32,
          oy: Math.sin(time * (speaking ? 2.1 : 0.9)) * baseRadius * 0.28,
          r: baseRadius * (0.68 + energy * 0.14),
          c1: speaking ? 'rgba(253, 224, 71, 0.58)' : 'rgba(134, 206, 171, 0.55)',
          c2: 'rgba(134, 206, 171, 0)',
        },
        {
          ox: Math.sin(time * (speaking ? 2.9 : 1.3) + 2.1) * baseRadius * 0.36,
          oy: Math.cos(time * (speaking ? 2.6 : 1.0) + 1.3) * baseRadius * 0.32,
          r: baseRadius * (0.62 + energy * 0.16),
          c1: speaking ? 'rgba(52, 211, 153, 0.52)' : 'rgba(45, 212, 191, 0.45)',
          c2: 'rgba(45, 212, 191, 0)',
        },
        {
          ox: Math.cos(time * (speaking ? 3.4 : 1.5) + 4.2) * baseRadius * 0.26,
          oy: Math.sin(time * (speaking ? 3.1 : 1.4) + 3.4) * baseRadius * 0.35,
          r: baseRadius * (0.55 + energy * 0.12),
          c1: muted && !speaking ? 'rgba(252, 165, 165, 0.30)' : 'rgba(236, 253, 245, 0.42)',
          c2: 'rgba(255, 255, 255, 0)',
        },
      ];

      for (const blob of blobs) {
        const bGrad = ctx.createRadialGradient(
          cx + blob.ox,
          cy + blob.oy,
          2,
          cx + blob.ox,
          cy + blob.oy,
          blob.r
        );
        bGrad.addColorStop(0, blob.c1);
        bGrad.addColorStop(1, blob.c2);
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx + blob.ox, cy + blob.oy, blob.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Reflejo especular 3D (brillo vítreo superior izquierdo + rebote inferior derecho)
      const specX = cx - baseRadius * 0.34;
      const specY = cy - baseRadius * 0.36;
      const specGrad = ctx.createRadialGradient(specX, specY, 1, specX, specY, baseRadius * 0.55);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      specGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.22)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Luz de rebote inferior derecha
      const bounceX = cx + baseRadius * 0.35;
      const bounceY = cy + baseRadius * 0.38;
      const bounceGrad = ctx.createRadialGradient(
        bounceX,
        bounceY,
        1,
        bounceX,
        bounceY,
        baseRadius * 0.48
      );
      bounceGrad.addColorStop(0, speaking ? 'rgba(253, 230, 138, 0.36)' : 'rgba(134, 206, 171, 0.32)');
      bounceGrad.addColorStop(1, 'rgba(134, 206, 171, 0)');
      ctx.fillStyle = bounceGrad;
      ctx.beginPath();
      ctx.arc(bounceX, bounceY, baseRadius * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 7. Sombreado Fresnel interno (oscurecimiento sutil del borde para volumen)
      ctx.globalCompositeOperation = 'source-over';
      const rimGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.65, cx, cy, baseRadius * 1.03);
      rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rimGrad.addColorStop(0.84, 'rgba(4, 22, 14, 0.18)');
      rimGrad.addColorStop(1, 'rgba(167, 243, 208, 0.45)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - baseRadius - 20, cy - baseRadius - 20, baseRadius * 2 + 40, baseRadius * 2 + 40);

      ctx.restore();

      // 8. Borde luminoso sutil del contorno orgánico
      buildSpherePath(1, 0);
      ctx.strokeStyle = speaking
        ? 'rgba(253, 230, 138, 0.55)'
        : listening
        ? 'rgba(134, 206, 171, 0.65)'
        : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animId);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isListening
          ? 'Pausar micrófono'
          : disabled
          ? 'Reconocimiento de voz no disponible'
          : 'Activar micrófono'
      }
      className={`relative flex items-center justify-center bg-transparent border-none p-0 my-2 transition-transform duration-300 ${
        disabled ? 'cursor-default opacity-80' : 'cursor-pointer hover:scale-[1.04] active:scale-[0.98]'
      }`}
    >
      <canvas
        ref={canvasRef}
        className="w-[210px] h-[210px] block select-none pointer-events-none"
      />
    </button>
  );
};
