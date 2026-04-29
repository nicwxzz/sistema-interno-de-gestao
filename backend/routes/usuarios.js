const router = require('express').Router();
const ctrl   = require('../controllers/usuarioController');
const { autenticar, exigirPerfil } = require('../middlewares/auth');

router.use(autenticar, exigirPerfil('administrador'));

router.get('/',       ctrl.listar);
router.post('/',      ctrl.criar);
router.put('/:id',    ctrl.atualizar);
router.delete('/:id', ctrl.deletar);

module.exports = router;
