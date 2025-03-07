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
import ControlRendimientoDietaySiembra from './pages/Dieta/Registros/PagesControlRendimientoDietaySiembra.jsx';

//imports paginas Gerencia
import Gerencia from './pages/Gerencia/PagesGerencia.jsx';
import GestionUsuarios from './pages/Gerencia/Registros/PagesGestionUsuarios.jsx';

//control de tiempos imports
import ControlTiempos from './pages/ControlTiempos/PagesControlTiempos.jsx';

//imports de paginas de horno
import Horno from './pages/Horno/PagesHorno.jsx';
import ControlRendimientoSecadoHornoMultilevel from './pages/Horno/Registros/PagesControlRendimientoSecadoHornoMultilevel.jsx';
import ControlRendimientoSecadoHornoMicroondas from './pages/Horno/Registros/PagesControlRendimientoSecadoHornoMicroondas.jsx';
import ControlOperativoHornoMultilevel from './pages/Horno/Registros/PagesControlOperativoHornoMultilevel.jsx';
import ControlRendimientoProductoTerminado from './pages/Horno/Registros/PagesControlRendimientoProductoTerminado.jsx'

//imports de paginas de Calidad
import Calidad from './pages/Calidad/PagesCalidad.jsx';
import ControlCalidadCosecha from './pages/Calidad/Registros/PagesControlCalidadCosecha.jsx';
import RecepcionMateriasPrimas from './pages/Calidad/Registros/PagesRecepcionMateriasPrimas.jsx';
import ControlNeonatos from './pages/Calidad/Registros/PagesControlNeonatos.jsx';
import ControlCalidadEngordeHatchery from './components/Calidad/Registros/ControlCalidadEngordeHatchery.jsx';
import ControlCalidadEngorde from './components/Calidad/Registros/ControlCalidadEngorde.jsx';
import ControlCalidadHornoMicroondas from './components/Calidad/Registros/ControlCalidadHornoMicroondas.jsx';

//imports de paginas de Mantenimiento
import Mantenimiento from './pages/Mantenimiento/PagesMantenimiento.jsx';
import LimpiezaDesinfeccionEquiposMaquinariaPesada from './pages/Mantenimiento/Registros/PagesLimpiezaDesinfeccionEquiposMaquinariaPesada.jsx';
import ReporteInspeccion from './pages/Mantenimiento/Registros/PagesReporteInspeccion.jsx'
import ReporteInspeccionSemanal from './pages/Mantenimiento/Registros/PagesReporteInspeccionSemanal.jsx'
import PreoperacionalTeletruk from './pages/Mantenimiento/Registros/PagesPreoperacionalTeletruk.jsx'

//imports de paginas de Cosecha
import Cosecha from './pages/Cosecha/PagesCosecha.jsx';
import ControlRendimientoCosechayFrass from './pages/Cosecha/Registros/PagesControlRendimientoCosechayFrass.jsx'



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
        {
          path: `ControlRendimientoDietaySiembra`,
          element: <ControlRendimientoDietaySiembra />,
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
    },

   // Grupo de rutas de Control de Tiempos
   {
    path: `/ControlTiempos`,
    element: <ControlTiempos />, // único componente registro de ControlTiempos
  },


  // Grupo de rutas de Horno
  {
    path: `/Horno`,
    element: <Horno />, // Componente principal de Horno
    children: [
      {
        path: `ControlRendimientoSecadoHornoMultilevel`,
        element: <ControlRendimientoSecadoHornoMultilevel />,
      },
      {
        path: `ControlRendimientoSecadoHornoMicroondas`,
        element: <ControlRendimientoSecadoHornoMicroondas />,
      },
      {
        path: `ControlOperativoHornoMultilevel`,
        element: <ControlOperativoHornoMultilevel />,
      },
      {
        path: `ControlRendimientoProductoTerminado`,
        element: <ControlRendimientoProductoTerminado />,
      },
    ],
  },
  

  // Grupo de rutas de Calidad
  {
    path: `/Calidad`,
    element: <Calidad />, // Componente principal de Calidad
    children: [
      {
        path: `ControlCalidadCosecha`,
        element: <ControlCalidadCosecha />,
      },
      {
        path: `RecepcionMateriasPrimas`,
        element: <RecepcionMateriasPrimas />,
      },
      {
        path: `ControlNeonatos`,
        element: <ControlNeonatos />,
      },
      {
        path: `ControlCalidadEngordeHatchery`,
        element: <ControlCalidadEngordeHatchery />,
      },
      {
        path: `ControlCalidadEngorde`,
        element: <ControlCalidadEngorde />,
      },
      {
        path: `ControlCalidadHornoMicroondas`,
        element: <ControlCalidadHornoMicroondas />,
      }

    ],
  },


  // Grupo de rutas de Mantenimiento
  {
    path: `/Mantenimiento`,
    element: <Mantenimiento />, // Componente principal de Mantenimiento
    children: [
      {
        path: `LimpiezaDesinfeccionEquiposMaquinariaPesada`,
        element: <LimpiezaDesinfeccionEquiposMaquinariaPesada />,
      },
      {
        path: `ReporteInspeccion`,
        element: <ReporteInspeccion />,
      },
      {
        path: `ReporteInspeccionSemanal`,
        element: <ReporteInspeccionSemanal />,
      },
      {
        path: `PreoperacionalTeletruk`,
        element: <PreoperacionalTeletruk/>,
      }


    ],
  },

  {
    path: `/Cosecha`,
    element: <Cosecha />, // Componente principal de Gerencia
    children: [
      {
        path: `ControlRendimientoCosechayFrass`,
        element: <ControlRendimientoCosechayFrass />,
      },
      
    ],
  },

    
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