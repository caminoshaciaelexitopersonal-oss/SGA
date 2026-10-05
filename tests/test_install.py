from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from scripts import install


class InstallerTests(unittest.TestCase):
    def test_web_does_not_install_python(self):
        with patch.object(install.subprocess, "run") as run, patch.object(install.venv, "EnvBuilder") as builder:
            install.install_component("web", False)
        run.assert_not_called()
        builder.assert_not_called()

    def test_backend_installs_models_and_checks_dependencies(self):
        with TemporaryDirectory() as temporary:
            root = Path(temporary)
            database = root / install.COMPONENTS["database"]
            (database / "models").mkdir(parents=True)
            (database / "models/__init__.py").touch()
            (database / "pyproject.toml").write_text('[project]\nname="test"\nversion="1"\n')
            with patch.object(install, "ROOT", root), patch.object(install.venv, "EnvBuilder") as builder, patch.object(install.subprocess, "run") as run:
                install.install_component("backend", False)
            builder.assert_called_once_with(with_pip=True)
            calls = run.call_args_list
            self.assertEqual(len(calls), 4)
            self.assertEqual(calls[2].args[0][-2:], ["-r", str(root / install.COMPONENTS["backend"] / "requirements.txt")])
            self.assertEqual(calls[-1].args[0][-2:], ["pip", "check"])
            self.assertFalse((database / "build").exists())

    def test_mobile_local_model_is_explicit(self):
        with TemporaryDirectory() as temporary, patch.object(install, "ROOT", Path(temporary)), patch.object(install.venv, "EnvBuilder"), patch.object(install.subprocess, "run") as run:
            install.install_component("mobile", True)
            self.assertTrue(run.call_args_list[1].args[0][-1].endswith("requirements-local-model.txt"))

    def test_existing_environment_version_is_preserved(self):
        with TemporaryDirectory() as temporary:
            root = Path(temporary)
            executable = root / install.COMPONENTS["desktop"] / ".venv" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
            executable.parent.mkdir(parents=True)
            executable.touch()
            with patch.object(install, "ROOT", root), patch.object(install.subprocess, "check_output", return_value="3.9\n"), patch.object(install.venv, "EnvBuilder") as builder, patch.object(install.subprocess, "run") as run:
                with self.assertRaises(RuntimeError):
                    install.install_component("desktop", False)
            builder.assert_not_called()
            run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
