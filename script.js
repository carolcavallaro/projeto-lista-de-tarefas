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

    // Tornar o item arrastável e guardar sua posição
    li.setAttribute('draggable', 'true');
    li.dataset.indice = indice;

    // Eventos de Drag and Drop individuais de cada item
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', indice);
      li.classList.add('arrastando');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('arrastando');
    });

    li.innerHTML = `
      <span class="alca-arraste" title="Arraste para reordenar">⋮⋮</span>
      <div class="conteudo-tarefa" onclick="alternarTarefa(${indice})">
        <input type="checkbox" ${tarefa.concluida ? 'checked' : ''} readOnly />
        <span>${escaparHTML(tarefa.texto)}</span>
      </div>
      <button class="botao-excluir" onclick="excluirTarefa(event, ${indice})" title="Excluir">🗑️</button>
    `;

    listaTarefas.appendChild(li);
  });
}

// Configurar a lista inteira para aceitar a reorganização (fora do forEach!)
listaTarefas.addEventListener('dragover', (e) => {
  e.preventDefault(); // Necessário para permitir soltar o item
  const itemArrastando = document.querySelector('.arrastando');
  
  // Aqui chamamos corretamente a função passando a posição do mouse (e.clientY)
  const elementoAbaixo = obterElementoAbaixo(listaTarefas, e.clientY);

  if (!elementoAbaixo) {
    listaTarefas.appendChild(itemArrastando);
  } else {
    listaTarefas.insertBefore(itemArrastando, elementoAbaixo);
  }
});

listaTarefas.addEventListener('drop', (e) => {
  e.preventDefault();

  // Recalcula a ordem do array com base na nova posição visual dos elementos na tela
  const novosItens = [...listaTarefas.querySelectorAll('.item-tarefa')];
  const novaListaTarefas = novosItens.map(li => {
    const indiceAntigo = li.dataset.indice;
    return tarefas[indiceAntigo];
  });

  tarefas = novaListaTarefas;
  salvarTarefas();
  renderizarTarefas();
});

// Função matemática auxiliar para descobrir qual item está sob o cursor
function obterElementoAbaixo(container, mouseY) {
  const elementosSemArrasta = [...container.querySelectorAll('.item-tarefa:not(.arrastando)')];

  return elementosSemArrasta.reduce((maisProximo, filho) => {
    // CORRIGIDO: O nome correto do método nativo é getBoundingClientRect (sem o 'React')
    const caixa = filho.getBoundingClientRect();
    const offset = mouseY - caixa.top - caixa.height / 2;

    if (offset < 0 && offset > maisProximo.offset) {
      return { offset: offset, element: filho };
    } else {
      return maisProximo;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
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