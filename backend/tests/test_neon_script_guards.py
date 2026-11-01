"""Production denial is effective even under python -O, without network I/O."""
import os
from pathlib import Path
import subprocess
import sys

import pytest


@pytest.mark.parametrize("optimized", [False, True])
@pytest.mark.parametrize("script", ["neon_pooler_check.py", "neon_request_session_check.py"])
@pytest.mark.parametrize("production_pooler", [False, True])
@pytest.mark.parametrize("mixed_case", [False, True])
def test_neon_scripts_refuse_production_before_network(script, optimized, production_pooler, mixed_case):
    backend = Path(__file__).resolve().parents[1]
    production = "ep-production" + ("-pooler" if production_pooler else "") + ".neon.tech"
    code = """
import os, runpy, socket
from unittest.mock import patch
attempts = []
original_connect = socket.socket.connect
def connect(sock, address):
    if address[0] in ('127.0.0.1', '::1'):
        return original_connect(sock, address)
    return forbidden(address)
def forbidden(*args, **kwargs):
    attempts.append(True)
    raise RuntimeError('NETWORK_ATTEMPT_FORBIDDEN')
with patch('dotenv.dotenv_values', return_value={'DATABASE_URL': 'postgresql://u:p@' + os.environ['TEST_PRODUCTION_HOST'] + '/db'}), patch('socket.getaddrinfo', forbidden), patch('socket.socket.connect', connect):
    try:
        runpy.run_path(os.environ['TEST_SCRIPT'], run_name='__main__')
    except SystemExit as error:
        if attempts or 'production is prohibited' not in str(error):
            raise RuntimeError('production guard did not refuse before network')
    else:
        raise RuntimeError('production guard did not refuse')
"""
    target = "EP-PRODUCTION-pooler.neon.tech" if mixed_case else "ep-production-pooler.neon.tech"
    env = {**os.environ, "TEST_PRODUCTION_HOST": production,
           "TEST_SCRIPT": str(backend / "scripts" / script),
           "DATABASE_URL": "postgresql://u:p@" + target + "/db",
           "NEON_TEST_POOLER_HOST": target,
           "DATABASE_URL_UNPOOLED": "postgresql://u:p@ep-production.neon.tech/db",
           "NEON_READ_HOST": "ep-production.neon.tech", "NEON_LEAK_EXPECT": "green"}
    args = [sys.executable] + (["-O"] if optimized else []) + ["-c", code]
    result = subprocess.run(args, cwd=backend, env=env, capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, result.stderr
