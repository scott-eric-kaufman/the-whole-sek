#!/bin/bash

for PNG in $*; do
	JPG="${PNG//.png}.jpg"
	convert "$PNG" "$JPG" && rm -v "$PNG"
done

