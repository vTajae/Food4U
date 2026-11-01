"""Keep the runtime install free of unused local-model/GPU stacks."""
from pathlib import Path
import re


def test_runtime_requirements_exclude_local_model_stacks_and_test_tools():
    requirements = Path(__file__).resolve().parents[1] / "requirements.txt"
    names = {
        re.split(r"[<>=!~\[; ]", line.strip(), maxsplit=1)[0].lower().replace("_", "-")
        for line in requirements.read_text().splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    forbidden = {
        name for name in names
        if name in {"torch", "triton", "transformers", "sentence-transformers", "pytest"}
        or name.startswith("nvidia-")
    }
    assert not forbidden, f"Unused heavy/test runtime requirements: {sorted(forbidden)}"
