import React, { useState } from 'react';

export default function CodeScreen({ onValid }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) {
      setError('El código debe tener al menos 4 caracteres.');
      return;
    }
    setError('');
    onValid(clean);
  };

  return (
    <section>
      <h1>Ingresa tu código</h1>
      <p>
        Recibiste un código de un solo uso en sobre cerrado. Ingrésalo para
        comenzar la encuesta.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          className="code-input"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={12}
          placeholder="ABC123"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
        />
        {error && (
          <p style={{ color: '#C62828', fontSize: 13, marginTop: -6 }}>{error}</p>
        )}
        <button className="btn btn-primary" type="submit" disabled={code.trim().length < 4}>
          Validar código
        </button>
      </form>
    </section>
  );
}