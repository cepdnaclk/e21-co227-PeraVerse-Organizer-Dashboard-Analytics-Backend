const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('attendanceUsageCSV', () => {
  const servicePath = path.join(__dirname, '../../src/services/attendanceUsageCSV.js');
  const db2Path = path.join(__dirname, '../../src/utils/db2.js');

  beforeEach(() => { jest.resetModules(); });

  it('generates a CSV with metrics and slot rows', async () => {
    jest.doMock(db2Path, () => createDbMock(), { virtual: false });
    const { generateAttendanceUsageCSV } = require(servicePath);

    const out = await generateAttendanceUsageCSV({ day: 1 });
    expect(out).toMatch(/attendance_usage.*\.csv$/);
    const text = fs.readFileSync(out, 'utf8');
  // json2csv quotes headers; assert on quoted header
  expect(text).toContain('"Building","Building ID","Total Visits","Unique Visitors","Repeat Visits","Avg Duration","Peak Entry Hour"');
  expect(text).toContain('SUMMARY');
  expect(text).toContain('Time Slot: 10-1');
    fs.unlinkSync(out);
  });
});
