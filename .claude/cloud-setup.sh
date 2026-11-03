#!/bin/bash
# The setup script of the Claude Code cloud environment (claude.ai/code,
# environment settings), kept here so that it is reviewed like code.
#
# **Editing this file changes nothing until it is pasted into the
# environment's "Setup script" field.** The environment runs its own copy, as
# root on Ubuntu 24.04, on the first session only: the filesystem it leaves is
# snapshotted and reused for about seven days, or until the field changes. A
# run over about five minutes is not snapshotted, and a non-zero exit stops the
# session from starting.
#
# It provisions what the image lacks — the Node.js of `volta.node` (the image
# has 20 to 22, with 22 first on PATH) and the pnpm of `packageManager` — and
# fetches the lockfile into the pnpm store. The snapshot is of one commit and
# later sessions start from a fresh clone, so the install a session uses is
# the `SessionStart` hook in `.claude/settings.json`, which runs offline-first
# against that store. A plain `bash -c` reads no profile, so the hook sources
# `env_file` itself; rename it in both places or neither. Setting the
# environment variable `BASH_ENV` to the same path gives every other
# non-interactive shell this Node too.

set -euxo pipefail

env_file=/etc/profile.d/claude-cloud-node.sh

is_repo() {
  [ -f "$1/pnpm-workspace.yaml" ] && grep -q '"name": "mono"' "$1/package.json" 2>/dev/null
}

# Neither the working directory nor the clone path is documented.
repo=$(git rev-parse --show-toplevel 2>/dev/null || true)
if ! is_repo "$repo"; then
  repo=''
  while IFS= read -r f; do
    if is_repo "$(dirname "$f")"; then
      repo=$(dirname "$f")
      break
    fi
  done < <(find / -maxdepth 5 \( -path /proc -o -path /sys -o -name node_modules \) -prune \
    -o -name pnpm-workspace.yaml -print 2>/dev/null)
fi
# Not fatal: a non-zero exit would leave no session at all, where this leaves
# one on the image's Node, with the hook installing from an empty store.
if [ -z "$repo" ]; then
  echo 'cloud-setup.sh: the repository was not found; nothing was set up' >&2
  exit 0
fi
cd "$repo"

node_version=$(node -p 'require("./package.json").volta.node')
node_dir="/opt/node-v${node_version}"

# The official binaries need libatomic.so.1, which a bare Ubuntu lacks. Not
# `grep -q`: it stops reading, and under pipefail the SIGPIPE it leaves
# `ldconfig` reads as "missing".
if ! ldconfig -p | grep 'libatomic\.so\.1 ' > /dev/null; then
  apt-get update -q
  apt-get install -y -q --no-install-recommends libatomic1
fi
if [ ! -x "${node_dir}/bin/node" ]; then
  mkdir -p "$node_dir"
  curl -fsSL "https://nodejs.org/dist/v${node_version}/node-v${node_version}-linux-x64.tar.xz" |
    tar -xJ -C "$node_dir" --strip-components=1
fi

# The system store as well as Node's own, for a proxy whose CA only the system
# trusts.
cat > "$env_file" << EOF
export PATH="${node_dir}/bin:\$PATH"
export NODE_USE_SYSTEM_CA=1
EOF
grep -qF "$env_file" ~/.bashrc 2>/dev/null || echo ". ${env_file}" >> ~/.bashrc
. "$env_file"

# Node 25 and later ship no corepack.
npm install -g "pnpm@$(node -p 'require("./package.json").packageManager.replace(/^pnpm@/, "")')"

# Fills the store from the lockfile alone; the hook installs the packages, and
# a failure here is the hook's to report.
pnpm fetch || true

node -v
pnpm -v
