const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nome);
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp/;
  const ext  = permitidos.test(path.extname(file.originalname).toLowerCase());
  const mime = permitidos.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, webp)'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
