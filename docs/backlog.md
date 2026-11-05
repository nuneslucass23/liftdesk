# LiftDesk: backlog com MoSCoW

Situação em 04/11/2026.

- **Na main:** já está no projeto principal.
- **Em PR:** pronto, aguardando revisão no GitHub.
- **A fazer:** ainda não apareceu no repositório.

## Must: sem isso o MVP não entrega o fluxo principal

| ID | História | Quem | Situação | Como saber que está pronto |
|---|---|---|---|---|
| B01 | Como grupo, queremos um projeto base com rotas e dados de exemplo, para trabalhar ao mesmo tempo. | Lucas | Na main | O site roda com `npm run dev` |
| B02 | Como pessoa da central, quero escolher entre gestor e técnico na tela inicial, para chegar à minha área. | Lucas | A fazer | Os botões Sou gestor e Sou técnico abrem as telas certas |
| B03 | Como gestor, quero ver as ocorrências da mais grave para a menos grave, para saber o que atender primeiro. | Pietro | Em PR | A ocorrência crítica aparece antes das outras e as resolvidas ficam no fim |
| B04 | Como gestor, quero ver o prazo de cada ocorrência, para agir antes de atrasar. | Pietro | Em PR | O selo ATRASADA aparece quando o prazo passa |
| B05 | Como gestor, quero registrar uma ocorrência, para colocá-la na fila de atendimento. | Erick | Em PR | A nova ocorrência aparece no Painel |
| B06 | Como gestor, quero que a gravidade e o prazo sejam definidos automaticamente, para não decidir isso na hora da urgência. | Erick | Em PR | Passageiro preso gera severidade crítica e prazo de 30 minutos |
| B07 | Como gestor, quero ver um técnico sugerido, para despachar mais rápido. | Lucas | Na main | A regra sugere um técnico livre do mesmo estado ou o primeiro livre |
| B08 | Como gestor, quero despachar o técnico, para iniciar o atendimento. | Erick | Em PR | O status vira `despachada` e o técnico fica gravado |
| B09 | Como técnico, quero ver minhas tarefas e marcar A caminho e Resolvido, para informar o andamento. | Lucas | A fazer | O Painel mostra a ocorrência resolvida |
| B10 | Como gestor, quero ver alertas de elevadores com falhas repetidas, para agir antes da quebra. | João Victor | A fazer | Os dados de exemplo geram os alertas de E2 e E5 e nenhum de E8 |
| B11 | Como gestor, quero gerar uma manutenção preventiva a partir do alerta, para resolver o risco. | João Victor | A fazer | O alerta some e a preventiva aparece no Painel |
| B12 | Como usuário, quero que os dados continuem depois do F5, para não perder o que fiz. | Lucas | Na main | Os dados ficam salvos no `localStorage` |
| B13 | Como apresentador, quero reiniciar a demonstração, para sempre começar do mesmo ponto. | Lucas | A fazer | O botão Reiniciar demonstração devolve os dados iniciais |
| B14 | Como grupo, queremos o site publicado, para entregar o link do deploy. | Lucas | A fazer | O checklist da especificação passa no link publicado |
| B15 | Como grupo, queremos o vídeo publicado com acesso público. | Pietro (roteiro) e João Victor (gravação e edição) | Roteiro pronto para revisão, gravação a fazer | O vídeo tem até 3 minutos e abre em uma aba anônima |
| B16 | Como grupo, queremos entregar o ZIP no portal da FIAP. | João Victor | A fazer | O ZIP tem o PDF e o código sem `node_modules` |

## Should: importante, mas o MVP funciona sem isso

| ID | História | Quem | Situação | Como saber que está pronto |
|---|---|---|---|---|
| B17 | Como gestor, quero mensagens de erro claras na Nova ocorrência, para corrigir o preenchimento (react-hook-form + yup). | Erick | A fazer | O formulário vazio mostra as mensagens de erro |
| B18 | Como gestor, quero cadastrar um elevador pelo CEP, para preencher o endereço mais rápido (ViaCEP). | João Victor | A fazer | O CEP `01310-100` preenche o endereço, e o elevador continua lá depois do F5 |
| B19 | Como grupo, queremos diagramas de classes e de sequência, para mostrar a engenharia do MVP. | Pietro | Pronto para revisão | Os nomes dos diagramas são os mesmos do código |

## Could: entra se sobrar tempo

| ID | História | Quem | Situação | Como saber que está pronto |
|---|---|---|---|---|
| B20 | Como usuário, quero textos claros e sempre com o mesmo nome para cada coisa, para usar o site sem dúvida. | Todos, com fechamento do Lucas | A fazer | Cada tela passa no checklist de UX Writing |

## Won't: fora desta entrega

- Login com senha
- Servidor e banco de dados
- Mapa
- Inteligência artificial de verdade
- Perfil de cliente
- styled-components
- jQuery
