#!/usr/bin/env bash
set -euo pipefail

npm_version=10.9.4
if [ "$(npm --version)" != "$npm_version" ]; then
  npm install --global "npm@$npm_version" --no-audit --no-fund
fi
node --version
test "$(npm --version)" = "$npm_version"
printf 'npm %s\n' "$npm_version"

lock_hash=$(sha256sum package-lock.json)
check_manifests() {
  sha256sum --check <<< "$lock_hash"
  git diff --exit-code HEAD -- package.json package-lock.json .npmrc
  test -z "$(git ls-files --others --exclude-standard -- package.json package-lock.json .npmrc)"
}

HUSKY=0 npm ci --no-audit --no-fund
check_manifests
npm ls --all
npm run validate
check_manifests
