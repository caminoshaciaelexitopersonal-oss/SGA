from .token import Token, TokenData
from .user import User, UserCreate
from .alumno import Alumno, AlumnoCreate, AlumnoUpdate
from .audit import AuditLog, AuditLogCreate
from .billing import Suscripcion, SuscripcionCreate, SuscripcionUpdate, Factura, FacturaCreate, FacturaUpdate
from .clase import ProcesoFormacion, ProcesoFormacionCreate, ProcesoFormacionUpdate, Clase, ClaseCreate, ClaseUpdate
from .communication import ChatConversacion, ChatConversacionCreate, ChatMensaje, ChatMensajeCreate, ForoClase, ForoClaseCreate, ForoHilo, ForoHiloCreate, ForoPublicacion, ForoPublicacionCreate
from .curriculum import PlanCurricular, PlanCurricularCreate, PlanCurricularUpdate, PlanCurricularTema, PlanCurricularTemaCreate, PlanCurricularTemaUpdate
from .dropdown import Dropdown, DropdownCreate, DropdownUpdate
from .escenario import Escenario, EscenarioCreate, EscenarioUpdate, EscenarioParte, EscenarioParteCreate, EscenarioParteUpdate, Reserva, ReservaCreate, ReservaUpdate
from .evento import Evento, EventoCreate, EventoUpdate, EventoParticipante, EventoParticipanteCreate
from .gamification import GamificacionAccion, GamificacionAccionCreate, GamificacionAccionUpdate, GamificacionPuntosLog, GamificacionPuntosLogCreate, GamificacionMedalla, GamificacionMedallaCreate, GamificacionMedallaUpdate, GamificacionMedallaObtenida, GamificacionMedallaObtenidaCreate
from .inscripcion_asistencia import Inscripcion, InscripcionCreate, Asistencia, AsistenciaCreate
from .inventory import Elemento, ElementoCreate, ElementoUpdate, Prestamo, PrestamoCreate, PrestamoUpdate
from .notificacion import Notificacion, NotificacionCreate, NotificacionUpdate
from .agent import AgentInput
