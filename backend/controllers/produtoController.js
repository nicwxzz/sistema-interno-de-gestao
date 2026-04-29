const Produto = require('../models/Produto');
const Log     = require('../models/Log');

const CATEGORIAS = ['Bolsas','Cintos','Colares','Brincos','Pulseiras','Óculos','Outros'];

exports.listar = (req, res) => {
  const { busca, min, max, categoria } = req.query;
  const lista = Produto.listar({
    busca,
    min:      Number(min) || 0,
    max:      Number(max) || Infinity,
    categoria: categoria || '',
  });
  res.json(lista);
};

exports.estoqueCritico = (req, res) => {
  res.json(Produto.estoqueCritico());
};

exports.buscarPorId = (req, res) => {
  const p = Produto.buscarPorId(Number(req.params.id));
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(p);
};

exports.criar = (req, res) => {
  const { nome, descricao, categoria, preco, quantidade, quantidade_min, sku, fornecedor_id } = req.body;

  if (!nome || preco == null)
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });

  if (!categoria || !CATEGORIAS.includes(categoria))
    return res.status(400).json({ erro: `Categoria inválida. Válidas: ${CATEGORIAS.join(', ')}` });

  if (sku && Produto.buscarPorSKU(sku))
    return res.status(409).json({ erro: 'SKU já cadastrado.' });

  const imagem = req.file ? `/uploads/${req.file.filename}` : null;
  const result = Produto.criar({
    nome, descricao, categoria,
    preco:         Number(preco),
    quantidade:    Number(quantidade) || 0,
    quantidade_min: Number(quantidade_min) || 5,
    sku:           sku || null,
    imagem,
    fornecedor_id: fornecedor_id || null,
  });

  Log.criar({ usuario_id: req.usuario.id, acao: 'PRODUTO_CRIADO', detalhes: `"${nome}" criado (id ${result.lastInsertRowid})` });
  res.status(201).json({ id: result.lastInsertRowid, mensagem: 'Produto criado.' });
};

exports.atualizar = (req, res) => {
  const id = Number(req.params.id);
  const p  = Produto.buscarPorId(id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const { nome, descricao, categoria, preco, quantidade, quantidade_min, sku, fornecedor_id } = req.body;

  if (categoria && !CATEGORIAS.includes(categoria))
    return res.status(400).json({ erro: `Categoria inválida. Válidas: ${CATEGORIAS.join(', ')}` });

  const imagem = req.file ? `/uploads/${req.file.filename}` : p.imagem;

  Produto.atualizar({
    id,
    nome:          nome          || p.nome,
    descricao:     descricao     ?? p.descricao,
    categoria:     categoria     || p.categoria,
    preco:         Number(preco  ?? p.preco),
    quantidade:    Number(quantidade    ?? p.quantidade),
    quantidade_min: Number(quantidade_min ?? p.quantidade_min),
    sku:           sku           || p.sku,
    imagem,
    fornecedor_id: fornecedor_id || p.fornecedor_id,
  });

  Log.criar({ usuario_id: req.usuario.id, acao: 'PRODUTO_EDITADO', detalhes: `Produto id ${id} atualizado` });
  res.json({ mensagem: 'Produto atualizado.' });
};

exports.deletar = (req, res) => {
  const id = Number(req.params.id);
  const p  = Produto.buscarPorId(id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });

  Produto.deletar(id);
  Log.criar({ usuario_id: req.usuario.id, acao: 'PRODUTO_EXCLUIDO', detalhes: `"${p.nome}" (id ${id}) excluído` });
  res.json({ mensagem: 'Produto excluído.' });
};