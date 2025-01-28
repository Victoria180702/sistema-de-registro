import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hatchery.css';

function Hatchery() {
  const navigate = useNavigate();

  return (
    <div className="hatchery-container">
      <h1>Registros de Hatchery</h1>
      <p>Esta es la página de registros de hatchery.</p>
      <button onClick={() => navigate('/IngresoPPInvernadero')} className="back-button">
        Ingreso PP Invernadero
      </button>
      <br></br>
      <button onClick={() => navigate('/ColectaInvernadero')} className="back-button">
        Colecta de Invernadero -embudo-
      </button>
      <br></br>
      <button onClick={() => navigate('/NIB')} className="back-button">
        NIB -neonatos inoculados-
      </button>
      <br></br>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default Hatchery;