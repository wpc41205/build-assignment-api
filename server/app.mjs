import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.post('/assignments', async (req, res) => {
  const { title, content, category, length, user_id, status, published_at } = req.body;

  // ตรวจสอบ input ที่จำเป็น
  if (!title || !content || !category || !user_id) {
    return res.status(400).json({ message: "Failed to create assignment. Required fields are missing." });
  }

  try {
    // ตรวจสอบว่า user_id มีอยู่จริงหรือไม่
    const userCheck = await connectionPool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // เพิ่มข้อมูล assignment
    await connectionPool.query(`
      INSERT INTO assignments (title, content, category, length, user_id, status, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [title, content, category, length, user_id, status, published_at]);

    return res.status(201).json({ message: "Created assignment successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create assignment. Database connection error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});