const request = require("supertest");
const app = require("../src/index");

describe("Satisfaction Rate API Tests", () => {
  test("GET /feedback/satisfaction without event_id should return 400", async () => {
    const res = await request(app).get("/feedback/satisfaction");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /feedback/satisfaction?event_id=E01 returns success or 404", async () => {
    const res = await request(app).get("/feedback/satisfaction?event_id=E01");
    expect([200, 404]).toContain(res.statusCode);
  });

  test("Response structure includes satisfaction_rate key when 200", async () => {
    const res = await request(app).get("/feedback/satisfaction?event_id=E01");
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("satisfaction_rate");
    }
  });
});
