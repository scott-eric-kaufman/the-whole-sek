#!/bin/bash

URL="$1"
SECTION="$2"
SLUG="$3"

HERE="$( cd "$(dirname "$0")"; pwd )"

if [ $# -ne 3 ]; then
	echo "$0 URL SECTION SLUG"
	exit 1
fi

wget "$URL" -O "$SLUG.html"
"$HERE/typepad-to-markdown.js" --file $SLUG.html > "$HERE/../content/$SECTION/$SLUG.md"
rm -f "$SLUG.html"

