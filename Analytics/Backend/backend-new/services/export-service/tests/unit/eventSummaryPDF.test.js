const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('eventSummaryPDF', () => {
  const servicePath = path.join(__dirname, '../../src/services/eventSummaryPDF.js');
  const db1Path = path.join(__dirname, '../../src/utils/db1.js');

  beforeEach(() => { jest.resetModules(); });

  it('generates Event Summary PDF', async () => {
    jest.doMock(db1Path, () => createDbMock(), { virtual: false });
    const { generateEventPDF } = require(servicePath);

    const out = await generateEventPDF({ day: 1 });
    expect(out).toMatch(/event_summary_.*\.pdf$/);
    expect(fs.existsSync(out)).toBe(true);
    expect(fs.statSync(out).size).toBeGreaterThan(100);
    fs.unlinkSync(out);
  });
});
