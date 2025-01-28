import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Mantenimiento.css';

function Mantenimiento() {
  const navigate = useNavigate();

  return (
    <div className="mantenimiento-container">
      <h1>Registros de Mantenimiento</h1>
      <p>Esta es la página de registros de mantenimiento.</p>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Mantenimiento;