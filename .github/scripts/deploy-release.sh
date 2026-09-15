#!/usr/bin/env bash

set -Eeuo pipefail

deploy_path="${1:-}"
release_id="${2:-}"

if [[ -z "$deploy_path" || "$deploy_path" != /* || "$deploy_path" == '/' ]]; then
    echo 'VPS_DEPLOY_PATH must be a non-root absolute path.' >&2
    exit 1
fi

if [[ ! "$release_id" =~ ^[a-f0-9]+-[0-9]+-[0-9]+$ ]]; then
    echo 'The release identifier is invalid.' >&2
    exit 1
fi

archive_path="/tmp/tamerin-$release_id.tar.gz"
releases_path="$deploy_path/releases"
shared_path="$deploy_path/shared"
shared_storage="$shared_path/storage"
release_path="$releases_path/$release_id"

if [[ ! -f "$archive_path" ]]; then
    echo "Release archive not found: $archive_path" >&2
    exit 1
fi

if [[ ! -f "$shared_path/.env" ]]; then
    echo "Production environment file not found: $shared_path/.env" >&2
    exit 1
fi

mkdir -p \
    "$releases_path" \
    "$shared_storage/app/public" \
    "$shared_storage/framework/cache/data" \
    "$shared_storage/framework/sessions" \
    "$shared_storage/framework/views" \
    "$shared_storage/logs"

mkdir "$release_path"
trap 'rm -f "$archive_path"' EXIT

tar -xzf "$archive_path" -C "$release_path"
ln -s "$shared_path/.env" "$release_path/.env"
ln -s "$shared_storage" "$release_path/storage"
chmod -R ug+rwX "$release_path/bootstrap/cache"

cd "$release_path"

php artisan optimize:clear --except=cache
php artisan migrate --force
php artisan cache:clear
php artisan storage:link
php artisan optimize
php artisan about --only=environment

next_link="$deploy_path/current-next"
rm -f "$next_link"
ln -s "$release_path" "$next_link"
mv -Tf "$next_link" "$deploy_path/current"

php artisan queue:restart

echo "Release $release_id is active."
