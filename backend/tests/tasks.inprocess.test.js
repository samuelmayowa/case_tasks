import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Clean DB between tests so they don't leak into each other
afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

describe("Tasks API (in-process, memory Mongo) – CRUD + validation", () => {
  let id;

  test("POST creates a task (201)", async () => {
    const due = new Date(Date.now() + 3600e3).toISOString();
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Review case C123456", status: "todo", dueDate: due })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Review case C123456");
    id = res.body._id;
  });

  test("GET lists tasks (200)", async () => {
    // seed one
    const due = new Date().toISOString();
    await request(app)
      .post("/api/tasks")
      .send({ title: "Seed", status: "todo", dueDate: due })
      .set("Content-Type", "application/json");

    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test("GET by id (200) then PATCH status (200) then DELETE (204) then 404", async () => {
    const due = new Date().toISOString();

    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "To update", status: "todo", dueDate: due })
      .set("Content-Type", "application/json");
    const _id = created.body._id;

    const byId = await request(app).get(`/api/tasks/${_id}`);
    expect(byId.status).toBe(200);
    expect(byId.body._id).toBe(_id);

    const patched = await request(app)
      .patch(`/api/tasks/${_id}/status`)
      .send({ status: "done" })
      .set("Content-Type", "application/json");
    expect(patched.status).toBe(200);
    expect(patched.body.status).toBe("done");

    const del = await request(app).delete(`/api/tasks/${_id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/tasks/${_id}`);
    expect(after.status).toBe(404);
    expect(after.body?.error?.code).toBe("TASK_NOT_FOUND");
  });

  test("Validation: missing title → 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ status: "todo", dueDate: new Date().toISOString() })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });

  test("Validation: invalid status on PATCH → 400", async () => {
    const due = new Date().toISOString();
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "X", status: "todo", dueDate: due })
      .set("Content-Type", "application/json");

    const bad = await request(app)
      .patch(`/api/tasks/${created.body._id}/status`)
      .send({ status: "not_valid" })
      .set("Content-Type", "application/json");

    expect(bad.status).toBe(400);
  });

  test("Invalid ObjectId format → 400", async () => {
    const res = await request(app).get("/api/tasks/abc");
    expect([400, 404]).toContain(res.status);
  });
});
