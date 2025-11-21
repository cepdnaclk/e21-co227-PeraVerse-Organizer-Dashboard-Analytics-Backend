const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('movementFlowCSV', () => {
  const servicePath = path.join(__dirname, '../../src/services/movementFlowCSV.js');
  const db2Path = path.join(__dirname, '../../src/utils/db2.js');

  beforeEach(() => { jest.resetModules(); });

  it('generates Movement & Flow CSV with multiple sections', async () => {
    jest.doMock(db2Path, () => createDbMock(), { virtual: false });
    const { generateMovementFlowCSV } = require(servicePath);

    const out = await generateMovementFlowCSV({ day: 1 });
    expect(out).toMatch(/movement_flow_day1_.*\.csv$/);
    const text = fs.readFileSync(out, 'utf8');
    expect(text).toContain('Entry vs Exit by Time Slot');
    expect(text).toContain('Zone Transitions (Top 50)');
    expect(text).toContain('Busiest Buildings');
    expect(text).toContain('Busiest Zones');
    expect(text).toContain('Average Buildings Visited per Person');
    fs.unlinkSync(out);
  });
});
