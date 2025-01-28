import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MenuPrincipal from './MenuPrincipal';
import Calidad from './Calidad';

import Hatchery from './Hatchery';
import IngresoPPInvernadero from './IngresoPPInvernadero';
import ColectaInvernadero from './ColectaInvernadero';
import NIB from './NIB';


import Horno from './Horno';
import Dieta from './Dieta';
import Cosecha from './Cosecha';
import Mantenimiento from './Mantenimiento';


import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/MenuPrincipal" element={<MenuPrincipal />} />
        <Route path="/Calidad" element={<Calidad />} />

        <Route path="/Hatchery" element={<Hatchery />} />
        <Route path="/IngresoPPInvernadero" element={<IngresoPPInvernadero />} />
        <Route path="/ColectaInvernadero" element={<ColectaInvernadero />} />
        <Route path="/NIB" element={<NIB />} />


        <Route path="/Horno" element={<Horno />} />
        <Route path="/Dieta" element={<Dieta />} />
        <Route path="/Cosecha" element={<Cosecha />} />
        <Route path="/Mantenimiento" element={<Mantenimiento />} /> 
        


      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);