#!/bin/bash

for i in $*; do
	D=$( wget -O - -q "$i" | grep '<p class="author">' | cut -c103-110 )
	T=$( echo "$i" | cut -d/ -f7 | sed -e 's/_/-/g;' )
	DT="20${D:6:2}-${D:0:2}-${D:3:2}"
	wget -O "${DT}-${T}.html" "$i"
	sleep 5s
done

