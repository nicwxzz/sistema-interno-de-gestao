const { getDB } = require('../config/database');

function registrarLog(acao, detalhes = '') {
  return (req, res, next) => {
    const original = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) {
        try {
          getDB().prepare(
            'INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)'
          ).run(req.usuario?.id || null, acao, detalhes || JSON.stringify(body).substring(0, 200));
        } catch (e) { /* silencioso */ }
      }
      return original(body);
    };
    next();
  };
}

module.exports = { registrarLog };
