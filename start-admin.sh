#!/bin/bash
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000
npx next start -p 3000
