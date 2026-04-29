const Database = require('better-sqlite3');
const path     = require('path');
const bcrypt   = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../database/gestao.db');
let db;

function getDB() {
  if (!db) db = new Database(DB_PATH);
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario    TEXT    NOT NULL UNIQUE,
      senha      TEXT    NOT NULL,
      perfil     TEXT    NOT NULL DEFAULT 'operacional',
      criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nome       TEXT NOT NULL,
      contato    TEXT,
      email      TEXT,
      telefone   TEXT,
      criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT    NOT NULL,
      descricao       TEXT,
      categoria       TEXT    NOT NULL DEFAULT 'Outros',
      preco           REAL    NOT NULL DEFAULT 0,
      quantidade      INTEGER NOT NULL DEFAULT 0,
      quantidade_min  INTEGER NOT NULL DEFAULT 5,
      sku             TEXT    UNIQUE,
      imagem          TEXT,
      fornecedor_id   INTEGER REFERENCES fornecedores(id) ON DELETE SET NULL,
      criado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
      atualizado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vendas (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      total      REAL    NOT NULL DEFAULT 0,
      criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS venda_itens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id   INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
      produto_id INTEGER NOT NULL REFERENCES produtos(id),
      quantidade INTEGER NOT NULL,
      preco_unit REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      acao       TEXT NOT NULL,
      detalhes   TEXT,
      criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migração segura: adiciona categoria se o banco já existia sem ela
  try {
    db.exec("ALTER TABLE produtos ADD COLUMN categoria TEXT NOT NULL DEFAULT 'Outros'");
    console.log('[DB] Migração: coluna "categoria" adicionada.');
  } catch { /* já existe — ok */ }

  // Seed: admin padrão
  const existe = db.prepare('SELECT id FROM usuarios WHERE usuario = ?').get('Nicolas');
  if (!existe) {
    const senha = bcrypt.hashSync('123456', 10);
    db.prepare("INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, 'administrador')").run('Nicolas', senha);
    console.log('[DB] Admin padrão criado — usuario: Nicolas / senha: 123456');
  }

  console.log('[DB] Banco de dados iniciado.');
}

module.exports = { getDB, initDB };