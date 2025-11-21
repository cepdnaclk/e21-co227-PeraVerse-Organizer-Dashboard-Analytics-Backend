const request = require("supertest");
const app = require("../src/index");

describe("Feedback Filtering API Tests", () => {

  // Test 1: Check if endpoint works
  test("GET /feedback/filter should return 200", async () => {
    const res = await request(app).get("/feedback/filter");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 2: Check positive sentiment filter
  test("GET /feedback/filter?sentiment=positive should return filtered data", async () => {
    const res = await request(app).get("/feedback/filter?sentiment=positive");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 3: Check zone and building filter combination
  test("GET /feedback/filter?zone=ZoneA&building=MainHall should return 200", async () => {
    const res = await request(app).get("/feedback/filter?zone=ZoneA&building=MainHall");
    expect(res.statusCode).toBe(200);
  });

});
