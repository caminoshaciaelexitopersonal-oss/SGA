"""
CRM & Marketing View for SGA-CD Mobile Flet Application (Plan Full).
Provides administrative staff with campaign management and AI multimedia generation.
"""
import flet as ft
from typing import Dict, Any

def crm_marketing_view(page: ft.Page, user_data: Dict[str, Any]) -> ft.Control:
    user_role = user_data.get("role", "admin_empresa")
    user_plan = user_data.get("plan", "full")

    # Non-administrative roles forbidden
    if user_role in ["profesor", "alumno", "padre_acudiente"]:
        return ft.Container(
            content=ft.Column([
                ft.Icon(ft.Icons.LOCK, size=64, color=ft.Colors.RED_400),
                ft.Text("Acceso Restringido", size=24, weight=ft.FontWeight.BOLD, color=ft.Colors.RED_400),
                ft.Text("La suite CRM y Marketing está reservada exclusivamente para el personal administrativo.", color=ft.Colors.WHITE70)
            ], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    # Basic Plan locked
    if user_plan != "full":
        return ft.Container(
            content=ft.Column([
                ft.Icon(ft.Icons.LOCK_CLOCK, size=64, color=ft.Colors.AMBER_400),
                ft.Text("Módulo Requiere Plan Full", size=24, weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER_400),
                ft.Text("Actualice a Plan Full para desbloquear la suite completa de CRM, Campañas e Inteligencia Artificial.", color=ft.Colors.WHITE70)
            ], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    return ft.Container(
        content=ft.Column([
            ft.Row([
                ft.Icon(ft.Icons.CAMPAIGN, color=ft.Colors.CYAN_400, size=32),
                ft.Text("CRM & Marketing de Captación — Plan Full", size=22, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE)
            ]),
            ft.Divider(color=ft.Colors.CYAN_900),
            ft.ResponsiveRow([
                ft.Container(
                    content=ft.Column([
                        ft.Text("Generador de Videos & Multimedia IA", weight=ft.FontWeight.BOLD, color=ft.Colors.CYAN_400),
                        ft.TextField(label="Prompt para Open Generative AI / SkyReels", hint_text="Ej: Video promocional para escuela de fútbol", multiline=True),
                        ft.ElevatedButton("Generar Contenido IA", icon=ft.Icons.AUTO_AWESOME)
                    ]),
                    padding=15,
                    bgcolor="#0D1424",
                    border_radius=10,
                    col={"sm": 12, "md": 6}
                ),
                ft.Container(
                    content=ft.Column([
                        ft.Text("Campañas Masivas (WhatsApp & Redes)", weight=ft.FontWeight.BOLD, color=ft.Colors.CYAN_400),
                        ft.TextField(label="Mensaje o Copy Comercial", multiline=True),
                        ft.ElevatedButton("Lanzar Campaña Masiva", icon=ft.Icons.SEND)
                    ]),
                    padding=15,
                    bgcolor="#0D1424",
                    border_radius=10,
                    col={"sm": 12, "md": 6}
                )
            ])
        ]),
        padding=20,
        expand=True
    )
