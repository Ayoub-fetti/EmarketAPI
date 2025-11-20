import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta.env
global.importMetaEnv = {
  VITE_BACKEND_URL: 'http://localhost:3000/api',
  VITE_BACKEND_BASE_URL: 'http://localhost:3000'
};
