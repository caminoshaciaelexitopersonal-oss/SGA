import flet as ft
import pandas as pd
import sqlite3
from datetime import datetime
from views.components.chat_assistant import ChatAssistant

def profesor_principal(page: ft.Page, tenant_id: int, user_id: int):

    # --- Fetch Area for Context ---
    try:
        conn = sqlite3.connect("formacion.db")
        cursor = conn.cursor()
        cursor.execute("SELECT area FROM profesores WHERE usuario_id = ? AND inquilino_id = ?", (user_id, tenant_id))
        result = cursor.fetchone()
        conn.close()
        area_context = result[0] if result else "General"
    except Exception as e:
        print(f"Error fetching area for profesor {user_id}: {e}")
        area_context = "General"

    # --- Instantiate the Assistant ---
    chat_assistant = ChatAssistant(page, user_id, tenant_id, area_context)

    def handle_export_asistencia(e):
        # ... (export logic remains the same)
        pass

    return ft.View(
        "/profesor_home",
        [
            ft.AppBar(title=ft.Text(f"Panel Principal ({area_context})")),
            ft.Container(
                padding=20,
                gradient=ft.LinearGradient(
                    begin=ft.alignment.Alignment(-1, -1),
                    end=ft.alignment.Alignment(1, 1),
                    colors=[
                        page.theme.color_scheme.primary_container,
                        page.theme.color_scheme.primary
                    ]
                ),
                content=ft.Column([
                    ft.Text("Bienvenido al sistema de formación", size=20, weight="bold"),
                    ft.Text("Seleccione una opción para continuar", size=16),
                    ft.Divider(),
                    ft.ListTile(
                        title=ft.Text("👥 Mi perfil"),
                        on_click=lambda _: page.go("/profesor_perfil")
                    ),
                    ft.ListTile(
                        title=ft.Text("📆 Gestión de eventos"),
                        on_click=lambda _: page.go("/profesor_eventos")
                    ),
                    ft.ListTile(
                        title=ft.Text("📚 Mis Clases"),
                        on_click=lambda _: page.go("/profesor/mis_clases")
                    ),
                    ft.ListTile(
                        title=ft.Text("➕ Crear Nueva Clase"),
                        on_click=lambda _: page.go("/profesor_clases")
                    ),
                    ft.Divider(),
                    ft.Text("Planificación y Seguimiento", weight="bold"),
                    ft.ListTile(
                        leading=ft.Icon(ft.icons.LIST_ALT),
                        title=ft.Text("Definir Currículo"),
                        on_click=lambda _: page.go("/definir_curriculo")
                    ),
                    ft.ListTile(
                        leading=ft.Icon(ft.icons.CALENDAR_MONTH),
                        title=ft.Text("Planificador de Clases"),
                        on_click=lambda _: page.go("/planificador_calendario")
                    ),
                    ft.ListTile(
                        leading=ft.Icon(ft.icons.GROUP),
                        title=ft.Text("Seguimiento de Alumnos"),
                        on_click=lambda _: page.go("/seguimiento_progreso")
                    ),
                    ft.Divider(),
                    ft.ListTile(
                        title=ft.Text("📊 Descargar Reporte de Asistencia"),
                        leading=ft.Icon(ft.icons.DOWNLOAD),
                        on_click=handle_export_asistencia
                    ),
                ], scroll=ft.ScrollMode.AUTO)
            )
        ],
        floating_action_button=chat_assistant
    )
