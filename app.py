from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import psycopg2
import psycopg2.extras
import os
import json
import io
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from openpyxl import Workbook
from openpyxl.drawing.image import Image as OpenpyxlImage
from openpyxl.styles import Font, PatternFill, Alignment
from datetime import datetime

app = Flask(__name__)
# Permitimos peticiones desde Vercel y localhost
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- CONFIGURACIÓN DE BASE DE DATOS (NUBE O LOCAL) ---
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    if DATABASE_URL:
        # Si está en Render (Nube), usa PostgreSQL
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.cursor_factory = psycopg2.extras.RealDictCursor
    else:
        # Si estás en tu compu, usa SQLite local
        conn = sqlite3.connect('workScan.db')
        conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    cursor = db.cursor()
    
    if DATABASE_URL:
        # Sintaxis para PostgreSQL
        cursor.execute('''CREATE TABLE IF NOT EXISTS respuestas (
            id SERIAL PRIMARY KEY,
            codigo_acceso TEXT NOT NULL,
            respuestas_json TEXT NOT NULL,
            sus_json TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
    else:
        # Sintaxis para SQLite
        cursor.execute('''CREATE TABLE IF NOT EXISTS respuestas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_acceso TEXT NOT NULL,
            respuestas_json TEXT NOT NULL,
            sus_json TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
    db.commit()
    cursor.close()
    db.close()

# Inicializar la tabla al arrancar
init_db()


@app.route('/api/enviar-encuesta', methods=['POST'])
def recibir_encuesta():
    try:
        datos = request.json
        respuestas = datos.get('respuestas')
        sus = datos.get('sus')
        
        if not respuestas or not sus:
            return jsonify({"error": "Datos incompletos"}), 400

        db = get_db()
        cursor = db.cursor()
        
        if DATABASE_URL:
            # PostgreSQL usa %s para los parámetros
            cursor.execute("INSERT INTO respuestas (codigo_acceso, respuestas_json, sus_json) VALUES (%s, %s, %s)", 
                           ('ANONIMO-123', json.dumps(respuestas), json.dumps(sus)))
        else:
            # SQLite usa ?
            cursor.execute("INSERT INTO respuestas (codigo_acceso, respuestas_json, sus_json) VALUES (?, ?, ?)", 
                           ('ANONIMO-123', json.dumps(respuestas), json.dumps(sus)))
                           
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"status": "success", "mensaje": "Datos guardados"}), 201
    except Exception as e:
        print("Error al guardar:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/contar-respuestas', methods=['GET'])
def contar_respuestas():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) FROM respuestas")
        total = cursor.fetchone()[0]
        cursor.close()
        db.close()
        return jsonify({"total": total})
    except Exception as e:
        return jsonify({"total": 0})


@app.route('/api/exportar-excel', methods=['GET'])
def exportar_excel():
    try:
        db = get_db()
        df = pd.read_sql_query("SELECT respuestas_json, sus_json FROM respuestas", db)
        db.close()
        
        if len(df) < 5:
            return jsonify({"error": "Bloqueado por privacidad. Se requieren al menos 5 respuestas."}), 403

        dimensiones = {
            'Interacción social': [1, 2, 3], 
            'Comunicación': [4, 5, 6],
            'Condiciones de trabajo': [7, 8, 9], 
            'Reconocimiento y pertenencia': [10, 11, 12],
            'Remuneración': [13, 14], 
            'Liderazgo': [15, 16, 17], 
            'Motivación': [18, 19]
        }
        resultados = {dim: [] for dim in dimensiones.keys()}

        for index, row in df.iterrows():
            try:
                respuestas = json.loads(row['respuestas_json'].replace("'", '"'))
                for dim, reactivos in dimensiones.items():
                    valores = [int(respuestas.get(str(r))) for r in reactivos if str(r) in respuestas]
                    if valores: 
                        resultados[dim].append(sum(valores) / len(valores))
            except: 
                continue

        promedios = {dim: sum(vals)/len(vals) if vals else 0 for dim, vals in resultados.items()}

        sns.set_theme(style="whitegrid")
        plt.figure(figsize=(8, 5))
        bars = plt.barh(list(promedios.keys()), list(promedios.values()), color='#FF8F00', edgecolor='#E65100')
        
        for bar in bars:
            plt.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
                     f'{bar.get_width():.2f}', va='center', fontweight='bold')
                     
        plt.title('Promedio por Dimensión - Kafito', fontsize=14, fontweight='bold')
        plt.xlim(1, 5)
        plt.tight_layout()
        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150)
        img_buffer.seek(0)
        plt.close()

        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Ejecutivo"
        
        ws['B2'] = "REPORTE DE CLIMA LABORAL - KAFITO"
        ws['B2'].font = Font(size=16, bold=True, color="1B5E20")
        ws['B3'] = f"Fecha de emisión: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        ws['B3'].font = Font(size=10, italic=True, color="555555")
        ws['B4'] = f"Total de respuestas procesadas: {len(df)}"
        ws['B4'].font = Font(size=10, bold=True, color="555555")

        img = OpenpyxlImage(img_buffer)
        img.width = 500
        img.height = 312
        ws.add_image(img, 'B6')

        ws['M2'] = "Resumen Ejecutivo"
        ws['M2'].font = Font(size=14, bold=True, color="1B5E20")
        
        headers = ['M4', 'N4', 'O4']
        ws['M4'], ws['N4'], ws['O4'] = "Dimensión", "Puntaje", "Estado"
        for cell in headers:
            ws[cell].font = Font(bold=True, color="FFFFFF")
            ws[cell].fill = PatternFill(start_color="1B5E20", end_color="1B5E20", fill_type="solid")
            ws[cell].alignment = Alignment(horizontal="center")

        row_num = 5
        for dim, valor in promedios.items():
            if valor >= 3.68:
                estado, color = "Favorable", "C6EFCE"
            elif valor >= 2.34:
                estado, color = "Intermedio", "FFEB9C"
            else:
                estado, color = "Desfavorable", "FFC7CE"

            ws[f'M{row_num}'] = dim
            ws[f'N{row_num}'] = round(valor, 2)
            ws[f'O{row_num}'] = estado
            
            ws[f'O{row_num}'].fill = PatternFill(start_color=color, end_color=color, fill_type="solid")
            ws[f'N{row_num}'].alignment = Alignment(horizontal="center")
            ws[f'O{row_num}'].alignment = Alignment(horizontal="center")
            row_num += 1

        global_mean = sum(promedios.values()) / len(promedios)
        ws[f'M{row_num+1}'] = "ÍNDICE GLOBAL"
        ws[f'M{row_num+1}'].font = Font(bold=True)
        ws[f'N{row_num+1}'] = round(global_mean, 2)
        ws[f'N{row_num+1}'].font = Font(bold=True)
        ws[f'N{row_num+1}'].alignment = Alignment(horizontal="center")

        ws[f'M{row_num+4}'] = "Recomendaciones Automáticas"
        ws[f'M{row_num+4}'].font = Font(size=12, bold=True, color="1B5E20")
        
        rec_row = row_num + 5
        for dim, valor in promedios.items():
            if valor < 3.0:
                ws[f'M{rec_row}'] = f"- Atención urgente requerida en: {dim}."
                ws[f'M{rec_row}'].font = Font(color="C62828")
                rec_row += 1
            elif valor < 3.68:
                ws[f'M{rec_row}'] = f"- Oportunidad de mejora en: {dim}."
                ws[f'M{rec_row}'].font = Font(color="F57C00")
                rec_row += 1
                
        if rec_row == row_num + 5:
            ws[f'M{rec_row}'] = "- Todas las dimensiones se encuentran en estado favorable."
            ws[f'M{rec_row}'].font = Font(color="2E7D32")

        ws.column_dimensions['B'].width = 10
        ws.column_dimensions['M'].width = 40
        ws.column_dimensions['N'].width = 15
        ws.column_dimensions['O'].width = 15

        excel_buffer = io.BytesIO()
        wb.save(excel_buffer)
        excel_buffer.seek(0)

        return send_file(excel_buffer, as_attachment=True, download_name="Reporte_Ejecutivo_Kafito.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        print("Error en excel:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Servidor Flask corriendo...")
    app.run(debug=True, port=5000)