import React, { useState } from 'react';

export default function LoginScreen({ onEntrarEmpleado, onLoginGerente }) {
  const [modo, setModo] = useState('inicio'); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGerenteSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setError('');
      onLoginGerente();
    } else {
      setError('Contraseña incorrecta.');
    }
  };

  if (modo === 'gerente') {
    return (
      <div className="login-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '40px 30px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Acceso Gerente</h1>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: '#666' }}>Ingresa tu contraseña para recolectar los datos.</p>
          
          <form onSubmit={handleGerenteSubmit}>
            <input
              type="password"
              className="code-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p style={{ color: '#C62828', fontSize: 13, marginTop: -6, marginBottom: '15px' }}>{error}</p>}
            
            <button className="btn btn-primary" type="submit" disabled={password.length < 4}>
              Entrar al Panel
            </button>
            <button type="button" className="btn btn-ghost" style={{ marginTop: 15 }} onClick={() => setModo('inicio')}>
              Volver al inicio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="login-wrapper" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1, 
        width: '100%',
        padding: '20px'
      }}
    >
      
      {/* Tarjeta principal */}
      <div 
        className="card" 
        style={{ 
          maxWidth: '600px', 
          width: '100%', 
          textAlign: 'center', 
          padding: '50px 40px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
        }}
      >
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333', fontWeight: 'normal' }}>Bienvenido a WorkScan</h1>
        <p style={{ fontSize: '16px', marginBottom: '40px', color: '#757575' }}>
          Medición de clima laboral · Kafito
        </p>
        
        <button 
          className="btn btn-primary" 
          style={{ fontSize: '18px', minHeight: '60px', marginBottom: '20px', borderRadius: '30px' }} 
          onClick={onEntrarEmpleado}
        >
          Comenzar Encuesta
        </button>

        <p style={{ fontSize: '13px', color: '#9E9E9E', margin: 0 }}>
          No se te pedirá tu nombre. Tus respuestas son 100% anónimas 🔒
        </p>
      </div>

      {/* Botón del gerente: afuera de la tarjeta pero centrado justo abajo */}
      <div style={{ marginTop: '20px' }}>
        <button 
          className="btn btn-ghost" 
          style={{ 
            fontSize: '14px', 
            color: '#1B5E20', 
            background: 'rgba(255,255,255,0.9)', 
            padding: '10px 24px', 
            borderRadius: '25px',
            fontWeight: 'bold',
            width: 'auto'
          }} 
          onClick={() => setModo('gerente')}
        >
          ¿Eres el gerente? Acceso administrativo ⚙️
        </button>
      </div>

    </div>
  );
}