const { getDB } = require('../config/database');

const Produto = {
  listar: ({ busca = '', min = 0, max = Infinity, categoria = '' } = {}) => {
    const catFiltro = categoria ? `AND p.categoria = ?` : '';
    const params    = categoria
      ? [`%${busca}%`, min, max === Infinity ? 999999999 : max, categoria]
      : [`%${busca}%`, min, max === Infinity ? 999999999 : max];

    return getDB().prepare(`
      SELECT p.*, f.nome AS fornecedor_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
      WHERE p.nome LIKE ?
        AND p.preco >= ?
        AND p.preco <= ?
        ${catFiltro}
      ORDER BY p.nome
    `).all(...params);
  },

  buscarPorId: (id) =>
    getDB().prepare('SELECT * FROM produtos WHERE id = ?').get(id),

  buscarPorSKU: (sku) =>
    getDB().prepare('SELECT * FROM produtos WHERE sku = ?').get(sku),

  criar: ({ nome, descricao, categoria, preco, quantidade, quantidade_min, sku, imagem, fornecedor_id }) =>
    getDB().prepare(`
      INSERT INTO produtos (nome, descricao, categoria, preco, quantidade, quantidade_min, sku, imagem, fornecedor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nome, descricao || null, categoria, preco, quantidade, quantidade_min || 5, sku || null, imagem || null, fornecedor_id || null),

  atualizar: ({ id, nome, descricao, categoria, preco, quantidade, quantidade_min, sku, imagem, fornecedor_id }) =>
    getDB().prepare(`
      UPDATE produtos SET
        nome=?, descricao=?, categoria=?, preco=?, quantidade=?,
        quantidade_min=?, sku=?, imagem=?, fornecedor_id=?,
        atualizado_em=datetime('now')
      WHERE id=?
    `).run(nome, descricao || null, categoria, preco, quantidade, quantidade_min || 5, sku || null, imagem || null, fornecedor_id || null, id),

  deletar: (id) =>
    getDB().prepare('DELETE FROM produtos WHERE id = ?').run(id),

  baixarEstoque: (id, qtd) =>
    getDB().prepare("UPDATE produtos SET quantidade = quantidade - ?, atualizado_em = datetime('now') WHERE id = ?").run(qtd, id),

  estoqueCritico: () =>
    getDB().prepare('SELECT * FROM produtos WHERE quantidade <= quantidade_min ORDER BY quantidade ASC').all(),

};

module.exports = Produto;