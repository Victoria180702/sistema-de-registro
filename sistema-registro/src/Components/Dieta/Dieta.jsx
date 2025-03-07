import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Dieta.css';
import logo2 from "../../assets/mosca.png";


function Dieta() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica si estás en la ruta principal de Dieta
  const isRootPath = location.pathname === "/Dieta";

  return (
    <div className="dieta-container">
      

      {isRootPath && (
        
        <>
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Registros de Dieta
        </h1>
        <div className="welcome-message">
          <p>Esta es la página de registros de dieta.</p>
          </div>
          <div className="botones">
            <button
              onClick={() => navigate("/Dieta/ControlInventarioCascaraPila")}
              className="back-button"
            >
              1- Control Inventario Cáscara en Pila
            </button>
            <button
              onClick={() => navigate("/Dieta/ControlRendimientoDietaySiembra")}
              className="back-button"
            >
              2- Control Rendimiento Dieta y Siembra
            </button>

            <button
              onClick={() => navigate("/Dieta/ControlMovimientosCajasProceso")}
              className="back-button"
            >
              3- Control Movimientos Cajas en Proceso
            </button>

            <button
              onClick={() => navigate("/ControlTiempos")}
              className="back-button"
            >
             4- Control de Tiempos Perdidos
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

export default Dieta;