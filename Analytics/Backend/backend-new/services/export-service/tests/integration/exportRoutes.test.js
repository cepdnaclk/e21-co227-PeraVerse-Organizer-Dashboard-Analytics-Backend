const express = require('express');
const request = require('supertest');

// Build a minimal app with the real router, while mocking heavy generators
const routes = require('../../src/routes/exportRoutes');

jest.mock('../../src/controllers/exportController', () => {
  // Re-require inside the factory to avoid out-of-scope references
  const fs = require('fs');
  const path = require('path');
  // Create a temp file and return its absolute path so res.download works
  function tempFile(ext) {
    const dir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const p = path.join(dir, `test_${Date.now()}${ext}`);
    fs.writeFileSync(p, 'stub');
    return p; // controller resolves absolute paths as-is
  }
  return {
    generateAttendancePDFReport: async (req, res) => {
      const day = Number(req.params.day);
      if (!Number.isNaN(day) && (day < 1 || day > 5)) {
        return res.status(400).send('Invalid day. Allowed values are 1-5.');
      }
      return res.download(tempFile('.pdf'));
    },
    generateAttendanceCSVReport: async (req, res) => res.download(tempFile('.csv')),
    generateMovementPDFReport: async (req, res) => res.download(tempFile('.pdf')),
    generateMovementCSVReport: async (req, res) => res.download(tempFile('.csv')),
    generateSecurityPDFReport: async (req, res) => res.download(tempFile('.pdf')),
    generateEventPDFReport: async (req, res) => res.download(tempFile('.pdf')),
  };
});

describe('exportRoutes integration', () => {
  const app = express();
  app.use('/api/export', routes);

  test('returns 400 for invalid day param', async () => {
    const res = await request(app).get('/api/export/attendance/pdf/99');
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Invalid day/);
  });

  test('downloads attendance CSV', async () => {
    const res = await request(app).get('/api/export/attendance/csv/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv|application\/octet-stream/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  test('downloads movement PDF', async () => {
    const res = await request(app).get('/api/export/movement/pdf/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });
});
