#!/bin/bash

#
# diff2html website release script
# by rtfpessoa
#

set -e

INPUT_DIR=website
INPUT_URL_JS=${INPUT_DIR}/templates/pages/url/url.js

OUTPUT_DIR=docs
OUTPUT_URL_JS=${OUTPUT_DIR}/url.js
OUTPUT_URL_MIN_JS=${OUTPUT_DIR}/url.min.js

echo "Creating diff2html website release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_URL_JS}

echo "Generating website js aggregation file in ${OUTPUT_URL_JS}"
browserify -e ${INPUT_URL_JS} -o ${OUTPUT_URL_JS}

echo "Minifying ${OUTPUT_URL_JS} to ${OUTPUT_URL_MIN_JS}"
uglifyjs ${OUTPUT_URL_JS} -c -o ${OUTPUT_URL_MIN_JS}

echo "Generating HTMLs from templates ..."
node ./scripts/release-website.js

echo "diff2html website release created successfully!"
