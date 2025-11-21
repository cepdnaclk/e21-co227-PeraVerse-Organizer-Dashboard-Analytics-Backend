const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('securityExceptionPDF', () => {
  const servicePath = path.join(__dirname, '../../src/services/securityExceptionPDF.js');
  const db2Path = path.join(__dirname, '../../src/utils/db2.js');

  beforeEach(() => { jest.resetModules(); });

  it('generates Security & Exception PDF', async () => {
    jest.doMock(db2Path, () => createDbMock(), { virtual: false });
    const { generateSecurityExceptionPDF } = require(servicePath);

    const out = await generateSecurityExceptionPDF({ day: 1, overstayMinutes: 120, congestionThreshold: 3 });
    expect(out).toMatch(/security_exception_.*\.pdf$/);
    expect(fs.existsSync(out)).toBe(true);
    expect(fs.statSync(out).size).toBeGreaterThan(100);
    fs.unlinkSync(out);
  });
});
