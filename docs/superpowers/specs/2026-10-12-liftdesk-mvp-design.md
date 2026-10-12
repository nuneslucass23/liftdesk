# LiftDesk — Design do MVP (Sprint 2 · Challenge OTIS · FIAP)

**Data:** 12/10/2026 · **Grupo:** LiftDesk (5 integrantes) · **Entrega:** 10/11/2026 23h59 (meta interna: 09/11)

## 1. Objetivo

Construir um MVP web funcional do **LiftDesk**, plataforma de gestão de ocorrências de elevadores apresentada no pitch do 1º semestre, que permita à banca da OTIS e ao professor executar, pelo link publicado, o fluxo completo:

> ocorrência registrada → classificada e priorizada automaticamente → gestor despacha o técnico sugerido → técnico atende e resolve → painel atualiza → alerta preditivo vira manutenção preventiva.

### Critérios de sucesso
- O fluxo acima roda de ponta a ponta no deploy do GitHub Pages, sem erros, inclusive após recarregar a página (F5).
- Interface intuitiva e responsiva (critério de 5 + 4,5 pontos de usabilidade).
- O vídeo de até 3 minutos consegue demonstrar todo o fluxo.

### Requisitos da entrega (FIAP)
- MVP funcional (15 pts), deploy (5 pts), vídeo pitch ≤ 3 min com demonstração (5 pts).
- Um `.zip` contendo: PDF (integrantes, nome do time, link do vídeo, link do deploy) + `.zip` com o código.
- Tecnologias do curso até a Fase 7; para o MVP outras tecnologias são permitidas.

## 2. Escopo

### Dentro
- Dois perfis, sem senha: **Gestor** (central de operações) e **Técnico de campo**.
- 5 telas + entrada "Entrar como" (seção 4).
- Classificação, prioridade, prazo (SLA), sugestão de técnico e alertas preditivos por **regras** (seção 6).
- Dados iniciais em JSON, persistência em `localStorage`, botão **Reiniciar demonstração**.

### Fora (não fazer)
- Backend, banco de dados, autenticação real, notificações push, mapa, IA/ML real, perfil de cliente/síndico, multi-idioma.

## 3. Stack

| Item | Escolha | Observação |
|---|---|---|
| Base | React + Vite | Ensinado (F5 cap 6, F6 cap 4) |
| Rotas | React Router DOM com **`createHashRouter`** | O curso ensina `createBrowserRouter`; no GitHub Pages ele quebra no F5 |
| Visual | Bootstrap 5 | Ensinado (F3, F4, F5) |
| Estado | `useState` + `useEffect` + Context | Context é o único item além do básico |
| Persistência | `localStorage` | JavaScript puro |
| Testes | Vitest (só regras) | Ferramenta de desenvolvimento |
| Deploy | GitHub Pages via pacote `gh-pages` | `npm run deploy` |

## 4. Telas

Cabeçalho comum: nome LiftDesk, perfil atual, "Trocar perfil", "Reiniciar demonstração" e menu de navegação do perfil.

| # | Rota | Perfil | Conteúdo |
|---|---|---|---|
| 0 | `/` | todos | **Entrar como**: botão Gestor + lista de técnicos |
| 1 | `/gestor` | Gestor | **Painel**: cards (abertas, críticas, em atendimento, resolvidas hoje); lista de ocorrências ordenada por prioridade com filtros por status e severidade; resumo dos alertas preditivos |
| 2 | `/gestor/nova` | Gestor | **Nova ocorrência**: formulário (elevador, tipo, descrição, passageiro preso?) com validação; mostra a severidade calculada em tempo real |
| 3 | `/gestor/ocorrencia/:id` | Gestor | **Detalhe e despacho**: dados, técnico sugerido + prazo calculado, troca manual de técnico, botão **Confirmar despacho**, histórico |
| 4 | `/gestor/alertas` | Gestor | **Alertas preditivos**: elevadores em risco com nível, motivo e botão **Gerar manutenção preventiva** |
| 5 | `/tecnico` | Técnico | **Minhas tarefas**: ocorrências atribuídas; botões Aceitar → A caminho → Resolvido (resolver exige observação) |
| — | `*` | todos | **Não encontrado** com link de volta |

O técnico é redirecionado se tentar abrir rotas `/gestor/*` e vice-versa.

## 5. Arquitetura e dados

```
src/
  main.jsx               rotas (createHashRouter) + DadosProvider
  App.jsx                layout: cabeçalho + <Outlet/>
  contexto/DadosContext.jsx
  dados/elevadores.json  dados/tecnicos.json  dados/ocorrencias.json
  regras/classificar.js  regras/prazo.js  regras/sugerirTecnico.js  regras/preditivo.js
  regras/*.test.js
  paginas/Entrar.jsx  Painel.jsx  NovaOcorrencia.jsx  DetalheOcorrencia.jsx  Alertas.jsx  MinhasTarefas.jsx  NaoEncontrado.jsx
  componentes/           peças reutilizáveis (Cabecalho, SeloSeveridade, CartaoIndicador...)
```

### DadosContext (fonte única dos dados)
- Estado: `elevadores`, `tecnicos`, `ocorrencias`, `alertasTratados`, `perfil`.
- Ao iniciar: lê o `localStorage` (chave `liftdesk-dados`); se não houver ou estiver inválido, carrega os JSON iniciais.
- A cada mudança, grava no `localStorage` (`useEffect`).
- Ações expostas: `entrar(perfil)`, `sair()`, `criarOcorrencia(dados)`, `despachar(id, tecnicoId)`, `atualizarStatus(id, novoStatus, observacao?)`, `gerarPreventiva(alerta)`, `reiniciarDemo()`.
- **Telas nunca alteram dados diretamente**: sempre chamam uma ação. Regras nunca são reimplementadas nas telas: sempre importadas de `regras/`.

### Modelos
- **Elevador**: `id`, `predio`, `endereco`, `regiao` (Norte, Sul, Leste, Oeste, Centro), `modelo`, `anoInstalacao`, `eventos[]` com `{ tipo: porta | vibracao | nivelamento | energia | ruido, diasAtras }`.
- **Técnico**: `id`, `nome`, `regiao`, `especialidades[]` (mesmos tipos dos eventos + `resgate`).
- **Ocorrência**: `id`, `elevadorId`, `tipo` (passageiro_preso, falha_tecnica, falta_energia, ruido_anormal, solicitacao_cliente, preventiva), `descricao`, `passageiroPreso`, `severidade`, `status`, `tecnicoId`, `criadaEm`, `prazoLimite`, `historico[]` com `{ status, quando, por }`, `observacao`, `origem` (manual | alerta).
- **Status**: `aberta → despachada → aceita → a_caminho → resolvida` (sem pular etapas).
- **Técnico ocupado** = tem ocorrência com status `despachada`, `aceita` ou `a_caminho`.
- **Dados iniciais**: cerca de 12 elevadores em 6 prédios, 5 técnicos (1 ou 2 por região), cerca de 10 ocorrências em status variados, com pelo menos 2 elevadores que já disparam alertas. Datas sempre relativas ao dia atual (`diasAtras`, minutos atrás) para a demo nunca envelhecer.

## 6. Regras de negócio (funções puras)

### 6.1 `classificar(ocorrencia) → severidade` (P3)
| Condição (avaliada nesta ordem) | Severidade |
|---|---|
| `passageiroPreso === true` | critica |
| tipo `falta_energia` ou `falha_tecnica` | alta |
| tipo `ruido_anormal` | media |
| tipo `solicitacao_cliente` ou `preventiva` | baixa |

**Ordenação da lista**: severidade (crítica > alta > média > baixa), depois `criadaEm` mais antiga primeiro. Resolvidas vão para o fim.

### 6.2 `calcularPrazo(severidade, criadaEm) → prazoLimite` e `situacaoPrazo(ocorrencia, agora)` (P4)
- Crítica 30 min · Alta 2 h · Média 8 h · Baixa 48 h.
- `situacaoPrazo` devolve `{ restanteMin, atrasada }`; a tela mostra o tempo restante ou o selo **ATRASADA**.

### 6.3 `sugerirTecnico(ocorrencia, elevador, tecnicos, ocorrencias) → { tecnico, aviso }` (P4)
1. Candidatos = técnicos livres.
2. Preferir mesma região do elevador **e** especialidade compatível (passageiro preso → `resgate`; falta de energia → `energia`; demais → qualquer).
3. Empate: menos ocorrências resolvidas hoje (equilíbrio de carga); depois ordem alfabética.
4. Se ninguém da região: melhor técnico livre de outra região + aviso "fora da região".
5. Se ninguém livre: `{ tecnico: null, aviso: "Nenhum técnico disponível" }` e o despacho fica bloqueado.

### 6.4 `gerarAlertas(elevadores, alertasTratados) → alertas[]` (P5)
- Janela: eventos com `diasAtras <= 7`.
- Por elevador e por tipo de evento: 3–4 ocorrências → risco **médio**; 5 ou mais → risco **alto**.
- Se o elevador tiver risco médio ou alto em **2 tipos diferentes**, o risco final é **alto**.
- Cada alerta: `{ id, elevadorId, tipo, quantidade, risco, motivo }`, com motivo legível, por exemplo "5 anomalias de porta nos últimos 7 dias".
- Alertas cujo `id` está em `alertasTratados` não aparecem.
- `gerarPreventiva` cria ocorrência `preventiva` (baixa, origem `alerta`) e adiciona o id em `alertasTratados`.

## 7. Tratamento de erros
- `localStorage` ausente ou JSON inválido → recarrega os dados iniciais (sem tela quebrada).
- Formulário: validação Bootstrap; descrição com no mínimo 10 caracteres; botão desativado enquanto inválido.
- Sem técnico disponível → aviso + despacho bloqueado.
- Transição de status inválida → ação ignora e não altera dados.
- Rota inexistente → página Não encontrado. Perfil errado → redireciona.

## 8. Testes
- **Automatizados (Vitest)**: cada arquivo de `regras/` tem de 3 a 5 casos, incluindo os limites (3 vs 2 eventos; 5 vs 4; ninguém livre; fora da região; prazo estourado).
- **Checklist manual da demo** (rodar no link publicado antes de cada entrega):
  1. Entrar como Gestor → painel com dados.
  2. Nova ocorrência com passageiro preso → aparece como crítica no topo.
  3. Abrir e despachar o técnico sugerido.
  4. Trocar para o técnico → Aceitar → A caminho → Resolvido com observação.
  5. Voltar ao gestor → painel atualizado.
  6. Alertas → Gerar preventiva → some do painel de alertas e vira ocorrência.
  7. F5 em qualquer tela → nada se perde e nada quebra.
  8. Reiniciar demonstração → volta ao estado inicial.
  9. Celular (largura de 375px) → layout utilizável.

## 9. Deploy
- Repositório no GitHub, nome `liftdesk`; `vite.config.js` com `base: '/liftdesk/'`.
- Scripts: `"predeploy": "npm run build"`, `"deploy": "gh-pages -d dist"`.
- Primeiro deploy na semana 1, com a base vazia; publicar novamente a cada merge relevante na `main`.

## 10. Divisão e fluxo de trabalho

| Pessoa | Responsabilidade |
|---|---|
| P1 | Projeto Vite, rotas, layout/cabeçalho, DadosContext, JSON iniciais, tela Entrar, reiniciar demo, deploy; depois **Minhas tarefas** (técnico); revisa PRs |
| P2 | Painel do gestor |
| P3 | Nova ocorrência + `classificar.js` |
| P4 | Detalhe e despacho + `prazo.js` + `sugerirTecnico.js` |
| P5 | Alertas + `preditivo.js` |

- Uma branch por tela ou regra (`feat/painel`, `feat/regra-prazo`...), pull request para a `main` e revisão da P1.
- Mudanças no `DadosContext` ou nos JSON precisam ser combinadas com o grupo antes.

## 11. Cronograma

| Semana | Meta |
|---|---|
| 1 · 12–18/10 | P1: base + Context + rotas + **deploy no ar**. P3, P4, P5: regras + testes. P2: layout do painel com dados fixos. Grupo: backlog MoSCoW. |
| 2 · 19–25/10 | Telas ligadas ao Context; **fluxo do gestor de ponta a ponta**. |
| 3 · 26/10–01/11 | Tela do técnico, alertas, acabamento visual e responsivo. **Congelar funcionalidades em 01/11.** |
| 4 · 02–09/11 | Correções; roteiro e gravação do vídeo (perto de 3 min, com demo); PDF; ZIP. **Entregar em 09/11.** |

## 12. Riscos
- **Integrantes com pouco React**: as regras são JS puro (dá para começar sem React); a P1 entrega a base e os exemplos cedo.
- **Conflitos de Git**: Context centralizado, uma tela por pessoa e PRs pequenos.
- **Deploy quebrado na véspera**: deploy desde a semana 1 + checklist da seção 8.
