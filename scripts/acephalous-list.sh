#!/bin/bash

for i in $(seq 1 116); do
	wget -O - -q http://acephalous.typepad.com/acephalous/page/${i}/ | grep "entry-header" | cut -d\" -f4 | tee -a urls
	sleep 1s
done

