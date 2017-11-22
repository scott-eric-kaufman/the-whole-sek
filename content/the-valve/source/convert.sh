#!/bin/bash

HERE="$( cd "$(dirname "$0")"; pwd )"

for i in $HERE/*.html; do
	$HERE/../../../scripts/processor/processor -date "h2[class='date']" -date-format " Monday, January 02, 2006 " -title "div#content > h3:first-of-type" -title-property '' -content 'div#content' -url 'form#comment_form' -url-property action -in $i -out-dir .
done
