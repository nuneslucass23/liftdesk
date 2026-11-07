import { Link } from "react-router-dom";

function Inicio() {
    return (
        <>
            <section className="inicio-hero">
                <div className="container">
                    <p className="inicio-sobretitulo">Gestão de ocorrências de elevadores</p>
                    <h1>O melhor atendimento é aquele que nunca precisou acontecer.</h1>
                    <div className="inicio-acoes">
                        <Link to="/gestor" className="btn btn-lg btn-gestor">Sou gestor</Link>
                        <Link to="/tecnico" className="btn btn-lg btn-tecnico">Sou técnico</Link>
                    </div>
                    <div className="inicio-losangos" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </section>

            <section className="inicio-recursos">
                <div>
                    <h2>Registrar</h2>
                    <p>Toda ocorrência é classificada e priorizada automaticamente.</p>
                </div>
                <div>
                    <h2>Despachar</h2>
                    <p>O sistema sugere o técnico e calcula o prazo de atendimento.</p>
                </div>
                <div>
                    <h2>Prever</h2>
                    <p>Padrões de anomalia viram alertas antes de a falha acontecer.</p>
                </div>
            </section>
        </>
    )
}

export default Inicio;
