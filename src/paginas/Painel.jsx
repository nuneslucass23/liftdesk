import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { lerDados } from '../dados.js'
import {
    estaAtrasada,
    gerarAlertas,
    ordenarPorGravidade,
    prazoEmMinutos,
    sugerirTecnico,
    tecnicoEstaLivre,
} from '../regras.js'
import './Painel.css'

const SEVERIDADES = {
    critica: { texto: 'Crítica', cor: 'text-bg-danger' },
    alta: { texto: 'Alta', cor: 'text-bg-warning' },
    media: { texto: 'Média', cor: 'text-bg-info' },
    baixa: { texto: 'Baixa', cor: 'text-bg-success' },
}

const TIPOS = {
    passageiro_preso: 'Passageiro preso',
    falha_tecnica: 'Falha técnica',
    falta_energia: 'Falta de energia',
    ruido: 'Ruído',
    pedido_cliente: 'Pedido do cliente',
    preventiva: 'Preventiva',
}

const ETAPAS = [
    { status: 'aberta', texto: 'Aberta' },
    { status: 'despachada', texto: 'Despachada' },
    { status: 'a_caminho', texto: 'A caminho' },
    { status: 'resolvida', texto: 'Resolvida' },
]

const emAtendimento = (o) => o.status === 'despachada' || o.status === 'a_caminho'

const FILTROS = [
    { id: 'nao_resolvidas', nome: 'Não resolvidas', teste: (o) => o.status !== 'resolvida' },
    { id: 'abertas', nome: 'Abertas', teste: (o) => o.status === 'aberta' },
    { id: 'criticas', nome: 'Críticas', teste: (o) => o.severidade === 'critica' && o.status !== 'resolvida' },
    { id: 'atendimento', nome: 'Em atendimento', teste: emAtendimento },
    { id: 'resolvidas', nome: 'Resolvidas', teste: (o) => o.status === 'resolvida' },
    { id: 'todas', nome: 'Todas', teste: () => true },
]

// milissegundos até o fim do prazo; fica negativo depois que o prazo passa
function tempoRestante(ocorrencia, agora) {
    return ocorrencia.criadaEm + prazoEmMinutos(ocorrencia.severidade) * 60000 - agora
}

// 24:51 ou 1:05:03, para o visor
function relogio(ms) {
    const totalSegundos = Math.floor(Math.abs(ms) / 1000)
    const horas = Math.floor(totalSegundos / 3600)
    const minutos = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, '0')
    const segundos = String(totalSegundos % 60).padStart(2, '0')
    return horas > 0 ? `${horas}:${minutos}:${segundos}` : `${minutos}:${segundos}`
}

// 30 min, 2h ou 1h 05min, para os textos
function duracao(ms) {
    const totalMinutos = Math.floor(Math.abs(ms) / 60000)
    if (totalMinutos < 1) return 'menos de 1 min'
    if (totalMinutos < 60) return `${totalMinutos} min`

    const horas = Math.floor(totalMinutos / 60)
    const minutos = totalMinutos % 60
    return minutos === 0 ? `${horas}h` : `${horas}h ${String(minutos).padStart(2, '0')}min`
}

function Cabine({ ocorrencia, elevador, sugerido, agora, naFila }) {
    if (!ocorrencia) {
        return (
            <section className="painel-cabine painel-cabine--livre">
                <div>
                    <h2 className="painel-cabine-titulo">Nada aguardando técnico</h2>
                    <p className="mb-0">Quando entrar uma nova ocorrência, ela aparece aqui.</p>
                </div>
            </section>
        )
    }

    const restante = tempoRestante(ocorrencia, agora)
    const temPrazo = !Number.isNaN(restante)
    const atrasada = estaAtrasada(ocorrencia)
    const severidade = SEVERIDADES[ocorrencia.severidade]

    return (
        <section className="painel-cabine" aria-labelledby="proxima-titulo">
            <div className={'painel-visor' + (atrasada ? ' painel-visor--atrasada' : '')}>
                <span className="painel-visor-legenda">{atrasada ? 'Atrasada há' : 'Tempo para atender'}</span>
                <span className="painel-visor-tempo" role="timer">{temPrazo ? relogio(restante) : '--:--'}</span>
                {temPrazo && (
                    <span className="painel-visor-legenda">Prazo de {duracao(prazoEmMinutos(ocorrencia.severidade) * 60000)}</span>
                )}
            </div>

            <div className="painel-cabine-info">
                <h2 id="proxima-titulo" className="painel-cabine-titulo">Próxima a despachar</h2>
                <p className="painel-cabine-predio">{elevador.predio}, {elevador.estado}</p>
                <p className="painel-cabine-descricao">{ocorrencia.descricao}</p>
                <p className="painel-cabine-dados">
                    <span className={'badge ' + severidade.cor}>{severidade.texto}</span>
                    <span>{TIPOS[ocorrencia.tipo]}</span>
                    <span>{ocorrencia.id}</span>
                </p>

                <div className="painel-cabine-acoes">
                    <Link to={'/gestor/ocorrencia/' + ocorrencia.id} className="painel-despachar">
                        Abrir e despachar
                    </Link>
                    <span className="painel-cabine-sugestao">
                        {sugerido ? `Sugestão: ${sugerido.nome} (${sugerido.estado})` : 'Nenhum técnico livre'}
                    </span>
                    {naFila > 0 && (
                        <span className="painel-cabine-fila">
                            {naFila === 1 ? 'Mais 1 na fila' : `Mais ${naFila} na fila`}
                        </span>
                    )}
                </div>
            </div>
        </section>
    )
}

function Prazo({ ocorrencia, agora }) {
    if (ocorrencia.status === 'resolvida') {
        return <span className="text-body-secondary">Encerrada</span>
    }

    const restante = tempoRestante(ocorrencia, agora)
    if (Number.isNaN(restante)) {
        return <span className="text-body-secondary">Sem prazo</span>
    }

    const prazo = prazoEmMinutos(ocorrencia.severidade) * 60000
    const usado = Math.min(1 - restante / prazo, 1)
    const atrasada = estaAtrasada(ocorrencia)

    let nivel = ''
    if (atrasada) nivel = ' painel-prazo-barra--atrasada'
    else if (usado >= 0.75) nivel = ' painel-prazo-barra--perto'

    return (
        <div className="painel-prazo">
            {atrasada
                ? <span><span className="badge text-bg-danger">ATRASADA</span> há {duracao(restante)}</span>
                : <span>Faltam {duracao(restante)}</span>}
            <div className="painel-prazo-trilho" aria-hidden="true">
                <div className={'painel-prazo-barra' + nivel} style={{ width: `${usado * 100}%` }} />
            </div>
        </div>
    )
}

function Etapas({ status }) {
    const posicao = ETAPAS.findIndex((etapa) => etapa.status === status)

    return (
        <div className="painel-etapas">
            <span>{ETAPAS[posicao].texto}</span>
            <span className="painel-etapas-andares" aria-hidden="true">
                {ETAPAS.map((etapa, i) => (
                    <span key={etapa.status} className={i <= posicao ? 'painel-andar painel-andar--aceso' : 'painel-andar'} />
                ))}
            </span>
        </div>
    )
}

function Painel() {
    const navigate = useNavigate()
    const [dados] = useState(lerDados())
    const [filtro, setFiltro] = useState('nao_resolvidas')
    const [agora, setAgora] = useState(() => Date.now())

    // atualiza a contagem dos prazos a cada segundo
    useEffect(() => {
        const relogioDaTela = setInterval(() => setAgora(Date.now()), 1000)
        return () => clearInterval(relogioDaTela)
    }, [])

    const { ocorrencias, elevadores, tecnicos, alertasTratados } = dados
    const acharElevador = (id) => elevadores.find((e) => e.id === id)

    // enquanto a prazoEmMinutos e a gerarAlertas não estiverem prontas, elas devolvem undefined
    const alertas = gerarAlertas(elevadores, alertasTratados) ?? []

    const filaAbertas = ordenarPorGravidade(ocorrencias.filter((o) => o.status === 'aberta'))
    const proxima = filaAbertas[0]
    const elevadorDaProxima = proxima && acharElevador(proxima.elevadorId)
    const sugerido = proxima ? sugerirTecnico(elevadorDaProxima, tecnicos, ocorrencias) : null

    const filtroAtual = FILTROS.find((f) => f.id === filtro)
    const visiveis = ordenarPorGravidade(ocorrencias.filter(filtroAtual.teste))
    const tecnicosLivres = tecnicos.filter((t) => tecnicoEstaLivre(t.id, ocorrencias))

    return (
        <div className="painel">
            <div className="painel-topo">
                <h1 className="painel-titulo">Painel</h1>
                <Link to="/gestor/nova" className="btn btn-dark">+ Nova ocorrência</Link>
            </div>

            <Cabine
                ocorrencia={proxima}
                elevador={elevadorDaProxima}
                sugerido={sugerido}
                agora={agora}
                naFila={filaAbertas.length - 1}
            />

            {alertas.length > 0 && (
                <div className="alert alert-warning" role="alert">
                    {alertas.length === 1 ? '1 alerta preditivo em aberto.' : `${alertas.length} alertas preditivos em aberto.`}{' '}
                    <Link to="/gestor/alertas" className="alert-link">Ver alertas</Link>
                </div>
            )}

            <div className="painel-corpo">
                <section aria-labelledby="ocorrencias-titulo">
                    <h2 id="ocorrencias-titulo" className="painel-secao-titulo">Ocorrências</h2>

                    <div className="painel-filtros" role="group" aria-label="Filtrar ocorrências">
                        {FILTROS.map((f) => (
                            <button
                                type="button"
                                key={f.id}
                                className={'painel-filtro' + (f.id === filtro ? ' painel-filtro--ativo' : '')}
                                aria-pressed={f.id === filtro}
                                onClick={() => setFiltro(f.id)}
                            >
                                <span>{f.nome}</span>
                                <strong>{ocorrencias.filter(f.teste).length}</strong>
                            </button>
                        ))}
                    </div>

                    {visiveis.length === 0 ? (
                        <p className="painel-vazio">
                            Nenhuma ocorrência neste filtro.{' '}
                            <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setFiltro('todas')}>
                                Ver todas
                            </button>
                        </p>
                    ) : (
                        <table className="table table-hover align-middle painel-tabela">
                            <thead>
                                <tr>
                                    <th scope="col">Ocorrência</th>
                                    <th scope="col">Local</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Técnico</th>
                                    <th scope="col">Prazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visiveis.map((o) => {
                                    const severidade = SEVERIDADES[o.severidade]
                                    const elevador = acharElevador(o.elevadorId)
                                    const tecnico = tecnicos.find((t) => t.id === o.tecnicoId)

                                    return (
                                        <tr
                                            key={o.id}
                                            className="painel-linha"
                                            onClick={() => navigate('/gestor/ocorrencia/' + o.id)}
                                        >
                                            <td className="painel-celula-id">
                                                <Link to={'/gestor/ocorrencia/' + o.id}>{o.id}</Link>
                                                <span className={'badge ' + severidade.cor}>{severidade.texto}</span>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{elevador.predio}, {elevador.estado}</div>
                                                <div className="text-body-secondary">{TIPOS[o.tipo]}</div>
                                            </td>
                                            <td><Etapas status={o.status} /></td>
                                            <td>{tecnico ? tecnico.nome : <span className="text-body-secondary">Sem técnico</span>}</td>
                                            <td><Prazo ocorrencia={o} agora={agora} /></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </section>

                <aside className="painel-equipe" aria-labelledby="equipe-titulo">
                    <h2 id="equipe-titulo" className="painel-secao-titulo">Técnicos</h2>
                    <p className="text-body-secondary">{tecnicosLivres.length} de {tecnicos.length} livres</p>

                    <ul className="painel-estados">
                        {tecnicos.map((t) => {
                            const atual = ocorrencias.find((o) => o.tecnicoId === t.id && emAtendimento(o))

                            return (
                                <li
                                    key={t.id}
                                    className={atual ? 'painel-estado' : 'painel-estado painel-estado--livre'}
                                    title={t.nome}
                                >
                                    <strong>{t.estado}</strong>
                                    <span>{atual ? atual.id : 'Livre'}</span>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
            </div>
        </div>
    )
}

export default Painel
