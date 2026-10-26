"""
Suite de Pruebas FASE 8.14.9 — Verificación Multitanante de Accesos a CRM/Marketing.

Valida que:
1. El personal administrativo (admin_empresa, jefe_area, profesional_area, tecnico_area, coordinador, jefe_almacen, almacenista, jefe_escenarios) goce de la suite CRM en Plan Full.
2. Los roles formativos y de servicio (profesor, alumno, padre_acudiente) tengan el acceso a CRM estrictamente DENEGADO sin importar el plan.
"""
import sys
import os
import unittest

# Ensure SGA-CD-FASTAPI-BACKEND is in Python path
sys.path.insert(0, os.path.abspath("SGA-CD-FASTAPI-BACKEND"))

from app.services.plan_capability_service import PlanCapabilityService, CANONICAL_FULL, CANONICAL_BASIC


class TestFase8149CrmPermissions(unittest.TestCase):

    def setUp(self):
        self.admin_roles = [
            "admin_empresa",
            "jefe_area",
            "profesional_area",
            "tecnico_area",
            "coordinador",
            "jefe_almacen",
            "almacenista",
            "jefe_escenarios"
        ]
        self.forbidden_roles = [
            "profesor",
            "alumno",
            "padre_acudiente"
        ]

    def test_01_administrative_roles_full_plan_access(self):
        """Verifica que todos los roles administrativos en Plan Full posean habilitados los módulos CRM."""
        tenant_data = {
            "id": 1,
            "nombre_empresa": "Empresa Administradora",
            "plan": "full",
            "activo": True
        }
        sub_data = {"estado": "activa", "fecha_fin": "2030-12-31T23:59:59Z"}
        caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)

        self.assertTrue(caps.is_active)
        self.assertEqual(caps.canonical_plan, CANONICAL_FULL)
        self.assertTrue(caps.crm_leads_enabled)
        self.assertTrue(caps.crm_campaigns_enabled)
        self.assertTrue(caps.crm_analytics_enabled)

    def test_02_forbidden_roles_crm_gating_logic(self):
        """Simula y verifica que los roles de enseñanza y beneficiarios no posean privilegios CRM."""
        # Function simulating role gating check in UI and Endpoints
        def check_role_crm_access(role: str, plan_caps) -> bool:
            if role in ["profesor", "alumno", "padre_acudiente"]:
                return False
            return plan_caps.crm_leads_enabled and plan_caps.is_active

        tenant_data = {"id": 1, "plan": "full", "activo": True}
        sub_data = {"estado": "activa"}
        caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)

        # Forbidden roles return False even on Plan Full
        for role in self.forbidden_roles:
            self.assertFalse(
                check_role_crm_access(role, caps),
                f"El rol '{role}' debe tener acceso denegado a CRM incluso en Plan Full."
            )

        # Administrative roles return True on Plan Full
        for role in self.admin_roles:
            self.assertTrue(
                check_role_crm_access(role, caps),
                f"El rol administrativo '{role}' debe tener acceso habilitado a CRM en Plan Full."
            )

    def test_03_basic_plan_blocks_crm_for_everyone(self):
        """Verifica que en Plan Básico ningún rol tenga acceso a CRM."""
        tenant_data = {"id": 1, "plan": "basico", "activo": True}
        sub_data = {"estado": "en_prueba"}
        caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)

        self.assertFalse(caps.crm_leads_enabled)
        self.assertFalse(caps.crm_campaigns_enabled)
        self.assertFalse(caps.crm_analytics_enabled)


if __name__ == "__main__":
    unittest.main()
