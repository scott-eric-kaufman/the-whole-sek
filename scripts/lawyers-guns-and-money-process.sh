#!/bin/bash

HERE="$( cd "$(dirname "$0")"; pwd )"

for i in $*; do
	d="$( cd "$(dirname "$i")/.." ; pwd )"
	dt=$( fgrep 'property="article:published_time"' $i | cut -d\" -f4 | cut -c1-10 )
	SLUG=${dt}-$( echo $i | cut -d'-' -f4- | sed -e 's/\.html$//g;' )
	echo "--> $i -> $SLUG.md"
	#"$HERE/lawyers-guns-and-money-to-markdown.js" --file $i.html > "$d/$SLUG.md"
	nodejs "$HERE/lawyers-guns-and-money-to-markdown.js" --file $i.html #> "$d/$SLUG.md"
done
