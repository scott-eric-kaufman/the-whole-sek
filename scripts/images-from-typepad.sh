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
	wget -O $B/$X.jpg http://acephalous.typepad.com/.a/${X}-800wi 
	JPG=$( file $B/$X.jpg | grep JPEG 2>&1 > /dev/null ; echo $? )
	if [ $JPG -ne 0 ]; then
		mv $B/$X.jpg $B/$X.png -v
	fi
done

git add $B

