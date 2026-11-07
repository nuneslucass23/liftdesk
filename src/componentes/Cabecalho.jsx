import { Link, NavLink } from "react-router-dom";
import { reiniciarDados } from "../dados.js"

function Cabecalho() {
    function reiniciar() {
        if (window.confirm("Reiniciar a demonstração? Todas as mudanças serão perdidas.")) {
            reiniciarDados()
            window.location.reload()
        }
    }

    return (
        <header className="topo">
            <div className="container topo-conteudo">
                <Link to="/" className="topo-marca">LiftDesk</Link>
                <nav className="topo-menu" aria-label="Menu principal">
                    <NavLink to="/gestor" end>Painel</NavLink>
                    <NavLink to="/gestor/nova">Nova ocorrência</NavLink>
                    <NavLink to="/gestor/alertas">Alertas</NavLink>
                    <NavLink to="/tecnico">Minhas tarefas</NavLink>
                </nav>
                <button className="topo-reiniciar" onClick={reiniciar}>Reiniciar demonstração</button>
            </div>
        </header>
    )
}

export default Cabecalho;
