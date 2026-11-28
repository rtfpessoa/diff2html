#!/usr/bin/env bash
set -euo pipefail

# Run only the version calculation in the legacy image; Actions run on the host.
image=codacy/git-version@sha256:9f533f4815c4cebdbc19083dea61c8e5e8ce989412c72b0351cc5480b7a48c36
version=$(docker run --rm --network none \
  --mount "type=bind,source=$PWD,target=/workspace,readonly" \
  --entrypoint /bin/sh "$image" -ec '
    git config --global --add safe.directory /workspace
    exec /bin/git-version --folder=/workspace --release-branch=master
  ')
[[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
printf '%s\n' "$version" > next-version.txt
printf '%s\n' latest > publish-tag.txt
