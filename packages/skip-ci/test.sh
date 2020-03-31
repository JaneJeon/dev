#!/bin/bash

# use subrepo for testing
cd repo

# last commit contains no skip message
git reset --soft HEAD~1
node ..
e3=$?

# second commit contains a [skip ci]
git reset --soft HEAD~1
node ..
e2=$?

# first commit contains a [ci skip]
node ..
e1=$?
