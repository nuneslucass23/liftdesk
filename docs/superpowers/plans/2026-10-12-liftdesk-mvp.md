# LiftDesk MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o MVP web do LiftDesk (gestão de ocorrências de elevadores, perfis Gestor e Técnico, regras de prioridade/prazo/despacho/alerta preditivo) publicado no GitHub Pages.

**Architecture:** SPA React + Vite. Regras de negócio são funções puras em `src/regras/`. Todas as mudanças de dados são funções puras em `src/contexto/estado.js` (testáveis sem React); `DadosContext.jsx` só guarda o estado, grava no `localStorage` e expõe as ações. Telas usam Bootstrap 5 e nunca alteram dados diretamente.

**Tech Stack:** React 18.3.1, Vite 5.4.8, React Router DOM 6.26.2 (`createHashRouter`), Bootstrap 5.3.3, Vitest 2.1.2, gh-pages 6.1.1.

**Spec:** `docs/superpowers/specs/2026-10-12-liftdesk-mvp-design.md`

**Responsáveis (P1–P5)** estão indicados em cada tarefa, conforme a seção 10 da spec. As tarefas 2–6 não dependem de React e podem ser feitas em paralelo assim que a Tarefa 1 estiver na `main`.

## Global Constraints

- Versões exatas: react 18.3.1, react-dom 18.3.1, react-router-dom 6.26.2, bootstrap 5.3.3, vite 5.4.8, @vitejs/plugin-react 4.3.2, vitest 2.1.2, gh-pages 6.1.1.
- Roteador: `createHashRouter` (nunca `createBrowserRouter`).
- `vite.config.js`: `base: '/liftdesk/'`.
- Chave do `localStorage`: `liftdesk-dados`; campo `versao: 1` no estado salvo.
- Sem backend, sem banco, sem autenticação real.
- Regras em `src/regras/` são funções puras (sem React, sem `localStorage`, recebem `agora` quando dependem de tempo).
- Telas só mudam dados chamando ações de `useDados()`.
- Todo texto da interface em português do Brasil.
- Severidades: `critica`, `alta`, `media`, `baixa`. Status: `aberta`, `despachada`, `aceita`, `a_caminho`, `resolvida`.
- Prazos: crítica 30 min, alta 120 min, média 480 min, baixa 2880 min.
- Alertas: janela de 7 dias; 3–4 do mesmo tipo = `medio`; 5+ ou 2 tipos marcados no mesmo elevador = `alto`.
- Layout utilizável em 375px de largura.

## Review Focus

1. **`localStorage` corrompido ou de versão antiga** (ex.: alguém editou ou o formato mudou): o app deve abrir com os dados iniciais, nunca tela branca. → teste na Tarefa 8.
2. **Duplo clique em "Confirmar despacho"** ou despachar uma ocorrência já despachada: nada muda na segunda vez. → teste na Tarefa 8.
3. **Técnico tenta resolver sem observação**: a ação é recusada (e o botão fica desativado). → teste na Tarefa 8, UI na Tarefa 14.
4. **"Gerar preventiva" clicado duas vezes no mesmo alerta**: só uma ocorrência preventiva é criada. → teste na Tarefa 8.
5. **Tipo "Passageiro preso" com a caixa "há passageiro preso" desmarcada**: continua crítica. → teste na Tarefa 2.

---

## Estrutura de arquivos

```
package.json  vite.config.js  index.html  .gitignore  README.md
src/
  main.jsx                       rotas + provider
  App.jsx                        layout (Cabecalho + Outlet)
  index.css                      ajustes mínimos de estilo
  contexto/estado.js             ações puras sobre o estado (+ estado.test.js)
  contexto/DadosContext.jsx      provider + useDados()
  dados/elevadores.json  dados/tecnicos.json  dados/ocorrencias.json
  dados/iniciais.js              monta o estado inicial com datas relativas (+ iniciais.test.js)
  regras/classificar.js          severidade, ordenação, rótulos (+ test)
  regras/prazo.js                SLA (+ test)
  regras/status.js               transições de status (+ test)
  regras/sugerirTecnico.js       sugestão de técnico (+ test)
  regras/preditivo.js            alertas preditivos (+ test)
  componentes/Cabecalho.jsx  RotaProtegida.jsx  Selos.jsx  CartaoIndicador.jsx  useAgora.js
  paginas/Entrar.jsx  Painel.jsx  NovaOcorrencia.jsx  DetalheOcorrencia.jsx  Alertas.jsx  MinhasTarefas.jsx  NaoEncontrado.jsx
```

---

### Task 1: Projeto base (P1)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/index.css`

**Interfaces:**
- Produces: scripts `npm run dev`, `npm run build`, `npm test`, `npm run deploy`.

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "liftdesk",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run --passWithNoTests",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "bootstrap": "5.3.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "6.26.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.3.2",
    "gh-pages": "6.1.1",
    "vite": "5.4.8",
    "vitest": "2.1.2"
  }
}
```

- [ ] **Step 2: Criar `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/liftdesk/',
  test: { environment: 'node' },
})
```

- [ ] **Step 3: Criar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiftDesk</title>
  </head>
  <body class="bg-light">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Criar `.gitignore`**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 5: Criar `src/index.css` e um `src/main.jsx` provisório**

`src/index.css`:
```css
.cursor-pointer { cursor: pointer; }
.tabela-ocorrencias td { vertical-align: middle; }
```

`src/main.jsx` (provisório; a Tarefa 9 substitui):
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <h1 className="container mt-4">LiftDesk</h1>
  </React.StrictMode>,
)
```

- [ ] **Step 6: Instalar e verificar**

Run: `npm install && npm test && npm run build`
Expected: instalação sem erro; Vitest "No test files found, exiting with code 0"; build cria `dist/index.html`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html .gitignore src
git commit -m "chore: projeto base React + Vite + Bootstrap"
```

---

### Task 2: Regra de classificação e ordenação (P3)

**Files:**
- Create: `src/regras/classificar.js`
- Test: `src/regras/classificar.test.js`

**Interfaces:**
- Produces: `classificar({ tipo, passageiroPreso }) → 'critica'|'alta'|'media'|'baixa'`; `ordenarOcorrencias(lista) → novaLista`; constantes `ROTULO_TIPO`, `ROTULO_SEVERIDADE`, `COR_SEVERIDADE`, `PESO_SEVERIDADE`.

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { classificar, ordenarOcorrencias } from './classificar.js'

describe('classificar', () => {
  it('passageiro preso é sempre crítica, mesmo em outro tipo', () => {
    expect(classificar({ tipo: 'passageiro_preso', passageiroPreso: true })).toBe('critica')
    expect(classificar({ tipo: 'ruido_anormal', passageiroPreso: true })).toBe('critica')
  })

  it('tipo passageiro preso é crítica mesmo com a caixa desmarcada', () => {
    expect(classificar({ tipo: 'passageiro_preso', passageiroPreso: false })).toBe('critica')
  })

  it('falta de energia e falha técnica são alta', () => {
    expect(classificar({ tipo: 'falta_energia', passageiroPreso: false })).toBe('alta')
    expect(classificar({ tipo: 'falha_tecnica', passageiroPreso: false })).toBe('alta')
  })

  it('ruído anormal é média', () => {
    expect(classificar({ tipo: 'ruido_anormal', passageiroPreso: false })).toBe('media')
  })

  it('solicitação do cliente, preventiva e tipo desconhecido são baixa', () => {
    expect(classificar({ tipo: 'solicitacao_cliente', passageiroPreso: false })).toBe('baixa')
    expect(classificar({ tipo: 'preventiva', passageiroPreso: false })).toBe('baixa')
    expect(classificar({ tipo: 'xyz', passageiroPreso: false })).toBe('baixa')
  })
})

describe('ordenarOcorrencias', () => {
  it('ordena por severidade, depois mais antiga, resolvidas no fim, sem alterar a original', () => {
    const lista = [
      { id: 'A', severidade: 'baixa', status: 'aberta', criadaEm: '2026-10-12T10:00:00.000Z' },
      { id: 'B', severidade: 'critica', status: 'resolvida', criadaEm: '2026-10-12T08:00:00.000Z' },
      { id: 'C', severidade: 'alta', status: 'aberta', criadaEm: '2026-10-12T09:30:00.000Z' },
      { id: 'D', severidade: 'alta', status: 'aceita', criadaEm: '2026-10-12T09:00:00.000Z' },
    ]
    expect(ordenarOcorrencias(lista).map((o) => o.id)).toEqual(['D', 'C', 'A', 'B'])
    expect(lista[0].id).toBe('A')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/regras/classificar.test.js`
Expected: FAIL (arquivo `./classificar.js` não existe)

- [ ] **Step 3: Implementar**

```js
export const ROTULO_TIPO = {
  passageiro_preso: 'Passageiro preso',
  falha_tecnica: 'Falha técnica',
  falta_energia: 'Falta de energia',
  ruido_anormal: 'Ruído anormal',
  solicitacao_cliente: 'Solicitação do cliente',
  preventiva: 'Manutenção preventiva',
}

export const ROTULO_SEVERIDADE = { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' }

// Classes do Bootstrap usadas como text-bg-<cor>
export const COR_SEVERIDADE = { critica: 'danger', alta: 'warning', media: 'info', baixa: 'success' }

export const PESO_SEVERIDADE = { critica: 4, alta: 3, media: 2, baixa: 1 }

export function classificar({ tipo, passageiroPreso }) {
  if (passageiroPreso || tipo === 'passageiro_preso') return 'critica'
  if (tipo === 'falta_energia' || tipo === 'falha_tecnica') return 'alta'
  if (tipo === 'ruido_anormal') return 'media'
  return 'baixa'
}

export function ordenarOcorrencias(lista) {
  return [...lista].sort((a, b) => {
    const resolvidaA = a.status === 'resolvida' ? 1 : 0
    const resolvidaB = b.status === 'resolvida' ? 1 : 0
    if (resolvidaA !== resolvidaB) return resolvidaA - resolvidaB
    const peso = PESO_SEVERIDADE[b.severidade] - PESO_SEVERIDADE[a.severidade]
    if (peso !== 0) return peso
    return new Date(a.criadaEm) - new Date(b.criadaEm)
  })
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/regras/classificar.test.js`
Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/regras/classificar.js src/regras/classificar.test.js
git commit -m "feat: regra de classificação e ordenação de ocorrências"
```

---

### Task 3: Regra de prazo (SLA) (P4)

**Files:**
- Create: `src/regras/prazo.js`
- Test: `src/regras/prazo.test.js`

**Interfaces:**
- Produces: `PRAZO_MINUTOS`; `calcularPrazo(severidade, criadaEmISO) → ISO string`; `situacaoPrazo(ocorrencia, agora) → { restanteMin: number|null, atrasada: boolean }`; `formatarRestante(min|null) → string`; `formatarDuracao(min) → string`.

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { calcularPrazo, situacaoPrazo, formatarRestante, formatarDuracao } from './prazo.js'

const base = '2026-10-12T10:00:00.000Z'

describe('calcularPrazo', () => {
  it('soma o prazo de cada severidade', () => {
    expect(calcularPrazo('critica', base)).toBe('2026-10-12T10:30:00.000Z')
    expect(calcularPrazo('alta', base)).toBe('2026-10-12T12:00:00.000Z')
    expect(calcularPrazo('media', base)).toBe('2026-10-12T18:00:00.000Z')
    expect(calcularPrazo('baixa', base)).toBe('2026-10-14T10:00:00.000Z')
  })
})

describe('situacaoPrazo', () => {
  const oc = { status: 'aberta', prazoLimite: '2026-10-12T10:30:00.000Z' }

  it('dentro do prazo', () => {
    expect(situacaoPrazo(oc, new Date('2026-10-12T10:10:00.000Z'))).toEqual({ restanteMin: 20, atrasada: false })
  })

  it('exatamente no limite ainda não está atrasada', () => {
    expect(situacaoPrazo(oc, new Date('2026-10-12T10:30:00.000Z')).atrasada).toBe(false)
  })

  it('prazo estourado', () => {
    expect(situacaoPrazo(oc, new Date('2026-10-12T11:00:00.000Z'))).toEqual({ restanteMin: -30, atrasada: true })
  })

  it('resolvida não tem prazo', () => {
    expect(situacaoPrazo({ ...oc, status: 'resolvida' }, new Date('2026-10-12T12:00:00.000Z'))).toEqual({ restanteMin: null, atrasada: false })
  })
})

describe('formatação', () => {
  it('formata tempo restante e atraso', () => {
    expect(formatarRestante(95)).toBe('1h 35min restantes')
    expect(formatarRestante(20)).toBe('20min restantes')
    expect(formatarRestante(-30)).toBe('atrasada há 30min')
    expect(formatarRestante(null)).toBe('—')
  })

  it('formata duração', () => {
    expect(formatarDuracao(30)).toBe('30min')
    expect(formatarDuracao(2880)).toBe('48h')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/regras/prazo.test.js`
Expected: FAIL (arquivo `./prazo.js` não existe)

- [ ] **Step 3: Implementar**

```js
export const PRAZO_MINUTOS = { critica: 30, alta: 120, media: 480, baixa: 2880 }

export function calcularPrazo(severidade, criadaEm) {
  const inicio = new Date(criadaEm).getTime()
  return new Date(inicio + PRAZO_MINUTOS[severidade] * 60000).toISOString()
}

export function situacaoPrazo(ocorrencia, agora = new Date()) {
  if (ocorrencia.status === 'resolvida') return { restanteMin: null, atrasada: false }
  const restanteMin = Math.round((new Date(ocorrencia.prazoLimite) - agora) / 60000)
  return { restanteMin, atrasada: restanteMin < 0 }
}

export function formatarDuracao(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h && m) return `${h}h ${m}min`
  if (h) return `${h}h`
  return `${m}min`
}

export function formatarRestante(minutos) {
  if (minutos === null) return '—'
  const texto = formatarDuracao(Math.abs(minutos))
  return minutos < 0 ? `atrasada há ${texto}` : `${texto} restantes`
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/regras/prazo.test.js`
Expected: PASS (7 testes)

- [ ] **Step 5: Commit**

```bash
git add src/regras/prazo.js src/regras/prazo.test.js
git commit -m "feat: regra de prazo de atendimento (SLA)"
```

---

### Task 4: Regra de status (P2)

**Files:**
- Create: `src/regras/status.js`
- Test: `src/regras/status.test.js`

**Interfaces:**
- Produces: `PROXIMO_STATUS`, `STATUS_ATIVOS`, `ROTULO_STATUS`, `podeMudar(atual, novo) → boolean`.

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { podeMudar, STATUS_ATIVOS } from './status.js'

describe('podeMudar', () => {
  it('aceita a sequência completa', () => {
    expect(podeMudar('aberta', 'despachada')).toBe(true)
    expect(podeMudar('despachada', 'aceita')).toBe(true)
    expect(podeMudar('aceita', 'a_caminho')).toBe(true)
    expect(podeMudar('a_caminho', 'resolvida')).toBe(true)
  })

  it('recusa pular etapas, voltar ou sair de resolvida', () => {
    expect(podeMudar('aberta', 'aceita')).toBe(false)
    expect(podeMudar('despachada', 'resolvida')).toBe(false)
    expect(podeMudar('aceita', 'despachada')).toBe(false)
    expect(podeMudar('resolvida', 'aberta')).toBe(false)
  })

  it('status ativos são os de atendimento em curso', () => {
    expect(STATUS_ATIVOS).toEqual(['despachada', 'aceita', 'a_caminho'])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/regras/status.test.js`
Expected: FAIL (arquivo `./status.js` não existe)

- [ ] **Step 3: Implementar**

```js
export const PROXIMO_STATUS = {
  aberta: 'despachada',
  despachada: 'aceita',
  aceita: 'a_caminho',
  a_caminho: 'resolvida',
}

export const STATUS_ATIVOS = ['despachada', 'aceita', 'a_caminho']

export const ROTULO_STATUS = {
  aberta: 'Aberta',
  despachada: 'Despachada',
  aceita: 'Aceita',
  a_caminho: 'A caminho',
  resolvida: 'Resolvida',
}

export function podeMudar(atual, novo) {
  return PROXIMO_STATUS[atual] === novo
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/regras/status.test.js`
Expected: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add src/regras/status.js src/regras/status.test.js
git commit -m "feat: regra de transição de status"
```

---

### Task 5: Regra de sugestão de técnico (P4)

**Files:**
- Create: `src/regras/sugerirTecnico.js`
- Test: `src/regras/sugerirTecnico.test.js`

**Interfaces:**
- Consumes: `STATUS_ATIVOS` de `./status.js` (Tarefa 4).
- Produces: `tecnicoOcupado(tecnicoId, ocorrencias) → boolean`; `especialidadeNecessaria(ocorrencia) → 'resgate'|'energia'|null`; `sugerirTecnico(ocorrencia, elevador, tecnicos, ocorrencias, agora) → { tecnico: objeto|null, aviso: string|null }`.

Regra (detalha a seção 6.3 da spec): candidatos são técnicos livres. Faixa 1: mesma região **e** especialidade compatível (sem aviso). Faixa 2: especialidade compatível em outra região (aviso "Técnico fora da região do elevador"). Faixa 3: qualquer livre, preferindo a mesma região (aviso "Nenhum técnico livre com a especialidade ideal"). Dentro de cada faixa: mesma região primeiro, depois menos resolvidas hoje, depois nome.

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { sugerirTecnico, tecnicoOcupado, especialidadeNecessaria } from './sugerirTecnico.js'

const agora = new Date('2026-10-12T15:00:00.000Z')
const tecnicos = [
  { id: 'T1', nome: 'Ana', regiao: 'Sul', especialidades: ['resgate', 'porta'] },
  { id: 'T2', nome: 'Bruno', regiao: 'Norte', especialidades: ['resgate'] },
  { id: 'T3', nome: 'Carla', regiao: 'Norte', especialidades: ['porta'] },
  { id: 'T4', nome: 'Diego', regiao: 'Leste', especialidades: ['energia'] },
]
const elevadorNorte = { id: 'E1', regiao: 'Norte' }
const preso = { tipo: 'passageiro_preso', passageiroPreso: true }
const ocupa = (tecnicoId) => ({ id: `X-${tecnicoId}`, tecnicoId, status: 'aceita' })

describe('tecnicoOcupado e especialidadeNecessaria', () => {
  it('ocupado só com atendimento em curso', () => {
    expect(tecnicoOcupado('T2', [{ tecnicoId: 'T2', status: 'despachada' }])).toBe(true)
    expect(tecnicoOcupado('T2', [{ tecnicoId: 'T2', status: 'resolvida' }])).toBe(false)
  })

  it('especialidade necessária', () => {
    expect(especialidadeNecessaria(preso)).toBe('resgate')
    expect(especialidadeNecessaria({ tipo: 'falta_energia', passageiroPreso: false })).toBe('energia')
    expect(especialidadeNecessaria({ tipo: 'ruido_anormal', passageiroPreso: false })).toBe(null)
  })
})

describe('sugerirTecnico', () => {
  it('passageiro preso no Norte: técnico de resgate do Norte', () => {
    expect(sugerirTecnico(preso, elevadorNorte, tecnicos, [], agora)).toEqual({ tecnico: tecnicos[1], aviso: null })
  })

  it('empate na região: quem resolveu menos hoje', () => {
    const ocorrencias = [{ id: 'R1', tecnicoId: 'T2', status: 'resolvida', resolvidaEm: '2026-10-12T13:00:00.000Z' }]
    const r = sugerirTecnico({ tipo: 'ruido_anormal', passageiroPreso: false }, elevadorNorte, tecnicos, ocorrencias, agora)
    expect(r.tecnico.id).toBe('T3')
  })

  it('resgate da região ocupado: resgate de outra região com aviso', () => {
    const r = sugerirTecnico(preso, elevadorNorte, tecnicos, [ocupa('T2')], agora)
    expect(r).toEqual({ tecnico: tecnicos[0], aviso: 'Técnico fora da região do elevador' })
  })

  it('ninguém com a especialidade: qualquer livre da região, com aviso', () => {
    const r = sugerirTecnico({ tipo: 'falta_energia', passageiroPreso: false }, elevadorNorte, tecnicos, [ocupa('T4')], agora)
    expect(r).toEqual({ tecnico: tecnicos[1], aviso: 'Nenhum técnico livre com a especialidade ideal' })
  })

  it('todos ocupados', () => {
    const r = sugerirTecnico(preso, elevadorNorte, tecnicos, tecnicos.map((t) => ocupa(t.id)), agora)
    expect(r).toEqual({ tecnico: null, aviso: 'Nenhum técnico disponível' })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/regras/sugerirTecnico.test.js`
Expected: FAIL (arquivo `./sugerirTecnico.js` não existe)

- [ ] **Step 3: Implementar**

```js
import { STATUS_ATIVOS } from './status.js'

export function tecnicoOcupado(tecnicoId, ocorrencias) {
  return ocorrencias.some((o) => o.tecnicoId === tecnicoId && STATUS_ATIVOS.includes(o.status))
}

export function especialidadeNecessaria(ocorrencia) {
  if (ocorrencia.passageiroPreso || ocorrencia.tipo === 'passageiro_preso') return 'resgate'
  if (ocorrencia.tipo === 'falta_energia') return 'energia'
  return null
}

function resolvidasHoje(tecnicoId, ocorrencias, agora) {
  const hoje = agora.toDateString()
  return ocorrencias.filter(
    (o) => o.tecnicoId === tecnicoId && o.resolvidaEm && new Date(o.resolvidaEm).toDateString() === hoje,
  ).length
}

export function sugerirTecnico(ocorrencia, elevador, tecnicos, ocorrencias, agora = new Date()) {
  const livres = tecnicos.filter((t) => !tecnicoOcupado(t.id, ocorrencias))
  if (livres.length === 0) return { tecnico: null, aviso: 'Nenhum técnico disponível' }

  const precisa = especialidadeNecessaria(ocorrencia)
  const temEspecialidade = (t) => !precisa || t.especialidades.includes(precisa)
  const mesmaRegiao = (t) => t.regiao === elevador.regiao

  const ordenar = (lista) =>
    [...lista].sort(
      (a, b) =>
        Number(mesmaRegiao(b)) - Number(mesmaRegiao(a)) ||
        resolvidasHoje(a.id, ocorrencias, agora) - resolvidasHoje(b.id, ocorrencias, agora) ||
        a.nome.localeCompare(b.nome),
    )

  const faixas = [
    { lista: livres.filter((t) => mesmaRegiao(t) && temEspecialidade(t)), aviso: null },
    { lista: livres.filter(temEspecialidade), aviso: 'Técnico fora da região do elevador' },
    { lista: livres, aviso: 'Nenhum técnico livre com a especialidade ideal' },
  ]
  const faixa = faixas.find((f) => f.lista.length > 0)
  return { tecnico: ordenar(faixa.lista)[0], aviso: faixa.aviso }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/regras/sugerirTecnico.test.js`
Expected: PASS (7 testes)

- [ ] **Step 5: Commit**

```bash
git add src/regras/sugerirTecnico.js src/regras/sugerirTecnico.test.js
git commit -m "feat: regra de sugestão de técnico"
```

---

### Task 6: Motor preditivo (P5)

**Files:**
- Create: `src/regras/preditivo.js`
- Test: `src/regras/preditivo.test.js`

**Interfaces:**
- Produces: `JANELA_DIAS`, `ROTULO_EVENTO`, `gerarAlertas(elevadores, alertasTratados) → [{ id, elevadorId, tipo, quantidade, risco: 'alto'|'medio', motivo }]` (id = `${elevadorId}-${tipo}`; ordenado: alto antes de médio, depois maior quantidade).

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { gerarAlertas } from './preditivo.js'

const ev = (tipo, ...dias) => dias.map((diasAtras) => ({ tipo, diasAtras }))
const elevador = (id, eventos) => ({ id, eventos })

describe('gerarAlertas', () => {
  it('sem eventos ou só 2 do mesmo tipo: sem alerta', () => {
    expect(gerarAlertas([elevador('E1', [])], [])).toEqual([])
    expect(gerarAlertas([elevador('E1', ev('porta', 1, 2))], [])).toEqual([])
  })

  it('3 anomalias do mesmo tipo: risco médio', () => {
    expect(gerarAlertas([elevador('E1', ev('porta', 1, 2, 3))], [])).toEqual([
      { id: 'E1-porta', elevadorId: 'E1', tipo: 'porta', quantidade: 3, risco: 'medio', motivo: '3 anomalias de porta nos últimos 7 dias' },
    ])
  })

  it('5 anomalias: risco alto', () => {
    const [alerta] = gerarAlertas([elevador('E1', ev('porta', 1, 2, 3, 5, 6))], [])
    expect(alerta.risco).toBe('alto')
    expect(alerta.motivo).toBe('5 anomalias de porta nos últimos 7 dias')
  })

  it('ignora eventos com mais de 7 dias', () => {
    expect(gerarAlertas([elevador('E1', ev('porta', 8, 9, 10))], [])).toEqual([])
  })

  it('dois tipos marcados no mesmo elevador: ambos alto', () => {
    const alertas = gerarAlertas([elevador('E7', [...ev('vibracao', 1, 4, 6), ...ev('nivelamento', 2, 3, 5)])], [])
    expect(alertas.map((a) => [a.id, a.risco])).toEqual([['E7-vibracao', 'alto'], ['E7-nivelamento', 'alto']])
  })

  it('filtra tratados e ordena alto antes de médio', () => {
    const elevadores = [elevador('E1', ev('porta', 1, 2, 3)), elevador('E2', ev('porta', 1, 2, 3, 4, 5)), elevador('E3', ev('ruido', 1, 2, 3))]
    expect(gerarAlertas(elevadores, ['E3-ruido']).map((a) => a.id)).toEqual(['E2-porta', 'E1-porta'])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/regras/preditivo.test.js`
Expected: FAIL (arquivo `./preditivo.js` não existe)

- [ ] **Step 3: Implementar**

```js
export const JANELA_DIAS = 7
const MINIMO_MEDIO = 3
const MINIMO_ALTO = 5

export const ROTULO_EVENTO = {
  porta: 'porta',
  vibracao: 'vibração',
  nivelamento: 'nivelamento',
  energia: 'energia',
  ruido: 'ruído',
}

export function gerarAlertas(elevadores, alertasTratados = []) {
  const alertas = []
  for (const elevador of elevadores) {
    const contagem = {}
    for (const evento of elevador.eventos) {
      if (evento.diasAtras <= JANELA_DIAS) contagem[evento.tipo] = (contagem[evento.tipo] || 0) + 1
    }
    const marcados = Object.entries(contagem).filter(([, quantidade]) => quantidade >= MINIMO_MEDIO)
    for (const [tipo, quantidade] of marcados) {
      alertas.push({
        id: `${elevador.id}-${tipo}`,
        elevadorId: elevador.id,
        tipo,
        quantidade,
        risco: quantidade >= MINIMO_ALTO || marcados.length >= 2 ? 'alto' : 'medio',
        motivo: `${quantidade} anomalias de ${ROTULO_EVENTO[tipo]} nos últimos ${JANELA_DIAS} dias`,
      })
    }
  }
  const pesoRisco = (a) => (a.risco === 'alto' ? 0 : 1)
  return alertas
    .filter((a) => !alertasTratados.includes(a.id))
    .sort((a, b) => pesoRisco(a) - pesoRisco(b) || b.quantidade - a.quantidade)
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/regras/preditivo.test.js`
Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/regras/preditivo.js src/regras/preditivo.test.js
git commit -m "feat: motor preditivo de alertas por padrões"
```

---

### Task 7: Dados iniciais (P1)

**Files:**
- Create: `src/dados/elevadores.json`, `src/dados/tecnicos.json`, `src/dados/ocorrencias.json`, `src/dados/iniciais.js`
- Test: `src/dados/iniciais.test.js`

**Interfaces:**
- Consumes: `classificar` (Tarefa 2), `calcularPrazo` (Tarefa 3).
- Produces: `criarDadosIniciais(agora) → { elevadores, tecnicos, ocorrencias }`. Formato de cada ocorrência montada: `{ id, elevadorId, tipo, descricao, passageiroPreso, severidade, status, tecnicoId, criadaEm, prazoLimite, historico: [{ status, quando, por }], observacao, origem: 'manual', resolvidaEm }`.

- [ ] **Step 1: Criar `src/dados/tecnicos.json`**

```json
[
  { "id": "T1", "nome": "Ana Souza", "regiao": "Sul", "especialidades": ["resgate", "porta", "energia"] },
  { "id": "T2", "nome": "Bruno Lima", "regiao": "Norte", "especialidades": ["resgate", "vibracao", "nivelamento"] },
  { "id": "T3", "nome": "Carla Mendes", "regiao": "Centro", "especialidades": ["porta", "ruido", "energia"] },
  { "id": "T4", "nome": "Diego Rocha", "regiao": "Leste", "especialidades": ["resgate", "energia", "vibracao"] },
  { "id": "T5", "nome": "Elisa Prado", "regiao": "Oeste", "especialidades": ["nivelamento", "porta", "ruido"] }
]
```

- [ ] **Step 2: Criar `src/dados/elevadores.json`**

```json
[
  { "id": "E01", "predio": "Ed. Paulista Center", "endereco": "Av. Paulista, 1000", "regiao": "Centro", "modelo": "Otis Gen2", "anoInstalacao": 2012,
    "eventos": [{ "tipo": "porta", "diasAtras": 9 }, { "tipo": "porta", "diasAtras": 10 }, { "tipo": "porta", "diasAtras": 12 }] },
  { "id": "E02", "predio": "Ed. Paulista Center", "endereco": "Av. Paulista, 1000", "regiao": "Centro", "modelo": "Otis Gen2", "anoInstalacao": 2012,
    "eventos": [{ "tipo": "ruido", "diasAtras": 3 }] },
  { "id": "E03", "predio": "Torre Vila Olímpia", "endereco": "R. Funchal, 200", "regiao": "Sul", "modelo": "Otis SkyRise", "anoInstalacao": 2018,
    "eventos": [{ "tipo": "porta", "diasAtras": 1 }, { "tipo": "porta", "diasAtras": 2 }, { "tipo": "porta", "diasAtras": 3 }, { "tipo": "porta", "diasAtras": 5 }, { "tipo": "porta", "diasAtras": 6 }] },
  { "id": "E04", "predio": "Torre Vila Olímpia", "endereco": "R. Funchal, 200", "regiao": "Sul", "modelo": "Otis SkyRise", "anoInstalacao": 2018, "eventos": [] },
  { "id": "E05", "predio": "Shopping Norte Plaza", "endereco": "Av. Cruzeiro do Sul, 1500", "regiao": "Norte", "modelo": "Otis Gen2", "anoInstalacao": 2015,
    "eventos": [{ "tipo": "ruido", "diasAtras": 2 }, { "tipo": "ruido", "diasAtras": 4 }] },
  { "id": "E06", "predio": "Shopping Norte Plaza", "endereco": "Av. Cruzeiro do Sul, 1500", "regiao": "Norte", "modelo": "Otis Gen2", "anoInstalacao": 2015, "eventos": [] },
  { "id": "E07", "predio": "Residencial Tatuapé", "endereco": "R. Tuiuti, 300", "regiao": "Leste", "modelo": "Otis Gen2", "anoInstalacao": 2009,
    "eventos": [{ "tipo": "vibracao", "diasAtras": 1 }, { "tipo": "vibracao", "diasAtras": 4 }, { "tipo": "vibracao", "diasAtras": 6 },
                { "tipo": "nivelamento", "diasAtras": 2 }, { "tipo": "nivelamento", "diasAtras": 3 }, { "tipo": "nivelamento", "diasAtras": 5 }] },
  { "id": "E08", "predio": "Residencial Tatuapé", "endereco": "R. Tuiuti, 300", "regiao": "Leste", "modelo": "Otis Gen2", "anoInstalacao": 2009, "eventos": [] },
  { "id": "E09", "predio": "Ed. Pinheiros Office", "endereco": "R. dos Pinheiros, 800", "regiao": "Oeste", "modelo": "Otis SkyRise", "anoInstalacao": 2020, "eventos": [] },
  { "id": "E10", "predio": "Ed. Pinheiros Office", "endereco": "R. dos Pinheiros, 800", "regiao": "Oeste", "modelo": "Otis SkyRise", "anoInstalacao": 2020,
    "eventos": [{ "tipo": "porta", "diasAtras": 1 }, { "tipo": "porta", "diasAtras": 3 }, { "tipo": "porta", "diasAtras": 6 }] },
  { "id": "E11", "predio": "Hospital Santa Luz", "endereco": "R. Vergueiro, 2000", "regiao": "Sul", "modelo": "Otis Gen360", "anoInstalacao": 2022, "eventos": [] },
  { "id": "E12", "predio": "Hospital Santa Luz", "endereco": "R. Vergueiro, 2000", "regiao": "Sul", "modelo": "Otis Gen360", "anoInstalacao": 2022,
    "eventos": [{ "tipo": "energia", "diasAtras": 2 }] }
]
```

- [ ] **Step 3: Criar `src/dados/ocorrencias.json`**

```json
[
  { "id": "OC-001", "elevadorId": "E05", "tipo": "passageiro_preso", "descricao": "Duas pessoas presas entre o 3º e o 4º andar, interfone funcionando.", "passageiroPreso": true, "status": "aberta", "tecnicoId": null, "minutosAtras": 4, "observacao": "" },
  { "id": "OC-002", "elevadorId": "E09", "tipo": "falha_tecnica", "descricao": "Elevador parado no térreo com erro no painel de comando.", "passageiroPreso": false, "status": "aberta", "tecnicoId": null, "minutosAtras": 25, "observacao": "" },
  { "id": "OC-003", "elevadorId": "E02", "tipo": "ruido_anormal", "descricao": "Ruído metálico forte ao passar pelo 8º andar.", "passageiroPreso": false, "status": "aberta", "tecnicoId": null, "minutosAtras": 90, "observacao": "" },
  { "id": "OC-004", "elevadorId": "E12", "tipo": "falta_energia", "descricao": "Queda de energia no prédio; elevador desligado no 2º andar, sem passageiros.", "passageiroPreso": false, "status": "despachada", "tecnicoId": "T1", "minutosAtras": 15, "observacao": "" },
  { "id": "OC-005", "elevadorId": "E08", "tipo": "falha_tecnica", "descricao": "Porta não fecha completamente no 5º andar.", "passageiroPreso": false, "status": "aceita", "tecnicoId": "T4", "minutosAtras": 150, "observacao": "" },
  { "id": "OC-006", "elevadorId": "E01", "tipo": "solicitacao_cliente", "descricao": "Síndico solicita revisão do botão de chamada do 10º andar.", "passageiroPreso": false, "status": "a_caminho", "tecnicoId": "T3", "minutosAtras": 240, "observacao": "" },
  { "id": "OC-007", "elevadorId": "E06", "tipo": "falha_tecnica", "descricao": "Elevador desnivelado cerca de 5 cm no térreo.", "passageiroPreso": false, "status": "resolvida", "tecnicoId": "T2", "minutosAtras": 300, "observacao": "Sensor de nivelamento recalibrado e testado." },
  { "id": "OC-008", "elevadorId": "E10", "tipo": "ruido_anormal", "descricao": "Barulho na porta ao abrir no 2º andar.", "passageiroPreso": false, "status": "resolvida", "tecnicoId": "T5", "minutosAtras": 420, "observacao": "Guia da porta lubrificada; sem ruído após teste." },
  { "id": "OC-009", "elevadorId": "E03", "tipo": "solicitacao_cliente", "descricao": "Administração pede vistoria por reclamações de porta lenta.", "passageiroPreso": false, "status": "aberta", "tecnicoId": null, "minutosAtras": 200, "observacao": "" },
  { "id": "OC-010", "elevadorId": "E07", "tipo": "falha_tecnica", "descricao": "Vibração forte durante a subida.", "passageiroPreso": false, "status": "resolvida", "tecnicoId": "T4", "minutosAtras": 1500, "observacao": "Coxins do motor substituídos." }
]
```

- [ ] **Step 4: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import { criarDadosIniciais } from './iniciais.js'
import { STATUS_ATIVOS } from '../regras/status.js'
import { gerarAlertas } from '../regras/preditivo.js'
import { sugerirTecnico } from '../regras/sugerirTecnico.js'

const agora = new Date('2026-10-12T15:00:00.000Z')
const { elevadores, tecnicos, ocorrencias } = criarDadosIniciais(agora)

describe('criarDadosIniciais', () => {
  it('tem a quantidade combinada na spec', () => {
    expect(elevadores).toHaveLength(12)
    expect(tecnicos).toHaveLength(5)
    expect(ocorrencias).toHaveLength(10)
  })

  it('calcula severidade, datas e prazo', () => {
    const oc1 = ocorrencias.find((o) => o.id === 'OC-001')
    expect(oc1.severidade).toBe('critica')
    expect(oc1.criadaEm).toBe('2026-10-12T14:56:00.000Z')
    expect(oc1.prazoLimite).toBe('2026-10-12T15:26:00.000Z')
    expect(oc1.origem).toBe('manual')
  })

  it('histórico termina no status atual e resolvidas têm resolvidaEm', () => {
    for (const o of ocorrencias) {
      expect(o.historico.at(-1).status).toBe(o.status)
      expect(Boolean(o.resolvidaEm)).toBe(o.status === 'resolvida')
    }
  })

  it('referências válidas e no máximo uma tarefa ativa por técnico', () => {
    for (const o of ocorrencias) {
      expect(elevadores.some((e) => e.id === o.elevadorId)).toBe(true)
      if (o.tecnicoId) expect(tecnicos.some((t) => t.id === o.tecnicoId)).toBe(true)
    }
    for (const t of tecnicos) {
      expect(ocorrencias.filter((o) => o.tecnicoId === t.id && STATUS_ATIVOS.includes(o.status)).length).toBeLessThanOrEqual(1)
    }
  })

  it('já abre com alertas para a demonstração', () => {
    const alertas = gerarAlertas(elevadores, [])
    expect(alertas.map((a) => [a.id, a.risco])).toEqual([
      ['E03-porta', 'alto'],
      ['E07-vibracao', 'alto'],
      ['E07-nivelamento', 'alto'],
      ['E10-porta', 'medio'],
    ])
  })

  it('a ocorrência crítica sugere o técnico de resgate do Norte', () => {
    const oc1 = ocorrencias.find((o) => o.id === 'OC-001')
    const elevador = elevadores.find((e) => e.id === oc1.elevadorId)
    expect(sugerirTecnico(oc1, elevador, tecnicos, ocorrencias, agora).tecnico.id).toBe('T2')
  })
})
```

- [ ] **Step 5: Rodar e ver falhar**

Run: `npx vitest run src/dados/iniciais.test.js`
Expected: FAIL (arquivo `./iniciais.js` não existe)

- [ ] **Step 6: Implementar `src/dados/iniciais.js`**

```js
import elevadores from './elevadores.json'
import tecnicos from './tecnicos.json'
import ocorrenciasBase from './ocorrencias.json'
import { classificar } from '../regras/classificar.js'
import { calcularPrazo } from '../regras/prazo.js'

const ETAPAS = ['aberta', 'despachada', 'aceita', 'a_caminho', 'resolvida']
const MINUTOS_ENTRE_ETAPAS = 5

function minutosAntes(agora, minutos) {
  return new Date(agora.getTime() - minutos * 60000).toISOString()
}

function quemFez(status, tecnicoId) {
  if (status === 'aberta') return 'Central de operações'
  if (status === 'despachada') return 'Gestor'
  return tecnicos.find((t) => t.id === tecnicoId).nome
}

function montarOcorrencia(base, agora) {
  const { minutosAtras, ...dados } = base
  const criadaEm = minutosAntes(agora, minutosAtras)
  const severidade = classificar(dados)
  const etapas = ETAPAS.slice(0, ETAPAS.indexOf(dados.status) + 1)
  const historico = etapas.map((status, i) => ({
    status,
    quando: minutosAntes(agora, Math.max(minutosAtras - i * MINUTOS_ENTRE_ETAPAS, 0)),
    por: quemFez(status, dados.tecnicoId),
  }))
  return {
    ...dados,
    severidade,
    criadaEm,
    prazoLimite: calcularPrazo(severidade, criadaEm),
    historico,
    origem: 'manual',
    resolvidaEm: dados.status === 'resolvida' ? historico.at(-1).quando : null,
  }
}

export function criarDadosIniciais(agora = new Date()) {
  return {
    elevadores: structuredClone(elevadores),
    tecnicos: structuredClone(tecnicos),
    ocorrencias: ocorrenciasBase.map((base) => montarOcorrencia(base, agora)),
  }
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npx vitest run src/dados/iniciais.test.js`
Expected: PASS (6 testes)

- [ ] **Step 8: Commit**

```bash
git add src/dados
git commit -m "feat: dados iniciais da demonstração"
```

---

### Task 8: Ações puras do estado (P1)

**Files:**
- Create: `src/contexto/estado.js`
- Test: `src/contexto/estado.test.js`

**Interfaces:**
- Consumes: `criarDadosIniciais` (T7), `classificar`, `ROTULO_TIPO` (T2), `calcularPrazo` (T3), `podeMudar` (T4), `tecnicoOcupado` (T5).
- Produces (todas puras; quando a ação é inválida devolvem **o mesmo objeto** recebido):
  - `CHAVE_ARMAZENAMENTO = 'liftdesk-dados'`, `VERSAO = 1`
  - `estadoInicial(agora) → { versao, elevadores, tecnicos, ocorrencias, alertasTratados: [], perfil: null }`
  - `carregarEstado(texto, agora) → estado`
  - `proximoId(ocorrencias) → 'OC-011'`
  - `definirPerfil(estado, perfil)` com perfil `{ tipo: 'gestor' } | { tipo: 'tecnico', tecnicoId } | null`
  - `criarOcorrencia(estado, { elevadorId, tipo, descricao, passageiroPreso }, agora)`
  - `despachar(estado, id, tecnicoId, agora)`
  - `atualizarStatus(estado, id, novoStatus, observacao, agora)` (só `aceita`, `a_caminho`, `resolvida`)
  - `gerarPreventiva(estado, alerta, agora)`
  - `reiniciar(estado, agora)` (mantém o perfil)

- [ ] **Step 1: Escrever os testes**

```js
import { describe, it, expect } from 'vitest'
import * as acoes from './estado.js'

const agora = new Date('2026-10-12T15:00:00.000Z')
const inicial = () => acoes.estadoInicial(agora)
const busca = (estado, id) => estado.ocorrencias.find((o) => o.id === id)
const novaValida = { elevadorId: 'E05', tipo: 'falha_tecnica', descricao: 'Botão do 2º andar não responde', passageiroPreso: false }

describe('carregarEstado', () => {
  it('sem nada salvo: estado inicial', () => {
    const e = acoes.carregarEstado(null, agora)
    expect(e.versao).toBe(1)
    expect(e.perfil).toBe(null)
    expect(e.ocorrencias).toHaveLength(10)
  })

  it('JSON quebrado, formato estranho ou versão antiga: estado inicial', () => {
    expect(acoes.carregarEstado('{quebrado', agora).ocorrencias).toHaveLength(10)
    expect(acoes.carregarEstado('{"ocorrencias": 5}', agora).ocorrencias).toHaveLength(10)
    expect(acoes.carregarEstado(JSON.stringify({ ...inicial(), versao: 0, ocorrencias: [] }), agora).ocorrencias).toHaveLength(10)
  })

  it('estado salvo válido é mantido', () => {
    const salvo = { ...inicial(), perfil: { tipo: 'gestor' } }
    expect(acoes.carregarEstado(JSON.stringify(salvo), agora)).toEqual(salvo)
  })
})

describe('criarOcorrencia', () => {
  it('cria aberta, classificada, com prazo e histórico', () => {
    const e = acoes.criarOcorrencia(inicial(), { ...novaValida, passageiroPreso: true }, agora)
    const oc = busca(e, 'OC-011')
    expect(oc).toMatchObject({ status: 'aberta', severidade: 'critica', tecnicoId: null, origem: 'manual', criadaEm: agora.toISOString(), prazoLimite: '2026-10-12T15:30:00.000Z' })
    expect(oc.historico).toEqual([{ status: 'aberta', quando: agora.toISOString(), por: 'Gestor' }])
  })

  it('dados inválidos não mudam nada', () => {
    const e = inicial()
    expect(acoes.criarOcorrencia(e, { ...novaValida, descricao: 'curta' }, agora)).toBe(e)
    expect(acoes.criarOcorrencia(e, { ...novaValida, elevadorId: 'E99' }, agora)).toBe(e)
    expect(acoes.criarOcorrencia(e, { ...novaValida, tipo: 'xyz' }, agora)).toBe(e)
  })
})

describe('despachar', () => {
  it('despacha ocorrência aberta para técnico livre', () => {
    const e = acoes.despachar(inicial(), 'OC-001', 'T2', agora)
    expect(busca(e, 'OC-001')).toMatchObject({ status: 'despachada', tecnicoId: 'T2' })
    expect(busca(e, 'OC-001').historico.at(-1)).toEqual({ status: 'despachada', quando: agora.toISOString(), por: 'Gestor' })
  })

  it('segundo despacho (duplo clique) não muda nada', () => {
    const e = acoes.despachar(inicial(), 'OC-001', 'T2', agora)
    expect(acoes.despachar(e, 'OC-001', 'T2', agora)).toBe(e)
  })

  it('técnico ocupado ou inexistente não muda nada', () => {
    const e = inicial()
    expect(acoes.despachar(e, 'OC-001', 'T1', agora)).toBe(e)
    expect(acoes.despachar(e, 'OC-001', 'T9', agora)).toBe(e)
  })
})

describe('atualizarStatus', () => {
  it('técnico avança etapa a etapa, registrando o nome dele', () => {
    let e = acoes.atualizarStatus(inicial(), 'OC-004', 'aceita', '', agora)
    expect(busca(e, 'OC-004').status).toBe('aceita')
    expect(busca(e, 'OC-004').historico.at(-1).por).toBe('Ana Souza')
    e = acoes.atualizarStatus(e, 'OC-004', 'a_caminho', '', agora)
    expect(busca(e, 'OC-004').status).toBe('a_caminho')
  })

  it('pular etapa ou usar para despachar não muda nada', () => {
    const e = inicial()
    expect(acoes.atualizarStatus(e, 'OC-004', 'resolvida', 'Feito o reparo', agora)).toBe(e)
    expect(acoes.atualizarStatus(e, 'OC-001', 'despachada', '', agora)).toBe(e)
  })

  it('resolver exige observação', () => {
    const e = inicial()
    expect(acoes.atualizarStatus(e, 'OC-006', 'resolvida', '  ', agora)).toBe(e)
    const r = acoes.atualizarStatus(e, 'OC-006', 'resolvida', 'Botão trocado', agora)
    expect(busca(r, 'OC-006')).toMatchObject({ status: 'resolvida', observacao: 'Botão trocado', resolvidaEm: agora.toISOString() })
  })
})

describe('gerarPreventiva', () => {
  const alerta = { id: 'E03-porta', elevadorId: 'E03', tipo: 'porta', quantidade: 5, risco: 'alto', motivo: '5 anomalias de porta nos últimos 7 dias' }

  it('cria preventiva e marca o alerta como tratado', () => {
    const e = acoes.gerarPreventiva(inicial(), alerta, agora)
    expect(busca(e, 'OC-011')).toMatchObject({ tipo: 'preventiva', severidade: 'baixa', origem: 'alerta', elevadorId: 'E03', descricao: 'Manutenção preventiva: 5 anomalias de porta nos últimos 7 dias' })
    expect(e.alertasTratados).toEqual(['E03-porta'])
  })

  it('segundo clique no mesmo alerta não cria outra', () => {
    const e = acoes.gerarPreventiva(inicial(), alerta, agora)
    expect(acoes.gerarPreventiva(e, alerta, agora)).toBe(e)
  })
})

describe('perfil, id e reinício', () => {
  it('proximoId', () => {
    expect(acoes.proximoId(inicial().ocorrencias)).toBe('OC-011')
    expect(acoes.proximoId([])).toBe('OC-001')
  })

  it('reiniciar volta os dados e mantém o perfil', () => {
    let e = acoes.definirPerfil(inicial(), { tipo: 'gestor' })
    e = acoes.criarOcorrencia(e, novaValida, agora)
    const r = acoes.reiniciar(e, agora)
    expect(r.ocorrencias).toHaveLength(10)
    expect(r.alertasTratados).toEqual([])
    expect(r.perfil).toEqual({ tipo: 'gestor' })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/contexto/estado.test.js`
Expected: FAIL (arquivo `./estado.js` não existe)

- [ ] **Step 3: Implementar**

```js
import { criarDadosIniciais } from '../dados/iniciais.js'
import { classificar, ROTULO_TIPO } from '../regras/classificar.js'
import { calcularPrazo } from '../regras/prazo.js'
import { podeMudar } from '../regras/status.js'
import { tecnicoOcupado } from '../regras/sugerirTecnico.js'

export const CHAVE_ARMAZENAMENTO = 'liftdesk-dados'
export const VERSAO = 1
const MIN_DESCRICAO = 10
const MIN_OBSERVACAO = 5

export function estadoInicial(agora = new Date()) {
  return { versao: VERSAO, ...criarDadosIniciais(agora), alertasTratados: [], perfil: null }
}

export function carregarEstado(texto, agora = new Date()) {
  if (!texto) return estadoInicial(agora)
  try {
    const dados = JSON.parse(texto)
    const valido =
      dados?.versao === VERSAO &&
      Array.isArray(dados.elevadores) &&
      Array.isArray(dados.tecnicos) &&
      Array.isArray(dados.ocorrencias) &&
      Array.isArray(dados.alertasTratados)
    return valido ? dados : estadoInicial(agora)
  } catch {
    return estadoInicial(agora)
  }
}

export function proximoId(ocorrencias) {
  const maior = ocorrencias.reduce((m, o) => Math.max(m, Number(o.id.replace('OC-', '')) || 0), 0)
  return `OC-${String(maior + 1).padStart(3, '0')}`
}

export function definirPerfil(estado, perfil) {
  return { ...estado, perfil }
}

function novaOcorrencia(estado, dados, origem, agora) {
  const criadaEm = agora.toISOString()
  const severidade = classificar(dados)
  return {
    id: proximoId(estado.ocorrencias),
    elevadorId: dados.elevadorId,
    tipo: dados.tipo,
    descricao: dados.descricao.trim(),
    passageiroPreso: Boolean(dados.passageiroPreso),
    severidade,
    status: 'aberta',
    tecnicoId: null,
    criadaEm,
    prazoLimite: calcularPrazo(severidade, criadaEm),
    historico: [{ status: 'aberta', quando: criadaEm, por: origem === 'alerta' ? 'Motor preditivo' : 'Gestor' }],
    observacao: '',
    origem,
    resolvidaEm: null,
  }
}

function trocarOcorrencia(estado, id, mudar) {
  return { ...estado, ocorrencias: estado.ocorrencias.map((o) => (o.id === id ? mudar(o) : o)) }
}

export function criarOcorrencia(estado, dados, agora = new Date()) {
  const elevadorExiste = estado.elevadores.some((e) => e.id === dados.elevadorId)
  const tipoValido = dados.tipo in ROTULO_TIPO && dados.tipo !== 'preventiva'
  const descricaoOk = (dados.descricao || '').trim().length >= MIN_DESCRICAO
  if (!elevadorExiste || !tipoValido || !descricaoOk) return estado
  return { ...estado, ocorrencias: [...estado.ocorrencias, novaOcorrencia(estado, dados, 'manual', agora)] }
}

export function despachar(estado, id, tecnicoId, agora = new Date()) {
  const oc = estado.ocorrencias.find((o) => o.id === id)
  const tecnico = estado.tecnicos.find((t) => t.id === tecnicoId)
  if (!oc || !tecnico || !podeMudar(oc.status, 'despachada') || tecnicoOcupado(tecnicoId, estado.ocorrencias)) return estado
  return trocarOcorrencia(estado, id, (o) => ({
    ...o,
    status: 'despachada',
    tecnicoId,
    historico: [...o.historico, { status: 'despachada', quando: agora.toISOString(), por: 'Gestor' }],
  }))
}

export function atualizarStatus(estado, id, novoStatus, observacao = '', agora = new Date()) {
  const oc = estado.ocorrencias.find((o) => o.id === id)
  if (!oc || novoStatus === 'despachada' || !podeMudar(oc.status, novoStatus)) return estado
  const texto = (observacao || '').trim()
  if (novoStatus === 'resolvida' && texto.length < MIN_OBSERVACAO) return estado
  const tecnico = estado.tecnicos.find((t) => t.id === oc.tecnicoId)
  const quando = agora.toISOString()
  return trocarOcorrencia(estado, id, (o) => ({
    ...o,
    status: novoStatus,
    historico: [...o.historico, { status: novoStatus, quando, por: tecnico ? tecnico.nome : 'Técnico' }],
    ...(novoStatus === 'resolvida' ? { observacao: texto, resolvidaEm: quando } : {}),
  }))
}

export function gerarPreventiva(estado, alerta, agora = new Date()) {
  if (estado.alertasTratados.includes(alerta.id)) return estado
  const dados = {
    elevadorId: alerta.elevadorId,
    tipo: 'preventiva',
    descricao: `Manutenção preventiva: ${alerta.motivo}`,
    passageiroPreso: false,
  }
  return {
    ...estado,
    ocorrencias: [...estado.ocorrencias, novaOcorrencia(estado, dados, 'alerta', agora)],
    alertasTratados: [...estado.alertasTratados, alerta.id],
  }
}

export function reiniciar(estado, agora = new Date()) {
  return { ...estadoInicial(agora), perfil: estado.perfil }
}
```

- [ ] **Step 4: Rodar e ver passar (e a suíte toda)**

Run: `npm test`
Expected: PASS em todos os arquivos (estado.test.js com 15 testes)

- [ ] **Step 5: Commit**

```bash
git add src/contexto/estado.js src/contexto/estado.test.js
git commit -m "feat: ações puras do estado (criar, despachar, status, preventiva, reiniciar)"
```

---

### Task 9: Contexto, rotas, layout e tela Entrar (P1)

**Files:**
- Create: `src/contexto/DadosContext.jsx`, `src/App.jsx`, `src/componentes/Cabecalho.jsx`, `src/componentes/RotaProtegida.jsx`, `src/componentes/Selos.jsx`, `src/componentes/CartaoIndicador.jsx`, `src/componentes/useAgora.js`, `src/paginas/Entrar.jsx`, `src/paginas/NaoEncontrado.jsx`, e versões iniciais de `src/paginas/Painel.jsx`, `NovaOcorrencia.jsx`, `DetalheOcorrencia.jsx`, `Alertas.jsx`, `MinhasTarefas.jsx`
- Modify: `src/main.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: tudo de `src/contexto/estado.js` (T8); `ROTULO_SEVERIDADE`, `COR_SEVERIDADE` (T2); `situacaoPrazo`, `formatarRestante` (T3); `ROTULO_STATUS` (T4).
- Produces:
  - `useDados() → { versao, elevadores, tecnicos, ocorrencias, alertasTratados, perfil, entrar(perfil), sair(), criarOcorrencia(dados) → id|null, despachar(id, tecnicoId) → boolean, atualizarStatus(id, novoStatus, observacao) → boolean, gerarPreventiva(alerta) → boolean, reiniciarDemo() }`
  - `useAgora(intervaloMs = 30000) → Date` (atualiza sozinho)
  - Componentes `<SeloSeveridade severidade />`, `<SeloStatus status />`, `<SeloPrazo ocorrencia agora />`, `<CartaoIndicador titulo valor cor />`

- [ ] **Step 1: Criar `src/contexto/DadosContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import * as acoes from './estado.js'

const DadosContext = createContext(null)

function lerArmazenado() {
  try {
    return localStorage.getItem(acoes.CHAVE_ARMAZENAMENTO)
  } catch {
    return null
  }
}

export function DadosProvider({ children }) {
  const [estado, setEstado] = useState(() => acoes.carregarEstado(lerArmazenado()))

  useEffect(() => {
    try {
      localStorage.setItem(acoes.CHAVE_ARMAZENAMENTO, JSON.stringify(estado))
    } catch {
      // Sem armazenamento disponível (modo privado): o app segue só em memória.
    }
  }, [estado])

  // Aplica o resultado de uma ação pura; devolve true se algo mudou.
  function aplicar(novo) {
    if (novo === estado) return false
    setEstado(novo)
    return true
  }

  const valor = {
    ...estado,
    entrar: (perfil) => aplicar(acoes.definirPerfil(estado, perfil)),
    sair: () => aplicar(acoes.definirPerfil(estado, null)),
    criarOcorrencia: (dados) => {
      const novo = acoes.criarOcorrencia(estado, dados, new Date())
      return aplicar(novo) ? novo.ocorrencias.at(-1).id : null
    },
    despachar: (id, tecnicoId) => aplicar(acoes.despachar(estado, id, tecnicoId, new Date())),
    atualizarStatus: (id, novoStatus, observacao) =>
      aplicar(acoes.atualizarStatus(estado, id, novoStatus, observacao, new Date())),
    gerarPreventiva: (alerta) => aplicar(acoes.gerarPreventiva(estado, alerta, new Date())),
    reiniciarDemo: () => aplicar(acoes.reiniciar(estado, new Date())),
  }

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>
}

export function useDados() {
  const valor = useContext(DadosContext)
  if (!valor) throw new Error('useDados precisa estar dentro de <DadosProvider>')
  return valor
}
```

- [ ] **Step 2: Criar os componentes compartilhados**

`src/componentes/useAgora.js`:
```js
import { useEffect, useState } from 'react'

export function useAgora(intervaloMs = 30000) {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])
  return agora
}
```

`src/componentes/Selos.jsx`:
```jsx
import { ROTULO_SEVERIDADE, COR_SEVERIDADE } from '../regras/classificar.js'
import { ROTULO_STATUS } from '../regras/status.js'
import { situacaoPrazo, formatarRestante } from '../regras/prazo.js'

export function SeloSeveridade({ severidade }) {
  return <span className={`badge text-bg-${COR_SEVERIDADE[severidade]}`}>{ROTULO_SEVERIDADE[severidade]}</span>
}

export function SeloStatus({ status }) {
  return <span className="badge text-bg-light border">{ROTULO_STATUS[status]}</span>
}

export function SeloPrazo({ ocorrencia, agora }) {
  const { restanteMin, atrasada } = situacaoPrazo(ocorrencia, agora)
  if (restanteMin === null) return null
  if (atrasada) return <span className="badge text-bg-danger">ATRASADA</span>
  return <span className="small text-secondary">{formatarRestante(restanteMin)}</span>
}
```

`src/componentes/CartaoIndicador.jsx`:
```jsx
export default function CartaoIndicador({ titulo, valor, cor }) {
  return (
    <div className={`card h-100 border-0 border-start border-4 border-${cor} shadow-sm`}>
      <div className="card-body">
        <div className="small text-secondary">{titulo}</div>
        <div className="fs-2 fw-bold">{valor}</div>
      </div>
    </div>
  )
}
```

`src/componentes/RotaProtegida.jsx`:
```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'

export default function RotaProtegida({ tipo }) {
  const { perfil } = useDados()
  if (!perfil) return <Navigate to="/" replace />
  if (perfil.tipo !== tipo) return <Navigate to={perfil.tipo === 'gestor' ? '/gestor' : '/tecnico'} replace />
  return <Outlet />
}
```

`src/componentes/Cabecalho.jsx`:
```jsx
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'

export default function Cabecalho() {
  const { perfil, tecnicos, sair, reiniciarDemo } = useDados()
  const navigate = useNavigate()
  const tecnico = perfil?.tipo === 'tecnico' ? tecnicos.find((t) => t.id === perfil.tecnicoId) : null

  function trocarPerfil() {
    sair()
    navigate('/')
  }

  function reiniciar() {
    if (window.confirm('Reiniciar a demonstração? Todos os dados voltam ao estado inicial.')) reiniciarDemo()
  }

  return (
    <header className="navbar navbar-dark bg-dark px-3 mb-4">
      <Link className="navbar-brand fw-bold" to="/">LiftDesk</Link>
      {perfil && (
        <nav className="d-flex flex-wrap align-items-center gap-2">
          {perfil.tipo === 'gestor' && (
            <>
              <NavLink end className="nav-link text-light" to="/gestor">Painel</NavLink>
              <NavLink className="nav-link text-light" to="/gestor/nova">Nova ocorrência</NavLink>
              <NavLink className="nav-link text-light" to="/gestor/alertas">Alertas</NavLink>
            </>
          )}
          <span className="badge text-bg-secondary">
            {perfil.tipo === 'gestor' ? 'Gestor' : `Técnico: ${tecnico?.nome ?? ''}`}
          </span>
          <button className="btn btn-sm btn-outline-light" onClick={trocarPerfil}>Trocar perfil</button>
          <button className="btn btn-sm btn-outline-warning" onClick={reiniciar}>Reiniciar demonstração</button>
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 3: Criar `src/App.jsx`, `Entrar.jsx` e `NaoEncontrado.jsx`**

`src/App.jsx`:
```jsx
import { Outlet } from 'react-router-dom'
import Cabecalho from './componentes/Cabecalho.jsx'

export default function App() {
  return (
    <>
      <Cabecalho />
      <main className="container pb-5">
        <Outlet />
      </main>
    </>
  )
}
```

`src/paginas/Entrar.jsx`:
```jsx
import { Navigate, useNavigate } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'

export default function Entrar() {
  const { perfil, tecnicos, entrar } = useDados()
  const navigate = useNavigate()

  if (perfil) return <Navigate to={perfil.tipo === 'gestor' ? '/gestor' : '/tecnico'} replace />

  function comoGestor() {
    entrar({ tipo: 'gestor' })
    navigate('/gestor')
  }

  function comoTecnico(tecnicoId) {
    entrar({ tipo: 'tecnico', tecnicoId })
    navigate('/tecnico')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h1 className="h3 mb-2">Entrar como</h1>
        <p className="text-secondary">Demonstração do LiftDesk: escolha um perfil. Não há senha.</p>
        <button className="btn btn-primary btn-lg w-100 mb-4" onClick={comoGestor}>
          Gestor — Central de operações
        </button>
        <h2 className="h5">Técnico de campo</h2>
        <div className="list-group">
          {tecnicos.map((t) => (
            <button
              key={t.id}
              className="list-group-item list-group-item-action d-flex justify-content-between"
              onClick={() => comoTecnico(t.id)}
            >
              <span>{t.nome}</span>
              <span className="small text-secondary">Região {t.regiao}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

`src/paginas/NaoEncontrado.jsx`:
```jsx
import { Link } from 'react-router-dom'

export default function NaoEncontrado() {
  return (
    <div className="text-center py-5">
      <h1 className="h3">Página não encontrada</h1>
      <Link to="/" className="btn btn-primary mt-3">Voltar ao início</Link>
    </div>
  )
}
```

- [ ] **Step 4: Criar as versões iniciais das telas (as Tarefas 10–14 substituem cada arquivo inteiro)**

`src/paginas/Painel.jsx`:
```jsx
export default function Painel() {
  return <h1 className="h3">Painel</h1>
}
```

`src/paginas/NovaOcorrencia.jsx`:
```jsx
export default function NovaOcorrencia() {
  return <h1 className="h3">Nova ocorrência</h1>
}
```

`src/paginas/DetalheOcorrencia.jsx`:
```jsx
export default function DetalheOcorrencia() {
  return <h1 className="h3">Detalhe da ocorrência</h1>
}
```

`src/paginas/Alertas.jsx`:
```jsx
export default function Alertas() {
  return <h1 className="h3">Alertas preditivos</h1>
}
```

`src/paginas/MinhasTarefas.jsx`:
```jsx
export default function MinhasTarefas() {
  return <h1 className="h3">Minhas tarefas</h1>
}
```

- [ ] **Step 5: Substituir `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { DadosProvider } from './contexto/DadosContext.jsx'
import RotaProtegida from './componentes/RotaProtegida.jsx'
import Entrar from './paginas/Entrar.jsx'
import Painel from './paginas/Painel.jsx'
import NovaOcorrencia from './paginas/NovaOcorrencia.jsx'
import DetalheOcorrencia from './paginas/DetalheOcorrencia.jsx'
import Alertas from './paginas/Alertas.jsx'
import MinhasTarefas from './paginas/MinhasTarefas.jsx'
import NaoEncontrado from './paginas/NaoEncontrado.jsx'

// HashRouter: o GitHub Pages não sabe redirecionar /gestor para o index.html.
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Entrar /> },
      {
        path: 'gestor',
        element: <RotaProtegida tipo="gestor" />,
        children: [
          { index: true, element: <Painel /> },
          { path: 'nova', element: <NovaOcorrencia /> },
          { path: 'ocorrencia/:id', element: <DetalheOcorrencia /> },
          { path: 'alertas', element: <Alertas /> },
        ],
      },
      {
        path: 'tecnico',
        element: <RotaProtegida tipo="tecnico" />,
        children: [{ index: true, element: <MinhasTarefas /> }],
      },
      { path: '*', element: <NaoEncontrado /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DadosProvider>
      <RouterProvider router={router} />
    </DadosProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 6: Verificar**

Run: `npm test && npm run build`
Expected: todos os testes PASS; build sem erros.

Run: `npm run dev` e abrir `http://localhost:5173/liftdesk/`
Expected:
- Tela "Entrar como" com o botão Gestor e 5 técnicos.
- Gestor → `#/gestor` mostra "Painel", e o menu leva a Nova ocorrência e Alertas.
- F5 continua logado como Gestor.
- Abrir `#/tecnico` como Gestor redireciona para `#/gestor`.
- "Trocar perfil" volta para Entrar.
- `#/xyz` mostra "Página não encontrada".

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: contexto de dados, rotas, layout e tela Entrar"
```

---

### Task 10: Painel do gestor (P2)

**Files:**
- Modify: `src/paginas/Painel.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: `useDados()` (T9), `useAgora` (T9), `SeloSeveridade`, `SeloStatus`, `SeloPrazo`, `CartaoIndicador` (T9), `ordenarOcorrencias`, `ROTULO_TIPO`, `ROTULO_SEVERIDADE` (T2), `STATUS_ATIVOS`, `ROTULO_STATUS` (T4), `gerarAlertas` (T6).

- [ ] **Step 1: Implementar**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'
import { useAgora } from '../componentes/useAgora.js'
import { SeloSeveridade, SeloStatus, SeloPrazo } from '../componentes/Selos.jsx'
import CartaoIndicador from '../componentes/CartaoIndicador.jsx'
import { ordenarOcorrencias, ROTULO_TIPO, ROTULO_SEVERIDADE } from '../regras/classificar.js'
import { STATUS_ATIVOS, ROTULO_STATUS } from '../regras/status.js'
import { gerarAlertas } from '../regras/preditivo.js'

export default function Painel() {
  const { ocorrencias, elevadores, tecnicos, alertasTratados } = useDados()
  const agora = useAgora()
  const navigate = useNavigate()
  const [filtroStatus, setFiltroStatus] = useState('ativas')
  const [filtroSeveridade, setFiltroSeveridade] = useState('todas')

  const hoje = agora.toDateString()
  const indicadores = [
    { titulo: 'Abertas (aguardando despacho)', valor: ocorrencias.filter((o) => o.status === 'aberta').length, cor: 'primary' },
    { titulo: 'Críticas não resolvidas', valor: ocorrencias.filter((o) => o.severidade === 'critica' && o.status !== 'resolvida').length, cor: 'danger' },
    { titulo: 'Em atendimento', valor: ocorrencias.filter((o) => STATUS_ATIVOS.includes(o.status)).length, cor: 'warning' },
    { titulo: 'Resolvidas hoje', valor: ocorrencias.filter((o) => o.resolvidaEm && new Date(o.resolvidaEm).toDateString() === hoje).length, cor: 'success' },
  ]
  const alertas = gerarAlertas(elevadores, alertasTratados)

  const lista = ordenarOcorrencias(ocorrencias).filter((o) => {
    const statusOk =
      filtroStatus === 'todas' || (filtroStatus === 'ativas' ? o.status !== 'resolvida' : o.status === filtroStatus)
    const severidadeOk = filtroSeveridade === 'todas' || o.severidade === filtroSeveridade
    return statusOk && severidadeOk
  })

  const elevador = (id) => elevadores.find((e) => e.id === id)
  const tecnico = (id) => tecnicos.find((t) => t.id === id)

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 m-0">Painel de ocorrências</h1>
        <Link to="/gestor/nova" className="btn btn-primary">+ Nova ocorrência</Link>
      </div>

      <div className="row g-3 mb-3">
        {indicadores.map((i) => (
          <div key={i.titulo} className="col-6 col-lg-3">
            <CartaoIndicador {...i} />
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>
            <strong>{alertas.length} alerta(s) preditivo(s):</strong> elevadores com padrão de falha nos últimos 7 dias.
          </span>
          <Link to="/gestor/alertas" className="btn btn-sm btn-warning">Ver alertas</Link>
        </div>
      )}

      <div className="row g-2 mb-3">
        <div className="col-sm-6 col-md-3">
          <label className="form-label small mb-1" htmlFor="filtro-status">Status</label>
          <select id="filtro-status" className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="ativas">Não resolvidas</option>
            <option value="todas">Todas</option>
            {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 col-md-3">
          <label className="form-label small mb-1" htmlFor="filtro-severidade">Severidade</label>
          <select id="filtro-severidade" className="form-select" value={filtroSeveridade} onChange={(e) => setFiltroSeveridade(e.target.value)}>
            <option value="todas">Todas</option>
            {Object.entries(ROTULO_SEVERIDADE).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive bg-white shadow-sm rounded">
        <table className="table table-hover m-0 tabela-ocorrencias">
          <thead>
            <tr>
              <th>ID</th><th>Severidade</th><th>Tipo</th><th>Elevador</th><th>Status</th><th>Técnico</th><th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan="7" className="text-center text-secondary py-4">Nenhuma ocorrência com esses filtros.</td></tr>
            )}
            {lista.map((o) => (
              <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/gestor/ocorrencia/${o.id}`)}>
                <td><Link to={`/gestor/ocorrencia/${o.id}`} onClick={(e) => e.stopPropagation()}>{o.id}</Link></td>
                <td><SeloSeveridade severidade={o.severidade} /></td>
                <td>{ROTULO_TIPO[o.tipo]}</td>
                <td>{elevador(o.elevadorId)?.predio} <span className="text-secondary small">({o.elevadorId})</span></td>
                <td><SeloStatus status={o.status} /></td>
                <td>{tecnico(o.tecnicoId)?.nome ?? <span className="text-secondary">—</span>}</td>
                <td><SeloPrazo ocorrencia={o} agora={agora} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev`, entrar como Gestor.
Expected:
- 4 cards, com "Abertas" = 4.
- Faixa amarela "4 alerta(s) preditivo(s)".
- OC-001 (crítica) aparece primeiro na tabela, e OC-005 mostra **ATRASADA**.
- O filtro "Todas" mostra 10 linhas, com as resolvidas no fim.
- O filtro de severidade "Crítica" mostra só a OC-001.
- Clicar numa linha abre `#/gestor/ocorrencia/OC-00X`.
- Em 375px (ferramentas do navegador, modo celular), a tabela rola na horizontal sem quebrar a página.

- [ ] **Step 3: Commit**

```bash
git add src/paginas/Painel.jsx
git commit -m "feat: painel do gestor com indicadores, filtros e lista priorizada"
```

---

### Task 11: Nova ocorrência (P3)

**Files:**
- Modify: `src/paginas/NovaOcorrencia.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: `useDados().criarOcorrencia(dados) → id|null`, `useDados().elevadores` (T9); `classificar`, `ROTULO_TIPO` (T2); `PRAZO_MINUTOS`, `formatarDuracao` (T3); `SeloSeveridade` (T9).

- [ ] **Step 1: Implementar**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'
import { SeloSeveridade } from '../componentes/Selos.jsx'
import { classificar, ROTULO_TIPO } from '../regras/classificar.js'
import { PRAZO_MINUTOS, formatarDuracao } from '../regras/prazo.js'

const TIPOS = ['passageiro_preso', 'falha_tecnica', 'falta_energia', 'ruido_anormal', 'solicitacao_cliente']
const MIN_DESCRICAO = 10

export default function NovaOcorrencia() {
  const { elevadores, criarOcorrencia } = useDados()
  const navigate = useNavigate()
  const [form, setForm] = useState({ elevadorId: '', tipo: '', descricao: '', passageiroPreso: false })
  const [tocado, setTocado] = useState({})

  const erros = {
    elevadorId: form.elevadorId ? null : 'Escolha o elevador.',
    tipo: form.tipo ? null : 'Escolha o tipo da ocorrência.',
    descricao: form.descricao.trim().length >= MIN_DESCRICAO ? null : `Descreva com pelo menos ${MIN_DESCRICAO} caracteres.`,
  }
  const valido = !erros.elevadorId && !erros.tipo && !erros.descricao
  const severidade = form.tipo ? classificar(form) : null

  function alterar(campo, valor) {
    setForm((atual) => {
      const novo = { ...atual, [campo]: valor }
      if (campo === 'tipo' && valor === 'passageiro_preso') novo.passageiroPreso = true
      return novo
    })
  }

  const classeCampo = (campo, base) => `${base}${tocado[campo] && erros[campo] ? ' is-invalid' : ''}`

  function enviar(evento) {
    evento.preventDefault()
    if (!valido) return
    const id = criarOcorrencia(form)
    if (id) navigate(`/gestor/ocorrencia/${id}`)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h1 className="h3 mb-3">Nova ocorrência</h1>
        <form className="card card-body shadow-sm" onSubmit={enviar} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="elevador">Elevador</label>
            <select
              id="elevador"
              className={classeCampo('elevadorId', 'form-select')}
              value={form.elevadorId}
              onChange={(e) => alterar('elevadorId', e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, elevadorId: true }))}
            >
              <option value="">Selecione...</option>
              {elevadores.map((e) => (
                <option key={e.id} value={e.id}>{e.predio} — {e.id} (região {e.regiao})</option>
              ))}
            </select>
            <div className="invalid-feedback">{erros.elevadorId}</div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              className={classeCampo('tipo', 'form-select')}
              value={form.tipo}
              onChange={(e) => alterar('tipo', e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, tipo: true }))}
            >
              <option value="">Selecione...</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{ROTULO_TIPO[t]}</option>
              ))}
            </select>
            <div className="invalid-feedback">{erros.tipo}</div>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              id="preso"
              className="form-check-input"
              type="checkbox"
              checked={form.passageiroPreso}
              onChange={(e) => alterar('passageiroPreso', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="preso">Há passageiro preso</label>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              rows="3"
              className={classeCampo('descricao', 'form-control')}
              value={form.descricao}
              onChange={(e) => alterar('descricao', e.target.value)}
              onBlur={() => setTocado((t) => ({ ...t, descricao: true }))}
              placeholder="O que está acontecendo? Em que andar?"
            />
            <div className="invalid-feedback">{erros.descricao}</div>
          </div>

          {severidade && (
            <div className="alert alert-light border d-flex flex-wrap gap-3 align-items-center">
              <span>Classificação automática: <SeloSeveridade severidade={severidade} /></span>
              <span>Prazo de atendimento: <strong>{formatarDuracao(PRAZO_MINUTOS[severidade])}</strong></span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={!valido}>Registrar ocorrência</button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev` → Gestor → Nova ocorrência.
Expected:
- O botão fica desativado enquanto falta algum campo. Sair de um campo vazio mostra a mensagem em vermelho.
- Escolher "Passageiro preso" liga a chave e mostra **Crítica · 30min**.
- "Ruído anormal" mostra **Média · 8h**.
- Ligar a chave com "Ruído anormal" muda para Crítica.
- Registrar abre `#/gestor/ocorrencia/OC-011`, e no painel ela aparece no topo se for crítica.

- [ ] **Step 3: Commit**

```bash
git add src/paginas/NovaOcorrencia.jsx
git commit -m "feat: formulário de nova ocorrência com classificação em tempo real"
```

---

### Task 12: Detalhe e despacho (P4)

**Files:**
- Modify: `src/paginas/DetalheOcorrencia.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: `useDados()` com `ocorrencias`, `elevadores`, `tecnicos`, `despachar(id, tecnicoId) → boolean` (T9); `useAgora`, `SeloSeveridade`, `SeloStatus`, `SeloPrazo` (T9); `sugerirTecnico`, `tecnicoOcupado` (T5); `ROTULO_TIPO` (T2); `ROTULO_STATUS` (T4).

- [ ] **Step 1: Implementar**

```jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'
import { useAgora } from '../componentes/useAgora.js'
import { SeloSeveridade, SeloStatus, SeloPrazo } from '../componentes/Selos.jsx'
import { sugerirTecnico, tecnicoOcupado } from '../regras/sugerirTecnico.js'
import { ROTULO_TIPO } from '../regras/classificar.js'
import { ROTULO_STATUS } from '../regras/status.js'

const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function DetalheOcorrencia() {
  const { id } = useParams()
  const { ocorrencias, elevadores, tecnicos, despachar } = useDados()
  const agora = useAgora()
  const [escolhido, setEscolhido] = useState('')

  const ocorrencia = ocorrencias.find((o) => o.id === id)
  if (!ocorrencia) {
    return (
      <div className="alert alert-warning">
        Ocorrência {id} não encontrada. <Link to="/gestor">Voltar ao painel</Link>
      </div>
    )
  }

  const elevador = elevadores.find((e) => e.id === ocorrencia.elevadorId)
  const responsavel = tecnicos.find((t) => t.id === ocorrencia.tecnicoId)
  const aberta = ocorrencia.status === 'aberta'
  const sugestao = aberta ? sugerirTecnico(ocorrencia, elevador, tecnicos, ocorrencias, agora) : null
  const livres = tecnicos.filter((t) => !tecnicoOcupado(t.id, ocorrencias))
  const tecnicoId = escolhido || sugestao?.tecnico?.id || ''

  return (
    <>
      <Link to="/gestor" className="small">← Voltar ao painel</Link>
      <div className="d-flex flex-wrap align-items-center gap-2 my-2">
        <h1 className="h3 m-0">{ocorrencia.id} · {ROTULO_TIPO[ocorrencia.tipo]}</h1>
        <SeloSeveridade severidade={ocorrencia.severidade} />
        <SeloStatus status={ocorrencia.status} />
        {ocorrencia.origem === 'alerta' && <span className="badge text-bg-dark">Gerada por alerta preditivo</span>}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <p className="mb-2">{ocorrencia.descricao}</p>
              {ocorrencia.passageiroPreso && <p className="text-danger fw-bold mb-2">Passageiro preso</p>}
              <dl className="row mb-0 small">
                <dt className="col-4">Elevador</dt>
                <dd className="col-8">{elevador.predio} ({elevador.id}) · {elevador.modelo}</dd>
                <dt className="col-4">Endereço</dt>
                <dd className="col-8">{elevador.endereco} · região {elevador.regiao}</dd>
                <dt className="col-4">Aberta em</dt>
                <dd className="col-8">{dataHora(ocorrencia.criadaEm)}</dd>
                <dt className="col-4">Prazo limite</dt>
                <dd className="col-8">{dataHora(ocorrencia.prazoLimite)} <SeloPrazo ocorrencia={ocorrencia} agora={agora} /></dd>
              </dl>
            </div>
          </div>

          {ocorrencia.status === 'resolvida' && (
            <div className="alert alert-success">
              <strong>Resolvida:</strong> {ocorrencia.observacao}
            </div>
          )}
        </div>

        <div className="col-lg-5">
          {aberta ? (
            <div className="card border-primary shadow-sm mb-3">
              <div className="card-body">
                <h2 className="h5">Despacho</h2>
                {sugestao.tecnico ? (
                  <p className="mb-2">
                    Técnico sugerido: <strong>{sugestao.tecnico.nome}</strong>{' '}
                    <span className="text-secondary small">(região {sugestao.tecnico.regiao})</span>
                  </p>
                ) : null}
                {sugestao.aviso && <div className="alert alert-warning py-2 small">{sugestao.aviso}</div>}
                {livres.length > 0 && (
                  <>
                    <label className="form-label small" htmlFor="tecnico">Trocar técnico</label>
                    <select id="tecnico" className="form-select mb-3" value={tecnicoId} onChange={(e) => setEscolhido(e.target.value)}>
                      {livres.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome} — {t.regiao} ({t.especialidades.join(', ')})</option>
                      ))}
                    </select>
                  </>
                )}
                <button className="btn btn-primary w-100" disabled={!tecnicoId} onClick={() => despachar(ocorrencia.id, tecnicoId)}>
                  Confirmar despacho
                </button>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h2 className="h5">Responsável</h2>
                <p className="mb-0">{responsavel?.nome} <span className="text-secondary small">(região {responsavel?.regiao})</span></p>
              </div>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5">Histórico</h2>
              <ol className="list-unstyled small mb-0">
                {ocorrencia.historico.map((h, i) => (
                  <li key={i} className="mb-1">
                    <strong>{ROTULO_STATUS[h.status]}</strong> · {dataHora(h.quando)} · {h.por}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev` → Gestor → abrir OC-001.
Expected:
- A sugestão é **Bruno Lima (Norte)**.
- "Trocar técnico" lista só Bruno e Elisa, os livres.
- Confirmar muda o status para Despachada, mostra o card "Responsável" e o histórico ganha a linha "Despachada · Gestor".
- Abrir OC-002 sugere **Elisa Prado**.
- Depois de despachar a OC-001 (Bruno) e a OC-002 (Elisa), abrir a OC-003 mostra "Nenhum técnico disponível" e o botão fica desativado.
- `#/gestor/ocorrencia/OC-999` mostra "não encontrada".

- [ ] **Step 3: Commit**

```bash
git add src/paginas/DetalheOcorrencia.jsx
git commit -m "feat: detalhe da ocorrência com despacho em um clique"
```

---

### Task 13: Alertas preditivos (P5)

**Files:**
- Modify: `src/paginas/Alertas.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: `useDados()` com `elevadores`, `alertasTratados`, `gerarPreventiva(alerta) → boolean` (T9); `gerarAlertas`, `JANELA_DIAS` (T6).

- [ ] **Step 1: Implementar**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDados } from '../contexto/DadosContext.jsx'
import { gerarAlertas, JANELA_DIAS } from '../regras/preditivo.js'

const ESTILO_RISCO = { alto: { cor: 'danger', rotulo: 'Risco ALTO' }, medio: { cor: 'warning', rotulo: 'Risco MÉDIO' } }

export default function Alertas() {
  const { elevadores, alertasTratados, gerarPreventiva } = useDados()
  const [ultimo, setUltimo] = useState(null)
  const alertas = gerarAlertas(elevadores, alertasTratados)
  const elevador = (id) => elevadores.find((e) => e.id === id)

  function preventiva(alerta) {
    if (gerarPreventiva(alerta)) setUltimo(alerta)
  }

  return (
    <>
      <h1 className="h3 mb-3">Alertas preditivos</h1>

      <div className="card card-body bg-white shadow-sm mb-3 small">
        <strong className="mb-1">Como o motor preditivo decide</strong>
        Ele conta as anomalias de cada elevador nos últimos {JANELA_DIAS} dias, separadas por tipo. De 3 a 4 do mesmo tipo
        geram risco <strong>médio</strong>. Com 5 ou mais, ou quando dois tipos diferentes aparecem no mesmo elevador, o risco é
        <strong> alto</strong>. Esses padrões costumam vir antes de uma falha.
      </div>

      {ultimo && (
        <div className="alert alert-success">
          Manutenção preventiva criada para o elevador {ultimo.elevadorId}. <Link to="/gestor">Ver no painel</Link>
        </div>
      )}

      {alertas.length === 0 && <p className="text-secondary">Nenhum elevador em risco no momento.</p>}

      <div className="row g-3">
        {alertas.map((a) => {
          const el = elevador(a.elevadorId)
          const estilo = ESTILO_RISCO[a.risco]
          return (
            <div key={a.id} className="col-md-6">
              <div className={`card h-100 shadow-sm border-${estilo.cor}`}>
                <div className="card-body d-flex flex-column">
                  <span className={`badge text-bg-${estilo.cor} align-self-start mb-2`}>{estilo.rotulo}</span>
                  <h2 className="h5 mb-1">{el.predio} · {el.id}</h2>
                  <p className="small text-secondary mb-2">{el.endereco} · região {el.regiao} · {el.modelo} ({el.anoInstalacao})</p>
                  <p className="mb-3">{a.motivo}</p>
                  <button className="btn btn-outline-primary mt-auto" onClick={() => preventiva(a)}>
                    Gerar manutenção preventiva
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev` → Gestor → Alertas.
Expected:
- 4 cards, nesta ordem: E03 porta ALTO, E07 vibração ALTO, E07 nivelamento ALTO e E10 porta MÉDIO.
- "Gerar manutenção preventiva" no E03 faz o card sumir e aparecer a mensagem verde.
- No painel surge uma nova ocorrência Baixa do E03. Ao abrir, ela tem o selo "Gerada por alerta preditivo" e o histórico "Aberta · Motor preditivo".
- F5 continua sem o alerta do E03.

- [ ] **Step 3: Commit**

```bash
git add src/paginas/Alertas.jsx
git commit -m "feat: tela de alertas preditivos com geração de preventiva"
```

---

### Task 14: Minhas tarefas, a tela do técnico (P1)

**Files:**
- Modify: `src/paginas/MinhasTarefas.jsx` (substituir inteiro)

**Interfaces:**
- Consumes: `useDados()` com `perfil`, `tecnicos`, `ocorrencias`, `elevadores`, `atualizarStatus(id, novoStatus, observacao) → boolean` (T9); `useAgora`, `SeloSeveridade`, `SeloStatus`, `SeloPrazo` (T9); `ordenarOcorrencias`, `ROTULO_TIPO` (T2).

- [ ] **Step 1: Implementar**

```jsx
import { useState } from 'react'
import { useDados } from '../contexto/DadosContext.jsx'
import { useAgora } from '../componentes/useAgora.js'
import { SeloSeveridade, SeloStatus, SeloPrazo } from '../componentes/Selos.jsx'
import { ordenarOcorrencias, ROTULO_TIPO } from '../regras/classificar.js'

const PROXIMA_ACAO = {
  despachada: { novo: 'aceita', rotulo: 'Aceitar chamado' },
  aceita: { novo: 'a_caminho', rotulo: 'Estou a caminho' },
  a_caminho: { novo: 'resolvida', rotulo: 'Marcar como resolvida' },
}
const MIN_OBSERVACAO = 5

export default function MinhasTarefas() {
  const { perfil, tecnicos, ocorrencias, elevadores, atualizarStatus } = useDados()
  const agora = useAgora()
  const [observacoes, setObservacoes] = useState({})

  const tecnico = tecnicos.find((t) => t.id === perfil.tecnicoId)
  const minhas = ordenarOcorrencias(ocorrencias.filter((o) => o.tecnicoId === perfil.tecnicoId))
  const ativas = minhas.filter((o) => o.status !== 'resolvida')
  const resolvidas = minhas.filter((o) => o.status === 'resolvida')
  const elevador = (id) => elevadores.find((e) => e.id === id)

  function avancar(ocorrencia) {
    const acao = PROXIMA_ACAO[ocorrencia.status]
    if (atualizarStatus(ocorrencia.id, acao.novo, observacoes[ocorrencia.id] ?? '')) {
      setObservacoes((atual) => ({ ...atual, [ocorrencia.id]: '' }))
    }
  }

  return (
    <>
      <h1 className="h3 mb-1">Minhas tarefas</h1>
      <p className="text-secondary">{tecnico?.nome} · região {tecnico?.regiao}</p>

      {ativas.length === 0 && (
        <div className="alert alert-light border">Nenhuma tarefa no momento. Aguarde o despacho da central.</div>
      )}

      <div className="row g-3 mb-4">
        {ativas.map((o) => {
          const el = elevador(o.elevadorId)
          const acao = PROXIMA_ACAO[o.status]
          const texto = observacoes[o.id] ?? ''
          const precisaObservacao = acao.novo === 'resolvida'
          const podeAvancar = !precisaObservacao || texto.trim().length >= MIN_OBSERVACAO
          return (
            <div key={o.id} className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <strong>{o.id}</strong>
                    <SeloSeveridade severidade={o.severidade} />
                    <SeloStatus status={o.status} />
                    <SeloPrazo ocorrencia={o} agora={agora} />
                  </div>
                  <h2 className="h6 mb-1">{ROTULO_TIPO[o.tipo]} · {el.predio} ({el.id})</h2>
                  <p className="small text-secondary mb-2">{el.endereco}</p>
                  <p className="mb-3">{o.descricao}</p>
                  {precisaObservacao && (
                    <div className="mb-2">
                      <label className="form-label small" htmlFor={`obs-${o.id}`}>O que foi feito?</label>
                      <textarea
                        id={`obs-${o.id}`}
                        className="form-control"
                        rows="2"
                        value={texto}
                        onChange={(e) => setObservacoes((atual) => ({ ...atual, [o.id]: e.target.value }))}
                      />
                      <div className="form-text">Mínimo de {MIN_OBSERVACAO} caracteres.</div>
                    </div>
                  )}
                  <button className="btn btn-success mt-auto" disabled={!podeAvancar} onClick={() => avancar(o)}>
                    {acao.rotulo}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {resolvidas.length > 0 && (
        <>
          <h2 className="h5">Resolvidas</h2>
          <ul className="list-group">
            {resolvidas.map((o) => (
              <li key={o.id} className="list-group-item small">
                <strong>{o.id}</strong> · {ROTULO_TIPO[o.tipo]} · {elevador(o.elevadorId).predio}: {o.observacao}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verificar o fluxo completo**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev`.
Expected:
- Como Gestor, despachar a OC-001 para o Bruno.
- Trocar perfil → Bruno Lima mostra a OC-001 com "Aceitar chamado" → "Estou a caminho" → o campo "O que foi feito?" aparece com o botão desativado.
- Digitar "Passageiros liberados, freio ajustado" ativa o botão → resolver.
- O card vai para "Resolvidas".
- Como Gestor, "Resolvidas hoje" aumentou 1 e a OC-001 está no fim da lista "Todas".
- Ana Souza já abre com a OC-004 em "Aceitar chamado".

- [ ] **Step 3: Commit**

```bash
git add src/paginas/MinhasTarefas.jsx
git commit -m "feat: tela do técnico com fluxo aceitar, a caminho e resolver"
```

---

### Task 15: README, deploy e checklist da demonstração (P1)

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: scripts da Tarefa 1; app completo (Tarefas 9–14).

- [ ] **Step 1: Criar `README.md`**

````markdown
# LiftDesk

Gestão inteligente de ocorrências de elevadores: Challenge OTIS · FIAP Engenharia de Software 2026.

**Demo:** https://<usuario-github>.github.io/liftdesk/

## Rodar localmente

```bash
npm install
npm run dev     # http://localhost:5173/liftdesk/
npm test        # testes das regras de negócio
```

## Publicar no GitHub Pages

```bash
npm run deploy
```

Na primeira vez, configure no GitHub: Settings → Pages → Source: branch `gh-pages`, pasta `/ (root)`.

## Como funciona

- **Perfis:** Gestor (central de operações) e Técnico de campo, sem senha (demonstração).
- **Classificação automática:** passageiro preso = crítica; falta de energia ou falha técnica = alta; ruído = média; demais = baixa.
- **Prazo (SLA):** crítica 30 min, alta 2 h, média 8 h, baixa 48 h.
- **Técnico sugerido:** livre, da mesma região e com a especialidade necessária (resgate para passageiro preso, energia para falta de energia).
- **Motor preditivo:** 3–4 anomalias do mesmo tipo em 7 dias = risco médio; 5+ ou dois tipos no mesmo elevador = risco alto.
- **Dados:** começam de arquivos JSON e ficam salvos no navegador (`localStorage`). O botão **Reiniciar demonstração** volta ao estado inicial.

## Checklist da demonstração (rodar no link publicado antes de entregar)

1. Entrar como Gestor → painel com dados.
2. Nova ocorrência com passageiro preso → aparece como crítica no topo.
3. Abrir e despachar o técnico sugerido.
4. Trocar para o técnico → Aceitar → A caminho → Resolvido com observação.
5. Voltar ao gestor → painel atualizado.
6. Alertas → Gerar preventiva → some dos alertas e vira ocorrência.
7. F5 em qualquer tela → nada se perde e nada quebra.
8. Reiniciar demonstração → volta ao estado inicial.
9. Celular (375px) → layout utilizável.

## Equipe

Grupo LiftDesk: preencher com os 5 integrantes e RMs.
````

- [ ] **Step 2: Rodar tudo**

Run: `npm test && npm run build`
Expected: todos os testes PASS; build sem erros.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README com execução, deploy e checklist da demo"
```

- [ ] **Step 4: Publicar (feito por um integrante, com a conta GitHub do grupo)**

Esta etapa publica o código e o site, então **o responsável confirma antes de executar**:
1. Criar no GitHub um repositório **público** chamado `liftdesk`.
2. Ligar o repositório local ao remoto e enviar o código:
```bash
git remote add origin https://github.com/<usuario-github>/liftdesk.git
git push -u origin main
npm run deploy
```
3. No GitHub: Settings → Pages → Source: branch `gh-pages`, pasta `/ (root)`.
4. Trocar `<usuario-github>` no README pelo usuário real e fazer commit e push.

Expected: em 1–2 minutos, `https://<usuario-github>.github.io/liftdesk/` abre a tela "Entrar como".

- [ ] **Step 5: Rodar o checklist da demonstração no link publicado**

Executar os 9 itens do checklist do README no site publicado (não no `localhost`), incluindo F5 em `#/gestor/alertas` e `#/tecnico`.
Expected: os 9 itens passam. Anotar e corrigir qualquer falha antes da gravação do vídeo.
