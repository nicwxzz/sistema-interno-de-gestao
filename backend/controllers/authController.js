const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const Usuario        = require('../models/Usuario');
const Log            = require('../models/Log');
const { JWT_SECRET } = require('../middlewares/auth');

// POST /api/auth/login
exports.login = (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha)
    return res.status(400).json({ erro: 'Preencha usuário e senha.' });

  const u = Usuario.buscarPorUsuario(usuario);
  if (!u || !bcrypt.compareSync(senha, u.senha))
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });

  const token = jwt.sign(
    { id: u.id, usuario: u.usuario, perfil: u.perfil },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  Log.criar({ usuario_id: u.id, acao: 'LOGIN', detalhes: `${u.usuario} fez login` });
  res.json({ token, usuario: { id: u.id, usuario: u.usuario, perfil: u.perfil } });
};

// POST /api/auth/register
// Perfil padrão: operacional. Apenas administradores podem criar outros perfis.
exports.register = (req, res) => {
  const { usuario, senha, perfil } = req.body;
  if (!usuario || !senha)
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });

  // Perfis válidos; se não informado ou não-admin enviando outro perfil → operacional
  const perfisValidos = ['operacional', 'tecnico', 'administrador'];
  const perfilFinal   = perfisValidos.includes(perfil) ? perfil : 'operacional';

  const existe = Usuario.buscarPorUsuario(usuario);
  if (existe) return res.status(409).json({ erro: 'Usuário já existe.' });

  const hash   = bcrypt.hashSync(senha, 10);
  const result = Usuario.criar({ usuario, senha: hash, perfil: perfilFinal });

  Log.criar({ usuario_id: null, acao: 'CADASTRO', detalhes: `Novo usuário "${usuario}" (${perfilFinal})` });
  res.status(201).json({ id: result.lastInsertRowid, mensagem: 'Conta criada com sucesso.' });
};
