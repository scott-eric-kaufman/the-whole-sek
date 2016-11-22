#!/bin/bash

for i in $*; do
	T=$( echo "$i" | cut -d/ -f5,6,7 | sed -e 's/\//-/g;' | sed -e 's/_/-/g;' )
	wget -O "${T}" "$i"
	sleep 1s
done

