#!/usr/bin/env bash

clever login --token $CLEVER_TOKEN --secret $CLEVER_SECRET
rm -f .clever.json

echo "Stopping backend DEV"
clever link -a backend_dev_app $BACKEND_DEV_APP_ID
timeout --signal=SIGINT 120 clever stop -a backend_dev_app

echo "Stopping frontend DEV"
clever link -a frontend_dev_app $FRONTEND_DEV_APP_ID
timeout --signal=SIGINT 120 clever stop -a frontend_dev_app
