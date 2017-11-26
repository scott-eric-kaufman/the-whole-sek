#!/bin/bash

HERE="$( cd "$(dirname "$0")"; pwd )"

for i in $HERE/*.html; do
	$HERE/../../../scripts/processor/processor \
	       	-date "h2[class='date-header']" \
		-date-property '' \
	       	-date-format "Monday, 02 January 2006" \
	       	-title "meta[property='og:title']" \
	       	-title-property 'content' \
	       	-content "div[class='entry-content'], div[class='comments']" \
	       	-url "meta[property='og:url']" \
	       	-url-property 'content' \
	       	-in $i -out-dir ..
done
