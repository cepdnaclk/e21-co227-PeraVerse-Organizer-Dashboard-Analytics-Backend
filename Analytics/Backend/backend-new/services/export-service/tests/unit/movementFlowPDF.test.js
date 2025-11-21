const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('movementFlowPDF', () => {
  const servicePath = path.join(__dirname, '../../src/services/movementFlowPDF.js');
  const db2Path = path.join(__dirname, '../../src/utils/db2.js');

  beforeEach(() => { jest.resetModules(); });

  it('generates Movement & Flow PDF', async () => {
    jest.doMock(db2Path, () => createDbMock(), { virtual: false });
    const { generateMovementFlowPDF } = require(servicePath);

    const out = await generateMovementFlowPDF({ day: 1 });
    expect(out).toMatch(/movement_flow_.*\.pdf$/);
    expect(fs.existsSync(out)).toBe(true);
    expect(fs.statSync(out).size).toBeGreaterThan(100);
    fs.unlinkSync(out);
  });
});
