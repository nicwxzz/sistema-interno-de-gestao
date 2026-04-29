const router = require('express').Router();
const ctrl   = require('../controllers/logController');
const { autenticar, exigirPerfil } = require('../middlewares/auth');

router.get('/', autenticar, exigirPerfil('administrador'), ctrl.listar);

module.exports = router;
