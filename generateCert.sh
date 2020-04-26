#!/usr/bin/env bash

#Generate a self-signed certificate
openssl req -nodes -new -x509 -keyout server.key -out server.cert
