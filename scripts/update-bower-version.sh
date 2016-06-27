#!/bin/bash

#
# diff2html update bower version
# by rtfpessoa
#

set -e

echo "diff2html updating bower version..."

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  SED_BIN=sed
elif [[ "$OSTYPE" == "darwin"* ]]; then
  SED_BIN=gsed
else
  echo "Cannot run this script in ${OSTYPE}"
  exit 1
fi

RELEASE_VERSION=$(cat package.json | grep "version" | head -1 | $SED_BIN -e 's/  "version": "\(.*\)",/\1/')

$SED_BIN -i 's/.*"version".*/  "version": "'${RELEASE_VERSION}'",/' bower.json

echo "diff2html updated bower version successfully!"
