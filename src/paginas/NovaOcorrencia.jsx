import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lerDados, salvarDados } from '../dados.js'
import { calcularSeveridade, prazoEmMinutos } from '../regras.js'

const tipos = [
    { valor: 'passageiro_preso', nome: 'Passageiro preso' },
    { valor: 'falha_tecnica', nome: 'Falha técnica' },
    { valor: 'falta_energia', nome: 'Falta de energia' },
    { valor: 'ruido', nome: 'Ruído' },
    { valor: 'pedido_cliente', nome: 'Pedido do cliente' },
]

const nomesSeveridade = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
}

function NovaOcorrencia() {
    const [dados, setDados] = useState(lerDados)
    const [elevadorId, setElevadorId] = useState('')
    const [tipo, setTipo] = useState('')
    const [passageiroPreso, setPassageiroPreso] = useState(false)
    const [descricao, setDescricao] = useState('')
    const navigate = useNavigate()

    const severidade = calcularSeveridade(tipo, passageiroPreso)
    const prazo = prazoEmMinutos(severidade)
    const descricaoValida = descricao.trim().length >= 10
    const formularioValido = elevadorId !== '' && tipo !== '' && descricaoValida

    function registrarOcorrencia(evento) {
        evento.preventDefault()
        if (!formularioValido) return

        const nova = {
            id: 'OC-' + Date.now(),
            elevadorId,
            tipo,
            descricao: descricao.trim(),
            passageiroPreso,
            severidade: calcularSeveridade(tipo, passageiroPreso),
            status: 'aberta',
            tecnicoId: null,
            criadaEm: Date.now(),
            observacao: '',
        }

        const novosDados = {
            ...dados,
            ocorrencias: [...dados.ocorrencias, nova],
        }

        salvarDados(novosDados)
        setDados(novosDados)
        navigate('/gestor/ocorrencia/' + nova.id)
    }

    return (
        <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <h1 className="mb-4">Nova ocorrência</h1>

            <form onSubmit={registrarOcorrencia}>
                <div className="card">
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="elevador">Elevador</label>
                            <select
                                className="form-select"
                                id="elevador"
                                value={elevadorId}
                                onChange={(evento) => setElevadorId(evento.target.value)}
                            >
                                <option value="">Selecione um elevador</option>
                                {dados.elevadores.map((elevador) => (
                                    <option key={elevador.id} value={elevador.id}>
                                        {elevador.predio} ({elevador.estado})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="tipo">Tipo</label>
                            <select
                                className="form-select"
                                id="tipo"
                                value={tipo}
                                onChange={(evento) => setTipo(evento.target.value)}
                            >
                                <option value="">Selecione o tipo</option>
                                {tipos.map((item) => (
                                    <option key={item.valor} value={item.valor}>
                                        {item.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="passageiroPreso"
                                checked={passageiroPreso}
                                onChange={(evento) => setPassageiroPreso(evento.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="passageiroPreso">
                                Há passageiro preso?
                            </label>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="descricao">Descrição</label>
                            <textarea
                                className="form-control"
                                id="descricao"
                                rows="4"
                                value={descricao}
                                onChange={(evento) => setDescricao(evento.target.value)}
                                aria-describedby="descricao-ajuda"
                            />
                            <div id="descricao-ajuda" className="form-text">
                                Informe pelo menos 10 letras.
                            </div>
                        </div>

                        <p className="alert alert-secondary mb-0">
                            Classificação automática: {nomesSeveridade[severidade]} · prazo de {prazo} min
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn-primary mt-3"
                    type="submit"
                    disabled={!formularioValido}
                >
                    Registrar
                </button>
            </form>
        </div>
    )
}

export default NovaOcorrencia
