#!/bin/bash

HERE="$( cd "$(dirname "$0")"; pwd )"

for i in $HERE/*.html; do
	$HERE/../../../scripts/processor/processor \
	       	-date "meta[property='article:published_time']" \
       		-date-property content \
		-date-format '2006-01-02T15:04:05-07:00' \
		-content "div.post-content, div.commentlist" \
		-in $i -out-dir ..
done

