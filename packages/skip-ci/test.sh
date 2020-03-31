#!/bin/bash

# use subrepo for testing
cd skip-ci-test

# first commit contains no skip message
git reset --hard 31f3670cfcc67252bfa6af8e0a4b1f8eb3d92ef4
node ..
e1=$?

# second commit contains a [skip ci]
git reset --hard 2ab295a54c63ec36543079e65c69c6fd5e18634a
node ..
e2=$?

# first commit contains a [ci skip]
git reset --hard 4b01fbf57648adc7303d3762a934ead866470a58
node ..
e3=$?

git reset --hard HEAD

if [[ $e1 -eq 0 && $e2 -eq 1 && $e3 -eq 1 ]]; then
    echo 'Test passed!'
else
    echo "Test failed! Exit codes: $e1, $e2, $e3"
    exit 1
fi
