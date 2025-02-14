import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { PrimeReactProvider } from 'primereact/api';   
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';  

//imports de las paginas principales
import Login from './pages/Login/PagesLogin.jsx';
import MenuPrincipal from './pages/MenuPrincipal/PagesMenuPrincipal.jsx';

//imports paginas Hatchery
import Hatchery from './pages/Hatchery/PagesHatchery.jsx';
import ColectaInvernadero from './pages/Hatchery/Registros/PagesColectaInvernadero.jsx';
import IngresoPPInvernadero from './pages/Hatchery/Registros/PagesIngresoPPInvernadero.jsx';
import NIB from './pages/Hatchery/Registros/PagesNIB.jsx';
import ControlRendimientoCosechaReproduccion from './pages/Hatchery/Registros/PagesControlRendimientoCosechaReproduccion.jsx';

//imports paginas Dieta
import Dieta from './pages/Dieta/PagesDieta.jsx';
import ControlInventarioCascaraPila from './pages/Dieta/Registros/PagesControlInventarioCascaraPila.jsx';

//imports paginas Gerencia
import Gerencia from './pages/Gerencia/PagesGerencia.jsx';
import GestionUsuarios from './pages/Gerencia/Registros/PagesGestionUsuarios.jsx'


const Layout = () => {
  return (
    <div>
      <Outlet/>
    </div>
  )
}

const router = createBrowserRouter([{
  path: `/`,
  element: <Layout />, // Componente general que incluye el Outlet
  children: [
    { path: `/`, element: <Login /> }, // Página principal (login)
    { path: `/MenuPrincipal`, element: <MenuPrincipal /> },

    // Grupo de rutas de Hatchery
    {
      path: `/Hatchery`,
      element: <Hatchery />, // Componente principal de Hatchery
      children: [
        {
          path: `IngresoPPInvernadero`,
          element: <IngresoPPInvernadero />,
        },
        {
          path: `ColectaInvernadero`,
          element: <ColectaInvernadero />,
        },
        {
          path: `NIB`,
          element: <NIB />,
        },
        {
          path: `ControlRendimientoCosechaReproduccion`,
          element: <ControlRendimientoCosechaReproduccion />,
        },
      ],
    },

    
    // Grupo de rutas de Dieta
    {
      path: `/Dieta`,
      element: <Dieta />, // Componente principal de Dieta
      children: [
        {
          path: `ControlInventarioCascaraPila`,
          element: <ControlInventarioCascaraPila />,
        },
        
      ],
    },


    // Grupo de rutas de Gerencia
    {
      path: `/Gerencia`,
      element: <Gerencia />, // Componente principal de Gerencia
      children: [
        {
          path: `GestionUsuarios`,
          element: <GestionUsuarios />,
        },
        
      ],
    }

   
    
]
}])


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrimeReactProvider>
    <RouterProvider router={router}/>
    </PrimeReactProvider>
  // <React.StrictMode>
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={<Login />} />
  //       <Route path="/MenuPrincipal" element={<MenuPrincipal />} />
  //       <Route path="/Calidad" element={<Calidad />} />

  //       <Route path="/Hatchery" element={<Hatchery />} />
  //       <Route path="/IngresoPPInvernadero" element={<IngresoPPInvernadero />} />
  //       <Route path="/ColectaInvernadero" element={<ColectaInvernadero />} />
  //       <Route path="/NIB" element={<NIB />} />


  //       <Route path="/Horno" element={<Horno />} />
  //       <Route path="/Dieta" element={<Dieta />} />
  //       <Route path="/Cosecha" element={<Cosecha />} />
  //       <Route path="/Mantenimiento" element={<Mantenimiento />} /> 
        


  //     </Routes>
  //   </BrowserRouter>
  // </React.StrictMode>
);