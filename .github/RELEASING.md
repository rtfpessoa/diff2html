# Releasing diff2html

A push to `master` in `rtfpessoa/diff2html`, including a PR merge, starts `.github/workflows/release.yml`. The workflow
validates the locked build, publishes `diff2html` to npm and `@rtfpessoa/diff2html` to GitHub Packages, tags the commit,
and deploys the website. PR and non-master push checks do not publish.

The [npm trusted publisher](https://docs.npmjs.com/trusted-publishers/) for `diff2html` must point to
`rtfpessoa/diff2html`, workflow `release.yml` (the caller), and environment `production`. Under **Allowed actions**,
enable direct `npm publish`; allowing only `npm stage publish` is not enough. The npm publish step uses GitHub OIDC; the
GitHub Packages step uses `GITHUB_TOKEN` separately.

## Recovering a failed release

Before retrying, record the exact commit and stamped version from the failed run. Check for that version in **both**
registries and check whether the remote Git tag exists. A workflow retry starts the failed job from the beginning; it
does not resume at the failed step.

- **Nothing published and no tag:** fix the failure, verify that the same version and commit are still intended, then
  retry the failed release. If the fix changes the workflow, validate it in a new run; a retry uses the original commit.
- **One registry published:** do not blindly rerun the publish job. Verify that registry's tarball matches the intended
  release, then arrange a reviewed recovery for the missing registry from the same commit and version. If that cannot be
  verified, stop and plan a new unused version instead of replacing an existing artifact.
- **Both registries published:** verify both tarballs. Resume only the unfinished tag, artifact upload or website
  deploy. Create a missing tag only for the commit that produced both packages. Stop if an existing tag points
  elsewhere.

Do not move or delete an existing tag as part of a retry. A legacy tag can exist without either package version; use a
new, unused version for a new release and verify the version calculation before merging.
