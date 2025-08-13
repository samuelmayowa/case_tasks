const request = require("supertest");

test("GET /api/tasks returns array", async () => {
  // Backend must be running for this test to pass
  const res = await request("http://localhost:4000").get("/api/tasks");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
