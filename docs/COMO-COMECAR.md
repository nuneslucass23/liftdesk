# LiftDesk: como começar a sua parte

> Atualizado em **18/10/2026**. Leia **tudo** antes de começar. É longo de propósito: está explicado passo a passo, para quem nunca fez isso antes.

---

## 1. O que já está pronto

O Lucas deixou a "base" do projeto pronta e no GitHub. Você **não precisa criar nada disso**:

| O que é | Onde fica | Para que serve |
|---|---|---|
| Projeto React (Vite + Bootstrap + React Router) | a pasta inteira | o site já roda |
| Dados de exemplo | `src/dados/` (3 arquivos `.json`) | 10 técnicos, 10 elevadores e 10 ocorrências |
| Funções de dados | `src/dados.js` | ler, salvar e reiniciar os dados |
| Regras de negócio | `src/regras.js` | as funções que **cada um** vai preencher |
| As 6 telas, ainda vazias | `src/paginas/` | **cada um** vai construir a sua |
| As rotas (endereços do site) | `src/main.jsx` | cada endereço abre uma tela |

Duas regras do `regras.js` **já estão prontas** e você pode usar: `tecnicoEstaLivre` e `sugerirTecnico`.

---

## 2. Quem faz o quê

| Quem | Tela (arquivo) | Endereço | Funções do `regras.js` |
|---|---|---|---|
| **Pietro** | `src/paginas/Painel.jsx` | `#/gestor` | `estaAtrasada`, `ordenarPorGravidade` |
| **Erick** | `src/paginas/NovaOcorrencia.jsx` e `src/paginas/DetalheOcorrencia.jsx` | `#/gestor/nova` e `#/gestor/ocorrencia/OC-001` | `calcularSeveridade`, `prazoEmMinutos` |
| **João Victor** | `src/paginas/Alertas.jsx` | `#/gestor/alertas` | `gerarAlertas` |
| **Lucas** | `Inicio.jsx`, `MinhasTarefas.jsx`, o cabeçalho e o deploy | `#/` e `#/tecnico` | `tecnicoEstaLivre` ✅, `sugerirTecnico` ✅ |

**Regra de ouro:** mexa **só nos seus arquivos** e, no `regras.js`, **só nas suas funções**. **Não mude o nome** de nenhuma função, nem os parâmetros (o que vai entre parênteses). Todo mundo depende desses nomes.

---

## 3. Preparar o seu computador (só na primeira vez)

### 3.1 O que precisa estar instalado
1. **Node.js**: baixe a versão **LTS** em https://nodejs.org e instale.
2. **Git**: no Mac já vem instalado. No Windows, baixe em https://git-scm.com.
3. **VS Code**: https://code.visualstudio.com

Para conferir se o Node e o Git estão instalados, abra o **Terminal** (no Mac) ou o **Prompt de Comando** (no Windows) e rode:
```bash
node -v
```
Deve aparecer um número como `v22.x.x`.
```bash
git -v
```
Deve aparecer algo como `git version 2.x`.

### 3.2 Ter acesso ao repositório
Mande ao Lucas o **seu usuário do GitHub**. Ele vai te adicionar como colaborador. Você recebe um **e-mail de convite**: **aceite** antes de continuar. Sem isso, você baixa o projeto, mas não consegue enviar nada.

### 3.3 Baixar o projeto
No terminal, entre na pasta onde você guarda os trabalhos da FIAP. Por exemplo:
```bash
cd Documents
```
- `cd` quer dizer "entrar na pasta".

Baixe o projeto:
```bash
git clone https://github.com/nuneslucass23/liftdesk.git
```
- `git clone` faz uma cópia do projeto do GitHub para o seu computador. Ele cria uma pasta chamada `liftdesk`.

Entre na pasta do projeto:
```bash
cd liftdesk
```

Instale as bibliotecas:
```bash
npm install
```
- Baixa tudo o que o projeto usa (React, Bootstrap...) para dentro da pasta `node_modules`. Demora de 30 segundos a 1 minuto.
- Avisos amarelos (`warn`) são normais. Só é problema se aparecer `ERR!` em vermelho.

### 3.4 Abrir o projeto no VS Code
No VS Code: **File → Open Folder** e escolha a pasta `liftdesk`.

**Ligue o salvamento automático:** **File → Auto Save** (deixe marcado). Assim você nunca esquece de salvar. Arquivo não salvo é o erro mais comum.

### 3.5 Rodar o site
No terminal, dentro da pasta `liftdesk`:
```bash
npm run dev
```
- Liga o site no seu computador. Vai aparecer `Local: http://localhost:5173/`.
- Abra no navegador, por exemplo: **http://localhost:5173/#/gestor**
- Deve aparecer uma faixa preta escrito **LiftDesk** e o título **Painel**. Se apareceu, está tudo certo!
- O terminal fica "ocupado" enquanto o site roda. Para os outros comandos, abra **outra aba** do terminal (no Mac: **Cmd + T**).
- Para desligar o site: **Ctrl + C** no terminal onde ele está rodando.
- Toda vez que você salvar um arquivo, a página atualiza sozinha.

---

## 4. Como o projeto está organizado

```
liftdesk/
├── src/
│   ├── main.jsx            ← as rotas (não mexa)
│   ├── App.jsx             ← o "molde": cabeçalho + espaço onde a tela aparece (não mexa)
│   ├── dados.js            ← lerDados, salvarDados, reiniciarDados (não mexa)
│   ├── regras.js           ← as regras: cada um preenche as suas funções
│   ├── dados/
│   │   ├── tecnicos.json
│   │   ├── elevadores.json
│   │   └── ocorrencias.json
│   └── paginas/            ← as telas: cada um mexe na sua
│       ├── Inicio.jsx
│       ├── Painel.jsx
│       ├── NovaOcorrencia.jsx
│       ├── DetalheOcorrencia.jsx
│       ├── Alertas.jsx
│       └── MinhasTarefas.jsx
└── docs/                   ← documentação e planos
```

### 4.1 Como são os dados
**Técnico** (`tecnicos.json`):
```json
{ "id": "T1", "nome": "João Silva", "estado": "RJ" }
```
São 10 técnicos, **um por estado**: RJ, SP, ES, AM, BA, GO, DF, RN, RS e SC.

**Elevador** (`elevadores.json`):
```json
{
  "id": "E2",
  "predio": "Edifício Paulista",
  "estado": "SP",
  "eventos": [ { "tipo": "porta", "diasAtras": 1 } ]
}
```
- `eventos` é o histórico de anomalias. Os tipos são `porta`, `vibracao`, `nivelamento`, `energia` e `ruido`.
- `diasAtras` diz há quantos dias o evento aconteceu.

**Ocorrência** (`ocorrencias.json`):
```json
{
  "id": "OC-001",
  "elevadorId": "E1",
  "tipo": "passageiro_preso",
  "descricao": "Passageiro preso no elevador do Edifício Copacabana.",
  "passageiroPreso": true,
  "severidade": "critica",
  "status": "aberta",
  "tecnicoId": null,
  "minutosAtras": 5,
  "observacao": ""
}
```
- **`tipo`**: `passageiro_preso`, `falha_tecnica`, `falta_energia`, `ruido`, `pedido_cliente` ou `preventiva`.
- **`severidade`**: `critica`, `alta`, `media` ou `baixa`. É **sem acento**, porque é código.
- **`status`**: segue sempre esta ordem: `aberta` → `despachada` → `a_caminho` → `resolvida`.
- **`tecnicoId`**: `null` quando ainda ninguém foi mandado.
- **`criadaEm`**: quando o site carrega os dados, cada ocorrência ganha esse campo, com o horário de abertura em milissegundos. **Use o `criadaEm`**, e não o `minutosAtras`, nas suas telas e regras.

### 4.2 Como uma tela pega e salva dados
**Toda tela segue o mesmo padrão:**
```jsx
import { useState } from 'react'
import { lerDados, salvarDados } from '../dados.js'

function Painel() {
  const [dados, setDados] = useState(lerDados())
  // dados.ocorrencias, dados.elevadores, dados.tecnicos, dados.alertasTratados

  function mudarAlgo() {
    const novosDados = { ...dados, ocorrencias: /* lista nova */ }
    salvarDados(novosDados)   // guarda no navegador (sobrevive ao F5)
    setDados(novosDados)      // atualiza a tela
  }

  return <h1>Painel</h1>
}

export default Painel
```

**Para mudar uma ocorrência**, crie uma lista nova com `.map()`. Nunca altere a lista original:
```js
const ocorrencias = dados.ocorrencias.map((o) =>
  o.id === id ? { ...o, status: 'despachada' } : o
)
```

**Para usar uma regra** na sua tela:
```js
import { sugerirTecnico, tecnicoEstaLivre } from '../regras.js'
```

---

## 5. As regras (`src/regras.js`)

| Função | Quem | O que recebe | O que devolve |
|---|---|---|---|
| `calcularSeveridade(tipo, passageiroPreso)` | Erick | o tipo e `true`/`false` | `'critica'`, `'alta'`, `'media'` ou `'baixa'` |
| `prazoEmMinutos(severidade)` | Erick | a severidade | `30`, `120`, `480` ou `2880` |
| `estaAtrasada(ocorrencia)` | Pietro | uma ocorrência | `true` se passou do prazo e não está resolvida |
| `ordenarPorGravidade(ocorrencias)` | Pietro | a lista de ocorrências | uma **lista nova**: críticas primeiro e resolvidas no fim |
| `tecnicoEstaLivre(tecnicoId, ocorrencias)` | Lucas ✅ | o id do técnico e a lista | `true` se ele não tem nada `despachada` ou `a_caminho` |
| `sugerirTecnico(elevador, tecnicos, ocorrencias)` | Lucas ✅ | o elevador e as duas listas | **um técnico** (objeto) ou `null` |
| `gerarAlertas(elevadores, alertasTratados)` | João Victor | os elevadores e os ids já tratados | a lista de alertas |

**A severidade, em detalhe:**
- passageiro preso → `critica`;
- falta de energia ou falha técnica → `alta`;
- ruído → `media`;
- o resto → `baixa`.

**Testando uma regra sem tela:** escreva a função, depois coloque temporariamente na sua tela:
```js
console.log(calcularSeveridade('ruido', true))  // deve mostrar 'critica'
```
Abra o navegador, aperte **F12** e vá na aba **Console** para ver o resultado. **Apague o `console.log` depois.**

---

## 6. O passo a passo de cada um

### 6.1 Pietro: Painel (`#/gestor`)
**Primeiro, as regras:**
1. **`estaAtrasada(o)`**: devolve `true` se `o.status !== 'resolvida'` **e** `Date.now() > o.criadaEm + prazoEmMinutos(o.severidade) * 60000`. Enquanto a `prazoEmMinutos` do Erick estiver vazia, teste trocando por `30`.
2. **`ordenarPorGravidade(lista)`**: crie um peso para cada severidade (`{ critica: 4, alta: 3, media: 2, baixa: 1 }`). Use `[...lista].sort(...)`: os `[...]` fazem uma cópia, para não mexer na lista original. As resolvidas vão para o fim.

**Depois, a tela:**
1. **4 cards** no topo, com `row` e `col` do Bootstrap: Abertas, Críticas, Em atendimento (`despachada` + `a_caminho`) e Resolvidas. Para contar, use `dados.ocorrencias.filter(...).length`.
2. Se `gerarAlertas(dados.elevadores, dados.alertasTratados).length > 0`, mostre uma faixa amarela (`alert alert-warning`) com um link para `#/gestor/alertas`.
3. Um botão **+ Nova ocorrência**, que leva para `/gestor/nova`. Use `<Link to="/gestor/nova">` do `react-router-dom`.
4. Uma **tabela** (`table table-hover` dentro de `<div className="table-responsive">`), usando `ordenarPorGravidade(...)` e `.map()`. As colunas:
   - ID;
   - severidade, num badge colorido;
   - tipo;
   - prédio: use `dados.elevadores.find(...)` pelo `elevadorId`;
   - status;
   - técnico;
   - o selo **ATRASADA**.

   Cada linha tem um link para `/gestor/ocorrencia/` + o id.
5. Um `<select>` para filtrar entre "Não resolvidas" (o padrão) e "Todas".

**Cores dos badges:** crítica `text-bg-danger`, alta `text-bg-warning`, média `text-bg-info`, baixa `text-bg-success`.

**Também é seu:** o roteiro do vídeo, o backlog com MoSCoW e os diagramas de classes e de sequência no Astah (veja o arquivo de melhorias).

### 6.2 Erick: Nova ocorrência (`#/gestor/nova`)
**Primeiro, as regras:**
1. **`calcularSeveridade(tipo, passageiroPreso)`**: só `if`s, na ordem da tabela da seção 5. Se `passageiroPreso` for `true`, é `'critica'` **sempre**.
2. **`prazoEmMinutos(severidade)`**: crítica 30, alta 120, média 480 e baixa 2880.

**Depois, a tela.** Um formulário do Bootstrap com:
- **Elevador:** um `<select>` com `dados.elevadores.map(...)`;
- **Tipo:** um `<select>` com os 5 tipos, sem "preventiva";
- **Há passageiro preso?:** um checkbox;
- **Descrição:** um `<textarea>`.

Guarde cada campo num `useState`. Enquanto o usuário preenche, mostre: *"Classificação automática: Crítica · prazo de 30 min"*.

O botão **Registrar** fica `disabled` se faltar algum campo ou se a descrição tiver menos de 10 letras. Ao clicar:
```js
const nova = {
  id: 'OC-' + Date.now(),
  elevadorId, tipo, descricao, passageiroPreso,
  severidade: calcularSeveridade(tipo, passageiroPreso),
  status: 'aberta',
  tecnicoId: null,
  criadaEm: Date.now(),
  observacao: '',
}
```
Salve com `salvarDados` e `setDados` (adicionando a nova em `dados.ocorrencias`) e vá para o detalhe:
```js
navigate('/gestor/ocorrencia/' + nova.id)
```
- O `navigate` vem de `const navigate = useNavigate()`, do `react-router-dom`.

### 6.3 Erick: Detalhe e despacho (`#/gestor/ocorrencia/OC-001`)
1. Pegue o id do endereço com `const { id } = useParams()`, do `react-router-dom`.
2. Ache a ocorrência: `dados.ocorrencias.find((o) => o.id === id)`. Se não achar, mostre "Ocorrência não encontrada" e um link para o painel.
3. Ache o elevador da ocorrência com `dados.elevadores.find(...)`.
4. Mostre num card:
   - prédio e estado;
   - tipo e descrição;
   - severidade, num badge;
   - status;
   - horário de abertura: `new Date(o.criadaEm).toLocaleString('pt-BR')`.
5. **Se o status for `aberta`:**
   - Calcule o técnico sugerido: `const sugerido = sugerirTecnico(elevador, dados.tecnicos, dados.ocorrencias)`.
   - Mostre "Técnico sugerido: **Nome** (estado)".
   - Se `sugerido.estado !== elevador.estado`, mostre o aviso **"Técnico de fora do estado"**.
   - Um `<select>` para trocar o técnico, só com os livres: `dados.tecnicos.filter((t) => tecnicoEstaLivre(t.id, dados.ocorrencias))`.
   - O botão **Despachar** muda o status para `despachada` e grava o `tecnicoId`, com o padrão do `.map()` da seção 4.2.
   - Se `sugerido === null`, mostre "Nenhum técnico disponível" e deixe o botão desativado.
6. **Se não for `aberta`:** mostre o técnico responsável e, se estiver resolvida, a observação.

**Para testar:**
- **OC-001** (RJ) deve sugerir o João Silva (RJ).
- **OC-002** (ES) deve mostrar o aviso "fora do estado", porque o técnico do ES está ocupado.

### 6.4 João Victor: Alertas preditivos (`#/gestor/alertas`)
**Primeiro, a regra `gerarAlertas(elevadores, alertasTratados)`.** Para cada elevador:
1. Conte quantos eventos de **cada tipo** têm `diasAtras <= 7`:
   ```js
   const contagem = {}
   // para cada evento com diasAtras <= 7:
   contagem[evento.tipo] = (contagem[evento.tipo] || 0) + 1
   ```
2. Para cada tipo com **3 ou mais**, crie:
   ```js
   {
     id: elevador.id + '-' + tipo,   // ex.: "E2-porta"
     elevadorId: elevador.id,
     tipo,
     quantidade,
     risco: quantidade >= 5 ? 'alto' : 'medio',
   }
   ```
3. No fim, tire os que já estão em `alertasTratados`, com `.filter()` e `.includes()`.

**Resultado esperado com os dados de exemplo:** exatamente **2 alertas**:
- **E2** (porta, 5) → **alto**;
- **E5** (vibração, 3) → **médio**.

O **E8** tem 3 eventos de ruído, mas com mais de 7 dias, então **não** pode dar alerta.

**Depois, a tela:**
- Um card curto explicando a regra: "3 ou mais anomalias do mesmo tipo em 7 dias geram alerta; 5 ou mais é risco alto".
- Um card por alerta, com:
  - o badge **Risco ALTO** (vermelho) ou **MÉDIO** (amarelo);
  - o prédio;
  - o texto "5 anomalias de porta nos últimos 7 dias".
- O botão **Gerar manutenção preventiva**, que:
  1. cria uma ocorrência com `tipo: 'preventiva'`, `severidade: 'baixa'`, `status: 'aberta'` e `tecnicoId: null`;
  2. coloca o `id` do alerta em `alertasTratados`;
  3. salva com `salvarDados` e `setDados`.
- Se não houver alertas: "Nenhum elevador em risco no momento."

**Também é seu:** gravar e editar o vídeo, montar o PDF da entrega e a tela "Cadastrar elevador" com ViaCEP (veja o arquivo de melhorias).

---

## 7. Como enviar o seu trabalho (Git)

### 7.1 Antes de começar: crie a sua branch
Uma **branch** é uma "cópia paralela" do projeto, só sua. Você trabalha nela sem atrapalhar ninguém.
```bash
git checkout -b painel
```
- `checkout -b` cria uma branch nova e já entra nela.
- Use o nome da sua tela: `painel`, `nova-ocorrencia`, `detalhe` ou `alertas`.

### 7.2 Sempre que terminar um pedaço que funciona
Veja o que mudou:
```bash
git status
```
Prepare tudo para o commit:
```bash
git add .
```
Crie o commit (uma "foto" do projeto) com uma mensagem:
```bash
git commit -m "feat: cards do painel"
```
- Use `feat:` para coisa nova e `fix:` para correção.

Envie para o GitHub:
```bash
git push
```
Na **primeira vez** que você enviar uma branch nova, o Git vai reclamar e sugerir um comando. Use este:
```bash
git push -u origin painel
```
(troque `painel` pelo nome da sua branch). Depois disso, basta `git push`.

### 7.3 Quando a sua tela estiver pronta: Pull Request
1. Antes, traga as novidades dos colegas e veja se nada quebrou:
   ```bash
   git pull origin main
   ```
2. Abra **github.com/nuneslucass23/liftdesk**. Vai aparecer um botão amarelo **"Compare & pull request"**. Clique nele.
3. No título, escreva o que você fez (ex.: "Tela do Painel"). Clique em **Create pull request**.
4. O Lucas revisa e junta na `main`.

---

## 8. Erros comuns (e como resolver)

| O que acontece | Causa provável | Como resolver |
|---|---|---|
| A tela não muda depois de editar | arquivo não salvo (bolinha branca na aba do VS Code) | **Cmd + S** (ou ligue o Auto Save) |
| `Failed to resolve import "..."` | caminho do import digitado errado | confira letra por letra. De uma tela para o `regras.js`, o caminho é `'../regras.js'` (com `..`, porque a tela está dentro de `paginas/`) |
| Tela em branco, sem erro | componente com nome em minúscula | o nome da função da tela começa com **maiúscula**: `function Painel()` |
| `Maximum call stack size exceeded` | a função chama ela mesma | dentro de uma função, não chame a própria função |
| Algo sublinhado em vermelho no `.json` | vírgula sobrando ou faltando, ou aspas simples | em JSON, só **aspas duplas** e **nenhuma vírgula depois do último item** |
| `'tipo' is defined but never used` | a função ainda está vazia | é normal; some quando você usar o parâmetro |
| Os dados ficaram bagunçados nos testes | os dados ficam salvos no navegador | no navegador: **F12 → Application → Local Storage → apague a chave `liftdesk`** e recarregue |
| O `git push` foi recusado | você ainda não aceitou o convite do repositório | aceite o e-mail de convite do GitHub |

---

## 9. Prazos

| Até | O quê |
|---|---|
| **25/10** | cada tela funcionando no seu computador, com os botões funcionando |
| **01/11** | Pull Request aberto e site publicado. **Nada de funcionalidade nova depois disso** |
| **09/11** | vídeo, PDF e ZIP prontos. **Entrega** |

---

## 10. Contexto do projeto (para quem for pedir ajuda ou pesquisar)

- **O que é:** LiftDesk, um sistema de gestão de ocorrências de elevadores para o Challenge OTIS, da FIAP (Engenharia de Software, 1º ano, Sprint 2).
- **Tecnologias:** React com Vite, React Router (`createHashRouter`), Bootstrap 5, dados em arquivos JSON e `localStorage`. **Sem backend e sem banco de dados.**
- **Nível:** somos alunos de 1º ano. A solução deve usar o que o curso ensinou: componentes, `useState`, props, `.map()`, `.filter()`, `.find()`, `if/else`, `Link`, `useParams`, `useNavigate` e classes do Bootstrap. **Nada de bibliotecas novas** além das que já estão no projeto, a não ser as combinadas no plano de melhorias (react-hook-form e yup).
- **O que não pode mudar:**
  - os nomes e parâmetros das funções do `regras.js`;
  - os campos dos JSON;
  - o padrão `useState(lerDados())` / `salvarDados()` / `setDados()`.
- **Documentos completos:**
  - `docs/superpowers/specs/2026-10-12-liftdesk-mvp-design.md`: o que vamos construir;
  - `docs/superpowers/plans/2026-10-12-liftdesk-mvp.md`: o plano e o guia de cada tela;
  - `docs/superpowers/plans/2026-10-17-liftdesk-fase7-melhorias.md`: as melhorias com o conteúdo da Fase 7.
