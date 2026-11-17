import { useState } from 'react'
import { lerDados, salvarDados } from '../dados.js'
import { gerarAlertas } from '../regras.js'

const TIPOS = {
    porta: 'porta',
    vibracao: 'vibração',
    nivelamento: 'nivelamento',
    energia: 'energia',
    ruido: 'ruído',
}

// monta a ocorrência preventiva fora do componente (igual ao montarOcorrencia da Nova ocorrência)
function montarPreventiva(alerta, elevador) {
    const agora = Date.now()

    return {
        id: 'OC-' + agora,
        elevadorId: alerta.elevadorId,
        tipo: 'preventiva',
        descricao: `Manutenção preventiva: ${alerta.quantidade} anomalias de ${TIPOS[alerta.tipo] ?? alerta.tipo} nos últimos 7 dias no ${elevador?.predio ?? alerta.elevadorId}.`,
        passageiroPreso: false,
        severidade: 'baixa',
        status: 'aberta',
        tecnicoId: null,
        criadaEm: agora,
        observacao: '',
    }
}

function Alertas() {
    const [dados, setDados] = useState(lerDados)
    const alertas = gerarAlertas(dados.elevadores, dados.alertasTratados)

    function gerarManutencao(alerta) {
        const elevador = dados.elevadores.find((item) => item.id === alerta.elevadorId)
        const novaOcorrencia = montarPreventiva(alerta, elevador)
        const novosDados = {
            ...dados,
            ocorrencias: [novaOcorrencia, ...dados.ocorrencias],
            alertasTratados: [...(dados.alertasTratados ?? []), alerta.id],
        }

        salvarDados(novosDados)
        setDados(novosDados)
    }

    return (
        <section aria-labelledby="alertas-titulo">
            <h1 id="alertas-titulo" className="mb-3">Alertas preditivos</h1>
            <div className="card mb-4">
                <div className="card-body">
                    <p className="card-text mb-0">
                        3 ou mais anomalias do mesmo tipo em 7 dias geram alerta; 5 ou mais é risco alto.
                    </p>
                </div>
            </div>

            {alertas.length === 0 ? (
                <p className="alert alert-success" role="status">
                    Nenhum elevador em risco no momento.
                </p>
            ) : (
                <div className="row g-3">
                    {alertas.map((alerta) => {
                        const elevador = dados.elevadores.find((item) => item.id === alerta.elevadorId)
                        const tipo = TIPOS[alerta.tipo] ?? alerta.tipo
                        const riscoAlto = alerta.risco === 'alto'

                        return (
                            <div className="col-12 col-md-6" key={alerta.id}>
                                <article className="card h-100">
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                            <h2 className="h5 card-title mb-0">
                                                {elevador?.predio ?? `Elevador ${alerta.elevadorId}`}
                                            </h2>
                                            <span className={'badge ' + (riscoAlto ? 'text-bg-danger' : 'text-bg-warning')}>
                                                Risco {riscoAlto ? 'ALTO' : 'MÉDIO'}
                                            </span>
                                        </div>
                                        <p className="card-text">
                                            {alerta.quantidade} {alerta.quantidade === 1 ? 'anomalia' : 'anomalias'} de {tipo} nos últimos 7 dias.
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-primary mt-auto align-self-start"
                                            onClick={() => gerarManutencao(alerta)}
                                        >
                                            Gerar manutenção preventiva
                                        </button>
                                    </div>
                                </article>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default Alertas
