# LiftDesk: o que vamos construir (Sprint 2, Challenge OTIS)

**Entrega:** 10/11/2026 às 23h59. A meta do grupo é **09/11**.

## 1. A ideia em uma frase

Um site em que o **gestor** registra problemas em elevadores, o sistema diz **o quanto é grave** e **qual técnico mandar**, o **técnico** marca o atendimento e o sistema **avisa antes** dos elevadores que estão dando sinais de falha.

## 2. O fluxo que precisa funcionar (é o que vai no vídeo)

1. O gestor registra uma ocorrência, por exemplo "passageiro preso".
2. O sistema classifica como **crítica**, que vai para o topo da lista.
3. O gestor abre a ocorrência, vê o **técnico sugerido** e clica em **Despachar**.
4. O técnico abre a tela dele, clica em **A caminho** e depois em **Resolvido**.
5. O painel do gestor mostra a ocorrência como resolvida.
6. Na tela de **Alertas**, o gestor vê um elevador em risco e clica em **Gerar manutenção preventiva**.

## 3. O que fica de fora
Login com senha, servidor, banco de dados, mapa, inteligência artificial de verdade e perfil de cliente.

## 4. Tecnologias (todas vistas no curso)
- **React com Vite**: componentes, `useState`, props e `.map()`.
- **React Router**: `createHashRouter`. O curso ensinou `createBrowserRouter`, que funciona do mesmo jeito, mas quebra no GitHub Pages quando alguém aperta F5.
- **Bootstrap 5**: cards, tabelas, formulários, badges e alertas.
- **JSON** para os dados iniciais e **`localStorage`** para guardar as mudanças.
- **GitHub Pages** para publicar.

## 5. Telas

| Tela | Endereço | Quem usa |
|---|---|---|
| Início | `/` | Todos. Dois botões: **Sou gestor** e **Sou técnico** |
| Painel | `/gestor` | Gestor |
| Nova ocorrência | `/gestor/nova` | Gestor |
| Detalhe e despacho | `/gestor/ocorrencia/:id` | Gestor |
| Alertas | `/gestor/alertas` | Gestor |
| Minhas tarefas | `/tecnico` | Técnico (escolhe o nome numa lista) |

O cabeçalho, que aparece em todas as telas, tem: o nome LiftDesk, links para as telas e o botão **Reiniciar demonstração**.

## 6. Dados

**elevadores.json**: `id`, `predio`, `estado` (sigla da UF), `eventos`. Cada evento tem `tipo` e `diasAtras`.
```json
{ "id": "E03", "predio": "Torre Vila Olímpia", "estado": "SP",
  "eventos": [ { "tipo": "porta", "diasAtras": 1 }, { "tipo": "porta", "diasAtras": 3 } ] }
```

**tecnicos.json**: `id`, `nome`, `estado`. A demonstração usa 10 estados (RJ, SP, ES, AM, BA, GO, DF, RN, RS, SC), com um técnico em cada; elevadores só nesses estados.

**ocorrencias.json**: `id`, `elevadorId`, `tipo`, `descricao`, `passageiroPreso`, `severidade`, `status`, `tecnicoId`, `minutosAtras`.

- **Tipos de ocorrência:** `passageiro_preso`, `falha_tecnica`, `falta_energia`, `ruido`, `pedido_cliente`, `preventiva`.
- **Status:** `aberta` → `despachada` → `a_caminho` → `resolvida`.
- Quando os dados são carregados, `minutosAtras` vira `criadaEm` (horário em milissegundos). Assim a demonstração sempre parece recente.

Tudo fica num objeto só, guardado no `localStorage`:
```js
{ elevadores: [...], tecnicos: [...], ocorrencias: [...], alertasTratados: [] }
```

## 7. Regras (todas no arquivo `src/regras.js`)

| Regra | Como funciona |
|---|---|
| **Severidade** | passageiro preso → `critica`; falta de energia ou falha técnica → `alta`; ruído → `media`; o resto → `baixa` |
| **Prazo** | crítica 30 min, alta 120 min, média 480 min, baixa 2880 min. Se o prazo passou e não está resolvida, a ocorrência está **ATRASADA** |
| **Técnico livre** | é o técnico que não tem nenhuma ocorrência `despachada` ou `a_caminho` |
| **Técnico sugerido** | o técnico livre do **mesmo estado** do elevador. Se não tiver, o primeiro livre de qualquer estado, com o aviso "fora do estado". Se ninguém estiver livre, não há sugestão |
| **Alerta preditivo** | contar os eventos de cada tipo nos últimos 7 dias. Com **3 ou mais**, gera alerta; com **5 ou mais**, o risco é **alto**, senão é **médio**. Alertas que já viraram preventiva não aparecem mais |

## 8. Como saber que está pronto
Rodar este checklist **no link publicado**:
1. Sou gestor → o painel aparece com dados.
2. Nova ocorrência com passageiro preso → aparece **Crítica** no topo.
3. Abrir → técnico sugerido → Despachar.
4. Sou técnico → escolher o técnico → A caminho → Resolvido.
5. O painel do gestor mostra a ocorrência resolvida.
6. Alertas → Gerar preventiva → o alerta some e a preventiva aparece no painel.
7. Apertar F5 em qualquer tela → nada se perde.
8. Reiniciar demonstração → tudo volta ao começo.
9. No celular a tela fica utilizável.
