import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import ConsentScreen from './components/ConsentScreen.jsx';
import SurveyScreen from './components/SurveyScreen.jsx';
import SusScreen from './components/SusScreen.jsx';
import ThanksScreen from './components/ThanksScreen.jsx';
import AdminReport from './components/AdminReport.jsx';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [answers, setAnswers] = useState({});
  const [susAnswers, setSusAnswers] = useState({});

  const finalizarTodo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/enviar-encuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: 'ANONIMO-123',
          respuestas: answers,
          sus: susAnswers
        }),
      });

      if (response.ok) {
        console.log("¡Datos guardados exitosamente!");
      }
    } catch (error) {
      console.log("Servidor Python apagado o error de conexión.");
    }
    setScreen('thanks');
  };

  return (
    <div 
      className="app-shell" 
      style={{ 
        backgroundImage: "url('/src/assets/fondo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">WS</span>
          <span className="brand-name">WorkScan</span>
        </div>
        <span className="brand-tag">Clima laboral · Kafito</span>
      </header>

      {screen === 'login' && (
        <LoginScreen 
          onEntrarEmpleado={() => setScreen('consent')} 
          onLoginGerente={() => setScreen('admin')} 
        />
      )}
      
      {screen === 'admin' && (
        <main className="app-main">
          <AdminReport onLogout={() => setScreen('login')} />
        </main>
      )}

      {screen !== 'login' && screen !== 'admin' && (
        <main className="app-main">
          {screen === 'consent' && <ConsentScreen onAccept={() => setScreen('survey')} />}
          {screen === 'survey' && (
            <SurveyScreen answers={answers} setAnswers={setAnswers} onFinish={() => setScreen('sus')} />
          )}
          {screen === 'sus' && (
            <SusScreen answers={susAnswers} setAnswers={setSusAnswers} onFinish={finalizarTodo} />
          )}
          {screen === 'thanks' && (
            <ThanksScreen onFinish={() => {
              setAnswers({});
              setSusAnswers({});
              setScreen('login');
            }} />
          )}
        </main>
      )}

      <footer className="app-footer">
        Instituto Tecnológico de Minatitlán · Taller de Investigación II
      </footer>
    </div>
  );
}