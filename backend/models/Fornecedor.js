const { getDB } = require('../config/database');

const Fornecedor = {
  listar: () =>
    getDB().prepare('SELECT * FROM fornecedores ORDER BY nome').all(),

  buscarPorId: (id) =>
    getDB().prepare('SELECT * FROM fornecedores WHERE id = ?').get(id),

  criar: ({ nome, contato, email, telefone }) =>
    getDB().prepare('INSERT INTO fornecedores (nome, contato, email, telefone) VALUES (?, ?, ?, ?)')
           .run(nome, contato || null, email || null, telefone || null),

  atualizar: ({ id, nome, contato, email, telefone }) =>
    getDB().prepare('UPDATE fornecedores SET nome=?, contato=?, email=?, telefone=? WHERE id=?')
           .run(nome, contato || null, email || null, telefone || null, id),

  deletar: (id) =>
    getDB().prepare('DELETE FROM fornecedores WHERE id = ?').run(id),
};

module.exports = Fornecedor;
