/* ════════════════════════════════════════════════
   app.js — Lógica principal (integrado ao backend)
════════════════════════════════════════════════ */

const CATEGORIAS = ['Bolsas','Cintos','Colares','Brincos','Pulseiras','Óculos','Outros'];

// ── Estado global ─────────────────────────────
let state = {
  usuario:    null,
  produtos:   [],
  editProdId: null,
  editUserId: null,
  sortCol:    null,
  sortDir:    'asc',
  confirmCb:  null,
};

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Tema salvo
  if (localStorage.getItem('an_tema') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }

  // Sessão ativa
  const u = getUsuario();
  if (u && getToken()) {
    state.usuario = u;
    iniciarApp();
  } else {
    mostrarAuth('tela-login');
  }
});

// ════════════════════════════════════════════════
//  TEMA
// ════════════════════════════════════════════════
function toggleTema() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? '' : 'dark';
  localStorage.setItem('an_tema', dark ? '' : 'dark');
}

// ════════════════════════════════════════════════
//  UTILITÁRIOS
// ════════════════════════════════════════════════
function toast(msg, tipo = '') {
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function pedir(msg, cb) {
  document.getElementById('modal-msg').textContent = msg;
  document.getElementById('overlay').classList.add('open');
  state.confirmCb = cb;
}
function fecharModal() {
  document.getElementById('overlay').classList.remove('open');
  state.confirmCb = null;
}
function confirmarAcao() {
  if (state.confirmCb) state.confirmCb();
  fecharModal();
}

function setLoading(btnId, loading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Aguarde…' : label;
}

// ════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════
function mostrarAuth(tela) {
  document.getElementById('auth-wrap').style.display    = 'flex';
  document.getElementById('app-shell').style.display    = 'none';
  document.getElementById('tela-login').style.display    = tela === 'tela-login'    ? 'block' : 'none';
  document.getElementById('tela-cadastro').style.display = tela === 'tela-cadastro' ? 'block' : 'none';
}

function irPara(tela) { mostrarAuth(tela); }

async function login() {
  const u = document.getElementById('lu').value.trim();
  const s = document.getElementById('ls').value;
  if (!u || !s) { toast('Preencha usuário e senha.', 'err'); return; }

  setLoading('btn-login', true, 'Entrar');
  try {
    const data    = await apiLogin(u, s);
    state.usuario = data.usuario;
    iniciarApp();
  } catch (e) {
    toast(e, 'err');
  } finally {
    setLoading('btn-login', false, 'Entrar');
  }
}

async function cadastrar() {
  const u = document.getElementById('cu').value.trim();
  const s = document.getElementById('cs').value;
  if (!u || !s) { toast('Preencha todos os campos.', 'err'); return; }
  if (s.length < 4) { toast('Senha deve ter ao menos 4 caracteres.', 'err'); return; }

  setLoading('btn-cadastrar', true, 'Cadastrar');
  try {
    await apiRegister(u, s);
    toast('Conta criada! Faça login.', 'ok');
    document.getElementById('cu').value = '';
    document.getElementById('cs').value = '';
    irPara('tela-login');
  } catch (e) {
    toast(e, 'err');
  } finally {
    setLoading('btn-cadastrar', false, 'Cadastrar');
  }
}

function logout() {
  clearSessao();
  state.usuario  = null;
  state.produtos = [];
  mostrarAuth('tela-login');
}

// ════════════════════════════════════════════════
//  APP SHELL
// ════════════════════════════════════════════════
function iniciarApp() {
  document.getElementById('auth-wrap').style.display = 'none';
  document.getElementById('app-shell').style.display = 'flex';

  const u = state.usuario;
  document.getElementById('sb-nome').textContent   = u.usuario;
  document.getElementById('sb-perfil').textContent = u.perfil;

  // Menu usuários: somente admin
  document.getElementById('nav-usuarios').style.display =
    u.perfil === 'administrador' ? 'flex' : 'none';

  abrirTela('produtos');
}

function abrirTela(nome) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tela-${nome}`)?.classList.add('on');
  document.getElementById(`nav-${nome}`)?.classList.add('active');

  if (nome === 'produtos') {
    const soLeitura = state.usuario.perfil === 'operacional';
    document.getElementById('form-produto').style.display      = soLeitura ? 'none' : 'block';
    document.getElementById('btn-importar-csv').style.display  = soLeitura ? 'none' : 'inline-flex';
    carregarProdutos();
  }
  if (nome === 'usuarios') {
    if (state.usuario.perfil !== 'administrador') {
      toast('Acesso negado.', 'err');
      return;
    }
    carregarUsuarios();
  }
}

// ════════════════════════════════════════════════
//  PRODUTOS — CRUD
// ════════════════════════════════════════════════
async function carregarProdutos() {
  const tbody = document.getElementById('tbody-prod');
  tbody.innerHTML = `<tr><td colspan="5" class="td-empty">Carregando…</td></tr>`;
  try {
    state.produtos = await apiGetProdutos();
    renderProdutos();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="td-empty" style="color:var(--danger)">Erro: ${e}</td></tr>`;
  }
}

async function salvarProduto() {
  const nome       = document.getElementById('pn').value.trim();
  const categoria  = document.getElementById('pc').value;
  const preco      = document.getElementById('pp').value;
  const quantidade = document.getElementById('pq').value;

  if (!nome || !categoria || !preco || quantidade === '') {
    toast('Nome, categoria, preço e quantidade são obrigatórios.', 'err'); return;
  }

  const dados = {
    nome, categoria,
    preco:         Number(preco),
    quantidade:    Number(quantidade),
    quantidade_min: Number(document.getElementById('pqmin').value) || 5,
    sku:           document.getElementById('psku').value.trim() || null,
    descricao:     document.getElementById('pdesc').value.trim() || null,
  };

  setLoading('btn-salvar-prod', true, '＋ Adicionar');
  try {
    if (state.editProdId !== null) {
      await apiAtualizarProduto(state.editProdId, dados);
      toast('Produto atualizado!', 'ok');
      cancelarEdicao();
    } else {
      await apiCriarProduto(dados);
      toast('Produto adicionado!', 'ok');
      limparFormProd();
    }
    await carregarProdutos();
  } catch (e) {
    toast(e, 'err');
  } finally {
    setLoading('btn-salvar-prod', false, state.editProdId ? '💾 Salvar' : '＋ Adicionar');
  }
}

function limparFormProd() {
  ['pn','pc','pp','pq','pqmin','psku','pdesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function cancelarEdicao() {
  state.editProdId = null;
  limparFormProd();
  document.getElementById('btn-salvar-prod').textContent      = '＋ Adicionar';
  document.getElementById('btn-cancelar-prod').style.display  = 'none';
  document.getElementById('form-titulo').textContent           = 'Adicionar produto';
}

function editarProduto(id) {
  const p = state.produtos.find(p => p.id === id);
  if (!p) return;
  state.editProdId = id;
  document.getElementById('pn').value    = p.nome;
  document.getElementById('pc').value    = p.categoria;
  document.getElementById('pp').value    = p.preco;
  document.getElementById('pq').value    = p.quantidade;
  document.getElementById('pqmin').value = p.quantidade_min;
  document.getElementById('psku').value  = p.sku || '';
  document.getElementById('pdesc').value = p.descricao || '';
  document.getElementById('btn-salvar-prod').textContent     = '💾 Salvar alterações';
  document.getElementById('btn-cancelar-prod').style.display = 'inline-flex';
  document.getElementById('form-titulo').textContent          = 'Editar produto';
  document.getElementById('form-produto').scrollIntoView({ behavior: 'smooth' });
}

function excluirProduto(id) {
  const p = state.produtos.find(p => p.id === id);
  pedir(`Excluir "${p?.nome}"?`, async () => {
    try {
      await apiDeletarProduto(id);
      toast('Produto excluído.', 'ok');
      await carregarProdutos();
    } catch (e) { toast(e, 'err'); }
  });
}

// ── Filtro e ordenação ────────────────────────
function filtrados() {
  const busca = document.getElementById('f-busca')?.value.toLowerCase() || '';
  const min   = parseFloat(document.getElementById('f-pmin')?.value) || 0;
  const max   = parseFloat(document.getElementById('f-pmax')?.value) || Infinity;

  let lista = state.produtos.filter(p =>
    p.nome.toLowerCase().includes(busca) &&
    p.preco >= min && p.preco <= max
  );

  if (state.sortCol) {
    lista = lista.slice().sort((a, b) => {
      let va = a[state.sortCol], vb = b[state.sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      const d = state.sortDir === 'asc' ? 1 : -1;
      return va < vb ? -d : va > vb ? d : 0;
    });
  }
  return lista;
}

function ordenar(col) {
  state.sortDir = state.sortCol === col && state.sortDir === 'asc' ? 'desc' : 'asc';
  state.sortCol = col;
  renderProdutos();
}

// ── Render tabela ─────────────────────────────
function renderProdutos() {
  const tbody  = document.getElementById('tbody-prod');
  const lista  = filtrados();
  const perfil = state.usuario?.perfil;
  const isAdmin = perfil === 'administrador' || perfil === 'tecnico';

  document.querySelectorAll('th[data-col]').forEach(th => {
    th.classList.remove('asc', 'desc');
    if (th.dataset.col === state.sortCol) th.classList.add(state.sortDir);
  });

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="td-empty">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(p => {
    const baixo = p.quantidade < (p.quantidade_min ?? 5);
    const acoes = isAdmin
      ? `<button class="btn btn-ghost btn-icon" onclick="editarProduto(${p.id})" title="Editar">✏️</button>
         <button class="btn btn-danger btn-icon" onclick="excluirProduto(${p.id})" title="Excluir">🗑️</button>`
      : `<span style="color:var(--muted);font-size:12px">—</span>`;

    return `<tr${baixo ? ' class="low"' : ''}>
      <td>${p.nome}</td>
      <td>${p.sku ? `<code>${p.sku}</code>` : '—'}</td>
      <td>R$ ${Number(p.preco).toFixed(2)}</td>
      <td class="qty">${p.quantidade}${baixo ? ' ⚠️' : ''}</td>
      <td><span class="badge badge-cat">${p.categoria}</span></td>
      <td>${acoes}</td>
    </tr>`;
  }).join('');
}

// ════════════════════════════════════════════════
//  USUÁRIOS — CRUD (somente admin)
// ════════════════════════════════════════════════
async function carregarUsuarios() {
  const tbody = document.getElementById('tbody-users');
  tbody.innerHTML = `<tr><td colspan="3" class="td-empty">Carregando…</td></tr>`;
  try {
    const lista = await apiGetUsuarios();
    renderUsers(lista);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3" class="td-empty" style="color:var(--danger)">Erro: ${e}</td></tr>`;
  }
}

function renderUsers(lista) {
  const tbody   = document.getElementById('tbody-users');
  const classes = { administrador: 'badge-admin', tecnico: 'badge-tec', operacional: 'badge-op' };

  if (!lista?.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="td-empty">Nenhum usuário.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(u => `
    <tr>
      <td>${u.usuario}</td>
      <td><span class="badge ${classes[u.perfil] || ''}">${u.perfil}</span></td>
      <td>
        <button class="btn btn-ghost btn-icon" onclick="editarUser(${u.id})" title="Editar">✏️</button>
        ${u.id !== state.usuario.id
          ? `<button class="btn btn-danger btn-icon" onclick="excluirUser(${u.id})" title="Excluir">🗑️</button>`
          : '<span title="Você mesmo" style="opacity:.3;font-size:12px;padding:4px">🔒</span>'}
      </td>
    </tr>`).join('');
}

async function editarUser(id) {
  try {
    const lista = await apiGetUsuarios();
    const u = lista.find(u => u.id === id);
    if (!u) return;
    state.editUserId = id;
    document.getElementById('eun').value = u.usuario;
    document.getElementById('eup').value = u.perfil;
    document.getElementById('eus').value = '';
    document.getElementById('painel-edit-user').style.display = 'block';
    document.getElementById('painel-edit-user').scrollIntoView({ behavior: 'smooth' });
  } catch (e) { toast(e, 'err'); }
}

async function salvarUser() {
  const usuario = document.getElementById('eun').value.trim();
  const perfil  = document.getElementById('eup').value;
  const senha   = document.getElementById('eus').value;
  if (!usuario || !perfil) { toast('Preencha usuário e perfil.', 'err'); return; }

  setLoading('btn-salvar-user', true, '💾 Salvar');
  try {
    const dados = { usuario, perfil };
    if (senha) dados.senha = senha;
    await apiAtualizarUsuario(state.editUserId, dados);
    toast('Usuário atualizado!', 'ok');
    cancelarEditUser();
    carregarUsuarios();
  } catch (e) { toast(e, 'err'); }
  finally { setLoading('btn-salvar-user', false, '💾 Salvar'); }
}

function cancelarEditUser() {
  state.editUserId = null;
  document.getElementById('painel-edit-user').style.display = 'none';
}

function excluirUser(id) {
  pedir('Deseja excluir este usuário?', async () => {
    try {
      await apiDeletarUsuario(id);
      toast('Usuário excluído.', 'ok');
      carregarUsuarios();
    } catch (e) { toast(e, 'err'); }
  });
}

// ════════════════════════════════════════════════
//  IMPORTAÇÃO CSV
// ════════════════════════════════════════════════
function abrirImportCSV() { document.getElementById('csv-input').click(); }

function importarCSV(input) {
  const arquivo = input.files[0];
  if (!arquivo) return;
  if (!arquivo.name.toLowerCase().endsWith('.csv')) {
    toast('Selecione um arquivo .csv válido.', 'err'); input.value = ''; return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const linhas = e.target.result.trim().split(/\r?\n/);
    if (linhas.length < 2) { toast('Arquivo vazio.', 'err'); return; }

    const sep      = linhas[0].includes(';') ? ';' : ',';
    const cabec    = linhas[0].split(sep).map(c => c.trim().toLowerCase());
    const obrig    = ['nome','categoria','preco','quantidade'];
    const faltando = obrig.filter(c => !cabec.includes(c));
    if (faltando.length) { toast(`Colunas faltando: ${faltando.join(', ')}`, 'err'); return; }

    const idx = { nome: cabec.indexOf('nome'), categoria: cabec.indexOf('categoria'), preco: cabec.indexOf('preco'), quantidade: cabec.indexOf('quantidade') };
    let ok = 0, fail = 0;

    for (const [i, linha] of linhas.slice(1).entries()) {
      if (!linha.trim()) continue;
      const cols     = linha.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
      const nome     = cols[idx.nome] || '';
      const categoria = cols[idx.categoria] || '';
      const preco    = parseFloat((cols[idx.preco] || '').replace(',', '.'));
      const quantidade = parseInt(cols[idx.quantidade] || '');

      if (!nome || !CATEGORIAS.includes(categoria) || isNaN(preco) || isNaN(quantidade)) {
        fail++; continue;
      }
      try {
        await apiCriarProduto({ nome, categoria, preco, quantidade });
        ok++;
      } catch { fail++; }
    }

    input.value = '';
    if (ok)   toast(`${ok} produto(s) importado(s)!`, 'ok');
    if (fail) setTimeout(() => toast(`${fail} linha(s) ignorada(s).`, 'err'), 400);
    carregarProdutos();
  };
  reader.readAsText(arquivo, 'UTF-8');
}

// ════════════════════════════════════════════════
//  RELATÓRIO PDF
// ════════════════════════════════════════════════
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF();
  const hoje = new Date().toLocaleDateString('pt-BR');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Acessórios Norte — Relatório de Produtos', 14, 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`Gerado em ${hoje}`, 14, 25);
  doc.line(14, 28, 196, 28);

  let y = 36;
  doc.setFont('helvetica', 'bold');
  doc.text('Produto', 14, y); doc.text('Categoria', 75, y);
  doc.text('Preço', 120, y); doc.text('Qtd', 148, y); doc.text('Subtotal', 165, y);
  y += 5; doc.line(14, y, 196, y); y += 7;

  doc.setFont('helvetica', 'normal');
  let total = 0;
  state.produtos.forEach(p => {
    const sub = p.preco * p.quantidade; total += sub;
    doc.text(String(p.nome).substring(0, 30), 14, y);
    doc.text(String(p.categoria), 75, y);
    doc.text(`R$ ${Number(p.preco).toFixed(2)}`, 120, y);
    doc.text(String(p.quantidade), 148, y);
    doc.text(`R$ ${sub.toFixed(2)}`, 165, y);
    y += 8;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.line(14, y, 196, y); y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de produtos: ${state.produtos.length}`, 14, y);
  doc.text(`Valor total em estoque: R$ ${total.toFixed(2)}`, 14, y + 8);

  doc.save('relatorio_acessorios_norte.pdf');
  toast('PDF exportado!', 'ok');
}

function limparEstoque() {
  pedir('Isso vai apagar TODOS os produtos. Tem certeza?', async () => {
    try {
      await apiLimparProdutos();
      toast('Estoque limpo com sucesso!', 'ok');
      carregarProdutos();
    } catch (e) {
      toast(e, 'err');
    }
  });
}