import React from "react";
import { useNavigate } from 'react-router-dom';
import './NIB.css';

function NIB() {
    const navigate = useNavigate();
    
    return (
        <div className="nib-container">
          <h1>NIB </h1>
          <p>Aquí va el registro de neonatos inoculados.</p>
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
export default NIB;