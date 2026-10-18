// regras de negócio do LiftDesk
// cada integrante do grupo preenche apenas as suas funções. NÃO MUDE NOMES NEM PARÂMETROS

// Erick: devolve 'critica', 'alta', 'media' ou 'baixa'
export function calcularSeveridade(tipo, passageiroPreso) { }

// Erick: devolve o prazo em minutos (30, 120, 480 ou 2880)
export function prazoEmMinutos(severidade) { }

// Pietro: devolve true se passou do prazo e não está resolvida
export function estaAtrasada(ocorrencia) { }

// Pietro: devolve uma lista nova, da mais grave para a menos grave, com as resolvidas no fim
export function ordenarPorGravidade(ocorrencias) { }

// Lucas: devolve true se o técnico não tem nenhuma ocorrência 'despachada' ou 'a_caminho'
export function tecnicoEstaLivre(tecnicoId, ocorrencias) {
    const emAndamento = ocorrencias.filter((o) =>
        o.tecnicoId === tecnicoId && (o.status === 'despachada' || o.status === 'a_caminho')
    )
    return emAndamento.length === 0
}

// Lucas: devolve o técnico livre do mesmo estado; senão, o primeiro livre; senão, null
export function sugerirTecnico(elevador, tecnicos, ocorrencias) {
    //1. apenas tecnicos livres
    const livres = tecnicos.filter((t) => tecnicoEstaLivre(t.id, ocorrencias))

    //2. um livre do mesmo estado do elevador 
    const mesmoEstado = livres.find((t) => t.estado === elevador.estado)
    if (mesmoEstado) return mesmoEstado

    //3. senao, o primeiro livre; se nao houver ninguem, null
    if (livres.length === 0) return null
    return livres[0]
}

// João Victor: devolve a lista de alertas (3+ eventos do mesmo tipo em 7 dias)
export function gerarAlertas(elevadores, alertasTratados) { }
