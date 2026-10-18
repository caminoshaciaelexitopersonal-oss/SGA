"""
Verification Script for Phase 7 Security, Pricing Matrix, and Terms Page
SGA-CD System Architecture - Dark Metallic Blue
"""

import os
import re
import unittest


class TestPhase7Verification(unittest.TestCase):

    def test_terms_page_structure_and_taxonomy(self):
        terms_path = os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "terms.html")
        self.assertTrue(os.path.exists(terms_path), "terms.html debe existir")

        with open(terms_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Verificar presencia de paleta Dark Metallic Blue y GSAP
        self.assertIn("#070B14", content)
        self.assertIn("#0D1424", content)
        self.assertIn("#38BDF8", content)
        self.assertIn("gsap", content)
        self.assertIn("accordion-grid", content)

        # Verificar preservación de texto legal previo
        self.assertIn("Aceptación de los Términos", content)
        self.assertIn("Uso Autorizado y Protección de Menores", content)
        self.assertIn("5 años de edad", content)
        self.assertIn("Propiedad Intelectual", content)

    def test_pricing_matrix_roles(self):
        main_js_path = os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "js", "main.js")
        self.assertTrue(os.path.exists(main_js_path), "js/main.js debe existir")

        with open(main_js_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Verificar matriz de planes por rol
        self.assertIn("Suscripción Estudiantil Costo 0", content)
        self.assertIn("Plan Profesional Instructores", content)
        self.assertIn("Plan Corporativo Gubernamental & Institucional", content)
        self.assertIn("alumnos_padres", content)
        self.assertIn("profesores", content)
        self.assertIn("entidades", content)

    def test_agentshield_security_breach_code(self):
        interceptor_path = os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "js", "utils", "network_interceptor.js")
        handler_path = os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "js", "utils", "error_handler.js")

        with open(interceptor_path, "r", encoding="utf-8") as f:
            interceptor_content = f.read()
        with open(handler_path, "r", encoding="utf-8") as f:
            handler_content = f.read()

        self.assertIn("handleSecurityBreach", interceptor_content)
        self.assertIn("STD-ERR-SECURITY-BREACH", handler_content)


if __name__ == "__main__":
    unittest.main()
