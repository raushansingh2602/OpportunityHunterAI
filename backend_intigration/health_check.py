import urllib.request
import sys

url = 'http://127.0.0.1:8000/api/health'
try:
    with urllib.request.urlopen(url, timeout=5) as r:
        print(r.status)
        print(r.read().decode())
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
