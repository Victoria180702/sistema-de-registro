import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Mantenimiento.css';
import logo2 from "../../assets/mosca.png"; // Asegúrate de tener esta imagen en la ruta correcta

function Mantenimiento() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica si estás en la ruta principal de Mantenimiento
  const isRootPath = location.pathname === "/Mantenimiento";

  return (
    <div className="mantenimiento-container">
      {isRootPath && (
        <>
          <h1>
            <img src={logo2} alt="mosca" className="logo2" />
            Registros de Mantenimiento
          </h1>
          <div className="welcome-message">
            <p>Esta es la página de registros de mantenimiento.</p>
          </div>
          <div className="botones">
            <button
              onClick={() => navigate("/Mantenimiento/LimpiezaDesinfeccionEquiposMaquinariaPesada")}
              className="back-button"
            >
              1- Limpieza y Desinfeccion de Equipos Maquinaria Pesada
            </button>
            
            <button onClick={() => navigate(-1)} className="back-button">
              Volver al Menú Principal
            </button>
          </div>
        </>
      )}

      {/* Aquí se renderizarán las subrutas */}
      <Outlet />
    </div>
  );
}

export default Mantenimiento;