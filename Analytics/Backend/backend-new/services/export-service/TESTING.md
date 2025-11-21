# Export Service – Testing

This folder now includes unit tests that exercise all report generators in `src/services`:

Covered modules
- attendanceUsagePDF.js → generates Attendance & Usage PDF
- attendanceUsageCSV.js → generates Attendance & Usage CSV
- eventSummaryPDF.js → generates Event Summary PDF
- movementFlowPDF.js → generates Movement & Flow PDF
- movementFlowCSV.js → generates Movement & Flow CSV
- securityExceptionPDF.js → generates Security & Exception PDF

What the tests do
- Mock the database layer (`src/utils/db1.js` and `src/utils/db2.js`) to return predictable rows for each query.
- Mock `chartjs-node-canvas` to return a tiny valid PNG so PDFKit can embed charts.
- Generate each export and assert:
  - the file path is returned,
  - the file exists and is non-empty (PDF), or
  - the CSV contains expected headers/sections (CSV).
- Clean up generated files after each test run.

How to run

```powershell
# from services/export-service
npm i
npm test
```

Notes
- Tests run in Node environment (Jest). No real DB or Canvas native bindings are required.
- Filenames include an ISO timestamp; the test suite freezes time for determinism.
