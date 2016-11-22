#!/bin/bash

Y=$1

for P in $( seq 1 60 ); do
	wget -O - -q https://edgeofthewest.wordpress.com/$Y/page/$P/ | \
		grep scotterickaufman -B 2 | \
		grep 'rel="bookmark"' | \
		cut -d\" -f6 | \
		tee -a urls
done
