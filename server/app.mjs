import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {

  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ 
      "message": "Server could not create assignment because there are missing data from client" 
    });
  }
  
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(), 
  }
  console.log(newAssignment);
  
  try {
      await connectionPool.query(
  `INSERT INTO assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,[
    newAssignment.title,
    newAssignment.content,
    newAssignment.category,
    newAssignment.length,
    newAssignment.user_id,
    newAssignment.status,
    newAssignment.created_at,
    newAssignment.updated_at,
    newAssignment.published_at,
   ]
  )
  } catch {
    return res.status(500).json({ "message": "Server could not create assignment because database connection" });
  }

  return res.status(201).json({ 
    message: "Created assignment sucessfully" });
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
