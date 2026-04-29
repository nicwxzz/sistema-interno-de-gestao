const Log = require('../models/Log');

exports.listar = (req, res) => {
  const limite = Number(req.query.limite) || 100;
  res.json(Log.listar(limite));
};
