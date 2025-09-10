/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        "primary-dark": "#1B5E20",
        "primary-light": "#4CAF50",
        secondary: "#1565C0",
        "secondary-dark": "#0D47A1",
        "secondary-light": "#2196F3",
        accent: "#FF8F00",
        "accent-dark": "#E65100",
        "accent-light": "#FFB74D",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
        surface: "#FFFFFF",
        background: "#F8F9FA",
        "gray-50": "#F9FAFB",
        "gray-100": "#F3F4F6",
        "gray-200": "#E5E7EB",
        "gray-300": "#D1D5DB",
        "gray-400": "#9CA3AF",
        "gray-500": "#6B7280",
        "gray-600": "#4B5563",
        "gray-700": "#374151",
        "gray-800": "#1F2937",
        "gray-900": "#111827"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      boxShadow: {
        card: "0 2px 4px rgba(0,0,0,0.1)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.15)",
        premium: "0 8px 25px rgba(0,0,0,0.1)"
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        scaleIn: "scaleIn 0.2s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      }
    },
  },
  plugins: [],
}