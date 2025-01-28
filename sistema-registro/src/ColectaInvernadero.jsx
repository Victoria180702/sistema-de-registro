import React from "react";
import { useNavigate } from 'react-router-dom';
import './ColectaInvernadero.css';

function ColectaInvernadero() {
    const navigate = useNavigate();
    
    return (
        <div className="colectainvernadero-container">
          <h1>Colecta Invernadero</h1>
          <p>Aquí va el registro de colecta de invernadero.</p>
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
export default ColectaInvernadero;