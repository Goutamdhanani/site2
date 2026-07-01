import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { pathToFileURL } from 'url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Expose loaded environment variables to Node process.env (so send-email.js API handler can read them)
  console.log('--- VITE LOADED ENV KEYS ---', Object.keys(env).filter(k => k.includes('ADMIN') || k.includes('JWT') || k.includes('SUPABASE')));
  for (const key in env) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      process.env[key] = env[key];
    }
  }

  // Common middleware to execute the serverless API functions locally
  const apiMiddleware = (req, res, next) => {
    const host = req.headers.host || 'localhost';
    const urlObj = new URL(req.url, `http://${host}`);
    const pathname = urlObj.pathname;

    if (pathname.startsWith('/api/')) {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const mockReq = {
            method: req.method,
            body: (body && body.trim()) ? JSON.parse(body) : {},
            headers: req.headers,
            query: Object.fromEntries(urlObj.searchParams.entries())
          };
          
          const mockRes = {
            statusCode: 200,
            status(code) {
              res.statusCode = code;
              this.statusCode = code;
              return this;
            },
            json(data) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            send(data) {
              res.end(data);
            },
            setHeader(name, value) {
              res.setHeader(name, value);
            }
          };

          let handlerPath = '';
          if (pathname === '/api/send-email') {
            handlerPath = './api/send-email.js';
          } else if (pathname === '/api/auth/login') {
            handlerPath = './api/auth/login.js';
          } else if (pathname === '/api/auth/logout') {
            handlerPath = './api/auth/logout.js';
          } else if (pathname === '/api/auth/session') {
            handlerPath = './api/auth/session.js';
          } else if (pathname === '/api/leads/stats') {
            handlerPath = './api/leads/stats.js';
          } else if (pathname === '/api/leads/export') {
            handlerPath = './api/leads/export.js';
          } else if (pathname === '/api/leads') {
            handlerPath = './api/leads/index.js';
          }

          if (handlerPath) {
            // Convert the handler path to an absolute path relative to process.cwd() and get a file:// URL
            const absolutePath = path.resolve(process.cwd(), handlerPath);
            const fileUrl = pathToFileURL(absolutePath).href;

            // Dynamically import the handler to ensure it runs inside the local Node context
            const { default: handler } = await import(fileUrl);
            await handler(mockReq, mockRes);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
          }
        } catch (error) {
          console.error(`Local API server error on ${pathname}:`, error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Local Dev API Server Error: ${error.message}` }));
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
        name: 'local-api-simulator',
        configureServer(server) {
          server.middlewares.use(apiMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(apiMiddleware);
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

