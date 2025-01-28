import React from "react";
import { useNavigate } from 'react-router-dom';
import './IngresoPPInvernadero.css';

function IngresoPPInvernadero() {
    const navigate = useNavigate();
    
    return (
        <div className="mantenimiento-container">
          <h1>Ingreso PP a Invernadero</h1>
          <p>Aquí va el registro de Ingreso de pre-pupas al invernadero.</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver al Menú de Registros
          </button>
          <br></br>
          <button onClick={() => navigate(-2)} className="back-button">
            Volver al Menú Principal
          </button>
        </div>
      );
}
export default IngresoPPInvernadero;