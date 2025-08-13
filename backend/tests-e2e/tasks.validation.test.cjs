const request = require("supertest");
const api = request("http://localhost:4000");

describe("Tasks API – validation rules", () => {
  jest.setTimeout(10000);
  let id; // temp task for invalid PATCH test

  beforeAll(async () => {
    // Create a minimal valid task to use in PATCH tests
    const res = await api
      .post("/api/tasks")
      .send({
        title: "Temp",
        status: "todo",
        dueDate: new Date().toISOString(),
      })
      .set("Content-Type", "application/json");
    id = res.body._id;
  });

  afterAll(async () => {
    // Clean up the temp task
    if (id) await api.delete(`/api/tasks/${id}`);
  });

  test("POST without title → 400", async () => {
    // Missing title should fail Zod validation
    const res = await api
      .post("/api/tasks")
      .send({ status: "todo", dueDate: new Date().toISOString() })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
    expect(res.body?.error).toBeDefined();
  });

  test("POST without dueDate → 400", async () => {
    // Missing dueDate should fail using Zod validation
    const res = await api
      .post("/api/tasks")
      .send({ title: "No due", status: "todo" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });

  test("PATCH status with invalid value → 400", async () => {
    // Status must be one of todo|in_progress|done
    const res = await api
      .patch(`/api/tasks/${id}/status`)
      .send({ status: "not_a_valid_status" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });
});
