if git status --porcelain | grep .; then
    echo Repo is dirty
else
    echo Repo is clean
fi
