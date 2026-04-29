/* ════════════════════════════════════════════════
   api.js — Integração com o backend
════════════════════════════════════════════════ */
const API_URL = 'http://localhost:3000/api';

// ── Token & sessão ────────────────────────────
function getToken()    { return localStorage.getItem('an_token'); }
function setToken(t)   { localStorage.setItem('an_token', t); }
function getUsuario()  { return JSON.parse(localStorage.getItem('an_usuario') || 'null'); }
function setUsuario(u) { localStorage.setItem('an_usuario', JSON.stringify(u)); }

function clearSessao() {
  localStorage.removeItem('an_token');
  localStorage.removeItem('an_usuario');
}

// ── Fetch base ────────────────────────────────
async function req(method, endpoint, body = null, isForm = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!isForm) headers['Content-Type'] = 'application/json';

  const cfg = { method, headers };
  if (body) cfg.body = isForm ? body : JSON.stringify(body);

  const res  = await fetch(`${API_URL}${endpoint}`, cfg);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.erro || `Erro ${res.status}`;
  return data;
}

// ── Auth ──────────────────────────────────────
async function apiLogin(usuario, senha) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.erro || 'Usuário ou senha inválidos.';
  setToken(data.token);
  setUsuario(data.usuario);
  return data;
}

async function apiRegister(usuario, senha) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha, perfil: 'operacional' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.erro || 'Erro ao criar conta.';
  return data;
}

// ── Produtos ──────────────────────────────────
function apiGetProdutos(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v != null))
  ).toString();
  return req('GET', `/produtos${qs ? '?' + qs : ''}`);
}

function apiCriarProduto(dados, arquivo = null) {
  if (arquivo) {
    const fd = new FormData();
    Object.entries(dados).forEach(([k, v]) => v != null && fd.append(k, v));
    fd.append('imagem', arquivo);
    return req('POST', '/produtos', fd, true);
  }
  return req('POST', '/produtos', dados);
}

function apiAtualizarProduto(id, dados, arquivo = null) {
  if (arquivo) {
    const fd = new FormData();
    Object.entries(dados).forEach(([k, v]) => v != null && fd.append(k, v));
    fd.append('imagem', arquivo);
    return req('PUT', `/produtos/${id}`, fd, true);
  }
  return req('PUT', `/produtos/${id}`, dados);
}

function apiDeletarProduto(id) { return req('DELETE', `/produtos/${id}`); }

// ── Usuários ──────────────────────────────────
function apiGetUsuarios()            { return req('GET',    '/usuarios'); }
function apiCriarUsuario(dados)      { return req('POST',   '/usuarios', dados); }
function apiAtualizarUsuario(id, d)  { return req('PUT',    `/usuarios/${id}`, d); }
function apiDeletarUsuario(id)       { return req('DELETE', `/usuarios/${id}`); }