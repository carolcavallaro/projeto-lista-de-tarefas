// Elementos do DOM
const formularioTarefa = document.getElementById('formulario-principal');
const inputTarefa = document.getElementById('input-tarefa');
const listaTarefas = document.getElementById('lista-itens');
const mensagemVazia = document.getElementById('sem-mensagem');
const botaoTema = document.getElementById('botao-tema');
const botaoAudio = document.getElementById('botao-audio');
const audioLofi = document.getElementById('audio-lofi');

// Carregar preferências e dados salvos no navegador (localStorage)
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let temaEscuroAtivo = localStorage.getItem('tema') === 'dark';

// Aplicar tema inicial ao carregar a página
if (temaEscuroAtivo) {
  document.body.classList.add('tema-escuro');
  botaoTema.textContent = '☀️';
} else {
  botaoTema.textContent = '🌙';
}

// Alternar Tema Escuro/Claro
botaoTema.addEventListener('click', () => {
  temaEscuroAtivo = !temaEscuroAtivo;
  document.body.classList.toggle('tema-escuro', temaEscuroAtivo);
  localStorage.setItem('tema', temaEscuroAtivo ? 'dark' : 'light');
  botaoTema.textContent = temaEscuroAtivo ? '☀️' : '🌙';
});

// Alternar Música
let estaTocando = false;
botaoAudio.addEventListener('click', () => {
  if (estaTocando) {
    audioLofi.pause();
    botaoAudio.textContent = '🎵';
  } else {
    audioLofi.play().catch(() => {
      alert("Clique novamente para permitir o áudio no seu navegador!");
    });
    botaoAudio.textContent = '⏸️';
  }
  estaTocando = !estaTocando;
});

// Salvar tarefas no localStorage
function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Renderizar as tarefas na tela
function renderizarTarefas() {
  listaTarefas.innerHTML = '';

  if (tarefas.length === 0) {
    mensagemVazia.style.display = 'block';
  } else {
    mensagemVazia.style.display = 'none';
  }

  tarefas.forEach((tarefa, indice) => {
    const li = document.createElement('li');
    li.className = `item-tarefa ${tarefa.concluida ? 'concluida' : ''}`;

    li.innerHTML = `
      <div class="conteudo-tarefa" onclick="alternarTarefa(${indice})">
        <input type="checkbox" ${tarefa.concluida ? 'checked' : ''} readOnly />
        <span>${escaparHTML(tarefa.texto)}</span>
      </div>
      <button class="botao-excluir" onclick="excluirTarefa(event, ${indice})" title="Excluir">🗑️</button>
    `;

    listaTarefas.appendChild(li);
  });
}

// Evento de adicionar nova tarefa
formularioTarefa.addEventListener('submit', (e) => {
  e.preventDefault();
  const textoTarefa = inputTarefa.value.trim();
  
  if (textoTarefa) {
    tarefas.push({ texto: textoTarefa, concluida: false });
    salvarTarefas();
    renderizarTarefas();
    inputTarefa.value = '';
  }
});

// Marcar tarefa como concluída ou pendente
function alternarTarefa(indice) {
  tarefas[indice].concluida = !tarefas[indice].concluida;
  salvarTarefas();
  renderizarTarefas();
}

// Excluir tarefa
function excluirTarefa(evento, indice) {
  evento.stopPropagation();
  tarefas.splice(indice, 1);
  salvarTarefas();
  renderizarTarefas();
}

// Sanitizar texto digitado para evitar código malicioso no HTML
function escaparHTML(str) {
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

// Inicializar a aplicação listando o que estiver salvo
renderizarTarefas();