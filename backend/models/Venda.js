const { getDB } = require('../config/database');

const Venda = {
  listar: () =>
    getDB().prepare(`
      SELECT v.*, u.usuario AS vendedor
      FROM vendas v
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      ORDER BY v.criado_em DESC
    `).all(),

  buscarPorId: (id) =>
    getDB().prepare(`
      SELECT v.*, u.usuario AS vendedor
      FROM vendas v
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.id = ?
    `).get(id),

  itens: (venda_id) =>
    getDB().prepare(`
      SELECT vi.*, p.nome AS produto_nome, p.sku
      FROM venda_itens vi
      JOIN produtos p ON p.id = vi.produto_id
      WHERE vi.venda_id = ?
    `).all(venda_id),

  criar: (usuario_id, total) =>
    getDB().prepare('INSERT INTO vendas (usuario_id, total) VALUES (?, ?)').run(usuario_id, total),

  adicionarItem: ({ venda_id, produto_id, quantidade, preco_unit }) =>
    getDB().prepare('INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unit) VALUES (?, ?, ?, ?)')
           .run(venda_id, produto_id, quantidade, preco_unit),
};

module.exports = Venda;
