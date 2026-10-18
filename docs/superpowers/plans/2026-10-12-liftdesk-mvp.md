# LiftDesk: plano e divisão de tarefas

Leia antes o documento **`docs/superpowers/specs/2026-10-12-liftdesk-mvp-design.md`**, que explica o que vamos construir.

## Quem faz o quê

| Pessoa | Tela | Funções de `regras.js` | Fora do código |
|---|---|---|---|
| **P1 · Lucas** | Projeto base, `dados.js`, cabeçalho, Início, **Minhas tarefas** (técnico) e deploy | `tecnicoEstaLivre` | Cuidar do GitHub e ajudar nos merges |
| **P2 · Pietro** | **Painel** | `estaAtrasada`, `ordenarPorGravidade` | Roteiro do vídeo e backlog com MoSCoW |
| **P3 e P4 · Erick** | **Nova ocorrência** e **Detalhe e despacho** | `calcularSeveridade`, `prazoEmMinutos`, `sugerirTecnico` | — |
| **P5 · João Victor** | **Alertas** | `gerarAlertas` | Gravação e edição do vídeo e PDF da entrega |

No resto do guia, P1 a P5 se referem a essas pessoas. O Gabriel saiu da faculdade, e as partes dele (P4) foram redistribuídas. Ele não entra no PDF nem no grupo da entrega no FIAP ON.

## Cronograma

| Semana | O que precisa estar pronto |
|---|---|
| **1 · 12–18/10** | P1 sobe o projeto base até **quarta, 15/10**. Até lá, os outros escrevem as suas funções de `regras.js` e testam com `console.log`. Até domingo, cada tela mostra **dados de verdade**, mesmo sem botões funcionando |
| **2 · 19–25/10** | Os botões funcionam: criar, despachar, A caminho, Resolvido e Gerar preventiva. O **fluxo completo** roda no computador |
| **3 · 26/10–01/11** | Acabamento visual, versão de celular e **deploy funcionando**. Rodar o checklist no link publicado. **Nada de funcionalidade nova depois de 01/11** |
| **4 · 02–09/11** | Corrigir os erros, gravar o vídeo (perto de 3 min, **mostrando o sistema**), montar o PDF e o ZIP. **Entregar em 09/11** |

## Como trabalhar no Git (sem conflito)

1. Cada pessoa cria a sua branch: `git checkout -b painel` (ou `nova-ocorrencia`, `detalhe`, `alertas`, `tecnico`).
2. Mexa **só nos seus arquivos**. Em `regras.js`, mexa **só nas suas funções**.
3. Antes de enviar, traga o que mudou na `main`: `git pull origin main`.
4. Envie e abra um **Pull Request** no GitHub. P1 revisa e faz o merge.

---

## P1: projeto base (fazer primeiro, até 15/10)

### 1. Criar o projeto
Dentro da pasta `liftdesk`, que já tem a pasta `docs`:
```bash
npm create vite@latest . -- --template react
npm install
npm install react-router-dom bootstrap
npm install -D gh-pages
```
Apague os arquivos de exemplo, como no capítulo 4 da Fase 6.

### 2. Arquivos de dados em `src/dados/`
Crie `elevadores.json` (12 elevadores em 6 prédios, só nos 10 estados dos técnicos), `tecnicos.json` (10 técnicos, um por estado: RJ, SP, ES, AM, BA, GO, DF, RN, RS, SC; campo `estado` com a sigla) e `ocorrencias.json` (umas 10 ocorrências em status variados). **Garanta que os dados de exemplo incluam:**
- pelo menos 1 elevador com **5 eventos de porta** nos últimos 7 dias, para dar alerta **alto**;
- pelo menos 1 elevador com **3 eventos** do mesmo tipo, para dar alerta **médio**;
- uma ocorrência **aberta com passageiro preso**, para a demonstração;
- **alguns técnicos ocupados** (uns 3) e o resto livre;
- pelo menos 1 elevador num estado cujo técnico esteja **ocupado**, para mostrar o aviso "fora do estado".

### 3. `src/dados.js`: ler, salvar e reiniciar
```js
import elevadores from './dados/elevadores.json'
import tecnicos from './dados/tecnicos.json'
import ocorrenciasIniciais from './dados/ocorrencias.json'

const CHAVE = 'liftdesk'

export function reiniciarDados() {
  const ocorrencias = ocorrenciasIniciais.map((o) => ({
    ...o,
    criadaEm: Date.now() - o.minutosAtras * 60000,
  }))
  const dados = { elevadores, tecnicos, ocorrencias, alertasTratados: [] }
  salvarDados(dados)
  return dados
}

export function lerDados() {
  const texto = localStorage.getItem(CHAVE)
  if (!texto) return reiniciarDados()
  return JSON.parse(texto)
}

export function salvarDados(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados))
}
```

**Como as telas usam isso** (todo mundo segue este padrão):
```jsx
const [dados, setDados] = useState(lerDados())

function mudarAlgo() {
  const novosDados = { ...dados, ocorrencias: /* lista nova */ }
  salvarDados(novosDados)   // guarda no navegador
  setDados(novosDados)      // atualiza a tela
}
```

### 4. `src/regras.js` com as funções vazias
Crie o arquivo só com os "esqueletos", e cada pessoa preenche a sua:
```js
export function calcularSeveridade(tipo, passageiroPreso) {}   // P3
export function prazoEmMinutos(severidade) {}                    // P3
export function estaAtrasada(ocorrencia) {}                      // P2
export function ordenarPorGravidade(ocorrencias) {}              // P2
export function tecnicoEstaLivre(tecnicoId, ocorrencias) {}      // P1
export function sugerirTecnico(elevador, tecnicos, ocorrencias) {} // P4
export function gerarAlertas(elevadores, alertasTratados) {}     // P5
```

### 5. Rotas em `main.jsx`
Faça igual ao capítulo 4 da Fase 6 (Código 28), mas usando **`createHashRouter`** no lugar de `createBrowserRouter`. As rotas estão na seção 5 da especificação. Crie cada página com um título simples (`<h1>Painel</h1>`), para os colegas já terem o arquivo onde trabalhar.

### 6. Cabeçalho e Início
- **Cabeçalho**: links para Painel, Nova ocorrência e Alertas, mais o botão **Reiniciar demonstração**. Esse botão chama `reiniciarDados()` e depois `window.location.reload()`.
- **Início**: dois botões grandes, `<Link to="/gestor">Sou gestor</Link>` e `<Link to="/tecnico">Sou técnico</Link>`.
- Coloque o Bootstrap no `main.jsx` com `import 'bootstrap/dist/css/bootstrap.min.css'`.

### 7. Deploy (semana 3)
1. No `vite.config.js`, adicione `base: '/liftdesk/'`.
2. No `package.json`, em `"scripts"`, adicione `"predeploy": "npm run build"` e `"deploy": "gh-pages -d dist"`.
3. Rode `npm run deploy`.
4. No GitHub: Settings → Pages → branch `gh-pages`.

### 8. Sua função: `tecnicoEstaLivre(tecnicoId, ocorrencias)`
Devolve `true` se **nenhuma** ocorrência desse técnico estiver `despachada` ou `a_caminho`. Dica: use `.filter()` ou um `for` com `if`.

### 9. Sua tela: Minhas tarefas (`/tecnico`)
- Um `<select>` com os técnicos. Guarde o escolhido num `useState`.
- Mostre as ocorrências do técnico que **não** estão resolvidas, em cards do Bootstrap: prédio, tipo, descrição e severidade.
- Botão de acordo com o status:
  - `despachada` → **A caminho**, que muda para `a_caminho`;
  - `a_caminho` → **Resolvido**, que muda para `resolvida`. Peça uma observação num `<textarea>` e só habilite o botão se ela não estiver vazia.
- Para mudar o status, crie a lista nova com `.map()`:
```js
const ocorrencias = dados.ocorrencias.map((o) =>
  o.id === id ? { ...o, status: 'a_caminho' } : o
)
```
- Se não houver tarefas, mostre: "Nenhuma tarefa no momento."

---

## P2: Painel (`/gestor`)

### Suas funções em `regras.js`
- **`estaAtrasada(ocorrencia)`**: devolve `true` se o status **não** for `resolvida` **e** `Date.now()` for maior que `criadaEm + prazoEmMinutos(severidade) * 60000`. Use a função `prazoEmMinutos` da P3. Enquanto ela não existir, teste com o número 30.
- **`ordenarPorGravidade(ocorrencias)`**: devolve a lista com as críticas primeiro, depois alta, média e baixa, e as resolvidas no fim. Dica: dê um peso para cada severidade (`critica: 4`, `alta: 3`...) e use `.sort()` numa **cópia** da lista (`[...ocorrencias].sort(...)`).

### O que a tela mostra
1. **4 cards** no topo, usando o grid do Bootstrap (`row` e `col`): Abertas, Críticas, Em atendimento (`despachada` + `a_caminho`) e Resolvidas. Para contar, use `.filter(...).length`.
2. Se `gerarAlertas(...)` (função da P5) devolver algum alerta, mostre uma faixa amarela (`alert alert-warning`) com um link para `/gestor/alertas`.
3. Um botão **+ Nova ocorrência**, que leva para `/gestor/nova`.
4. Uma **tabela** (`table table-hover`, dentro de `table-responsive`) com ID, severidade (um badge colorido), tipo, prédio, status, técnico e um selo **ATRASADA** quando for o caso. Cada linha tem um `<Link>` para `/gestor/ocorrencia/ID`.
5. Um `<select>` para filtrar: **Não resolvidas** (padrão) ou **Todas**.

**Cores dos badges:** crítica `text-bg-danger`, alta `text-bg-warning`, média `text-bg-info`, baixa `text-bg-success`.

**Conferir:** a ocorrência com passageiro preso aparece primeiro, e a tabela não quebra no celular.

---

## P3: Nova ocorrência (`/gestor/nova`)

### Suas funções em `regras.js`
- **`calcularSeveridade(tipo, passageiroPreso)`**: são só `if`s, nesta ordem:
  - `passageiroPreso` verdadeiro **ou** tipo `passageiro_preso` → `'critica'`
  - `falta_energia` ou `falha_tecnica` → `'alta'`
  - `ruido` → `'media'`
  - o resto → `'baixa'`
- **`prazoEmMinutos(severidade)`**: crítica 30, alta 120, média 480, baixa 2880.

Teste no console: `console.log(calcularSeveridade('ruido', true))` deve mostrar `critica`.

### O que a tela mostra
Um formulário do Bootstrap (capítulo 2 da Fase 4) com:
- **Elevador**: `<select>` com os elevadores (`dados.elevadores.map(...)`);
- **Tipo**: `<select>` com os 5 tipos (sem "preventiva");
- **Há passageiro preso?**: checkbox, ou o "switch" do Bootstrap;
- **Descrição**: `<textarea>`.

Guarde cada campo num `useState`. Enquanto o usuário preenche, mostre embaixo: **"Classificação automática: Crítica · prazo de 30 min"**, usando as suas duas funções.

**Botão Registrar:**
- desativado (`disabled`) se faltar elevador, tipo ou uma descrição com pelo menos 10 letras;
- ao clicar, monta a ocorrência nova e salva:
```js
const nova = {
  id: 'OC-' + Date.now(),
  elevadorId, tipo, descricao, passageiroPreso,
  severidade: calcularSeveridade(tipo, passageiroPreso),
  status: 'aberta',
  tecnicoId: null,
  criadaEm: Date.now(),
}
```
- depois de salvar, vai para a tela de detalhe com `navigate('/gestor/ocorrencia/' + nova.id)`, usando o `useNavigate()` do React Router.

---

## P4: Detalhe e despacho (`/gestor/ocorrencia/:id`)

### Sua função em `regras.js`
**`sugerirTecnico(elevador, tecnicos, ocorrencias)`**:
1. Monte a lista de técnicos livres com `tecnicoEstaLivre` (função da P1).
2. Procure nessa lista alguém do **mesmo estado** do elevador (`t.estado === elevador.estado`) (`.find()`). Se achar, devolva essa pessoa.
3. Se não achar, devolva o primeiro livre (`livres[0]`) e mostre o aviso "Técnico de fora do estado".
4. Se a lista estiver vazia, devolva `null`.

### O que a tela mostra
- Pegue o id da URL com `const { id } = useParams()` e encontre a ocorrência com `.find()`. Se não existir, mostre "Ocorrência não encontrada" e um link para o painel.
- Um card com: prédio, estado, tipo, descrição, severidade (badge), status, horário de abertura (`new Date(criadaEm).toLocaleString('pt-BR')`) e o selo ATRASADA.
- **Se o status for `aberta`**, um card **Despacho**:
  - "Técnico sugerido: **Nome** (estado)";
  - um `<select>` para trocar o técnico, só com os livres e com o sugerido já selecionado;
  - o botão **Despachar**, que muda o status para `despachada` e grava o `tecnicoId`, usando o mesmo padrão `.map()` da P1;
  - se não houver técnico livre: aviso "Nenhum técnico disponível" e botão desativado.
- **Se não for `aberta`**: mostre quem é o técnico responsável e, se estiver resolvida, a observação.

**Conferir:** a ocorrência com passageiro preso sugere o técnico livre do mesmo estado. Depois de despachar, ela aparece na tela do técnico.

---

## P5: Alertas (`/gestor/alertas`)

### Sua função em `regras.js`
**`gerarAlertas(elevadores, alertasTratados)`**: devolve uma lista de alertas.

Para cada elevador:
1. Conte quantos eventos de cada tipo têm `diasAtras <= 7`. Dica: um objeto contador, `contagem[evento.tipo] = (contagem[evento.tipo] || 0) + 1`.
2. Para cada tipo com **3 ou mais**, crie um alerta:
```js
{
  id: elevador.id + '-' + tipo,      // ex.: "E03-porta"
  elevadorId: elevador.id,
  tipo,
  quantidade,
  risco: quantidade >= 5 ? 'alto' : 'medio',
}
```
3. Antes de devolver, tire os alertas cujo `id` esteja em `alertasTratados` (`.filter()` com `.includes()`).

Teste no console com os dados de exemplo: deve sair pelo menos um alerta alto e um médio.

### O que a tela mostra
- Um card curto explicando a regra: "3 ou mais anomalias do mesmo tipo em 7 dias geram alerta; com 5 ou mais, o risco é alto". **Isso ajuda muito na banca.**
- Um card por alerta: badge **Risco ALTO** (vermelho) ou **MÉDIO** (amarelo), prédio, elevador e o texto *"5 anomalias de porta nos últimos 7 dias"*.
- O botão **Gerar manutenção preventiva**, que:
  1. cria uma ocorrência nova com `tipo: 'preventiva'`, `severidade: 'baixa'`, `status: 'aberta'` e a descrição "Manutenção preventiva: 5 anomalias de porta";
  2. coloca o `id` do alerta em `alertasTratados`;
  3. salva tudo com `salvarDados` e `setDados`.
- Se não houver alertas: "Nenhum elevador em risco no momento."

**Conferir:** depois de clicar, o alerta some e a preventiva aparece no painel. Ao apertar F5, o alerta continua sumido.

---

## Semana 4: entrega (todos)

- **Vídeo (P2 faz o roteiro, P5 grava e edita):** use quase os 3 minutos.
  - **~30 s:** o problema da Otis;
  - **~2 min:** o sistema funcionando, seguindo o fluxo da seção 2 da especificação;
  - **~30 s:** os ganhos e o encerramento.
  - Publique no YouTube como **público**.
- **PDF (P5):** nomes e RMs, nome do time, link do vídeo e link do deploy. **Em PDF, não em Word.**
- **ZIP:** o PDF e um zip do código **sem a pasta `node_modules`**.
- **Antes de entregar:** todos rodam o checklist da seção 8 da especificação **no link publicado**.
