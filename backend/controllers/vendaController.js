const { getDB } = require('../config/database');
const Venda   = require('../models/Venda');
const Produto = require('../models/Produto');
const Log     = require('../models/Log');

exports.listar = (req, res) => {
  const vendas = Venda.listar();
  res.json(vendas);
};

exports.buscarPorId = (req, res) => {
  const venda = Venda.buscarPorId(Number(req.params.id));
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada.' });
  const itens = Venda.itens(venda.id);
  res.json({ ...venda, itens });
};

exports.criar = (req, res) => {
  const { itens } = req.body; // [{ produto_id, quantidade }]
  if (!itens || !itens.length) return res.status(400).json({ erro: 'Informe ao menos um item.' });

  const db = getDB();

  // Validar estoque
  for (const item of itens) {
    const p = Produto.buscarPorId(item.produto_id);
    if (!p) return res.status(404).json({ erro: `Produto ${item.produto_id} não encontrado.` });
    if (p.quantidade < item.quantidade) {
      return res.status(409).json({ erro: `Estoque insuficiente para "${p.nome}". Disponível: ${p.quantidade}` });
    }
  }

  // Transação: criar venda + itens + baixar estoque
  const criarVenda = db.transaction(() => {
    let total = 0;
    const detalhes = [];

    // Calcular total
    for (const item of itens) {
      const p = Produto.buscarPorId(item.produto_id);
      total += p.preco * item.quantidade;
    }

    const venda = Venda.criar(req.usuario.id, total);
    const vendaId = venda.lastInsertRowid;

    for (const item of itens) {
      const p = Produto.buscarPorId(item.produto_id);
      Venda.adicionarItem({ venda_id: vendaId, produto_id: p.id, quantidade: item.quantidade, preco_unit: p.preco });
      Produto.baixarEstoque(p.id, item.quantidade);
      detalhes.push(`${item.quantidade}x ${p.nome}`);
    }

    Log.criar({ usuario_id: req.usuario.id, acao: 'VENDA_CRIADA', detalhes: `Venda #${vendaId}: ${detalhes.join(', ')} | Total: R$ ${total.toFixed(2)}` });
    return { vendaId, total };
  });

  const resultado = criarVenda();
  res.status(201).json({ id: resultado.vendaId, total: resultado.total, mensagem: 'Venda registrada.' });
};
