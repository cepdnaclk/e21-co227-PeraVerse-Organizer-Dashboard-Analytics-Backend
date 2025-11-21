const fs = require('fs');
const path = require('path');
const { createDbMock } = require('../helpers/dbMock');

describe('attendanceUsagePDF', () => {
	const servicePath = path.join(__dirname, '../../src/services/attendanceUsagePDF.js');
	const db2Path = path.join(__dirname, '../../src/utils/db2.js');
	const db1Path = path.join(__dirname, '../../src/utils/db1.js');

	beforeEach(() => {
		jest.resetModules();
	});

	it('generates a PDF and returns its path', async () => {
		jest.doMock(db2Path, () => createDbMock(), { virtual: false });
		jest.doMock(db1Path, () => createDbMock(), { virtual: false });

		const { generateAttendanceUsagePDF } = require(servicePath);
		const out = await generateAttendanceUsagePDF({ day: 1 });
		expect(out).toMatch(/attendance_usage.*\.pdf$/);
		expect(fs.existsSync(out)).toBe(true);
		const size = fs.statSync(out).size;
		expect(size).toBeGreaterThan(100); // basic sanity
		// cleanup
		fs.unlinkSync(out);
	});
});

