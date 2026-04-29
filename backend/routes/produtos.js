const router  = require('express').Router();
const ctrl    = require('../controllers/produtoController');
const { autenticar, exigirPerfil } = require('../middlewares/auth');
const upload  = require('../config/multer');

router.use(autenticar);

router.get('/',           ctrl.listar);
router.get('/criticos',   ctrl.estoqueCritico);
router.get('/:id',        ctrl.buscarPorId);

router.post('/',          exigirPerfil('administrador', 'tecnico'), upload.single('imagem'), ctrl.criar);
router.put('/:id',        exigirPerfil('administrador', 'tecnico'), upload.single('imagem'), ctrl.atualizar);
router.delete('/:id',     exigirPerfil('administrador'),            ctrl.deletar);

module.exports = router;