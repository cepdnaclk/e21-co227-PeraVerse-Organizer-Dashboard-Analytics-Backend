const request = require("supertest");
const app = require("../src/index");

describe("Event Ranking API Tests", () => {
  test("GET /feedback/rank should return 200", async () => {
    const res = await request(app).get("/feedback/rank");
    expect(res.statusCode).toBe(200);
  });

  test("GET /feedback/rank?rank=1 should return rank object", async () => {
    const res = await request(app).get("/feedback/rank?rank=1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("rank");
  });

  test("Ranked events structure includes average_rating field", async () => {
    const res = await request(app).get("/feedback/rank?rank=1");
    if (res.statusCode === 200) {
      expect(res.body.events[0]).toHaveProperty("average_rating");
    }
  });
});
