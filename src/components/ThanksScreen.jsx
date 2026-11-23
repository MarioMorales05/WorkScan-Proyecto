import React from 'react';

export default function ThanksScreen({ onFinish }) {
  return (
    <section className="thanks">
      <div className="thanks-icon">✓</div>
      <h1>¡Gracias por participar!</h1>
      <p>
        Tus respuestas se registraron de forma <strong>anónima</strong>.
        Los resultados se presentarán únicamente de forma agrupada.
      </p>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onFinish}>
        Volver al inicio
      </button>
    </section>
  );
}