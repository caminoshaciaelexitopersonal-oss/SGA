import argparse
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import venv


ROOT = Path(__file__).resolve().parents[1]
COMPONENTS = {
    "database": "SGA-CD-DB.git",
    "backend": "SGA-CD-FASTAPI-BACKEND",
    "desktop": "SGA-CD-APP.git",
    "mobile": "SGA-CD-APK.git",
    "web": "SGA-CD-WEB.git",
}


def install_component(component, local_model):
    directory = ROOT / COMPONENTS[component]
    if component == "web":
        if not (directory / "index.html").is_file():
            raise RuntimeError("No se encontró la entrada del frontend web.")
        print("web: HTML, CSS y JavaScript; no requiere instalación Python.", flush=True)
        return

    environment = directory / ".venv"
    executable = environment / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    print(f"Instalando {component} en su entorno aislado.", flush=True)
    if executable.is_file():
        version = subprocess.check_output(
            [str(executable), "-c", "import sys; print('.'.join(map(str, sys.version_info[:2])))"],
            text=True,
        ).strip()
        if version != f"{sys.version_info.major}.{sys.version_info.minor}":
            raise RuntimeError("El entorno existente utiliza otra versión de Python.")
    else:
        venv.EnvBuilder(with_pip=True).create(environment)
    subprocess.run([str(executable), "-m", "pip", "install", "--upgrade", "pip"], check=True)

    if component in {"database", "backend"}:
        source = ROOT / COMPONENTS["database"]
        with tempfile.TemporaryDirectory(prefix="sga-db-package-") as staging:
            package = Path(staging)
            shutil.copy2(source / "pyproject.toml", package / "pyproject.toml")
            shutil.copytree(source / "models", package / "models", ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
            subprocess.run(
                [str(executable), "-m", "pip", "install", str(package)],
                check=True,
            )

    if component != "database":
        requirements = "requirements-local-model.txt" if component == "mobile" and local_model else "requirements.txt"
        subprocess.run(
            [str(executable), "-m", "pip", "install", "-r", str(directory / requirements)],
            cwd=directory,
            check=True,
        )

    subprocess.run([str(executable), "-m", "pip", "check"], check=True)
    print(f"{component}: dependencias instaladas y verificadas.", flush=True)


def main():
    parser = argparse.ArgumentParser(description="Instala los componentes WCP en entornos separados.")
    parser.add_argument("component", choices=["all", *COMPONENTS], nargs="?", default="all")
    parser.add_argument("--local-model", action="store_true", help="Incluye llama-cpp-python para el cliente móvil.")
    arguments = parser.parse_args()
    components = list(COMPONENTS) if arguments.component == "all" else [arguments.component]

    if any(component != "web" for component in components) and not (3, 10) <= sys.version_info[:2] <= (3, 12):
        parser.error("Utiliza Python 3.10, 3.11 o 3.12 para las dependencias actuales del proyecto.")

    try:
        for component in components:
            install_component(component, arguments.local_model)
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"No se completó la instalación ({type(error).__name__}). Revisa el componente indicado.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
