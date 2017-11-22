#!/bin/bash

HERE="$( cd "$(dirname "$0")"; pwd )"

for i in $HERE/*.html; do
	$HERE/../../../scripts/processor/processor \
	       	-date "meta[property='article:published_time']" \
		-date-property 'content' \
	       	-date-format "2006-01-02T15:04:05-07:00" \
	       	-title "p[id='breadcrumbs'] > strong" \
	       	-title-property '' \
	       	-content "div[class='entry'] > p" \
	       	-url "meta[property='og:url']" \
	       	-url-property 'content' \
	       	-in $i -out-dir ..
done
