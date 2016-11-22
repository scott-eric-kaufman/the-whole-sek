#!/bin/bash

for i in $(seq 1 16); do
	wget -O - -q http://www.thevalve.org/go/valve/archive_author/sekaufman/Scott%20Eric%20Kaufman/P${i}/ | grep dc:identifier | cut -d\" -f2 | tee -a urls
done

