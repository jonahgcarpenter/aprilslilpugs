import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/aprilslilpugs": "http://192.168.4.103:9000",
      "/hls": "http://192.168.4.92:8080",
    },
  },
  plugins: [react(), tailwindcss()],
});
