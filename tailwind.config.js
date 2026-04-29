/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        h: ["Sora", "sans-serif"],
        b: ["DM Sans", "sans-serif"],
      },
      colors: {
        "primary-container": "#004d4d",
        "on-surface-variant": "#3f4848",
        surface: "#f9f9f9",
        "surface-container": "#eeeeee",
        "accent-teal": "#006a6a",
        "dark": "#0f172a",
        "accent": "#14b8a6",
        "f-primary": "#14b8a6",
        "f-secondary": "#0ea5e9",
        "f-dark": "#070a13",
        "f-border": "rgba(255, 255, 255, 0.08)",
        "f-text-dim": "#94a3b8",
        "f-glass-white": "rgba(255, 255, 255, 0.03)",
        // New variables from auth UI
        auth: {
          bg: "#eaeff7",
          "bg-tl": "rgba(16, 185, 129, 0.11)",
          "bg-br": "rgba(59, 130, 246, 0.11)",
          form: "#ffffff",
          input: "#f6f9fc",
          border: "#dde4ef",
          "text-dark": "#0d1b2e",
          "text-mid": "#4a5568",
          "text-light": "#8fa3bf",
          "brand-top": "#0e1f42",
          "brand-bot": "#091529",
          "brand-muted": "rgba(255, 255, 255, 0.55)",
          teal: "#10b981",
          "teal-dim": "rgba(16, 185, 129, 0.09)",
          "teal-glow": "rgba(16, 185, 129, 0.28)",
          blue: "#3b82f6",
          red: "#ef4444",
          "red-dim": "rgba(239, 68, 68, 0.09)",
          card: "rgba(255, 255, 255, 0.88)",
          "card-border": "rgba(255, 255, 255, 0.6)",
        }
      },
      borderRadius: {
        "r-sm": "13px",
        r: "18px",
        "r-lg": "24px",
        "r-xl": "32px",
      },
      keyframes: {
        floatCard: {
          '0%, 100%': { transform: 'translateY(0) rotate(-12deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-10deg)' },
        },
        floatCardSecondary: {
          '0%, 100%': { transform: 'translate(40px, 60px) rotate(-8deg)' },
          '50%': { transform: 'translate(45px, 40px) rotate(-6deg)' },
        },
        pulseMarker: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 0 0 rgba(20, 184, 166, 0.4)' },
          '70%': { transform: 'translate(-50%, -50%) scale(1.1)', boxShadow: '0 0 0 15px rgba(20, 184, 166, 0)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 0 0 rgba(20, 184, 166, 0)' },
        },
        orbitSpin: {
          to: { transform: 'rotate(360deg)' }
        },
        centerPulse: {
          '0%, 100%': { boxShadow: '0 0 0 5px rgba(16, 185, 129, 0.1), 0 8px 22px rgba(16, 185, 129, 0.28)' },
          '50%': { boxShadow: '0 0 0 12px rgba(16, 185, 129, 0.05), 0 8px 30px rgba(16, 185, 129, 0.38)' }
        },
        drawCircle: {
          to: { strokeDashoffset: '0' }
        },
        drawCheck: {
          to: { strokeDashoffset: '0' }
        },
        glowPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.18)', opacity: '1' }
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0.9' },
          '100%': { transform: 'translateY(130%) rotate(420deg)', opacity: '0' }
        },
        rejectPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '1' }
        },
        popIn: {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '65%': { transform: 'scale(1.1) rotate(4deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        },
        spinRing: {
          to: { transform: 'rotate(360deg)' }
        },
        fadein: {
          from: { opacity: '0', transform: 'translateY(9px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'float-card': 'floatCard 5s ease-in-out infinite',
        'float-card-secondary': 'floatCardSecondary 5s ease-in-out infinite',
        'pulse-marker': 'pulseMarker 2s infinite',
        'orbit-spin': 'orbitSpin 1.9s linear infinite',
        'orbit-spin-reverse': 'orbitSpin 2.7s linear reverse infinite',
        'orbit-spin-fast': 'orbitSpin 1.3s linear infinite',
        'center-pulse': 'centerPulse 2.2s ease-in-out infinite',
        'draw-circle': 'drawCircle 0.72s 0.12s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'draw-check': 'drawCheck 0.38s 0.88s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glow-pulse': 'glowPulse 2.2s 1.1s ease-in-out infinite',
        'confetti-fall': 'confettiFall linear forwards',
        'reject-pulse': 'rejectPulse 2.2s ease-in-out infinite',
        'pop-in': 'popIn 0.48s 0.08s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'spin-ring': 'spinRing 0.6s linear infinite',
        'fadein': 'fadein 0.38s ease forwards',
      },
    },
  },
  plugins: [],
}
