import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dieta.css';

function Dieta() {
  const navigate = useNavigate();

  return (
    <div className="dieta-container">
      <h1>Registros de Dieta</h1>
      <p>Esta es la página de registros de dieta.</p>
      <button onClick={() => navigate('/MenuPrincipal')} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Dieta;