#!/bin/bash

#
# diff2html update bower version
# by rtfpessoa
#

set -e

echo "diff2html updating bower version..."

RELEASE_VERSION=$(cat package.json | grep "version" | head -1 | gsed -e 's/  "version": "\(.*\)",/\1/')

gsed -i 's/.*"version".*/  "version": "'${RELEASE_VERSION}'",/' bower.json

echo "diff2html updated bower version successfully!"
