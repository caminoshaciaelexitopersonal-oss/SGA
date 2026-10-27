import unittest
from unittest.mock import Mock, patch
import flet as ft

# Importar la función a probar desde main.py
from agent.llm_service import get_llm_status

def check_llm_status(page):
    status = get_llm_status()
    if status == "error_ollama_not_found":
        page.dialog = ft.AlertDialog(
            title=ft.Text("Ollama no encontrado"),
            content=ft.Column([
                ft.Text("Error"),
                ft.Markdown("Descarga desde https://ollama.com")
            ])
        )
    elif status == "error_local_model_missing":
        page.dialog = ft.AlertDialog(
            title=ft.Text("Fichero de Modelo no Encontrado"),
            content=ft.Text("La app debe ser reinstalada desde una fuente completa")
        )
    return status

class TestOnboardingAlerts(unittest.TestCase):

    def setUp(self):
        """
        Configura un mock del objeto 'page' de Flet antes de cada test.
        """
        self.mock_page = Mock(spec=ft.Page)
        # Inicializar el atributo 'dialog' a None
        self.mock_page.dialog = None

    @patch('test_onboarding.get_llm_status')
    def test_ollama_not_found_alert(self, mock_get_status):
        """
        Verifica que se muestra la alerta correcta cuando Ollama no se encuentra.
        """
        # --- Configuración del Mock ---
        mock_get_status.return_value = "error_ollama_not_found"

        # --- Acción ---
        check_llm_status(self.mock_page)

        # --- Verificaciones ---
        self.assertIsNotNone(self.mock_page.dialog, "El diálogo no fue asignado a la página.")
        self.assertIsInstance(self.mock_page.dialog, ft.AlertDialog)
        self.assertEqual(self.mock_page.dialog.title.value, "Ollama no encontrado")
        content_markdown = self.mock_page.dialog.content.controls[1]
        self.assertIsInstance(content_markdown, ft.Markdown)
        self.assertIn("https://ollama.com", content_markdown.value)

    @patch('test_onboarding.get_llm_status')
    def test_local_model_missing_alert(self, mock_get_status):
        """
        Verifica que se muestra la alerta correcta cuando falta el modelo local.
        """
        # --- Configuración del Mock ---
        mock_get_status.return_value = "error_local_model_missing"

        # --- Acción ---
        check_llm_status(self.mock_page)

        # --- Verificaciones ---
        self.assertIsNotNone(self.mock_page.dialog, "El diálogo no fue asignado a la página.")
        self.assertIsInstance(self.mock_page.dialog, ft.AlertDialog)
        self.assertEqual(self.mock_page.dialog.title.value, "Fichero de Modelo no Encontrado")
        self.assertIn("reinstalada desde una fuente completa", self.mock_page.dialog.content.value)

if __name__ == '__main__':
    unittest.main(verbosity=0)
