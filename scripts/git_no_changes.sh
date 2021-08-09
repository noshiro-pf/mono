if git status --porcelain | grep .; then
    echo Repo is dirty
    exit 1
else
    echo Repo is clean
fi
