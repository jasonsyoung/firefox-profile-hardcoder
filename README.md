# firefox-profile-hardcoder
A macOS utility for hardcoding a profile into a Firefox.app, so that app bundle always launches a specific profile. This modifies the application bundle, so an update might overwrite the changes. This was developed because I coud not find an easy way to have two Firefox channels in my dock launch separate profiles without having an extra dock icon appear.

## Usage
```
usage: firefox-profile-hardcoder [-h] [-v] -a APP -p PROFILE [-n]

Updates a Firefox.app to load a specific profile

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -a APP, --app APP     The Firefox application to update
  -p PROFILE, --profile PROFILE
                        The Firefox profile to use
  -n, --no-backup       Don't first backup application
```

### Examples
Modify Firefox.app to launch the `jason` profile. This will first copy Firefox.app to Firefox.app.backup then modify.
```
firefox-profile-hardcoder -a /Applications/Firefox.app -p jason
```

If you don't care about backing up (all this package does is modify two files), you can add the `-n` parameter:
```
firefox-profile-hardcoder -a /Applications/Firefox.app -p jason -n
```

## Install
`npm install -g firefox-profile-hardcoder`
