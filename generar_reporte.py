import sqlite3
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Configurar el estilo visual de la gráfica
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = 'sans-serif'

# 1. Conectar a la base de datos y extraer los datos
conn = sqlite3.connect('workScan.db')
query = "SELECT respuestas_json FROM respuestas"
df = pd.read_sql_query(query, conn)
conn.close()

if len(df) == 0:
    print("No hay respuestas en la base de datos todavía.")
    exit()

# 2. Procesar el JSON y calcular los promedios
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
        # TRUCO: Reemplazamos las comillas simples por dobles para que sea un JSON válido
        json_string = row['respuestas_json'].replace("'", '"')
        respuestas = json.loads(json_string)
        
        for dim, reactivos in dimensiones.items():
            # Validamos si la llave existe antes de buscar
            valores = [int(respuestas.get(str(r))) for r in reactivos if str(r) in respuestas]
            if valores:
                resultados[dim].append(sum(valores) / len(valores))
    except Exception as e:
        # Si una fila está corrupta, la salta y sigue con las demás
        print(f"Saltando una fila con formato antiguo: {e}")
        continue

# Calcular el promedio final por dimensión
promedios = {dim: sum(vals)/len(vals) if vals else 0 for dim, vals in resultados.items()}

# 3. Generar la gráfica
plt.figure(figsize=(10, 6))
bars = plt.barh(list(promedios.keys()), list(promedios.values()), color='#FF8F00', edgecolor='#E65100')

for bar in bars:
    plt.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
             f'{bar.get_width():.2f}', 
             va='center', fontweight='bold', color='#333333')

plt.title('Reporte de Clima Laboral - Kafito (Generado con Python)', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Promedio (Escala 1 al 5)', fontsize=12)
plt.xlim(1, 5)
plt.tight_layout()

# 4. Guardar la imagen y mostrarla
plt.savefig('reporte_clima_kafito.png', dpi=300)
print("✅ ¡Reporte generado con éxito! Revisa el archivo 'reporte_clima_kafito.png' en tu carpeta.")
plt.show()