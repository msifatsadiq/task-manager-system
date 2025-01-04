const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
require("dotenv").config();
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Handlebars configuration
app.engine("handlebars", exphbs.create({ extname: ".handlebars" }).engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Get all tasks and render home page
app.get("/", (req, res) => {
  const query = "SELECT * FROM tasklist";
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.render("home", { tasks: result });
    }
  });
});

//get a single task by id
// app.get("/tasks/:id", (req, res) => {
//   const taskId = req.params.id;
//   const query = "SELECT * FROM tasklist WHERE id = ? ";

//   db.query(query, [taskId], (err, result) => {
//     if (err) {
//       console.error("Error fetching tasks", err);
//       res.status(500).send("Error fetching tasks");
//     } else if (result.length === 0) {
//       res.status(404).send("task not found");
//     } else {
//       res.status(200).json(result[0]);
//     }
//   });
// });
// Add a new task
app.post("/tasks", (req, res) => {
  const { title, description, due_date } = req.body;
  const query =
    "INSERT INTO tasklist (title, description, due_date) VALUES (?, ?, ?)";
  db.query(query, [title, description, due_date], (err, result) => {
    if (err) {
      res.status(500).send("Error adding task");
    } else {
      res.redirect("/");
    }
  });
});

// Render edit form for a task
app.get("/tasks/edit/:id", (req, res) => {
  const taskId = req.params.id;
  const query = "SELECT * FROM tasklist WHERE id = ?";
  db.query(query, [taskId], (err, result) => {
    if (err) {
      res.status(500).send("Error fetching task");
    } else if (result.length === 0) {
      res.status(404).send("Task not found");
    } else {
      res.render("edit", { task: result[0] });
    }
  });
});

// Update a task
app.post("/tasks/update/:id", (req, res) => {
  const taskId = req.params.id;
  const { title, description, due_date } = req.body;
  const query = "UPDATE tasklist SET title = ?, description = ?, due_date = ? WHERE id = ?";

  db.query(query, [title, description, due_date, taskId], (err) => {
    if (err) {
      res.status(500).send("Error updating task");
    } else {
      res.redirect("/");
    }
  });
});



// delete a task
app.post("/tasks/delete/:id", (req, res) => {
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
