import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cosecha.css';

function Cosecha() {
  const navigate = useNavigate();

  return (
    <div className="cosecha-container">
      <h1>Registros de Cosecha</h1>
      <p>Esta es la página de registros de cosecha.</p>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Cosecha;