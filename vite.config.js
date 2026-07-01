import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Expose loaded environment variables to Node process.env (so send-email.js API handler can read them)
  for (const key in env) {
    if (Object.prototype.hasOwnProperty.call(env, key) && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  // Common middleware to execute the serverless send-email function locally
  const emailMiddleware = (req, res, next) => {
    if (req.url === '/api/send-email' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const mockReq = {
            method: 'POST',
            body: JSON.parse(body),
            headers: req.headers
          };
          const mockRes = {
            status(code) {
              res.statusCode = code;
              return {
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                }
              };
            },
            setHeader(name, value) {
              res.setHeader(name, value);
            }
          };

          // Dynamically import the handler to ensure it runs inside the local Node context
          const { default: handler } = await import('./api/send-email.js');
          await handler(mockReq, mockRes);
        } catch (error) {
          console.error('Local email server error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Local Dev Email Server Error: ${error.message}` }));
        }
      });
    } else {
      next();
    }
  };

  return {
    plugins: [
      react(),
      {
        name: 'local-email-sender',
        configureServer(server) {
          server.middlewares.use(emailMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(emailMiddleware);
        }
      }
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('node_modules/@studio-freight/lenis') || id.includes('node_modules/lenis')) {
              return 'vendor-lenis';
            }
          },
        },
      },
    },
  }
})

