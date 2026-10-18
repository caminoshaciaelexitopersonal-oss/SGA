import sys
import os
import time
import json
import copy
from datetime import datetime, timezone

sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')
sys.path.insert(0, 'SGA-CD-DB.git')

from sqlalchemy import create_engine, text
from app.services.gemini_service import gemini_plan_service

# Dedicated Disposable Test Database for Mass Data Simulation
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_simulation_disposable.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 60},
)

DISCIPLINAS_DEPORTES = [
    "Fútbol", "Baloncesto", "Natación", "Atletismo", "Voleibol",
    "Taekwondo", "Ciclismo", "Gimnasia", "Tenis de Campo", "Patinaje"
]

DISCIPLINAS_CULTURA = [
    "Música / Canto", "Danza Folclórica", "Teatro", "Pintura y Escultura", "Literatura / Escritura",
    "Fotografía Digital", "Banda Marcial", "Artes del Circo", "Producción Audio Visual", "Títeres y Marionetas"
]

def run_annual_simulation():
    print("=" * 80)
    print("🚀 INICIANDO EJERCICIO DE SIMULACIÓN MASIVA EN BASE DE PRUEBA DESECHABLE")
    print("   DATABASE: test_simulation_disposable.db")
    print("   ESCALA: 200 Empresas/Entidades | 4.000 Profesores | 200.000 Estudiantes")
    print("   CICLO: Enero (Inscripciones) a Diciembre (Noche de los Mejores & Premiación)")
    print("=" * 80)

    start_time = time.time()

    # Apply High-Performance SQLite Pragmas on Disposable DB
    raw_conn = engine.raw_connection()
    cursor = raw_conn.cursor()
    cursor.execute("PRAGMA synchronous = OFF;")
    cursor.execute("PRAGMA journal_mode = MEMORY;")
    cursor.execute("PRAGMA cache_size = 100000;")
    raw_conn.commit()

    # 1. Crear esquemas en la base desechable
    print("\n[FASE 1/5] Inicializando Tablas e Índices en Base de Datos Desechable...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inquilinos (
            id INTEGER PRIMARY KEY,
            nombre_empresa TEXT,
            plan TEXT DEFAULT 'pro_mensual',
            activo BOOLEAN DEFAULT 1
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inquilino_id INTEGER,
            nombre_usuario TEXT,
            correo TEXT,
            password_hash TEXT,
            rol TEXT,
            activo BOOLEAN DEFAULT 1,
            nombre_completo TEXT
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alumnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            inquilino_id INTEGER,
            rango_edad TEXT DEFAULT '12-17'
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profesores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            inquilino_id INTEGER,
            especialidad TEXT,
            area TEXT
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS planes_trabajo_docentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profesor_id INTEGER,
            inquilino_id INTEGER,
            disciplina TEXT,
            area TEXT,
            titulo_plan TEXT,
            contenido_json TEXT,
            fecha_creacion DATETIME
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inscripciones_anuales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alumno_id INTEGER,
            profesor_id INTEGER,
            inquilino_id INTEGER,
            mes_inscripcion TEXT DEFAULT 'Enero',
            estado TEXT DEFAULT 'Inscrito'
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS noche_de_los_mejores_premiacion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alumno_id INTEGER,
            inquilino_id INTEGER,
            categoria TEXT,
            reconocimiento TEXT,
            puntos_gamificacion INTEGER,
            fecha_premiacion DATETIME
        );
    """)
    raw_conn.commit()

    print("✅ Tablas de la base desechable listas.")

    # 2. Obtener Planes de Trabajo por Disciplina
    print("\n[FASE 2/5] Generando Planes de Trabajo Maestros con Google Gemini API...")
    master_plans = {}

    gemini_sports_sample = gemini_plan_service.generate_annual_work_plan("Deportes y Salud", "Deportes")
    gemini_culture_sample = gemini_plan_service.generate_annual_work_plan("Artes y Cultura", "Cultura")

    for disc in DISCIPLINAS_DEPORTES:
        p = copy.deepcopy(gemini_sports_sample)
        p["disciplina"] = disc
        p["titulo_plan"] = f"Plan Anual de Formación Metodológica en {disc} (Deportes)"
        master_plans[disc] = p

    for disc in DISCIPLINAS_CULTURA:
        p = copy.deepcopy(gemini_culture_sample)
        p["disciplina"] = disc
        p["titulo_plan"] = f"Plan Anual de Formación Metodológica en {disc} (Cultura)"
        master_plans[disc] = p

    print(f"✅ {len(master_plans)} Planes de Trabajo Maestros generados exitosamente con Gemini.")

    # 3. Poblado de 200 Empresas, 4.000 Profesores y 4.000 Planes de Trabajo
    print("\n[FASE 3/5] Poblando 200 Empresas y 4.000 Profesores con sus Planes de Trabajo...")
    t0 = time.time()

    cursor.execute("DELETE FROM inquilinos;")
    cursor.execute("DELETE FROM usuarios;")
    cursor.execute("DELETE FROM profesores;")
    cursor.execute("DELETE FROM alumnos;")
    cursor.execute("DELETE FROM planes_trabajo_docentes;")
    cursor.execute("DELETE FROM inscripciones_anuales;")
    cursor.execute("DELETE FROM noche_de_los_mejores_premiacion;")
    raw_conn.commit()

    inquilinos_batch = [(i, f"Entidad Cultural y Deportiva #{i}") for i in range(1, 201)]
    cursor.executemany("INSERT INTO inquilinos (id, nombre_empresa) VALUES (?, ?);", inquilinos_batch)
    raw_conn.commit()

    profesores_data = []
    user_id_counter = 1
    prof_id_counter = 1

    for inq_id in range(1, 201):
        for idx, disc in enumerate(DISCIPLINAS_DEPORTES):
            profesores_data.append((
                prof_id_counter,
                user_id_counter,
                inq_id,
                f"Prof. {disc} E{inq_id}",
                f"prof_dep_{inq_id}_{idx}@sgacd.org",
                "profesor",
                disc,
                "Deportes"
            ))
            user_id_counter += 1
            prof_id_counter += 1

        for idx, disc in enumerate(DISCIPLINAS_CULTURA):
            profesores_data.append((
                prof_id_counter,
                user_id_counter,
                inq_id,
                f"Prof. {disc} E{inq_id}",
                f"prof_cul_{inq_id}_{idx}@sgacd.org",
                "profesor",
                disc,
                "Cultura"
            ))
            user_id_counter += 1
            prof_id_counter += 1

    cursor.executemany("""
        INSERT INTO usuarios (id, inquilino_id, nombre_usuario, correo, password_hash, rol, nombre_completo)
        VALUES (?, ?, ?, ?, 'hash_pwd_secret', ?, ?);
    """, [(p[1], p[2], f"user_prof_{p[0]}", p[4], p[5], p[3]) for p in profesores_data])

    cursor.executemany("""
        INSERT INTO profesores (id, usuario_id, inquilino_id, especialidad, area)
        VALUES (?, ?, ?, ?, ?);
    """, [(p[0], p[1], p[2], p[6], p[7]) for p in profesores_data])

    planes_batch = []
    now_str = datetime.now(timezone.utc).isoformat()
    for p in profesores_data:
        prof_id, _, inq_id, _, _, _, disc, area = p
        plan_obj = master_plans[disc]
        planes_batch.append((
            prof_id,
            inq_id,
            disc,
            area,
            plan_obj.get("titulo_plan", f"Plan Anual de {disc}"),
            json.dumps(plan_obj, ensure_ascii=False),
            now_str
        ))

    cursor.executemany("""
        INSERT INTO planes_trabajo_docentes (profesor_id, inquilino_id, disciplina, area, titulo_plan, contenido_json, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, planes_batch)

    raw_conn.commit()

    print(f"✅ 200 Empresas y 4.000 Profesores registrados en {round(time.time() - t0, 2)}s.")

    # 4. Poblar 200.000 Estudiantes e Inscripciones de Enero
    print("\n[FASE 4/5] Registrando 200.000 Estudiantes y Simulando Fase de Inscripciones (Enero)...")
    t0 = time.time()

    alumnos_user_batch = [None] * 200000
    alumnos_profile_batch = [None] * 200000
    inscripciones_batch = [None] * 200000

    idx = 0
    alumno_id = 1

    for prof in profesores_data:
        prof_id, _, inq_id, _, _, _, disc, area = prof
        for st in range(50):
            u_id = user_id_counter
            a_id = alumno_id

            alumnos_user_batch[idx] = (
                u_id,
                inq_id,
                f"estudiante_{a_id}",
                f"estudiante_{a_id}@inst{inq_id}.edu.co",
                "hash_pwd",
                "alumno",
                f"Estudiante {a_id}"
            )
            alumnos_profile_batch[idx] = (a_id, u_id, inq_id)
            inscripciones_batch[idx] = (a_id, prof_id, inq_id, "Enero", "Inscrito")

            user_id_counter += 1
            alumno_id += 1
            idx += 1

    print(f"   -> Listas en memoria construidas ({idx} registros) en {round(time.time() - t0, 2)}s. Insertando en DB desechable...")
    t0 = time.time()

    cursor.executemany("""
        INSERT INTO usuarios (id, inquilino_id, nombre_usuario, correo, password_hash, rol, nombre_completo)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, alumnos_user_batch)

    cursor.executemany("""
        INSERT INTO alumnos (id, usuario_id, inquilino_id)
        VALUES (?, ?, ?);
    """, alumnos_profile_batch)

    cursor.executemany("""
        INSERT INTO inscripciones_anuales (alumno_id, profesor_id, inquilino_id, mes_inscripcion, estado)
        VALUES (?, ?, ?, ?, ?);
    """, inscripciones_batch)

    raw_conn.commit()

    print(f"✅ 200.000 Estudiantes e inscripciones insertadas en DB en {round(time.time() - t0, 2)}s.")

    # 5. Simular la Gala de Premiación: "Noche de los Mejores" (Diciembre)
    print("\n[FASE 5/5] Simulando Cierre de Ciclo en Diciembre: 'Noche de los Mejores' & Premiación...")
    t0 = time.time()

    fecha_diciembre = datetime(2026, 12, 15, 19, 0, tzinfo=timezone.utc).isoformat()

    premiaciones_batch = [None] * 20000
    p_idx = 0

    for a_id in range(10, 200001, 10):
        inq_id = ((a_id - 1) // 1000) + 1
        cat = "Excelencia Deportiva" if p_idx % 2 == 0 else "Excelencia Cultural y Artística"
        rec = "Medalla de Oro al Talento y Perseverancia" if p_idx % 5 == 0 else "Insignia de Honor Institucional"
        pts = 500 if p_idx % 5 == 0 else 250
        premiaciones_batch[p_idx] = (a_id, inq_id, cat, rec, pts, fecha_diciembre)
        p_idx += 1

    cursor.executemany("""
        INSERT INTO noche_de_los_mejores_premiacion
        (alumno_id, inquilino_id, categoria, reconocimiento, puntos_gamificacion, fecha_premiacion)
        VALUES (?, ?, ?, ?, ?, ?);
    """, premiaciones_batch)
    raw_conn.commit()

    print(f"✅ {len(premiaciones_batch)} Premios otorgados en {round(time.time() - t0, 2)}s.")

    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 80)
    print(f"🎉 EJERCICIO DE SIMULACIÓN COMPLETADO CON ÉXITO EN {elapsed} SEGUNDOS")
    print("=" * 80)

    # Verificar Conteos Finales en la Base de Datos Desechable
    cursor.execute("SELECT COUNT(*) FROM inquilinos;")
    count_inq = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM profesores;")
    count_prof = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM planes_trabajo_docentes;")
    count_plan = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM alumnos;")
    count_alum = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM inscripciones_anuales;")
    count_inscr = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM noche_de_los_mejores_premiacion;")
    count_prem = cursor.fetchone()[0]

    print("\n📊 RESUMEN DE REGISTROS EN BASE DE DATOS DESECHABLE:")
    print(f"   • Empresas / Entidades (Tenants): {count_inq:,}")
    print(f"   • Profesores / Instructores:     {count_prof:,}")
    print(f"   • Planes de Trabajo Docentes:    {count_plan:,}")
    print(f"   • Estudiantes / Alumnos:         {count_alum:,}")
    print(f"   • Inscripciones (Enero):          {count_inscr:,}")
    print(f"   • Premiaciones (Diciembre):       {count_prem:,}")
    print("=" * 80)

    raw_conn.close()

if __name__ == "__main__":
    run_annual_simulation()
