import os
import json
import flet as ft

def load_design_tokens():
    tokens_path = os.path.join(os.path.dirname(__file__), "..", "assets", "design_tokens.json")
    if os.path.exists(tokens_path):
        try:
            with open(tokens_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading design tokens: {e}")
    return {
        "colors": {
            "bg_deep": "#070B14",
            "surface_card": "#0D1424",
            "border_specular": "#1A2642",
            "border_hover": "#38BDF8",
            "accent_cyan": "#38BDF8",
            "text_primary": "#E2E8F0",
            "text_muted": "#94A3B8",
            "secondary_gold": "#F59E0B"
        }
    }

DESIGN_TOKENS = load_design_tokens()

def create_dark_metallic_blue_theme():
    colors = DESIGN_TOKENS.get("colors", {})
    return ft.Theme(
        color_scheme=ft.ColorScheme(
            background=colors.get("bg_deep", "#070B14"),
            primary=colors.get("accent_cyan", "#38BDF8"),
            primary_container=colors.get("surface_card", "#0D1424"),
            secondary=colors.get("secondary_gold", "#F59E0B"),
            on_background=colors.get("text_primary", "#E2E8F0"),
            on_surface=colors.get("text_primary", "#E2E8F0"),
            on_primary="#070B14",
            surface=colors.get("surface_card", "#0D1424"),
        ),
        custom_colors={
            "secondary_text": colors.get("text_muted", "#94A3B8"),
            "card_border": colors.get("border_specular", "#1A2642"),
            "border_hover": colors.get("border_hover", "#38BDF8")
        }
    )
