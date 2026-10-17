# LiftDesk: melhorias com o que vimos na Fase 7

Este plano **soma** ao [plano principal](2026-10-12-liftdesk-mvp.md) e não o substitui. Vale a mesma regra: **cada um programa a própria parte**.

## Regra de ouro

**Nenhuma melhoria começa antes do fluxo principal funcionar** (meta: 25/10). As melhorias entram na semana 3 (26/10–01/11), e o congelamento de **01/11** continua valendo. Se o fluxo principal atrasar, cortem as melhorias de baixo para cima desta lista.

> ⚠️ Em 17/10 o repositório ainda não tem o projeto base, que estava previsto para 15/10. Isso é mais urgente do que qualquer melhoria abaixo.

## O que a Fase 7 trouxe e o que fazemos com cada coisa

| Conteúdo da Fase 7 | Decisão | Por quê |
|---|---|---|
| **react-hook-form + yup** (cap. 5) | ✅ **Usar** em Nova ocorrência | Deixa a validação mais limpa e mostra na banca o que aprendemos |
| **fetch + API ViaCEP** (cap. 5) | ✅ **Usar** numa tela nova: Cadastrar elevador | O sistema passa a consumir uma API de verdade, o que conta no critério "Coleta de dados" |
| **Diagrama de classes e de sequência** (caps. 3 e 4) | ✅ **Fazer** como documentação | Mostra engenharia por trás do MVP, e o modelo de dados já está pronto |
| **UX Writing** (cap. 9) | ✅ **Revisar os textos** de todas as telas | Custa pouco e melhora a nota de usabilidade (5 + 4,5 pontos) |
| **styled-components** (cap. 5) | ❌ **Não usar** | Já usamos Bootstrap. Misturar os dois deixa o visual inconsistente e gera retrabalho |
| **jQuery** (cap. 8) | ❌ **Não usar** | Ele mexe direto no HTML, e o React também. Usar os dois juntos causa bugs |
| **Python + Oracle** (cap. 6) | ❌ **Fora do escopo** | Roda só no terminal e não chega ao site publicado no GitHub Pages |

## Prioridade (MoSCoW)

| Prioridade | Melhoria | Quem |
|---|---|---|
| **Must** | O fluxo principal do plano original | Todos |
| **Should** | M1. Nova ocorrência com react-hook-form + yup | Erick |
| **Should** | M2. Cadastrar elevador com busca por CEP (ViaCEP) | João Victor |
| **Should** | M3. Diagramas de classes e de sequência | Pietro |
| **Could** | M4. Revisão de textos (UX Writing) | Todos, cada um na própria tela; Lucas fecha a persona e o tom |
| **Won't** | styled-components, jQuery, banco de dados | — |

---

## M1. Nova ocorrência com react-hook-form + yup (Erick)

**Quando:** só depois que a tela já funciona com `useState` (semana 2). É uma troca do "motor" do formulário, e a tela continua com a mesma cara.

```bash
npm install react-hook-form @hookform/resolvers yup
```

**Regras de validação** (as mesmas de hoje, agora num `schema`):
```js
const schema = yup.object({
  elevadorId: yup.string().required('Escolha o elevador.'),
  tipo: yup.string().required('Escolha o tipo da ocorrência.'),
  descricao: yup.string().min(10, 'Descreva com pelo menos 10 letras.').required('Descreva o problema.'),
  passageiroPreso: yup.boolean(),
})
```

**Como ligar ao formulário** (igual ao cap. 5):
```jsx
const { register, handleSubmit, watch, formState: { errors } } = useForm({
  resolver: yupResolver(schema),
})

<select {...register('elevadorId')}>...</select>
<span className="text-danger small">{errors.elevadorId?.message}</span>

<form onSubmit={handleSubmit(registrar)}>
```

- A função `registrar(valores)` recebe `{ elevadorId, tipo, descricao, passageiroPreso }` e monta a ocorrência do mesmo jeito que antes.
- **A "Classificação automática" continua aparecendo enquanto o usuário preenche:** use `watch('tipo')` e `watch('passageiroPreso')` para ler os campos em tempo real e passe os valores para `calcularSeveridade`.
- Se o tipo escolhido for `passageiro_preso`, a severidade já é crítica pela regra, então não precisa marcar a caixa automaticamente.

**Conferir:** enviar vazio mostra as 3 mensagens embaixo dos campos. Uma descrição de 5 letras mostra o erro de tamanho. Uma ocorrência válida continua indo para o detalhe.

---

## M2. Cadastrar elevador com busca por CEP (João Victor)

Uma tela nova em `/gestor/elevadores/novo`, com um link no cabeçalho: **"Cadastrar elevador"**. Hoje os elevadores existem só no JSON. Com essa tela, o gestor cadastra prédios novos, e o endereço vem da API ViaCEP.

**Campos:** prédio, CEP, rua, bairro, cidade (preenchidos pela API), número, região (um `<select>` com Norte, Sul, Leste, Oeste e Centro) e modelo do elevador.

**Busca do CEP no `onBlur`** (igual ao cap. 5):
```js
function buscarCep(evento) {
  const cep = evento.target.value.replace(/\D/g, '')
  if (cep.length !== 8) return

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((res) => res.json())
    .then((data) => {
      if (data.erro) {
        setErroCep('CEP não encontrado. Confira os números.')
        return
      }
      setErroCep('')
      setValue('rua', data.logradouro)
      setValue('bairro', data.bairro)
      setValue('cidade', data.localidade)
      setFocus('numero')
    })
    .catch(() => setErroCep('Não deu para buscar o CEP agora. Preencha o endereço à mão.'))
}
```

**Três cuidados que a banca pode testar:**
1. **CEP que não existe** (ex.: `00000000`): a API responde `{ erro: true }`, não dá erro. Por isso o `if (data.erro)`.
2. **Sem internet:** cai no `.catch`. Os campos continuam editáveis, para o gestor preencher à mão.
3. **CEP com traço ou ponto:** o `replace(/\D/g, '')` limpa antes de buscar.

**Ao salvar:** adicione o elevador novo em `dados.elevadores` e grave com `salvarDados` e `setDados`:
```js
const novo = {
  id: 'E' + Date.now(),
  predio, regiao, modelo,
  endereco: `${rua}, ${numero} · ${bairro} · ${cidade}`,
  eventos: [],
}
```
Ele já aparece no `<select>` da Nova ocorrência, porque ela também lê `dados.elevadores`.

**Validação:** use react-hook-form + yup do mesmo jeito da M1 (prédio, CEP com 8 números, número e região obrigatórios). Combine com o Erick para os dois formulários ficarem parecidos.

**Conferir:**
- O CEP `01310-100` preenche a Av. Paulista.
- O CEP `00000000` mostra a mensagem de CEP não encontrado.
- Depois de salvar, o elevador aparece na Nova ocorrência.
- Depois de apertar F5, ele continua lá.

---

## M3. Diagramas de classes e de sequência (Pietro)

Feitos no **Astah**, como no curso. Exporte como imagem e salve em `docs/diagramas/`. Eles entram no README e podem aparecer rapidamente no vídeo.

**Diagrama de classes** (cap. 3), com as entidades do LiftDesk:

| Classe | Atributos | Relacionamentos |
|---|---|---|
| `Elevador` | id, predio, endereco, regiao, modelo | tem 0..* `Evento` (**composição**: o evento não existe sem o elevador) |
| `Evento` | tipo, diasAtras | — |
| `Tecnico` | id, nome, regiao | atende 0..* `Ocorrencia` |
| `Ocorrencia` | id, tipo, descricao, passageiroPreso, severidade, status, criadaEm | pertence a 1 `Elevador`; pode ter 0..1 `Tecnico` |
| `Alerta` | id, tipo, quantidade, risco | refere-se a 1 `Elevador`; pode gerar 0..1 `Ocorrencia` preventiva |

- Para mostrar as **3 camadas** do capítulo:
  - **Fronteira:** as telas (`TelaPainel`, `TelaNovaOcorrencia`...);
  - **Controle:** `Regras` (as funções de `regras.js`) e `Dados` (`dados.js`);
  - **Entidade:** as 5 classes acima.
- Visibilidade: use `+` para os métodos de `Regras`, como `+calcularSeveridade(tipo, passageiroPreso): String`.

**Diagrama de sequência** (cap. 4), de um caso de uso: **"Despachar ocorrência"**.
- Ator `Gestor` → `TelaDetalhe` → `Regras.sugerirTecnico()` → retorno do técnico → `Gestor` confirma → `Dados.salvarDados()`.
- Use um fragmento **alt** para "há técnico livre" / "nenhum técnico disponível".

**Conferir:** os nomes do diagrama são os mesmos do código (`sugerirTecnico`, `salvarDados`, status `despachada`).

---

## M4. Revisão de textos com UX Writing (todos, Lucas fecha)

**Lucas define em 5 linhas, no README:**
- **Persona:** por exemplo, "Marina, 38 anos, gestora da central de operações. Atende vários chamados ao mesmo tempo e precisa decidir rápido".
- **Tom:** direto, calmo e sem gírias. É uma situação de urgência, então nada de brincadeira.

**Cada um revisa a própria tela com este checklist:**
- Os botões dizem **o que acontece**: "Despachar técnico", não "OK"; "Registrar ocorrência", não "Enviar".
- As mensagens de erro dizem **o que fazer**: "Descreva com pelo menos 10 letras", não "Campo inválido".
- As listas vazias **orientam**: "Nenhuma tarefa no momento. Aguarde o despacho da central."
- A mesma coisa tem **sempre o mesmo nome**: decidam se é "ocorrência" ou "chamado" e usem só um.

---

## Cronograma ajustado

| Semana | Fluxo principal (plano original) | Melhorias |
|---|---|---|
| **até 19/10** | **Lucas sobe o projeto base (atrasado)** | — |
| 19–25/10 | Fluxo completo funcionando | Pietro começa os diagramas, que não dependem de código |
| 26/10–01/11 | Deploy, visual e celular | M1 (Erick), M2 (João Victor), M4 (todos). **Congelar em 01/11** |
| 02–09/11 | Vídeo, PDF, ZIP | No vídeo, mostrar a busca de CEP em ~10 s, e o diagrama se couber |

## Checklist extra (somar ao checklist final)

- [ ] Nova ocorrência vazia mostra as mensagens de erro do yup.
- [ ] Cadastrar elevador com o CEP `01310-100` preenche o endereço.
- [ ] O CEP `00000000` mostra a mensagem de CEP não encontrado.
- [ ] O elevador cadastrado aparece na Nova ocorrência e continua lá depois do F5.
- [ ] Os diagramas estão em `docs/diagramas/` e no README.
