#!/bin/sh
if [ $# -eq 0 ]
  then
    terraform refresh
  else
    terraform refresh -var-file=$1
fi

scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")

s3_url=$(terraform output --raw s3_url)
echo "S3 URL: $s3_url"
echo "Deployment Directory: $scriptDir/../dist"

aws s3 sync "$scriptDir/../dist" "$s3_url"