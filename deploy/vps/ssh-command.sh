#!/bin/sh
set -eu
exec sudo -n /usr/local/sbin/acceleret-deploy "$SSH_ORIGINAL_COMMAND"
