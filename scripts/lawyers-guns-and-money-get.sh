#!/bin/bash

for i in $*; do
	wget -c "$i" -O "$(echo $i | cut -d/ -f4,5,6,7 | sed -e 's/\/$//;' | sed -e 's/\//-/g;').html"
done
