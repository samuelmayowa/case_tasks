const request = require("supertest");
const api = request("http://localhost:4000"); // hits running API

describe("Tasks API – CRUD flow", () => {
  jest.setTimeout(10000);
  let id; // will hold the _id of the task created

  test("POST /api/tasks creates a task (expects 201 + task body)", async () => {
    // Create a valid task
    const payload = {
      title: "Review case C654323",
      description: "Validate evidence bundle",
      status: "todo",
      // dueDate must be a valid ISO string in the future
      dueDate: new Date(Date.now() + 24 * 3600e3).toISOString(),
    };

    const res = await api
      .post("/api/tasks")
      .send(payload)
      .set("Content-Type", "application/json");

    // Asserts: correct status, body has _id, title echoes back
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(payload.title);
    id = res.body._id;
  });

  test("GET /api/tasks lists tasks (expects 200 + array)", async () => {
    const res = await api.get("/api/tasks");
    // Asserts: success + array payload
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/tasks/:id fetches created task (expects 200 + same _id)", async () => {
    const res = await api.get(`/api/tasks/${id}`);
    // Asserts: success + correct record
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(id);
  });

  test("PATCH /api/tasks/:id/status updates status (expects 200 + updated field)", async () => {
    const res = await api
      .patch(`/api/tasks/${id}/status`)
      .send({ status: "done" })
      .set("Content-Type", "application/json");

    // Asserts: success + status changed to 'done'
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  test("DELETE /api/tasks/:id deletes task (expects 204)", async () => {
    const res = await api.delete(`/api/tasks/${id}`);
    // Asserts: 204 No Content
    expect(res.status).toBe(204);
  });

  test("GET /api/tasks/:id after delete returns 404", async () => {
    const res = await api.get(`/api/tasks/${id}`);
    // Asserts: not found once deleted
    expect(res.status).toBe(404);
  });
});
