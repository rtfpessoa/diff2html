## How to contribute to diff2html

### Main rules

* Before you open a ticket or send a pull request, [search](https://github.com/rtfpessoa/diff2html/issues) for previous discussions about the same feature or issue. Add to the earlier ticket if you find one.

* If you're proposing a new feature, make sure you create an issue to let other contributors know what you are working on.

* Before sending a pull request make sure your code is tested.

* Before sending a pull request for a feature, be sure to run tests with `yarn test`.

* Use the same coding style as the rest of the codebase, most of the check can be performed with `yarn run lint`.

* Use `git rebase` (not `git merge`) to sync your work from time to time with the master branch.

* After creating your pull request make sure the build is passing on [CircleCI](https://circleci.com/gh/rtfpessoa/diff2html)
and that [Codacy](https://www.codacy.com/app/Codacy/diff2html) is also confident in the code quality.

* In your pull request, do not commit the `dist` or `build` folder if you needed to build the release files.

### Commit Style

Writing good commit logs is important. A commit log should describe what changed and why.
Follow these guidelines when writing one:

1. The first line should be 50 characters or less and contain a short
   description of the change prefixed with the name of the changed
   subsystem (e.g. "net: add localAddress and localPort to Socket").
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.

A good commit log can look something like this:

```
subsystem: explaining the commit in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc. etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.
```

### Developer's Certificate of Origin 1.0

By making a contribution to this project, I certify that:

* (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the open source license indicated
  in the file; or
* (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source license
  and I have the right under that license to submit that work with
  modifications, whether created in whole or in part by me, under the
  same open source license (unless I am permitted to submit under a
  different license), as indicated in the file; or
* (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified it.
