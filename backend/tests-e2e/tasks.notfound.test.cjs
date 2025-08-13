const request = require("supertest");
const api = request("http://localhost:4000");

// A valid ObjectId format that might not exist in  DB
const MISSING_ID = "000000000000000000000000";

describe("Tasks API – not found cases", () => {
  test("GET non-existent id → 404", async () => {
    const res = await api.get(`/api/tasks/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });

  test("PATCH status with non-existent id → 404", async () => {
    const res = await api
      .patch(`/api/tasks/${MISSING_ID}/status`)
      .send({ status: "done" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(404);
  });

  test("DELETE non-existent id → 404", async () => {
    const res = await api.delete(`/api/tasks/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
