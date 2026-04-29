const router = require('express').Router();
const ctrl   = require('../controllers/vendaController');
const { autenticar, exigirPerfil } = require('../middlewares/auth');

router.use(autenticar);

router.get('/',    ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/',   exigirPerfil('administrador','tecnico'), ctrl.criar);

module.exports = router;
