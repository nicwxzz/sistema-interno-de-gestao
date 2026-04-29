const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { initDB } = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/produtos',    require('./routes/produtos'));
app.use('/api/vendas',      require('./routes/vendas'));
app.use('/api/usuarios',    require('./routes/usuarios'));
app.use('/api/fornecedores',require('./routes/fornecedores'));
app.use('/api/logs',        require('./routes/logs'));

initDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
