---
'split-view-extension': minor
---

Open any pull request on GitHub in a split view, as the PR Manager's links do: a **⧉ Split view** button at the bottom left of every pull request page, and an **Open pull request in Split View** item in the context menu of a link to one. The diff is put beside the conversation, and the issue the pull request closes, when there is one, beside that. Adds the `contextMenus` permission, and a content script on github.com that reads a pull request's title and closing issue from its conversation page.
