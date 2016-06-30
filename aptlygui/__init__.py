#  Copyright 2016 SUB Goettingen
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

"""
aptlygui flask app providing a gui for aptly repo api
"""

import requests, json
from datetime import datetime

from flask import Flask, Response, session, request, redirect, render_template, jsonify
from flask_sso import SSO

app = Flask(__name__)

app.config.from_object('settings_local')
app.secret_key = app.config['SECRET_KEY']

app.config.setdefault('SSO_ATTRIBUTE_MAP', app.config['SSO_ATTRIBUTE_MAP'])
app.config.setdefault('SSO_LOGIN_URL', '/login')
ext = SSO(app=app)

# Exception class http://flask.pocoo.org/docs/0.10/patterns/apierrors/
class InvalidAPIUsage(Exception):
    status_code = 400
    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload
    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.message
        return rv

# register errorhandler
@app.errorhandler(InvalidAPIUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


def userisadmin():
    ret = False
    if 'user' in session:
        user_groups = session['user'].get('isMemberOf').split(';')
        admin_groups = app.config['ADMIN_GROUPS'].split(';')
        groups_intersection = set.intersection(set(user_groups),set(admin_groups))
        if groups_intersection:
            ret = True
    return ret

def writeaccesstorepo(repo):
    if userisadmin():
        ret = True
    else:
        ret = False
    return ret

def maypublish():
    if userisadmin():
        ret = True
    else:
        ret = False
    return ret

@ext.login_handler
def login(user_info):
    session['user'] = user_info
    return redirect('/')

@app.route('/logout')
def logout():
    session.pop('user')
    return redirect('/')

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def apicall(path):
    ret = ''
    if request.method == 'GET' and path == 'repos':
        '''allow to GET the repo list but add writablility-info'''
        response = requests.get(app.config['API_URL']+'/repos')
        if response.status_code != 200:
            raise InvalidAPIUsage('There was a back end error!', status_code=response.status_code)
        data = []
        for item in response.json():
            item['Writable']=writeaccesstorepo(item['Name'])
            data.append(item)
        ret = Response(response=json.dumps(data), status=200, mimetype='application/json')
    elif request.method == 'GET':
        '''always allow GET requests'''
        response = requests.get(app.config['API_URL']+'/'+path, params=dict(request.args.items()))
        if response.status_code != 200:
            raise InvalidAPIUsage('There was a back end error!', status_code=response.status_code)
        ret = Response(response=json.dumps(response.json()), status=200, mimetype='application/json')
    elif path.startswith('publish/'):
        if maypublish():
            response = requests.put(app.config['API_URL']+'/'+path, data=request.get_json())
            if response.status_code != 200:
                raise InvalidAPIUsage('There was a back end error!', status_code=response.status_code)
            ret = Response(response=json.dumps(response.json()), status=200, mimetype='application/json')
        else:
            raise InvalidAPIUsage('Access denied.', status_code=403)
    else:
        if path.startswith('repos/'):
            repo = path[6:]
            if repo.find('/'):
                repo = repo[0:repo.find('/')]
            if writeaccesstorepo(repo):
                if request.method == 'POST':
                    response = requests.post(app.config['API_URL']+'/'+path, headers={'content-type': 'application/json'}, data=request.data)
                    app.logger.error(app.config['API_URL']+'/'+path)
                    app.logger.error(request.headers)
                    app.logger.error(request.get_json())
                    if response.status_code != 200:
                        app.logger.error(response)
                        raise InvalidAPIUsage('There was a back end error!', status_code=response.status_code)
                    ret = Response(response=json.dumps(response.json()), status=200, mimetype='application/json')
                elif request.method == 'DELETE':
                    response = requests.delete(app.config['API_URL']+'/'+path, headers=request.headers, data=request.data)
                    app.logger.error(app.config['API_URL']+'/'+path)
                    app.logger.error(request.headers)
                    app.logger.error(request.get_json())
                    if response.status_code != 200:
                        raise InvalidAPIUsage('There was a back end error!', status_code=response.status_code)
                    ret = Response(response=json.dumps(response.json()), status=200, mimetype='application/json')
                else:
                    raise InvalidAPIUsage('Unknown request!', status_code=400)
            else:
                raise InvalidAPIUsage('Access denied.', status_code=403)
        else:
            raise InvalidAPIUsage('Something wrong!', status_code=400)
    return ret


@app.route('/')
def index():
    username = None
    if 'user' in session:
        username = session['user'].get('username')
        member = session['user'].get('isMemberOf')
    else:
        username = None
        member = None
    return render_template('index.html',username=username,member=member)

if __name__ == '__main__':
    app.run()
