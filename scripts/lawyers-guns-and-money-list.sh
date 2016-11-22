#!/bin/bash

for i in $(seq 1 83); do
	wget -O - -q http://www.lawyersgunsmoneyblog.com/author/sek/page/$i | grep post-title | cut -d\" -f4 | tee -a urls
done

