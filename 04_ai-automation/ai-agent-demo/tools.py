"""Generic CLI command execution helpers."""

import subprocess


def run_cli_command(command: str) -> dict[str, str]:
    """Run a shell command and return structured execution details."""
    # We use the shell so the model can suggest real Linux commands, while still
    # capturing stdout, stderr, and the exit code for the explanation step.
    try:
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            shell=True,
            timeout=20,
        )
    except subprocess.TimeoutExpired:
        return {
            "command": command,
            "exit_code": "timeout",
            "stdout": "",
            "stderr": "Command timed out after 20 seconds.",
        }
    except Exception as error:
        return {
            "command": command,
            "exit_code": "error",
            "stdout": "",
            "stderr": f"Command execution error: {error}",
        }

    return {
        "command": command,
        "exit_code": str(result.returncode),
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
    }
