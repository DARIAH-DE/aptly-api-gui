# aptly-api-gui

Proof of Concept for a HTML GUI for the [aptly API](https://www.aptly.info/doc/api/).
The GUI is implemented through an [AngularJS](https://angularjs.org/)
on top a [Flask](http://flask.pocoo.org/) API that handles authentication and proxies API requests to aptly.

## Setup

Install flask with its components from `reqirements.txt` into a virtualenv namend `venv`.
Enforce Shibboleth authentication at `/login`.

Add the neccessary options to `settings_local.py`:

```
SECRET_KEY = '*****************'

API_URL = 'http://localhost:8008/api'

ADMIN_GROUPS = 'group01;group07'

SSO_ATTRIBUTE_MAP = {
    'eppn': (True, 'username'),
    'cn': (True, 'fullname'),
    'mail': (True, 'email'),
    'isMemberOf': (False, 'isMemberOf')
}
```

Set up aptly to serve at the url configured.

## Features

* Shibboleth authentication and write access only for admins
* provide dropdown of existing repositories
* show list of packages in the selected repository


## Development

This tool has been developed within the “Humanities at Scale” project.
This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement 675570.


