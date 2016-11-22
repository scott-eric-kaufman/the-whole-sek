#!/bin/bash

SECTION=$1
SLUG=$2

if [ $# -ne 2 ]; then
	echo "$0 section slug"
	exit 1
fi

if [ ! -d ./content ]; then
	echo "MUST BE RUN FROM ROOT OF REPOSITORY"
	exit 1
fi

B=images/${SECTION}/${SLUG}

mkdir -p $B
cat content/$SECTION/$SLUG.md | grep -iE '^!\[' | cut -d'[' -f2 | cut -d']' -f1 | while read X; do
	Y=$( echo $X | cut -c1-4 )
	Z=$( echo $X | cut -c5-6 )
	wget -O $B/$X.jpg http://i.onionstatic.com/avclub/$Y/$Z/original/640.jpg
done

git add $B
