#!/usr/bin/env bash

set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "$0" )" && pwd )"

node ${SCRIPT_DIRECTORY}/hulk.js \
    --wrapper node \
    --variable 'browserTemplates' \
    ${SCRIPT_DIRECTORY}/../src/templates/*.mustache > ${SCRIPT_DIRECTORY}/../src/diff2html-templates.js
