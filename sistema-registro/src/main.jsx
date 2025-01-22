import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './FetchData.jsx'
import { PrimeReactProvider } from 'primereact/api';   
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';  
import Usuarios from './pages/Usuarios.jsx';
import Login from './pages/Login.jsx';

const Layout = () => {
  return (
    <div>
      <Outlet/>
    </div>
  )
}

const router = createBrowserRouter([{
  path:`/`,
  element:<Layout/>,
  children:[
    {
    path:`/`,
    element:<Login/>
  },
  {
    path:`/usuarios`,
    element:<Usuarios/>
  },
  // {
  //   path:`/`,
  //   element:<App/>
  // },
  // {
  //   path:`/`,
  //   element:<App/>
  // },
]
}])


createRoot(document.getElementById('root')).render(
  
    <PrimeReactProvider>
    <RouterProvider router={router}/>
    </PrimeReactProvider>
  
)
