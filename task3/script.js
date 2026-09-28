let tasks = [];
let nextId = 1;           
let currentFilter = 'all';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const warning = document.getElementById('warning');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');
const filterButtons = document.querySelectorAll('.filter-btn');

function addTask() {
  const text = input.value.trim();
  if (text === '') {
    warning.hidden = false;
    return;
  }
  warning.hidden = true;
  tasks.push({ id: nextId++, text: text, completed: false });
  input.value = '';
  render();
}

function toggleTask(id) {
  tasks = tasks.map(function (task) {
    return task.id === id ? { id: task.id, text: task.text, completed: !task.completed } : task;
  });
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  render();
}

function render() {
  list.innerHTML = '';

  tasks.map(function (task) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const visible =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);
    if (!visible) {
      li.classList.add('hidden');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function () {
      toggleTask(task.id);
    });

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.completed) {
      span.classList.add('completed');
    }

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Удалить';
    delBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
  }).forEach(function (li) {
    list.appendChild(li);
  });

  const done = tasks.filter(function (t) { return t.completed; }).length;
  const left = tasks.length - done;
  counter.textContent = 'Осталось: ' + left + ', Выполнено: ' + done;

  filterButtons.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  addTask();
});

input.addEventListener('input', function () {
  warning.hidden = true;
});

filterButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
