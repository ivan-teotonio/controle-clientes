# OS Manager — Sistema de Gestão de Ordens de Serviço

Sistema completo para abertura, acompanhamento e encerramento de Ordens de Serviço, com controle de clientes, técnicos e equipamentos.

---

## 📋 Sobre o projeto

O OS Manager permite que operadores gerenciem o ciclo de vida completo de chamados de manutenção — desde a abertura até a conclusão — com rastreabilidade total de cada mudança de status.

---

## 🚀 Tecnologias

| Tecnologia | Versão | Motivo da escolha |
|---|---|---|
| Next.js | 16.x | Framework React com App Router — front e back em um projeto só |
| TypeScript | 5.x | Tipagem estática, reduz erros em tempo de desenvolvimento |
| Prisma | 7.x | ORM com type-safety completo e migrations versionadas |
| PostgreSQL | 16.x | Banco relacional robusto, ideal para dados com relacionamentos |
| JWT | — | Autenticação stateless com access token + refresh token |
| bcryptjs | — | Hash seguro de senhas |
| Tailwind CSS | 3.x | Estilização utilitária, rápida e consistente |
| Docker | — | Isola o ambiente do banco de dados |
| Lucide React | — | Ícones consistentes e profissionais |

---

## 🏗️ Arquitetura

O projeto usa o Next.js como solução fullstack — o frontend e o backend vivem no mesmo repositório, separados por responsabilidade:

```
service-order/
├── app/
│   ├── api/                  ← Backend (API Routes)
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   └── login/
│   │   ├── clients/
│   │   ├── technicians/
│   │   ├── equipments/
│   │   └── service-orders/
│   ├── components/           ← Componentes reutilizáveis
│   │   └── Sidebar.tsx
│   ├── services/             ← Regras de negócio
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── technician.service.ts
│   │   ├── equipment.service.ts
│   │   └── service-order.service.ts
│   ├── lib/                  ← Utilitários
│   │   ├── prisma.ts
│   │   └── jwt.ts
│   ├── (pages)/              ← Telas do sistema
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── technicians/
│   │   └── equipments/
│   ├── login/
│   └── service-orders/
│       └── new/
└── prisma/
    └── schema.prisma
```

### Padrão de camadas

```
API Route → Service → Prisma → PostgreSQL
```

- **API Route** — recebe a requisição HTTP, valida campos, chama o service
- **Service** — toda a regra de negócio fica aqui
- **Prisma** — acesso ao banco com type-safety

---

## 🗄️ Modelo de dados

```
User          → quem opera o sistema (tem login)
Client        → empresa que contratou o serviço
Technician    → técnico que executa o serviço
Equipment     → equipamento vinculado a um cliente
ServiceOrder  → ordem de serviço (coração do sistema)
ServiceOrderHistory → histórico de cada mudança de status
```

### Fluxo de status da OS

```
ABERTA → EM_ANDAMENTO → CONCLUIDA
  │             │
  └─────────────┴──→ CANCELADA
```

Toda mudança de status gera um registro em `ServiceOrderHistory`, garantindo rastreabilidade completa.

---

## ⚙️ Decisões técnicas

**Por que Next.js fullstack?**
Uma única aplicação que serve o frontend e expõe API Routes como backend. Reduz complexidade de infraestrutura sem abrir mão da separação de responsabilidades.

**Por que Prisma?**
Gera tipos TypeScript automaticamente a partir do schema. Se o banco mudar, o TypeScript avisa onde o código precisa ser atualizado. Migrations versionadas junto com o código.

**Por que JWT com access + refresh token?**
Access tokens de curta duração (15min) limitam o dano em caso de vazamento. O refresh token (7 dias) em cookie `httpOnly` não pode ser lido por JavaScript — protege contra ataques XSS.

**Por que soft delete?**
Clientes, técnicos e equipamentos nunca são deletados fisicamente. Isso preserva o histórico das OS antigas — uma OS concluída continua mostrando o cliente e técnico mesmo que eles sejam removidos do sistema.

**Por que paginação em todas as listagens?**
Uma query sem `LIMIT` em produção pode retornar milhares de registros e derrubar a API. Todas as listagens usam paginação para garantir performance independente do volume de dados.

**Por que ServiceOrderHistory?**
Rastreabilidade é requisito implícito em qualquer sistema de OS. Saber quem mudou o status, quando e com qual observação é fundamental para auditoria.

---

## 🔐 Autenticação

O sistema usa JWT com dois tokens:

- **Access Token** — dura 15 minutos, enviado no header `Authorization: Bearer <token>`
- **Refresh Token** — dura 7 dias, salvo em cookie `httpOnly`

Todas as rotas exceto `/api/auth/register` e `/api/auth/login` exigem autenticação.

---

## 📡 Endpoints da API

### Auth
```
POST /api/auth/register   → criar conta
POST /api/auth/login      → login (retorna accessToken)
```

### Clients
```
GET    /api/clients?page=1&limit=10&search=
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id   → soft delete
```

### Technicians
```
GET    /api/technicians?page=1&limit=10&search=
POST   /api/technicians
GET    /api/technicians/:id
PATCH  /api/technicians/:id
DELETE /api/technicians/:id
```

### Equipments
```
GET    /api/equipments?page=1&limit=10&clientId=
POST   /api/equipments
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
```

### Service Orders
```
GET    /api/service-orders?page=1&limit=10&status=&clientId=&technicianId=
POST   /api/service-orders
GET    /api/service-orders/:id        → retorna OS com histórico completo
PATCH  /api/service-orders/:id/assign-technician
PATCH  /api/service-orders/:id/status
PATCH  /api/service-orders/:id/observation
```

---

## 🐳 Como rodar o projeto

### Pré-requisitos
- Node.js 20+
- Docker

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/os-manager.git
cd os-manager

# 2. Instale as dependências
npm install

# 3. Suba o banco de dados
docker compose up -d

# 4. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com suas configurações

# 5. Rode as migrations
npx prisma migrate deploy

# 6. Inicie o servidor
npm run dev

# 7. Acesse
# http://localhost:3000
```

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/osmanager"
JWT_SECRET="sua-chave-secreta-aqui"
```

---

## 🖥️ Telas do sistema

| Tela | URL | Descrição |
|---|---|---|
| Login | `/login` | Autenticação com email e senha |
| Dashboard | `/dashboard` | Listagem de OS com filtros e cards de resumo |
| Clientes | `/clients` | Listagem e cadastro de clientes |
| Técnicos | `/technicians` | Listagem e cadastro de técnicos |
| Equipamentos | `/equipments` | Listagem e cadastro de equipamentos |
| Nova OS | `/service-orders/new` | Formulário de abertura de chamado |

---

## 👨‍💻 Autor

**Ivan Teotonio Acioli Junior**
- LinkedIn: [linkedin.com/in/ivan-teotonio](https://linkedin.com/in/ivan-teotonio)
- GitHub: [github.com/ivan-teotonio](https://github.com/ivan-teotonio)
