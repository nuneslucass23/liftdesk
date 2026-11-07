import { Link } from "react-router-dom";

function Inicio() {
    return (
        <div className="text-center py-5">
            <h1>LiftDesk</h1>
            <p className="text-secondary">Gestão de ocorrências de elevadores</p>
            <div className="d-flex justify-content-center gap-3 mt-4">
                <Link to="/gestor" className="btn btn-dark btn-lg">Sou gestor</Link>
                <Link to="/tecnico" className="btn btn-outline-dark btn-lg">Sou técnico</Link>
            </div>
        </div>
    )
}

export default Inicio;