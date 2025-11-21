const fs = require('fs');
const path = require('path');

// Freeze time for predictable filenames
const FIXED_TIME = new Date('2025-01-01T12:00:00Z');
jest.useFakeTimers().setSystemTime(FIXED_TIME);

// Ensure exports directory exists before tests
const exportsDir = path.join(__dirname, '..', 'src', 'exports');
try {
  const alt = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportsDir) && !fs.existsSync(alt)) {
    fs.mkdirSync(alt, { recursive: true });
  }
} catch {}

// Silence noisy logs in tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Mock chartjs-node-canvas globally to avoid native Canvas
jest.mock('chartjs-node-canvas', () => {
  // 1x1 PNG image buffer
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABBAEAQv8F5QAAAABJRU5ErkJggg==';
  const buf = Buffer.from(pngBase64, 'base64');
  return {
    ChartJSNodeCanvas: jest.fn().mockImplementation(() => ({
      renderToBuffer: async () => buf
    }))
  };
});

// Some services import this side-effect module – stub it
jest.mock('chartjs-chart-matrix', () => ({}), { virtual: true });
