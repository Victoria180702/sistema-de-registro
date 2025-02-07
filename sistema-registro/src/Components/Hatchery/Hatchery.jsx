import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Hatchery.css';

function Hatchery() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica si estás en la ruta principal de Hatchery
  const isRootPath = location.pathname === "/Hatchery";

  return (
    <div className="hatchery-container">
      

      {isRootPath && (
        
        <>
        <h1>Registros de Hatchery</h1>
          <p>Esta es la página de registros de hatchery.</p>
          <div className="button-container">
            <button
              onClick={() => navigate("/Hatchery/IngresoPPInvernadero")}
              className="back-button"
            >
              1- Ingreso de Pre-Pupas a Invernadero
            </button>
            <br />
            <button
              onClick={() => navigate("/Hatchery/ColectaInvernadero")}
              className="back-button"
            >
              2- Colecta de Eggies del Invernadero
            </button>
            <br />
            <button
              onClick={() => navigate("/Hatchery/NIB")}
              className="back-button"
            >
              3- NIB - Neonatos Inoculados
            </button>
            <br />
            <button
              onClick={() => navigate("/Hatchery/ControlRendimientoCosechaReproduccion")}
              className="back-button"
            >
              4- Control de Rendimiento Cosecha-Reproducción
            </button>
            <br />
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

export default Hatchery;