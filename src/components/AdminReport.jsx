import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { DIMENSIONS } from '../data/items.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Datos simulados para la gráfica de promedios
const DEMO_MEANS = [3.9, 3.4, 3.1, 4.0, 2.6, 3.7, 3.5];

function baremo(v) {
  if (v >= 3.68) return { label: 'Favorable', cls: 'badge-favorable', color: '#2E7D32' };
  if (v >= 2.34) return { label: 'Intermedio', cls: 'badge-intermedio', color: '#F9A825' };
  return { label: 'Desfavorable', cls: 'badge-desfavorable', color: '#C62828' };
}

export default function AdminReport({ onLogout }) {
  const [downloadError, setDownloadError] = useState('');
  const [totalRespuestas, setTotalRespuestas] = useState(0); // Estado para el número real

  // Pedir el número real de respuestas a Python cuando carga la página
  useEffect(() => {
    fetch('http://localhost:5000/api/contar-respuestas')
      .then(res => res.json())
      .then(data => setTotalRespuestas(data.total))
      .catch(err => console.log("Servidor Python apagado, usando 0 como respaldo."));
  }, []);

  const global = DEMO_MEANS.reduce((a, b) => a + b, 0) / DEMO_MEANS.length;
  const g = baremo(global);

  const handleExport = async () => {
    setDownloadError('');
    try {
      const response = await fetch('http://localhost:5000/api/exportar-excel');
      
      if (response.status === 403) {
        setDownloadError("Bloqueado por privacidad: Se requieren al menos 5 respuestas en la base de datos para exportar.");
        return;
      }

      if (!response.ok) throw new Error('Error al generar el reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Reporte_Clima_Kafito.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      setDownloadError("No se pudo conectar con el servidor de Python. Asegúrate de que 'app.py' esté corriendo.");
    }
  };

  const barData = {
    labels: DIMENSIONS.map(d => d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name),
    datasets: [{
      label: 'Media por dimensión',
      data: DEMO_MEANS,
      backgroundColor: '#FF8F00', 
      borderRadius: 8,
      barThickness: 22,
    }]
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { min: 0, max: 5, grid: { display: false }, ticks: { color: '#757575' } },
      y: { grid: { display: false }, ticks: { color: '#424242', font: { weight: '600' } } }
    },
    plugins: { legend: { display: false } }
  };

  const doughnutData = {
    labels: ['Calificación', 'Restante'],
    datasets: [{
      data: [global, 5 - global],
      backgroundColor: [g.color, '#EEEEEE'],
      borderWidth: 0,
      cutout: '80%',
    }]
  };

  return (
    <div className="app-shell" style={{ background: '#F8F9FA' }}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">WS</span>
          <span className="brand-name">Dashboard</span>
        </div>
        <div>
          <button onClick={handleExport} style={{ background: 'white', color: '#1B5E20', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginRight: '10px', fontWeight: 'bold' }}>
            Descargar Reporte Excel
          </button>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
            Salir
          </button>
        </div>
      </header>

      <main className="app-main" style={{ padding: '16px 18px' }}>
        
        {downloadError && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #FFCDD2' }}>
            {downloadError}
          </div>
        )}

        <div className="card" style={{ background: '#E3F2FD', borderLeft: '5px solid #1976D2' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0D47A1' }}>Filtros de Segmentación (Privacidad)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#1565C0' }}>
            Para proteger el anonimato, no se muestran resultados si un filtro tiene <strong>menos de 5 respuestas</strong>.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #90CAF9' }}>
              <option>Todos los empleados ({totalRespuestas})</option>
              <option disabled>Cocina (3) - Bloqueado por privacidad</option>
              <option>Meseros (5)</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
          <div style={{ width: '100px', height: '100px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#212121' }}>{global.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginLeft: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#757575', textTransform: 'uppercase' }}>Clima Global</p>
            <h2 style={{ margin: '4px 0 8px 0', fontSize: '20px', color: '#1B5E20' }}>{g.label}</h2>
            {/* Aquí mostramos el número real de respuestas de la BD */}
            <p style={{ margin: 0, fontSize: '13px', color: '#616161' }}>Basado en <strong>{totalRespuestas} respuestas</strong> válidas.</p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#212121', borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
            Promedio por Dimensión
          </h3>
          <div className="chart-box" style={{ height: '260px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#212121', borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
            Desglose Detallado
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DIMENSIONS.map((d, i) => {
              const b = baremo(DEMO_MEANS[i]);
              const porcentaje = (DEMO_MEANS[i] / 5) * 100;
              return (
                <div key={d.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#424242' }}>{d.name}</span>
                    <span style={{ fontWeight: '700', color: b.color }}>{DEMO_MEANS[i].toFixed(2)}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#EEEEEE', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${porcentaje}%`, height: '100%', background: b.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}