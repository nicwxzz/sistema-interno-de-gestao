const { getDB } = require('../config/database');

const Log = {
  listar: (limite = 100) =>
    getDB().prepare(`
      SELECT l.*, u.usuario
      FROM logs l
      LEFT JOIN usuarios u ON u.id = l.usuario_id
      ORDER BY l.criado_em DESC
      LIMIT ?
    `).all(limite),

  criar: ({ usuario_id, acao, detalhes }) =>
    getDB().prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)')
           .run(usuario_id || null, acao, detalhes || null),
};

module.exports = Log;
