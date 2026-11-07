import { useState } from 'react'
import { lerDados, salvarDados } from '../dados.js'

const nomesStatus = {
    despachada: 'Despachada',
    a_caminho: 'A caminho',
}

function MinhasTarefas() {
    const [dados, setDados] = useState(lerDados)
    const [tecnicoId, setTecnicoId] = useState('')
    const [observacoes, setObservacoes] = useState({})

    function mudarStatus(id, novoStatus) {
        const ocorrencias = dados.ocorrencias.map((o) =>
            o.id === id
                ? { ...o, status: novoStatus, observacao: observacoes[id] ?? o.observacao }
                : o
        )
        const novosDados = { ...dados, ocorrencias }
        salvarDados(novosDados)
        setDados(novosDados)
    }

    const tarefas = dados.ocorrencias.filter((o) =>
        o.tecnicoId === tecnicoId && o.status !== 'resolvida'
    )

    return (
        <>
            <h1 className="h3 mb-3">Minhas tarefas</h1>

            <div className="mb-4">
                <label className="form-label" htmlFor="tecnico">Nome do técnico</label>
                <select
                    id="tecnico"
                    className="form-select"
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                >
                    <option value="">Selecione o técnico</option>
                    {dados.tecnicos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome} ({t.estado})</option>
                    ))}
                </select>
            </div>

            {tecnicoId && tarefas.length === 0 && (
                <p className="text-secondary">Nenhuma tarefa no momento.</p>
            )}

            {tarefas.map((o) => {
                const elevador = dados.elevadores.find((e) => e.id === o.elevadorId)
                return (
                    <div key={o.id} className="card mb-3">
                        <div className="card-body">
                            <h2 className="h5">{o.id} · {elevador.predio}</h2>
                            <p className="mb-1">{o.descricao}</p>
                            <p className="text-secondary mb-0">Status: {nomesStatus[o.status]}</p>

                            {o.status === 'despachada' && (
                                <button className="btn btn-dark mt-3" onClick={() => mudarStatus(o.id, 'a_caminho')}>
                                    A caminho
                                </button>
                            )}

                            {o.status === 'a_caminho' && (
                                <div className="mt-3">
                                    <label className="form-label" htmlFor={'obs-' + o.id}>O que foi feito?</label>
                                    <textarea
                                        id={'obs-' + o.id}
                                        className="form-control mb-2"
                                        rows="2"
                                        value={observacoes[o.id] ?? ''}
                                        onChange={(e) => setObservacoes({ ...observacoes, [o.id]: e.target.value })}
                                    />
                                    <button
                                        className="btn btn-success"
                                        disabled={!observacoes[o.id]?.trim()}
                                        onClick={() => mudarStatus(o.id, 'resolvida')}
                                    >
                                        Resolvido
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default MinhasTarefas
