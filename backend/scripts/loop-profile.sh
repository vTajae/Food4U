#!/usr/bin/env bash
# Feedback loop: mint a JWT (secret from $JWT_SECRET_KEY) for a user_id and hit the backend.
# Usage: JWT_SECRET_KEY=... loop-profile.sh <user_id> [path ...]
B=${B:-https://food4u-qxcn.onrender.com}; uid=$1; shift; paths=${@:-/profile /user/profile}
E=$(( $(date +%s) + 1800 ))
T=$(python -I -c "
import hmac,hashlib,base64,json,os,sys
b=lambda d: base64.urlsafe_b64encode(json.dumps(d,separators=(',',':')).encode()).rstrip(b'=').decode()
h=b({'alg':'HS256','typ':'JWT'}); p=b({'user_id':int(sys.argv[1]),'username':'loop@food4u.test','role':'2','exp':int(sys.argv[2])})
s=base64.urlsafe_b64encode(hmac.new(os.environ['JWT_SECRET_KEY'].encode(),f'{h}.{p}'.encode(),hashlib.sha256).digest()).rstrip(b'=').decode()
print(f'{h}.{p}.{s}')" "$uid" "$E")
for p in $paths; do printf "user_id=%-6s GET %-14s -> " "$uid" "$p"; curl -s -o /tmp/loop-body.txt -w '%{http_code} ' --max-time 90 -H "Authorization: Bearer $T" "$B$p"; head -c 200 /tmp/loop-body.txt | tr '\n' ' '; echo; done
