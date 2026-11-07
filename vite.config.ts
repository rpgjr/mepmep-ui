import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api calls are forwarded to the Spring Boot server (no CORS needed).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": process.env.API_PROXY ?? "http://localhost:8090" } },
});
