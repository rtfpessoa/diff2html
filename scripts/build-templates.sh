#!/usr/bin/env bash

set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "$0" )" && pwd )"

node ${SCRIPT_DIRECTORY}/../build/scripts/hulk.js \
    --wrapper ts \
    --variable 'defaultTemplates' \
    ${SCRIPT_DIRECTORY}/../src/templates/*.mustache > ${SCRIPT_DIRECTORY}/../src/diff2html-templates.ts
