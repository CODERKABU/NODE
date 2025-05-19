const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let todos = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const editIndex = req.query.edit;
  res.render('index', { todos, editIndex });
});

app.post('/add', (req, res) => {
  const task = req.body.task.trim();
  if (task) {
    todos.push(task);
  }
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const index = req.body.index;
  todos.splice(index, 1);
  res.redirect('/');
});

app.post('/edit', (req, res) => {
  const index = req.body.index;
  const updatedTask = req.body.updatedTask.trim();
  if (updatedTask) {
    todos[index] = updatedTask;
  }
  res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
