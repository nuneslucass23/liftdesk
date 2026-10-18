import elevadores from './dados/elevadores.json'
import tecnicos from './dados/tecnicos.json'
import ocorrenciasIniciais from './dados/ocorrencias.json'

const CHAVE = 'liftdesk'

export function reiniciarDados() {
    const ocorrencias = ocorrenciasIniciais.map((o) => ({
        ...o,
        criadaEm: Date.now() - o.minutosAtras * 60 * 1000,
    }))
    const dados = { elevadores, tecnicos, ocorrencias, alertasTratados: [] }
    salvarDados(dados)
    return dados
}

export function lerDados() {
    const texto = localStorage.getItem(CHAVE)
    if (!texto)
        return reiniciarDados()
    try {
        return JSON.parse(texto)
    } catch {
        return reiniciarDados()
    }
}

export function salvarDados(dados) {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
}