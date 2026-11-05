import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
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

// as regras de validação do formulário
const schema = yup.object({
    elevadorId: yup.string().required('Escolha o elevador.'),
    tipo: yup.string().required('Escolha o tipo da ocorrência.'),
    descricao: yup
        .string()
        .trim()
        .required('Descreva o problema.')
        .min(10, 'Descreva com pelo menos 10 letras.'),
    passageiroPreso: yup.boolean(),
})

// monta a ocorrência nova com os valores do formulário (só roda quando clica em Registrar)
function montarOcorrencia(valores) {
    const agora = Date.now()

    return {
        id: 'OC-' + agora,
        elevadorId: valores.elevadorId,
        tipo: valores.tipo,
        descricao: valores.descricao,
        passageiroPreso: valores.passageiroPreso,
        severidade: calcularSeveridade(valores.tipo, valores.passageiroPreso),
        status: 'aberta',
        tecnicoId: null,
        criadaEm: agora,
        observacao: '',
    }
}

function NovaOcorrencia() {
    const [dados, setDados] = useState(lerDados)
    const navigate = useNavigate()

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            elevadorId: '',
            tipo: '',
            descricao: '',
            passageiroPreso: false,
        },
    })

    // lê o tipo e a caixa em tempo real, para mostrar a classificação enquanto preenche
    const tipo = useWatch({ control, name: 'tipo' })
    const passageiroPreso = useWatch({ control, name: 'passageiroPreso' })
    const severidade = calcularSeveridade(tipo, passageiroPreso)
    const mostrarClassificacao = tipo !== '' || passageiroPreso

    function registrar(valores) {
        const nova = montarOcorrencia(valores)
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

            <form onSubmit={handleSubmit(registrar)} noValidate>
                <div className="card">
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="elevador">Elevador</label>
                            <select
                                className={'form-select' + (errors.elevadorId ? ' is-invalid' : '')}
                                id="elevador"
                                aria-invalid={errors.elevadorId ? 'true' : 'false'}
                                aria-describedby="elevador-erro"
                                {...register('elevadorId')}
                            >
                                <option value="">Selecione um elevador</option>
                                {dados.elevadores.map((elevador) => (
                                    <option key={elevador.id} value={elevador.id}>
                                        {elevador.predio} ({elevador.estado})
                                    </option>
                                ))}
                            </select>
                            <span id="elevador-erro" className="text-danger small">
                                {errors.elevadorId?.message}
                            </span>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="tipo">Tipo</label>
                            <select
                                className={'form-select' + (errors.tipo ? ' is-invalid' : '')}
                                id="tipo"
                                aria-invalid={errors.tipo ? 'true' : 'false'}
                                aria-describedby="tipo-erro"
                                {...register('tipo')}
                            >
                                <option value="">Selecione o tipo</option>
                                {tipos.map((item) => (
                                    <option key={item.valor} value={item.valor}>
                                        {item.nome}
                                    </option>
                                ))}
                            </select>
                            <span id="tipo-erro" className="text-danger small">
                                {errors.tipo?.message}
                            </span>
                        </div>

                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="passageiroPreso"
                                {...register('passageiroPreso')}
                            />
                            <label className="form-check-label" htmlFor="passageiroPreso">
                                Há passageiro preso?
                            </label>
                        </div>

                        <div className="mb-3">
                            <label className="form-label" htmlFor="descricao">Descrição</label>
                            <textarea
                                className={'form-control' + (errors.descricao ? ' is-invalid' : '')}
                                id="descricao"
                                rows="4"
                                aria-invalid={errors.descricao ? 'true' : 'false'}
                                aria-describedby="descricao-ajuda descricao-erro"
                                {...register('descricao')}
                            />
                            <div id="descricao-ajuda" className="form-text">
                                Informe pelo menos 10 letras.
                            </div>
                            <span id="descricao-erro" className="text-danger small">
                                {errors.descricao?.message}
                            </span>
                        </div>

                        <p className="alert alert-secondary mb-0">
                            {mostrarClassificacao
                                ? `Classificação automática: ${nomesSeveridade[severidade]} · prazo de ${prazoEmMinutos(severidade)} min`
                                : 'Escolha o tipo para ver a classificação automática.'}
                        </p>
                    </div>
                </div>

                <button className="btn btn-primary mt-3" type="submit">
                    Registrar
                </button>
            </form>
        </div>
    )
}

export default NovaOcorrencia
