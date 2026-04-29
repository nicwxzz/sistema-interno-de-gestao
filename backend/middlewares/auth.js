const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'acessorios_norte_secret_2024';

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }
  try {
    req.usuario = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    next();
  };
}

module.exports = { autenticar, exigirPerfil, JWT_SECRET };
