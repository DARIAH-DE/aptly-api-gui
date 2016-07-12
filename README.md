# aptly-api-gui

Proof of Concept for a HTML GUI for the [aptly API](https://www.aptly.info/doc/api/).
The GUI is implemented through an [AngularJS](https://angularjs.org/)
on top a [Flask](http://flask.pocoo.org/) API that handles authentication and proxies API requests to aptly.

This app supports only the features required for [DARIAH](https://de.dariah.eu) and is designed to be run on DARIAH infrastructure.
In particular, only a subset of API calls are supported and authentication is supported through [Shibboleth](https://wiki.de.dariah.eu/display/publicde/DARIAH+AAI+Documentation) only!

## Features

* Shibboleth authentication and write access only for admins
* provide dropdown of existing repositories
* show list of packages in the selected repository
* allow to copy packages to other repositories

## Setup

Install flask with its components from `reqirements.txt` into a virtualenv named `venv`:
```Bash
virtualenv venv
source venv/bin/activate
pip install -r requirements
```

Add the WSGI app to Apache and enforce Shibboleth authentication at `/login`:
```Apache
WSGIDaemonProcess aptlygui user=www-data group=www-data threads=5 python-path=/opt/aptly-api-gui/venv
WSGIScriptAlias /aptly /opt/aptly-api-gui/aptlygui.wsgi

<Location /aptly>
  WSGIProcessGroup aptlygui
  WSGIApplicationGroup %{GLOBAL}
  Require all granted
</Location>

<Location /aptly/login>
  AuthType shibboleth
  ShibRequestSetting requireSession true
  Require valid-user
</Location>
```

Add the neccessary options to `settings_local.py`:

```Python
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

## Development

This tool has been developed within the “Humanities at Scale” project.
This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement 675570.


