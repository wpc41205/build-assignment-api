import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('Server is running on port 4001');
});

//User สามารถดูข้อมูลแบบทดสอบทั้งหมดในระบบได้
app.get('/assignments', async (req, res) => {
  try {
    const client = await connectionPool.connect();
    
    try {
      const result = await client.query('SELECT * FROM assignments');
      await client.release();
      
      res.status(200).json({
        data: result.rows
      });
    } catch (queryError) {
      await client.release();
      throw queryError;
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }
});

// User สามารถดูข้อมูลแบบทดสอบอันเดียวได้
app.get('/assignments/:id', async (req, res) => {
  try {
    const client = await connectionPool.connect();
    
    try {
      const { id } = req.params;
      const result = await client.query('SELECT * FROM assignments WHERE id = $1', [id]);
      await client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested assignment"
        });
      }
      
      res.status(200).json({
        data: result.rows[0]
      });
    } catch (queryError) {
      await client.release();
      throw queryError;
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }
});

// User สามารถแก้ไขแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.put('/assignments/:id', async (req, res) => {
  try {
    const client = await connectionPool.connect();
    
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;
      
      // Check if assignment exists first
      const checkResult = await client.query('SELECT * FROM assignments WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        await client.release();
        return res.status(404).json({
          message: "Server could not find a requested assignment to update"
        });
      }
      
      // Update the assignment
      const updateResult = await client.query(
        'UPDATE assignments SET title = $1, content = $2, category = $3 WHERE id = $4 RETURNING *',
        [title, content, category, id]
      );
      
      await client.release();
      
      res.status(200).json({
        message: "Updated assignment sucessfully"
      });
    } catch (queryError) {
      await client.release();
      throw queryError;
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: "Server could not update assignment because database connection"
    });
  }
});

// User สามารถลบแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.delete('/assignments/:id', async (req, res) => {
  try {
    const client = await connectionPool.connect();
    
    try {
      const { id } = req.params;
      
      // Check if assignment exists first
      const checkResult = await client.query('SELECT * FROM assignments WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        await client.release();
        return res.status(404).json({
          message: "Server could not find a requested assignment to delete"
        });
      }
      
      // Delete the assignment
      await client.query('DELETE FROM assignments WHERE id = $1', [id]);
      
      await client.release();
      
      res.status(200).json({
        message: "Deleted assignment sucessfully"
      });
    } catch (queryError) {
      await client.release();
      throw queryError;
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: "Server could not delete assignment because database connection"
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});