import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lerDados, salvarDados } from '../dados.js'
import { sugerirTecnico, tecnicoEstaLivre } from '../regras.js'

const nomesTipos = {
    passageiro_preso: 'Passageiro preso',
    falha_tecnica: 'Falha técnica',
    falta_energia: 'Falta de energia',
    ruido: 'Ruído',
    pedido_cliente: 'Pedido do cliente',
    preventiva: 'Preventiva',
}

const nomesSeveridade = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
}

const nomesStatus = {
    aberta: 'Aberta',
    despachada: 'Despachada',
    a_caminho: 'A caminho',
    resolvida: 'Resolvida',
}

const classesSeveridade = {
    critica: 'text-bg-danger',
    alta: 'text-bg-warning',
    media: 'text-bg-info',
    baixa: 'text-bg-success',
}

function DetalheOcorrencia() {
    const { id } = useParams()
    const [dados, setDados] = useState(lerDados)
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState('')

    const ocorrencia = dados.ocorrencias.find((item) => item.id === id)

    if (!ocorrencia) {
        return (
            <div>
                <h1 className="mb-3">Ocorrência não encontrada</h1>
                <Link className="btn btn-primary" to="/gestor">Voltar ao painel</Link>
            </div>
        )
    }

    const elevador = dados.elevadores.find((item) => item.id === ocorrencia.elevadorId)

    if (!elevador) {
        return (
            <div>
                <h1 className="mb-3">Elevador não encontrado</h1>
                <Link className="btn btn-primary" to="/gestor">Voltar ao painel</Link>
            </div>
        )
    }

    const tecnicoResponsavel = dados.tecnicos.find((item) => item.id === ocorrencia.tecnicoId)
    const sugerido = ocorrencia.status === 'aberta'
        ? sugerirTecnico(elevador, dados.tecnicos, dados.ocorrencias)
        : null
    const tecnicosLivres = dados.tecnicos.filter((tecnico) =>
        tecnicoEstaLivre(tecnico.id, dados.ocorrencias)
    )
    const tecnicoDespacho = tecnicoSelecionado || sugerido?.id

    function despachar() {
        if (!tecnicoDespacho) return

        const ocorrencias = dados.ocorrencias.map((item) =>
            item.id === ocorrencia.id
                ? { ...item, status: 'despachada', tecnicoId: tecnicoDespacho }
                : item
        )
        const novosDados = { ...dados, ocorrencias }

        salvarDados(novosDados)
        setDados(novosDados)
    }

    return (
        <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <h1 className="mb-4">Detalhe da ocorrência</h1>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h2 className="h5">{elevador.predio}</h2>
                            <div className="text-secondary">Estado: {elevador.estado}</div>
                        </div>
                        <span className={`badge ${classesSeveridade[ocorrencia.severidade]}`}>
                            {nomesSeveridade[ocorrencia.severidade]}
                        </span>
                    </div>

                    <hr />

                    <dl className="row mb-0">
                        <dt className="col-sm-3">Tipo</dt>
                        <dd className="col-sm-9">{nomesTipos[ocorrencia.tipo]}</dd>

                        <dt className="col-sm-3">Descrição</dt>
                        <dd className="col-sm-9">{ocorrencia.descricao}</dd>

                        <dt className="col-sm-3">Status</dt>
                        <dd className="col-sm-9">{nomesStatus[ocorrencia.status]}</dd>

                        <dt className="col-sm-3">Abertura</dt>
                        <dd className="col-sm-9">
                            {new Date(ocorrencia.criadaEm).toLocaleString('pt-BR')}
                        </dd>
                    </dl>
                </div>
            </div>

            {ocorrencia.status === 'aberta' ? (
                <div className="card">
                    <div className="card-body">
                        {sugerido ? (
                            <>
                                <p>
                                    Técnico sugerido: <strong>{sugerido.nome} ({sugerido.estado})</strong>
                                </p>
                                {sugerido.estado !== elevador.estado && (
                                    <div className="alert alert-warning">
                                        Técnico de fora do estado
                                    </div>
                                )}

                                <label className="form-label" htmlFor="tecnico">Técnico</label>
                                <select
                                    className="form-select mb-3"
                                    id="tecnico"
                                    value={tecnicoDespacho}
                                    onChange={(evento) => setTecnicoSelecionado(evento.target.value)}
                                >
                                    {tecnicosLivres.map((tecnico) => (
                                        <option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nome} ({tecnico.estado})
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <p className="alert alert-danger mb-3">Nenhum técnico disponível</p>
                        )}

                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={despachar}
                            disabled={!sugerido || !tecnicoDespacho}
                        >
                            Despachar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <p>
                            Técnico responsável: <strong>{tecnicoResponsavel?.nome || 'Não informado'}</strong>
                        </p>
                        {ocorrencia.status === 'resolvida' && (
                            <p className="mb-0">
                                Observação: {ocorrencia.observacao || 'Não informada'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DetalheOcorrencia
