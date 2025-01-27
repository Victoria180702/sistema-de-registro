import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MenuPrincipal from './MenuPrincipal';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/MenuPrincipal" element={<MenuPrincipal />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);