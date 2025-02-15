import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MenuPrincipal.css';
import logo from '../../assets/Pronuvo_logos_sin_fondo_6.png green.png';
import logo2 from '../../assets/mosca.png';


function MenuPrincipal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { departamento } = location.state || {}; // Obtener el nombre de usuario desde el estado

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    navigate('/'); // Redirigir a la pantalla de Login
  };

  return (
    <div className="menu-principal">
      <h1>
        <img src={logo2} alt="mosca" className="logo2" /> Menú Principal
      </h1>
      <div className="botones">
        {/* Solo mostrar "Opción 1" si el usuario pertenece al departamento de Calidad" */}
        {departamento === 'Calidad' && (
          <button onClick={() => navigate('/Calidad')}>Registros Calidad</button>
        )}
        {departamento === 'Hatchery' && (
          <button onClick={() => navigate('/Hatchery')}>Registros Hatchery </button>
        )}
        {departamento === 'Horno' && (
          <button onClick={() => navigate('/Horno')}>Registros Horno </button>
        )}
        {departamento === 'Dieta' && (
          <button onClick={() => navigate('/Dieta')}>Registros Dieta </button>
        )}
        {departamento === 'Cosecha' && (
          <button onClick={() => navigate('/Cosecha')}>Registros Cosecha </button>
        )}
        {departamento === 'Mantenimiento' && (
          <button onClick={() => navigate('/Mantenimiento')}>Registros Mantenimiento </button>
        )}
        {departamento === 'Gerencia' && (
          <button onClick={() => navigate('/Gerencia')}>Información Gerencia </button>
        )}
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
         {/* Logo en la esquina inferior derecha */}
        <img src={logo} alt="Logo de mi aplicación" className="logo" />
    </div>

  );
}

export default MenuPrincipal;