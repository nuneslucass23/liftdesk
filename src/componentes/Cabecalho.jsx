import { Link } from "react-router-dom";
import { reiniciarDados } from "../dados.js"

function Cabecalho() {
    function reiniciar() {
        if (window.confirm("Reiniciar a demonstração? Todas as mudanças serão perdidas.")) {
            reiniciarDados()
            window.location.reload()
        }
    }

    return (
        <header className="bg-dark py-3 mb-4">
            <div className="container d-flex flex-wrap align-items-center gap-3">
                <Link to="/" className="text-white fw-bold text-decoration-none">LiftDesk</Link>
                <Link to="/gestor" className="btn btn-outline-light">Painel</Link>
                <Link to="/gestor/nova" className="btn btn-outline-light">Nova ocorrência</Link>
                <Link to="/gestor/alertas" className="btn btn-outline-light">Alertas</Link>
                <Link to="/tecnico" className="btn btn-outline-light">Minhas tarefas</Link>
                <button className="btn btn-outline-light ms-auto" onClick={reiniciar}>Reiniciar demonstração</button>
            </div>
        </header>
    )
}

export default Cabecalho;
