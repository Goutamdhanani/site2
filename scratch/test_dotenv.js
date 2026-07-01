import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
console.log('--- TEST LOADED ENV ---');
console.log('ADMIN_PASSWORD_HASH:', env.ADMIN_PASSWORD_HASH);
