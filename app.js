const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const { error } = require("console");
const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MySql connection

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
db.connect((err) => {
  if (err) {
    console.log("Something went wrong", err);
  } else {
    console.log("MYSQL connected successfully");
  }
});

// routes

// get all the tasks
app.get("/api/tasks", (req, res) => {
  //   res.status(201).send("THis is the get route");

  const query = "SELECT * FROM tasklist";
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

//get a single task by id
app.get("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const query = "SELECT * FROM tasklist WHERE id = ? ";

  db.query(query, [taskId], (err, result) => {
    if (err) {
      console.error("Error fetching tasks", err);
      res.status(500).send("Error fetching tasks");
    } else if (result.length === 0) {
      res.status(404).send("task not found");
    } else {
      res.status(200).json(result[0]);
    }
  });
});
//add a new task
app.post("/api/tasks", (req, res) => {
  const { title, description, due_date } = req.body;
  const query =
    "INSERT INTO tasklist (title, description, due_date) VALUES (?, ?, ?)";

  db.query(query, [title, description, due_date], (err, result) => {
    if (err) {
      console.error("Error adding tasks", err);
      res.status(500).send("Error adding tasks");
    } else {
      res
        .status(200)
        .json({
          id: result.insertId,
          title,
          description,
          due_date,
          status: "pending",
        });
    }
  });
});

// update a task
app.put("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, due_date } = req.body;
  const query =
    "UPDATE tasklist SET title = ?,description = ?, status = ?,due_date = ? WHERE id = ?";

  db.query(query, [title, description, status, due_date, taskId], (err) => {
    if (err) {
      console.error("Error updating tasks", err);
      res.status(500).send("Error updating tasks");
    }
    res.json({ taskId, title, description, status, due_date });
  });
});

// delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const query = "DELETE FROM tasklist WHERE id = ?";

  db.query(query, [taskId], (err) => {
    if (err) {
      console.error("Error deleting tasks", err);
      res.status(500).send("Error deleting tasks");
    }
    res.status(200).send("User deleted Successfully");
  });
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT} `);
});
