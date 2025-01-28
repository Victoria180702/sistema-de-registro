import { useState, useEffect} from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import logo from './assets/Pronuvo_logos_sin_fondo_6.png green.png';
import logo2 from './assets/mosca.png';
import supabase from './supabaseClient';

function App() {
  const [usuarios, setUsuarios] = useState([]);

  const getUsuarios = async() => { 
    
    const { data, error } = await supabase
    .from('Usuarios')
    .select()

    setUsuarios(data)
    
    console.log(data)
  }
    
  useEffect(() => {

    getUsuarios();

  }, []);

  // Lista de usuarios quemados
  // const usuarios = [
  //   { username: 'Calidad01', password: 'ProNuvoCa01' },
  //   { username: 'Hatchery01', password: 'ProNuvoHa01' },
  //   { username: 'Horno01', password: 'ProNuvoHo01' },
  //   { username: 'Dieta01', password: 'ProNuvoDi01' },
  // ];

  // Estados para el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const navigate = useNavigate();

  // Función de autenticación
  const autenticarUsuario = (e) => {
    e.preventDefault(); // Evitar que la página se recargue
    const usuarioValido = usuarios.find(
      (usuario) => usuario.username === username && usuario.password === password
    );

    if (usuarioValido) {
      setMensaje(`¡Bienvenido, ${username}!`);
       // Redirigir al menú principal y pasar el nombre de usuario
       navigate('/MenuPrincipal', { state: { username } });
    
       // Limpiar los campos de usuario y contraseña
       setUsername('');
       setPassword('');

      } else {
      setMensaje('Usuario o contraseña incorrectos.');
       // Limpiar los campos de usuario y contraseña
       setUsername('');
       setPassword('');
    
    }
  };

  return (
    <div>
      <div className="login-container">

        <img src={logo2} alt="mosca" className="logo2" /> 

        <h1>Acceso</h1>
        <form onSubmit={autenticarUsuario}>
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>
        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
  

   

      {/* Logo en la esquina inferior derecha */}
      <img src={logo} alt="Logo de mi aplicación" className="logo" />
    </div>
  );
  
}


export default App;
