# Note: this justfile should work for anyone using MacOS, however with some work we can probably get it to also work on
# Windows if we use the [unix] and [windows] attributes on the commands that execute shell scripts:
#   https://just.systems/man/en/attributes.html#enabling-and-disabling-recipes180

[private]
default:
    just --list

currentBranch := `git branch --show-current`
branchAsTag := replace(currentBranch, '_', '-')
packageName := '@labkey/api'
pwd := `pwd`

# We quote the paths from our environment variables so these variables will work even if the paths contains spaces
# We trim the trailing / from our environment variables so we can treat them consistently with our other paths
components := quote(trim_end_match(env('LABKEY_UI_COMPONENTS_HOME'), '/') / 'packages/components')
premium := quote(trim_end_match(env('LABKEY_UI_PREMIUM_HOME'), '/'))
distPath := 'node_modules' / packageName / 'dist'
sourceDist := pwd / 'dist/'
modulesToBump := components + ' ' + premium
copyLocations := append('/' + distPath, modulesToBump)

# Builds the package
build:
    npm run build

# Copies built package to NODE_MODULES directory for every module listed in copyLocations
copy:
    #!/usr/bin/env zsh
    set -euo pipefail
    for module in {{ copyLocations }}; do
        echo '{{ GREEN }}'Copying built package to '{{CYAN}}'$module'{{ NORMAL }}'
        rsync -ra {{ sourceDist }} $module
    done

# Builds the package and copies it to NODE_MODULES for every module listed in copyLocations
bc: build copy

# Bumps version to a prerelease version based on the current branch name
preVersion:
    @echo {{ GREEN }}Bumping prerelease version with preid='{{CYAN}}'{{ branchAsTag }}{{ NORMAL }}
    @npm version prerelease --preid {{ branchAsTag }} --no-git-tag-version

# Publishes the current version with the current branch name as a tag
publishPreVersion:
    @echo {{ GREEN }}Publishing prerelease package{{ NORMAL }}
    @npm publish --tag {{ branchAsTag }}

[private]
sleep:
    @echo {{ GREEN }}"Sleeping so artifactory doesn't return 404"{{ NORMAL }}
    @sleep 6

# Lists the modules in the 'modulesToBump' variable
listModules:
    #!/usr/bin/env zsh
    set -euo pipefail
    for module in {{ modulesToBump }}; do
        echo $module
    done

# Stored as a string because we want to execute this when scripts are run, not when the justfile is evaluated, so we
# always have the most up to date version.
currentVersionImport := quote("require('./package.json').version")

# lists the current package version
version:
    @echo $(node -p -e {{ currentVersionImport }})

# Bumps the @labkey/api package to the current version in every module listed in the modulesToBump variable
bump:
    #!/usr/bin/env zsh
    set -euo pipefail
    v=$(node -p -e {{ currentVersionImport }})
    echo '{{ GREEN }}'Bumping {{ packageName }} to '{{CYAN}}'$v'{{ NORMAL }}'
    for module in {{ modulesToBump }}; do
        pushd $module
        echo '{{ GREEN }}'Bumping {{ packageName }} in '{{CYAN}}'$(pwd)'{{ NORMAL }}'
        npm install --legacy-peer-deps --save-exact {{ packageName }}@$v
        popd
    done

# Bumps the version to a prerelease version based on the current branch name, publishes the version, and bumps it in every module listed in modulesToBump
release: preVersion publishPreVersion sleep bump

# Bumps the major version
major:
    npm version major --no-git-tag-version

# Bumps the minor version
minor:
    npm version minor --no-git-tag-version

# Bumps the patch version
patch:
    npm version patch --no-git-tag-version

# Publishes the current version, must be a production version
publish:
    npm publish

pb: publish sleep bump
