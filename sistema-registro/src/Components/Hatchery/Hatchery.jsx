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
              Ingreso PP Invernadero
            </button>
            <br />
            <button
              onClick={() => navigate("/Hatchery/ColectaInvernadero")}
              className="back-button"
            >
              Colecta de Invernadero -embudo-
            </button>
            <br />
            <button
              onClick={() => navigate("/Hatchery/NIB")}
              className="back-button"
            >
              NIB -neonatos inoculados-
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