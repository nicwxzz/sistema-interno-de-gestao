const Fornecedor = require('../models/Fornecedor');
const Log        = require('../models/Log');

exports.listar = (req, res) => res.json(Fornecedor.listar());

exports.buscarPorId = (req, res) => {
  const f = Fornecedor.buscarPorId(Number(req.params.id));
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  res.json(f);
};

exports.criar = (req, res) => {
  const { nome, contato, email, telefone } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  const result = Fornecedor.criar({ nome, contato, email, telefone });
  Log.criar({ usuario_id: req.usuario.id, acao: 'FORNECEDOR_CRIADO', detalhes: `Fornecedor "${nome}" criado` });
  res.status(201).json({ id: result.lastInsertRowid, mensagem: 'Fornecedor criado.' });
};

exports.atualizar = (req, res) => {
  const id = Number(req.params.id);
  const f  = Fornecedor.buscarPorId(id);
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  const { nome, contato, email, telefone } = req.body;
  Fornecedor.atualizar({ id, nome: nome || f.nome, contato, email, telefone });
  Log.criar({ usuario_id: req.usuario.id, acao: 'FORNECEDOR_EDITADO', detalhes: `Fornecedor id ${id} atualizado` });
  res.json({ mensagem: 'Fornecedor atualizado.' });
};

exports.deletar = (req, res) => {
  const id = Number(req.params.id);
  const f  = Fornecedor.buscarPorId(id);
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  Fornecedor.deletar(id);
  Log.criar({ usuario_id: req.usuario.id, acao: 'FORNECEDOR_EXCLUIDO', detalhes: `Fornecedor "${f.nome}" excluído` });
  res.json({ mensagem: 'Fornecedor excluído.' });
};
