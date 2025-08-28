from langchain_core.tools import tool
from typing import Any, List, Dict
from app.tools.herramientas_analiticas import generar_grafico_asistencia

class InteligenciaSoldiers:
    """
    El arsenal de herramientas de ejecución (la escuadra de Soldados) para las operaciones de Inteligencia.
    Son comandados por el Sargento de Inteligencia.
    """
    def __init__(self, api_client: Any):
        self.api = api_client

    @tool
    def obtener_respuesta_asistente_ia(self, pregunta_usuario: str, contexto: str = None) -> str:
        """
        (SOLDADO AGENTE IA) Ejecuta una consulta al agente de IA de bajo nivel para obtener respuestas a preguntas de soporte o conocimiento general.
        """
        return "Respuesta Simulada: La inscripción para los cursos de verano se abre el 15 de julio."

    @tool
    def calcular_kpi(self, nombre_kpi: str, parametros: Dict) -> Dict:
        """
        (SOLDADO ANALÍTICA Y KPIs) Ejecuta el cálculo de un Indicador Clave de Rendimiento (KPI) específico.
        """
        return {"kpi": nombre_kpi, "valor": "92%", "tendencia": "positiva", "comparativo": "+5% vs mes anterior"}

    @tool
    def construir_dashboard(self, nombre_dashboard: str, widgets: List[Dict]) -> Dict:
        """
        (SOLDADO DASHBOARD) Ejecuta la construcción de un nuevo dashboard de visualización de datos.
        """
        return {"status": "success", "dashboard_id": "dash-xyz", "url": f"/dashboards/{nombre_dashboard.replace(' ','-').lower()}"}

    @tool
    def exportar_reporte_a_csv(self, nombre_reporte: str, parametros: Dict) -> Dict:
        """
        (SOLDADO EXPORTAR) Ejecuta la generación y exportación de los datos de un reporte a un archivo CSV.
        """
        return {"status": "success", "file_url": f"/downloads/{nombre_reporte.replace(' ','-').lower()}.csv"}

    @tool
    def obtener_sugerencias_estrategicas_ia(self, objetivo: str) -> List[str]:
        """
        (SOLDADO SUGERENCIAS IA) Utiliza un modelo de IA estratégico para analizar un objetivo y proponer acciones.
        """
        return [
            "Lanzar una campaña de gamificación con medallas por asistencia consecutiva.",
            "Enviar notificaciones personalizadas a estudiantes con bajo rendimiento reciente."
        ]

    @tool
    def generar_visualizacion_grafica(self, pregunta: str) -> Dict:
        """
        (SOLDADO VISUALIZACIÓN) Genera un gráfico para responder a una pregunta sobre datos.
        Utilízalo cuando el usuario pida comparar, analizar o ver tendencias de datos visualmente.
        Devuelve un diccionario con la URL de la imagen generada.
        """
        try:
            web_path = generar_grafico_asistencia(pregunta)
            return {
                "status": "success",
                "message": "Se ha generado un gráfico para responder a tu pregunta.",
                "image_url": web_path
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"No se pudo generar el gráfico: {e}"
            }

    def get_all_soldiers(self) -> List:
        """
        Recluta y devuelve la Escuadra de Inteligencia completa.
        """
        return [
            self.obtener_respuesta_asistente_ia,
            self.calcular_kpi,
            self.construir_dashboard,
            self.exportar_reporte_a_csv,
            self.obtener_sugerencias_estrategicas_ia,
            self.generar_visualizacion_grafica
        ]
