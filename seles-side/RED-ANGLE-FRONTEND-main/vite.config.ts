// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')
//   // default to 5000 which matches your backend here
//   const apiUrl = env.VITE_API_BASE_URL || 'http://localhost:5000'

//   return {
//     plugins: [react()],
//     server: {
//       // Force default dev port to 5173 so the frontend runs on the expected port
//       port: 5173,
//       proxy: {
//         '/api': {
//           target: apiUrl,
//           changeOrigin: true,
//           secure: false,
//           rewrite: (path) => path.replace(/^\/api/, ''),
//           onError(err: any, req: any, res: any) {
//             // Log target and the error to help diagnose connection failures in dev
//             // eslint-disable-next-line no-console
//             console.error(`Dev proxy error when forwarding ${req?.url} to ${apiUrl}:`, err);
//             if (res && !res.headersSent) {
//               res.writeHead?.(502, { 'Content-Type': 'application/json' });
//               res.end(JSON.stringify({ error: 'Proxy error', details: String(err?.message || err) }));
//             }
//           },
//         },
//       },
//     },
//   }
// })

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_BASE_URL || "http://localhost:9000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
          onError(err: any, req: any, res: any) {
            console.error(
              `Dev proxy error when forwarding ${req?.url} to ${apiUrl}:`,
              err
            );
            if (res && !res.headersSent) {
              res.writeHead?.(502, {
                "Content-Type": "application/json",
              });
              res.end(
                JSON.stringify({
                  error: "Proxy error",
                  details: String(err?.message || err),
                })
              );
            }
          },
        },
      },
    },
  };
});