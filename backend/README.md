# Sistema de Gestão — Acessórios Norte (v2)

Arquitetura profissional com Node.js + Express + SQLite.

## Estrutura

```
/sistema-gestao
├── /backend
│   ├── /config         → database.js, multer.js
│   ├── /controllers    → lógica de cada recurso
│   ├── /middlewares    → auth JWT, logger
│   ├── /models         → queries do banco
│   ├── /routes         → endpoints da API
│   ├── /uploads        → imagens salvas localmente
│   ├── server.js
│   └── package.json
├── /frontend
│   └── /js
│       └── api.js      → integração com a API via fetch
└── /database
    └── gestao.db       → gerado automaticamente
```

## Como rodar

```bash
cd backend
npm install
node server.js
```

O banco é criado automaticamente na primeira execução.

**Login padrão:** `Nicolas` / `123456`

## Endpoints da API

| Método | Rota                     | Perfil mínimo  |
|--------|--------------------------|----------------|
| POST   | /api/auth/login          | público        |
| GET    | /api/produtos            | todos          |
| GET    | /api/produtos/criticos   | todos          |
| POST   | /api/produtos            | técnico+       |
| PUT    | /api/produtos/:id        | técnico+       |
| DELETE | /api/produtos/:id        | administrador  |
| GET    | /api/vendas              | todos          |
| POST   | /api/vendas              | técnico+       |
| GET    | /api/usuarios            | administrador  |
| POST   | /api/usuarios            | administrador  |
| PUT    | /api/usuarios/:id        | administrador  |
| DELETE | /api/usuarios/:id        | administrador  |
| GET    | /api/fornecedores        | todos          |
| POST   | /api/fornecedores        | técnico+       |
| GET    | /api/logs                | administrador  |

## Upload de imagem

Envie `multipart/form-data` com o campo `imagem`. Tamanho máximo: 5MB. Formatos: jpeg, jpg, png, webp.

A URL da imagem é retornada no campo `imagem` do produto (ex: `/uploads/1234567890.jpg`).
