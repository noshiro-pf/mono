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
# `env_file` itself; rename it in both places or neither.
#
# The Bash tool does not see `env_file` on its own: it replays a PATH captured
# when the session starts, which lacked it even while `~/.bashrc` sourced the
# file (after its interactive guard), and `BASH_ENV` set as an environment
# variable was unset there. So the hook also appends it to `CLAUDE_ENV_FILE`,
# which Claude Code sources before each Bash tool command, and the links in
# `~/.local/bin`, which the image's PATH puts ahead of `/opt/node22/bin`, cover
# a session that loads no hooks, such as one with several repositories.

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

# PATH only. The environment already runs Node with `--use-openssl-ca`, which
# trusts the proxy's CA, and Node 26 exits 9 when `NODE_USE_SYSTEM_CA` is set
# beside it.
echo "export PATH=\"${node_dir}/bin:\$PATH\"" > "$env_file"
# Nothing to follow: the file is the one line written just above.
# shellcheck source=/dev/null
. "$env_file"

# Assigned first: `set -e` ignores a substitution that fails inside an
# argument, which would install `pnpm@`, the latest.
pnpm_version=$(node -p 'require("./package.json").packageManager.replace(/^pnpm@/, "")')
# Node 25 and later ship no corepack.
npm install -g "pnpm@${pnpm_version}"

# After the pnpm install, so that its commands are linked too.
mkdir -p ~/.local/bin
ln -sf "${node_dir}"/bin/* ~/.local/bin/

# Fills the store from the lockfile alone; the hook installs the packages, and
# a failure here is the hook's to report.
pnpm fetch || true

node -v
pnpm -v
