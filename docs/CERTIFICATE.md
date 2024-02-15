# Certificate

## Create Certificate Authority

### Create CA

Hint: Create passkey with `pwgen 80 1`

`openssl req -x509 -sha256 -days 1825 -newkey rsa:4096 -keyout ca.key -out ca.crt`

### Install in Web Browser

`about:preferences` -> Certificates -> View Certificates -> Authorities -> Import... -> ca.crt

## Create Server Certificate

### Create private key

`openssl genrsa -des3 -out server.key 4096`

### Create Certificate Request (CSR)

`openssl req -key server.key -new -out domain.csr`

### Create extended information for CSR

-> server.ext

```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
```

### Sign CSR with CA

`openssl x509 -req -CA ca.crt -CAkey ca.key -in server.csr -out server.crt -days 3650 -CAcreateserial -extfile server.ext`

### Move stuff to correct directories

`.mosquitto/certs/` should contain the following:

```
ca.crt
server.crt
server.key
```

`certs/` should contain the following:

```
server.crt
server.key
```
