// Elementos do DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty-msg');
const themeToggleBtn = document.getElementById('theme-toggle');
const audioToggleBtn = document.getElementById('audio-toggle');
const lofiAudio = document.getElementById('lofi-audio');

// Carregar preferências e dados do localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isDarkTheme = localStorage.getItem('theme') === 'dark';

// Aplicar tema inicial
if (isDarkTheme) {
  document.body.classList.add('dark-theme');
  themeToggleBtn.textContent = '☀️';
} else {
  themeToggleBtn.textContent = '🌙';
}

// Alternar Tema Escuro/Claro
themeToggleBtn.addEventListener('click', () => {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme', isDarkTheme);
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  themeToggleBtn.textContent = isDarkTheme ? '☀️' : '🌙';
});

// Alternar Música
let isPlaying = false;
audioToggleBtn.addEventListener('click', () => {
  if (isPlaying) {
    lofiAudio.pause();
    audioToggleBtn.textContent = '🎵';
  } else {
    lofiAudio.play().catch(() => {
      alert("Clique novamente para permitir o áudio no seu navegador!");
    });
    audioToggleBtn.textContent = '⏸️';
  }
  isPlaying = !isPlaying;
});

// Persistência das tarefas
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Renderização das Tarefas
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-content" onclick="toggleTask(${index})">
        <input type="checkbox" ${task.completed ? 'checked' : ''} readOnly />
        <span>${escapeHTML(task.text)}</span>
      </div>
      <button class="btn-delete" onclick="deleteTask(event, ${index})" title="Excluir">🗑️</button>
    `;

    taskList.appendChild(li);
  });
}

// Evento de Adicionar Tarefa
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  
  if (text) {
    tasks.push({ text: text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
  }
});

// Alternar Concluído/Pendente
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Excluir Tarefa
function deleteTask(event, index) {
  event.stopPropagation();
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Sanitização HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Inicializar
renderTasks();