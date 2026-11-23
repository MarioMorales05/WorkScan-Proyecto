import React, { useState } from 'react';
import { SUS_ITEMS, LIKERT } from '../data/items.js';

export default function SusScreen({ answers, setAnswers, onFinish }) {
  // Estado para la pregunta abierta
  const [respuestaAbierta, setRespuestaAbierta] = useState('');

  // Función para guardar la respuesta de cada pregunta
  const select = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex + 1]: value });
  };

  // Verificamos si ya respondió todas las preguntas cerradas
  const allAnswered = SUS_ITEMS.every((_, index) => answers[index + 1] !== undefined);

  // Empaquetamos todo (las 10 respuestas y la abierta) al momento de finalizar
  const handleFinalizar = () => {
    // Guardamos la pregunta abierta en el objeto de respuestas (con el índice 11)
    setAnswers({ ...answers, 11: respuestaAbierta });
    
    // Le damos un pequeño respiro a React para que guarde el estado y luego avanzamos
    setTimeout(() => {
      onFinish();
    }, 100);
  };

  return (
    <section style={{ paddingBottom: '20px' }}>
      <div className="progress" style={{ marginBottom: '6px' }}>
        <div 
          className="progress-bar" 
          style={{ width: `${(Object.keys(answers).length / SUS_ITEMS.length) * 100}%` }} 
        />
      </div>
      <div className="progress-label" style={{ marginBottom: '20px' }}>
        Usabilidad · {Object.keys(answers).length} de {SUS_ITEMS.length} respondidas
      </div>

      {/* Iteramos sobre todas las preguntas del SUS */}
      {SUS_ITEMS.map((question, index) => {
        const currentAnswer = answers[index + 1];

        return (
          <div className="card" key={index} style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: 12, color: '#9E9E9E', marginBottom: 6 }}>
              Pregunta {index + 1}
            </p>
            <h2 style={{ fontSize: 16, lineHeight: 1.4, marginBottom: '16px' }}>
              {question}
            </h2>

            <div className="likert" role="radiogroup">
              {LIKERT.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={currentAnswer === opt.value}
                  className={`likert-btn ${currentAnswer === opt.value ? 'selected' : ''}`}
                  onClick={() => select(index, opt.value)}
                >
                  <span className="num">{opt.value}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* PREGUNTA ABIERTA */}
      <div className="card" style={{ marginBottom: '16px', backgroundColor: '#F9F9F9' }}>
        <p style={{ fontSize: 12, color: '#2E7D32', fontWeight: 'bold', marginBottom: 6 }}>
          PREGUNTA ABIERTA
        </p>
        <h2 style={{ fontSize: 16, lineHeight: 1.4, marginBottom: '16px' }}>
          ¿El sistema presentado ofrece una manera eficiente, una forma diferente de medir el clima laboral o una alternativa tecnológica creativa y eficiente para conocer el clima laboral?
        </h2>
        <textarea
          value={respuestaAbierta}
          onChange={(e) => setRespuestaAbierta(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CCC', minHeight: '100px', fontFamily: 'inherit', fontSize: '14px' }}
        />
      </div>

      {/* Botón para finalizar */}
      <button 
        className="btn btn-primary" 
        onClick={handleFinalizar} 
        disabled={!allAnswered}
        style={{ marginTop: '10px' }}
      >
        {allAnswered ? 'Finalizar encuesta' : `Faltan ${SUS_ITEMS.length - Object.keys(answers).length} por responder`}
      </button>
    </section>
  );
}