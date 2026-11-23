import React, { useState } from 'react';

export default function ConsentScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <section>
      <h1>Antes de comenzar</h1>
      <p>
        Este estudio busca conocer cómo percibes tu entorno de trabajo en
        <strong> Kafito</strong>. Tus respuestas son <strong>anónimas</strong>:
        no se solicita tu nombre, correo ni datos personales.
      </p>

      <div className="card">
        <h2>Información importante</h2>
        <p>
          <strong>Voluntariedad:</strong> puedes no participar o dejar de responder
          en cualquier momento, sin ninguna consecuencia en tu trabajo.
        </p>
        <p>
          <strong>Confidencialidad:</strong> no se recaban datos demográficos ni
          preguntas abiertas. El código de acceso no se asocia a tu persona.
        </p>
        <p>
          <strong>Anonimato:</strong> dado que el restaurante tiene pocas personas,
          el anonimato no puede garantizarse de forma absoluta; por ello se limitan
          los datos que se recaban. Los resultados se presentan solo de forma agrupada.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Uso de los datos:</strong> solo para este proyecto académico; al
          concluir la evaluación se eliminarán o conservarán únicamente de forma anonimizada.
        </p>
      </div>

      <label className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={{ marginTop: 4, width: 20, height: 20, accentColor: '#1B5E20' }}
        />
        <span style={{ fontSize: 14, lineHeight: 1.5 }}>
          He leído la información anterior, entiendo que mi participación es
          voluntaria y <strong>acepto participar</strong>.
        </span>
      </label>

      <button className="btn btn-primary" disabled={!checked} onClick={onAccept}>
        Acepto y continuar
      </button>
    </section>
  );
}