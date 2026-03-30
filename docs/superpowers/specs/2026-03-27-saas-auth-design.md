# SaaS Auth + Multi-tenancy — Gestão Pro

**Date:** 2026-03-27
**Status:** Approved
**Goal:** Transformar o dashboard em um produto SaaS vendável, com registro/login profissional, dados isolados por empresa e pagamento único via Stripe.

---

## 1. Visão Geral

O sistema permite que empresários criem sua própria conta, usem o dashboard por 14 dias grátis, e depois adquiram acesso vitalício com pagamento único via Stripe.

**Fluxo principal:**
```
Visitante → /register → conta criada (trial 14 dias) → dashboard normal
→ trial expira → /planos → pagamento único Stripe → plan=PAID → acesso vitalício
```

**Subsistemas fora do escopo desta spec (próximas specs):**
- Landing page pública de vendas
- Painel admin (gerenciar contas)

---

## 2. Banco de Dados

### Migração SQLite → PostgreSQL

- Provider: Neon (free tier, 0.5GB)
- `datasource db { provider = "postgresql" }`
- `DATABASE_URL` configurada via variável de ambiente

**Estratégia de migração:** o banco SQLite de desenvolvimento é descartado. Rodar `prisma migrate dev --name init` contra o PostgreSQL (Neon) do zero. Nenhum dado existente precisa ser migrado.

**`lib/prisma.ts`** precisa ser reescrito. O projeto atual usa o adaptador libsql/Turso, que é incompatível com PostgreSQL. Substituir por:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Remover qualquer import de `@prisma/adapter-libsql` ou `PrismaLibSql`.

### Novo model: User

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String?
  nome        String
  empresa     String
  plan        String    @default("TRIAL")
  trialEndsAt DateTime
  paidAt      DateTime?
  createdAt   DateTime  @default(now())

  clientes    Cliente[]
  despesas    Despesa[]
  metas       Meta[]
}
```

- `plan`: `"TRIAL"` ou `"PAID"`
- `trialEndsAt`: `now() + 14 dias` no momento do registro
- `password String?`: nullable para compatibilidade futura com OAuth providers
- `paidAt DateTime?`: preenchido pelo webhook do Stripe; garante rastreabilidade e idempotência

### Mudanças nos models existentes

Adicionar `userId String` + relação `user User @relation(...)` em:

| Model | Campo adicionado | Observação |
|---|---|---|
| `Cliente` | `userId String` | Obras e Pagamentos ficam isolados via cascata |
| `Despesa` | `userId String` | Sem relação hierárquica com Cliente |
| `Meta` | `userId String` | Sem relação hierárquica com Cliente |

`Obra` e `Pagamento` **não recebem userId** — já ficam isolados via `Cliente → userId`.

A constraint `@@unique([mes, ano])` em `Meta` passa a ser `@@unique([mes, ano, userId])`.

O identificador gerado pelo Prisma muda de `mes_ano` para `mes_ano_userId`. O `upsert` em `app/api/metas/route.ts` deve ser atualizado assim:

```ts
// Antes:
where: { mes_ano: { mes, ano } }

// Depois:
where: { mes_ano_userId: { mes, ano, userId } }
// e no bloco create: incluir userId
create: { mes, ano, userId, metaFaturamento, metaLucro }
```

---

## 3. Autenticação — NextAuth.js v5

### Pacotes

```
next-auth@5
bcryptjs
@types/bcryptjs
```

**Nota:** `@auth/prisma-adapter` **não é usado** nesta implementação. O Credentials provider com `strategy: "jwt"` é incompatível com o PrismaAdapter para sessões. O lookup do usuário no banco é feito manualmente dentro do callback `authorize` do Credentials provider.

### Arquivo `auth.ts` (raiz do projeto)

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          empresa: user.empresa,
          plan: user.plan,
          trialEndsAt: user.trialEndsAt.toISOString(),
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.empresa = (user as any).empresa
        token.plan = (user as any).plan
        token.trialEndsAt = (user as any).trialEndsAt
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.empresa = token.empresa as string
      session.user.plan = token.plan as string
      session.user.trialEndsAt = token.trialEndsAt as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

### Arquivo `app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### Registro (`/api/register/route.ts`)

```ts
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, nome, empresa } = await req.json()
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  const hash = await bcrypt.hash(password, 12)
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  await prisma.user.create({ data: { email, password: hash, nome, empresa, trialEndsAt } })
  return NextResponse.json({ ok: true })
}
```

### Middleware (`middleware.ts`)

```ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/planos']
const PUBLIC_API = ['/api/auth', '/api/register', '/api/webhook']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic =
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    PUBLIC_API.some(p => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const session = req.auth
  if (!session) return NextResponse.redirect(new URL('/login', req.url))

  const trialExpired =
    session.user.plan === 'TRIAL' &&
    new Date(session.user.trialEndsAt) < new Date()

  if (trialExpired) return NextResponse.redirect(new URL('/planos', req.url))

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Nota:** `/api/auth` está explicitamente na lista de caminhos públicos para que o NextAuth possa processar login/logout sem ser interceptado pelo middleware.

**Nota:** `/api/checkout` **não está** na lista de caminhos públicos — é uma rota protegida que requer sessão válida.

---

## 4. Páginas e Componentes

### Reestruturação de rotas

Mover os seguintes arquivos existentes para dentro de `app/(dashboard)/`:

- `app/page.tsx` → `app/(dashboard)/page.tsx`
- `app/clientes/page.tsx` → `app/(dashboard)/clientes/page.tsx`
- `app/despesas/page.tsx` → `app/(dashboard)/despesas/page.tsx`
- `app/receber/page.tsx` → `app/(dashboard)/receber/page.tsx`
- `app/dre/page.tsx` → `app/(dashboard)/dre/page.tsx`
- `app/metas/page.tsx` → `app/(dashboard)/metas/page.tsx`

**Estrutura de rotas final:**
```
app/
  layout.tsx                      ← SEM ShellLayout (apenas html/body)
  (auth)/
    layout.tsx                    ← layout sem sidebar
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx                    ← ShellLayout aqui
    page.tsx
    clientes/page.tsx
    despesas/page.tsx
    receber/page.tsx
    dre/page.tsx
    metas/page.tsx
  planos/page.tsx                 ← pública (sem ShellLayout)
  api/
    auth/[...nextauth]/route.ts
    register/route.ts
    checkout/route.ts
    webhook/route.ts
    clientes/route.ts             ← + [id]/route.ts
    obras/route.ts                ← + [id]/route.ts
    despesas/route.ts             ← + [id]/route.ts
    pagamentos/route.ts           ← + [id]/route.ts
    dashboard/route.ts
    dre/route.ts
    metas/route.ts
```

### Design das telas de Auth (login + register)

**Fundo:** gradient blobs — manchas radiais suaves posicionadas em 3 cantos:
- Canto superior esquerdo: `rgba(245,158,11,0.18)`, `blur(20px)`, `180×180px`
- Canto inferior direito: `rgba(139,92,246,0.15)`, `blur(20px)`, `160×160px`
- Centro-direita: `rgba(16,185,129,0.10)`, `blur(16px)`, `120×120px`

**Card do form:** `background: rgba(22,27,34,0.85)`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 12px`, `backdrop-filter: blur(12px)`, largura máxima `380px`, centralizado na tela.

**Logo:** "GESTÃO PRO" em `#f59e0b`, `font-weight: 900`, `letter-spacing: 2px`.
**Subtítulo login:** "Controle financeiro para sua empresa"
**Subtítulo register:** "14 dias grátis · Sem cartão de crédito"

**Campos do registro (nesta ordem):** Nome da empresa, Seu nome, E-mail, Senha
**Campos do login:** E-mail, Senha

**CTAs:** botão âmbar `#f59e0b` com texto preto:
- Login: "Entrar"
- Register: "Começar 14 dias grátis"

**Links de navegação:** "Não tem conta? Criar conta grátis →" | "Já tem conta? Entrar →"

### Tela `/planos`

Mesmo fundo gradient blobs. Card central (`max-width: 400px`) com:
- Ícone ⏰ grande
- Título: "Seu período grátis acabou"
- Subtítulo: "Continue usando todos os recursos com acesso vitalício."
- Card de preço com: label "Acesso Vitalício", valor em destaque âmbar, "pagamento único · sem mensalidade"
- Lista de benefícios (✓ verde): Dashboard completo, DRE automático, Clientes e obras ilimitados, Suporte incluso
- Botão: "Comprar agora →"

**Preço exibido na página:** buscar via `stripe.prices.retrieve(STRIPE_PRICE_ID)` para mostrar o valor real. Se a chamada falhar, exibir "Entre em contato" como fallback.

### ShellLayout — adições

- Header: exibir `session.user.empresa` como subtítulo (substituindo "Martins Pro Serv" hardcoded)
- Adicionar no canto do header: iniciais do usuário em círculo âmbar + dropdown com "Sair" (ícone `LogOut` Lucide)
- `signOut()` do NextAuth no click em "Sair"

---

## 5. Proteção das Rotas de API

**Todas** as rotas de API exceto `/api/auth/*`, `/api/register`, `/api/webhook` usam este padrão:

```ts
import { auth } from '@/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  // ... queries com where: { userId }
}
```

### Rotas dinâmicas `[id]` — verificação de propriedade

As rotas `DELETE`/`PUT` com `[id]` devem verificar se o registro pertence ao usuário antes de modificar:

```ts
// Exemplo: DELETE /api/clientes/[id]
const cliente = await prisma.cliente.findFirst({ where: { id: +params.id, userId } })
if (!cliente) return Response.json({ error: 'Not found' }, { status: 404 })
await prisma.cliente.delete({ where: { id: +params.id } })
```

Para `obras/[id]` e `pagamentos/[id]`, a verificação de propriedade é feita atravessando a relação (sem `userId` direto em Obra/Pagamento):

```ts
// DELETE /api/obras/[id]
const obra = await prisma.obra.findFirst({ where: { id: +params.id, cliente: { userId } } })
if (!obra) return Response.json({ error: 'Not found' }, { status: 404 })
await prisma.obra.delete({ where: { id: +params.id } })

// DELETE /api/pagamentos/[id]
const pagamento = await prisma.pagamento.findFirst({
  where: { id: +params.id, obra: { cliente: { userId } } }
})
if (!pagamento) return Response.json({ error: 'Not found' }, { status: 404 })
await prisma.pagamento.delete({ where: { id: +params.id } })
```

Para `despesas/[id]`, usar `where: { id: +params.id, userId }` diretamente.

---

## 6. Pagamento Único — Stripe

### Pacote

```
stripe
```

### `/api/checkout/route.ts` (rota protegida — requer sessão)

```ts
import Stripe from 'stripe'
import { auth } from '@/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/planos`,
    metadata: { userId: session.user.id },
    payment_method_types: ['card'],
  })

  return Response.json({ url: checkout.url })
}
```

### `/api/webhook/route.ts` (pública — verificação por assinatura Stripe)

```ts
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()  // RAW body obrigatório para verificação
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: 'PAID', paidAt: new Date() },
      })
    }
  }

  return Response.json({ received: true })
}
```

**Segurança:** a verificação da assinatura (`constructEvent`) garante que só requests genuínos do Stripe são processados. O body deve ser lido como texto puro (`req.text()`), nunca como JSON antes da verificação.

### Variáveis de ambiente (`.env`)

```
NEXTAUTH_SECRET=           # string aleatória longa (ex: openssl rand -base64 32)
NEXTAUTH_URL=              # URL da aplicação (ex: https://gestaopro.com.br)
DATABASE_URL=              # URL do PostgreSQL Neon (ex: postgresql://...)
STRIPE_SECRET_KEY=         # sk_live_... ou sk_test_...
STRIPE_WEBHOOK_SECRET=     # whsec_... (obtido no Stripe Dashboard > Webhooks)
STRIPE_PRICE_ID=           # price_... (ID do produto criado no Stripe)
```

### Configuração no Stripe Dashboard

1. Criar produto: "Gestão Pro — Acesso Vitalício"
2. Tipo: **One-time**
3. Preço: valor definido pelo dono do produto (ex: R$297)
4. Copiar o `Price ID` → `STRIPE_PRICE_ID`
5. Criar Webhook endpoint apontando para `https://seu-dominio.com/api/webhook`
6. Eventos a escutar: `checkout.session.completed`
7. Copiar `Signing secret` → `STRIPE_WEBHOOK_SECRET`

---

## 7. TypeScript — Extensão dos tipos NextAuth

Criar `types/next-auth.d.ts` para evitar erros de TypeScript no acesso a campos customizados da sessão:

```ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      empresa: string
      plan: string
      trialEndsAt: string
    }
  }
  interface User {
    empresa: string
    plan: string
    trialEndsAt: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    empresa: string
    plan: string
    trialEndsAt: string
  }
}
```

---

## 8. O Que NÃO Muda

- Toda lógica de negócio e cálculos financeiros
- Componentes de UI (KpiCard, HeroKpiCard, MiniGauge, charts)
- Design system (cores, animações)
- Formulários (ClienteForm, DespesaForm, PagamentoForm) — apenas recebem userId indiretamente via API

---

## 9. Arquivos a Criar / Modificar

| Arquivo | Ação |
|---|---|
| `prisma/schema.prisma` | Modificar — PostgreSQL, novo model User, userId nos models existentes |
| `lib/prisma.ts` | Modificar — remover libsql adapter, PrismaClient padrão |
| `types/next-auth.d.ts` | Criar — extensão de tipos NextAuth |
| `auth.ts` | Criar — config NextAuth v5 com Credentials provider |
| `middleware.ts` | Criar — proteção de rotas |
| `app/layout.tsx` | Modificar — remover ShellLayout (fica em dashboard layout) |
| `app/(auth)/layout.tsx` | Criar — layout sem sidebar (apenas html/body wrapper) |
| `app/(auth)/login/page.tsx` | Criar — tela de login |
| `app/(auth)/register/page.tsx` | Criar — tela de registro |
| `app/planos/page.tsx` | Criar — trial expirado + Stripe |
| `app/(dashboard)/layout.tsx` | Criar — move ShellLayout para cá |
| `app/(dashboard)/page.tsx` | Mover de `app/page.tsx` |
| `app/(dashboard)/clientes/page.tsx` | Mover de `app/clientes/page.tsx` |
| `app/(dashboard)/despesas/page.tsx` | Mover de `app/despesas/page.tsx` |
| `app/(dashboard)/receber/page.tsx` | Mover de `app/receber/page.tsx` |
| `app/(dashboard)/dre/page.tsx` | Mover de `app/dre/page.tsx` |
| `app/(dashboard)/metas/page.tsx` | Mover de `app/metas/page.tsx` |
| `app/api/auth/[...nextauth]/route.ts` | Criar — handlers NextAuth |
| `app/api/register/route.ts` | Criar — endpoint de registro |
| `app/api/checkout/route.ts` | Criar — endpoint Stripe Checkout |
| `app/api/webhook/route.ts` | Criar — webhook Stripe com verificação de assinatura |
| `app/api/clientes/route.ts` | Modificar — adicionar userId scoping |
| `app/api/clientes/[id]/route.ts` | Modificar — verificar propriedade antes de DELETE/PUT |
| `app/api/obras/route.ts` | Modificar — adicionar userId scoping |
| `app/api/obras/[id]/route.ts` | Modificar — verificar propriedade antes de DELETE/PUT |
| `app/api/despesas/route.ts` | Modificar — adicionar userId scoping |
| `app/api/despesas/[id]/route.ts` | Modificar — verificar propriedade antes de DELETE/PUT |
| `app/api/pagamentos/route.ts` | Modificar — adicionar userId scoping |
| `app/api/pagamentos/[id]/route.ts` | Modificar — verificar propriedade antes de DELETE/PUT |
| `app/api/dashboard/route.ts` | Modificar — adicionar userId scoping |
| `app/api/dre/route.ts` | Modificar — adicionar userId scoping |
| `app/api/metas/route.ts` | Modificar — adicionar userId scoping |
| `components/ui/ShellLayout.tsx` | Modificar — adicionar user info + logout |
