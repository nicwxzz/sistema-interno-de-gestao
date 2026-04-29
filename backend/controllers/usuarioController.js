const bcrypt  = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Log     = require('../models/Log');

exports.listar = (req, res) => {
  res.json(Usuario.listar());
};

exports.criar = async (req, res) => {
  const { usuario, senha, perfil } = req.body;
  if (!usuario || !senha || !perfil) return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const existe = Usuario.buscarPorUsuario(usuario);
  if (existe) return res.status(409).json({ erro: 'Usuário já existe.' });

  const hash   = bcrypt.hashSync(senha, 10);
  const result = Usuario.criar({ usuario, senha: hash, perfil });
  Log.criar({ usuario_id: req.usuario.id, acao: 'USUARIO_CRIADO', detalhes: `Usuário "${usuario}" (${perfil}) criado` });
  res.status(201).json({ id: result.lastInsertRowid, mensagem: 'Usuário criado.' });
};

exports.atualizar = async (req, res) => {
  const id = Number(req.params.id);
  const u  = Usuario.buscarPorId(id);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const { usuario, perfil, senha } = req.body;
  const hash = senha ? bcrypt.hashSync(senha, 10) : null;
  Usuario.atualizar({ id, usuario: usuario || u.usuario, perfil: perfil || u.perfil, senha: hash });
  Log.criar({ usuario_id: req.usuario.id, acao: 'USUARIO_EDITADO', detalhes: `Usuário id ${id} atualizado` });
  res.json({ mensagem: 'Usuário atualizado.' });
};

exports.deletar = (req, res) => {
  const id = Number(req.params.id);
  if (id === req.usuario.id) return res.status(400).json({ erro: 'Você não pode excluir seu próprio usuário.' });
  const u = Usuario.buscarPorId(id);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  Usuario.deletar(id);
  Log.criar({ usuario_id: req.usuario.id, acao: 'USUARIO_EXCLUIDO', detalhes: `Usuário "${u.usuario}" excluído` });
  res.json({ mensagem: 'Usuário excluído.' });
};
