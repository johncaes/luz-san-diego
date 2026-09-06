import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" => rutas relativas, sirve igual en dominio raíz (Vercel/Netlify)
// que en subruta (GitHub Pages: /luz-san-diego/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
