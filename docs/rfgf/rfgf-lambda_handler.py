#!/data/data/com.termux/files/usr/bin/python
#
# curl "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getequipo&codequipo=5514262" | jq
#
import json
import pprint
import requests
import contextlib
import warnings
from urllib3.exceptions import InsecureRequestWarning


url_rfgf = 'https://appweb.futgal.es/pnfg/'

url_login = url_rfgf+'NLogin?codcliente=1&key=04c886166b0ba1cc267eedcba81aa806eb81ee3e&token=ExponentPushToken%5BvQvnFlHB7T7rywcx31GecP%5D&version=3.0.35'

COD_TEMPORADA=20
JSESSIONID=None

session = requests.Session()
session.verify = False

old_merge_environment_settings = requests.Session.merge_environment_settings
@contextlib.contextmanager
def no_ssl_verification():
    opened_adapters = set()

    def merge_environment_settings(self, url, proxies, stream, verify, cert):
        # Verification happens only once per connection so we need to close
        # all the opened adapters once we're done. Otherwise, the effects of
        # verify=False persist beyond the end of this context manager.
        opened_adapters.add(self.get_adapter(url))

        settings = old_merge_environment_settings(self, url, proxies, stream, verify, cert)
        settings['verify'] = False
        return settings

    requests.Session.merge_environment_settings = merge_environment_settings
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', InsecureRequestWarning)
            yield
    finally:
        requests.Session.merge_environment_settings = old_merge_environment_settings
        for adapter in opened_adapters:
            try:
                adapter.close()
            except:
                pass

def login(id=None):
    global JSESSIONID

    headers = {
            "User-Agent": "okhttp/4.11.0",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Accept": "*/*",
        }

    if id:
        JSESSIONID = id
        headers['Cookie'] = "JSESSIONID="+JSESSIONID

    finished = False
    cont=0
    session_ok = False

    while not finished:
        cont += 1
        if cont > 5:
            break

        response = session.get(url_rfgf, headers=headers, verify=False)
        if response.status_code == 200:
            JSESSIONID = session.cookies.get_dict()['JSESSIONID']

            result=response.json()
            if result['sesion_ok'] == '1':
                session_ok = True
                break

            payload = {"headers": {"pragma": "no-cache", "cache-control": "no-cache"}}
            headers['Cookie'] = "JSESSIONID="+JSESSIONID
            response = requests.post(url_login, data=json.dumps(payload), headers=headers, verify=False)
            # Check if the request was successful (status code 200)
            if response.status_code == 200:
                #print("Response Body:", response.json())
                result=response.json()
                if result['sesion_ok'] == '1':
                    finished = True
                    session_ok = True

    return session_ok

def get_equipo(codequipo):
    headers = {
            "User-Agent": "okhttp/4.11.0",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Accept": "*/*",
            "Cookie" : "JSESSIONID="+JSESSIONID,
            "authorization" : "4f4a25d3e9f1ec32371afef904478c2f90fc2fc7"
        }


    url = f"{url_rfgf}NPcd/NSMApi_HomeDatosEquipo?codequipo={codequipo}&cod_temporada={COD_TEMPORADA}&v2=1"

    value = {
        "agent" : "AWS",
        "is_ok":"false",
        "data":""
    }
    response = requests.get(url, headers=headers, verify=False)
    if response.status_code == 200:
        #print("Response Body:", response.json())
        value["is_ok"] = "true"
        value["data"] = response.json()
    else:
        print(response.content)

    return value


def lambda_handler(event, context):
    response = {}
    no_ssl_verification()

    params = event['queryStringParameters']
    if 'JSESSIONID' in params:
        id = params['JSESSIONID']
    else:
        id=None
    if login(id):
        if params['type'] == 'getequipo':
            response = get_equipo(params['codequipo'])



    return {
        'statusCode': 200,
        'body': response
    }


def pretty(var):
    try:
        print(json.dumps(var, indent=4))
    except TypeError:
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(var)


if __name__ == "__main__":
    event = {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": "/",
        "rawQueryString": "param1=value1&paran2=value2",
        "headers": {
            "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
            "x-amzn-tls-version": "TLSv1.3",
            "x-amzn-trace-id": "Root=1-66ec017a-4edec7045cb52fb039d6da3e",
            "x-forwarded-proto": "https",
            "host": "pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws",
            "x-forwarded-port": "443",
            "x-forwarded-for": "83.165.98.109",
            "accept": "*/*",
            "user-agent": "curl/7.68.0"
        },
        "queryStringParameters": {
            "type": "getequipo",
            "codequipo": "5514262"
        },
        "requestContext": {
            "accountId": "anonymous",
            "apiId": "pevbxmstzqkdtno6y4ocsumnz40kbdac",
            "domainName": "pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws",
            "domainPrefix": "pevbxmstzqkdtno6y4ocsumnz40kbdac",
            "http": {
                "method": "GET",
                "path": "/",
                "protocol": "HTTP/1.1",
                "sourceIp": "83.165.98.109",
                "userAgent": "curl/7.68.0"
            },
            "requestId": "111c2023-b3c0-4654-b69b-b928f176635f",
            "routeKey": "$default",
            "stage": "$default",
            "time": "19/Sep/2024:10:48:26 +0000",
            "timeEpoch": 1726742906540
        },
        "isBase64Encoded": False
    }
    out = lambda_handler(event, None)
    pretty(out)
