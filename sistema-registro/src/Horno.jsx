import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Horno.css';

function Horno() {
  const navigate = useNavigate();

  return (
    <div className="horno-container">
      <h1>Registros de Horno</h1>
      <p>Esta es la página de registros de horno.</p>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Horno;