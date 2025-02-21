#!/bin/bash

if git status --porcelain | grep .; then
    echo Repo is dirty
    git add -N .
    git diff
    exit 1
else
    echo Repo is clean
fi
