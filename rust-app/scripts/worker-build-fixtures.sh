#!/bin/sh
# Supported adapter override: genuine Cargo features, explicit dev builds only.
set -eu
real="$(readlink -f "${FOOD4U_WORKER_BUILD_REAL:-${CARGO_HOME:-$HOME/.cargo}/bin/worker-build}")"
if [ "$real" = "$(readlink -f "$0")" ]; then
  echo "Fixture worker-build wrapper must not delegate to itself" >&2; exit 1
fi
if [ "$("$real" --version)" != "0.8.7" ]; then
  echo "Fixture builds require the real pinned worker-build 0.8.7" >&2; exit 1
fi
if [ "$#" = 1 ] && [ "$1" = "--version" ]; then
  exec "$real" --version
fi
if [ "$#" = 0 ] || [ "$1" != "--dev" ]; then
  echo "Refusing fixture features outside an explicit dev build" >&2; exit 1
fi
case " $* " in
  *" -- "*) exec "$real" "$@" --features debug-fixtures ;;
  *) echo "Expected adapter Cargo-argument delimiter" >&2; exit 1 ;;
esac
