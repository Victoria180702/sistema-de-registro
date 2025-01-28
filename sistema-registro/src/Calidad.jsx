import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Calidad.css';


function Calidad() {
  const navigate = useNavigate();
 

  return (
    <div className="calidad-container">
      <h1>Registros de Calidad</h1>
      <p>Esta es la página de registros de calidad.</p>
      <button onClick={() => navigate (-1)} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Calidad;