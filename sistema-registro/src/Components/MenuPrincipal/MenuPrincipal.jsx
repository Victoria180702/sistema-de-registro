import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MenuPrincipal.css';
import logo from '../../assets/Pronuvo_logos_sin_fondo_6.png green.png';

function MenuPrincipal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || {}; // Obtener el nombre de usuario desde el estado

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    navigate('/'); // Redirigir a la pantalla de Login
  };

  return (
    <div className="menu-principal">
      <h1>Menú Principal</h1>
      <div className="botones">
        {/* Solo mostrar "Opción 1" si el usuario es "Calidad01" */}
        {username === 'Calidad01' && (
          <button onClick={() => navigate('/Calidad')}>Registros Calidad</button>
        )}
        {username === 'Hatchery01' && (
          <button onClick={() => navigate('/Hatchery')}>Registros Hatchery </button>
        )}
        {username === 'Horno01' && (
          <button onClick={() => navigate('/Horno')}>Registros Horno </button>
        )}
        {username === 'Dieta01' && (
          <button onClick={() => navigate('/Dieta')}>Registros Dieta </button>
        )}
        {username === 'Cosecha01' && (
          <button onClick={() => navigate('/Cosecha')}>Registros Cosecha </button>
        )}
        {username === 'Mantenimiento01' && (
          <button onClick={() => navigate('/Mantenimiento')}>Registros Mantenimiento </button>
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