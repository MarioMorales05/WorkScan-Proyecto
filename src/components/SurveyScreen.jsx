import React, { useState } from 'react';
import { ITEMS, LIKERT, DIMENSIONS } from '../data/items.js';

export default function SurveyScreen({ answers, setAnswers, onFinish }) {
  const [dimIndex, setDimIndex] = useState(0);
  const [error, setError] = useState('');
  
  // Obtenemos la dimensión actual y sus reactivos
  const currentDim = DIMENSIONS[dimIndex];
  const dimItems = currentDim.items.map(itemNumber => 
    ITEMS.find(i => i.n === itemNumber)
  );
  
  const totalDims = DIMENSIONS.length;
  const progress = ((dimIndex + 1) / totalDims) * 100;

  const select = (itemNumber, value) => {
    setAnswers({ ...answers, [itemNumber]: value });
    setError('');
  };

  const next = () => {
    // Validar que se hayan contestado al menos algunas de este bloque
    // (Para el avance, solo validaremos que no pase del 20% global al final)
    if (dimIndex < totalDims - 1) {
      setDimIndex(dimIndex + 1);
      window.scrollTo(0, 0); // Subir al inicio al cambiar de bloque
    } else {
      // Validación del 20% al final del cuestionario completo
      const answeredCount = Object.keys(answers).length;
      const totalItems = ITEMS.length;
      const missingCount = totalItems - answeredCount;
      const missingPercentage = (missingCount / totalItems) * 100;

      if (missingPercentage > 20) {
        setError(`Has dejado ${missingCount} preguntas en blanco en total. El sistema no permite enviar si faltan más del 20%.`);
      } else {
        onFinish();
      }
    }
  };

  return (
    <section>
      {/* Barra de progreso por dimensión */}
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-label">
        Dimensión {dimIndex + 1} de {totalDims}: {currentDim.name}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, color: '#1B5E20', marginBottom: 20 }}>
          {currentDim.name}
        </h2>
        
        <p style={{ fontSize: 13, color: '#757575', marginBottom: 20 }}>
          Por favor, responde qué tan seguido ocurre lo siguiente en tu trabajo:
        </p>

        {/* Lista de preguntas de esta dimensión */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {dimItems.map((item) => (
            <div key={item.n} style={{ borderBottom: '1px solid #EEE', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, lineHeight: 1.4 }}>
                {item.n}. {item.text}
              </h3>
              
              <div className="likert" role="radiogroup">
                {LIKERT.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`likert-btn ${answers[item.n] === opt.value ? 'selected' : ''}`}
                    onClick={() => select(item.n, opt.value)}
                  >
                    <span className="num">{opt.value}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #FFCDD2' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-secondary"
          onClick={() => { setDimIndex(Math.max(0, dimIndex - 1)); window.scrollTo(0, 0); }}
          disabled={dimIndex === 0}
        >
          Anterior
        </button>
        
        <button className="btn btn-primary" onClick={next}>
          {dimIndex === totalDims - 1 ? 'Finalizar Encuesta' : 'Siguiente Dimensión'}
        </button>
      </div>
    </section>
  );
}