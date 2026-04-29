const { getDB } = require('../config/database');

const Usuario = {
  buscarPorUsuario: (usuario) =>
    getDB().prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario),

  buscarPorId: (id) =>
    getDB().prepare('SELECT id, usuario, perfil, criado_em FROM usuarios WHERE id = ?').get(id),

  listar: () =>
    getDB().prepare('SELECT id, usuario, perfil, criado_em FROM usuarios ORDER BY usuario').all(),

  criar: ({ usuario, senha, perfil }) =>
    getDB().prepare('INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)').run(usuario, senha, perfil),

  atualizar: ({ id, usuario, perfil, senha }) => {
    if (senha) {
      return getDB().prepare('UPDATE usuarios SET usuario=?, perfil=?, senha=? WHERE id=?').run(usuario, perfil, senha, id);
    }
    return getDB().prepare('UPDATE usuarios SET usuario=?, perfil=? WHERE id=?').run(usuario, perfil, id);
  },

  deletar: (id) =>
    getDB().prepare('DELETE FROM usuarios WHERE id = ?').run(id),
};

module.exports = Usuario;
