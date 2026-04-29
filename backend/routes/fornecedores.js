const router = require('express').Router();
const ctrl   = require('../controllers/fornecedorController');
const { autenticar, exigirPerfil } = require('../middlewares/auth');

router.use(autenticar);

router.get('/',       ctrl.listar);
router.get('/:id',    ctrl.buscarPorId);
router.post('/',      exigirPerfil('administrador','tecnico'), ctrl.criar);
router.put('/:id',    exigirPerfil('administrador','tecnico'), ctrl.atualizar);
router.delete('/:id', exigirPerfil('administrador'),           ctrl.deletar);

module.exports = router;
