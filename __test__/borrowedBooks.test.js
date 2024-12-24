const request = require("supertest");
const express = require("express");
const borrowedBooksRouter = require("../routes/borrowedBooksRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/borrowedBooks", borrowedBooksRouter);

describe("BorrowedBooks API", () => {
  it("should return all borrowed books", async () => {
    const response = await request(app).get("/api/borrowedBooks");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        borrowedAt: expect.any(String),
        borrowedDays: expect.any(Number),
        userNIM: expect.any(String),
      }),
    ]));
  });

  it("should return a specific borrowed book by id", async () => {
    const response = await request(app).get("/api/borrowedBooks/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
  });

  it("should return 404 when book is not found", async () => {
    const response = await request(app).get("/api/borrowedBooks/text");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Borrowed book not found");
  });

  it("should return 400 when trying to borrow a book with invalid days", async () => {
    const response = await request(app)
      .post("/api/borrowedBooks/1")
      .send({ borrowedDays: 0, userNIM: "12345678" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Jumlah hari peminjaman harus antara 1 dan 14 hari");
  });

  it("should return 400 when no userNIM is provided", async () => {
    const response = await request(app)
      .post("/api/borrowedBooks/1")
      .send({ borrowedDays: 5 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User NIM harus disertakan");
  });

  it("should borrow a book successfully", async () => {
    const response = await request(app)
      .post("/api/borrowedBooks/1")
      .send({ borrowedDays: 7, userNIM: "12345678" });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("title", "Laskar Pelangi");
  });

  it("should delete a borrowed book", async () => {
    const response = await request(app).delete("/api/borrowedBooks/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("title", "Laskar Pelangi");
  });

  it("should return 404 when trying to delete a non-existing borrowed book", async () => {
    const response = await request(app).delete("/api/borrowedBooks/999");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Borrowed book not found");
  });

  it("should return 404 when trying to extend loan for a non-existing borrowed book", async () => {
    const response = await request(app)
      .put("/api/borrowedBooks/999")
      .send({ additionalDays: 7 });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Borrowed book not found");
  });
});
