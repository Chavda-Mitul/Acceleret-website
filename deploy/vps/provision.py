#!/usr/bin/env python3
"""One-time root provisioning on the existing VPS1, without touching other apps."""
import hashlib
import json
import os
from pathlib import Path
import pwd
import secrets
import subprocess
import sys
import time

BASE = Path('/opt/acceleret')
BUNDLE = Path(__file__).resolve().parent


def run(*args, **kwargs):
    return subprocess.run(list(args), check=True, **kwargs)


def write_private(path, content):
    with path.open('x') as output:
        output.write(content)
    path.chmod(0o600)


def main():
    if os.geteuid() != 0 or len(sys.argv) != 2:
        raise ValueError('As root: provision.py <deploy-public-key-file>')
    public_key = Path(sys.argv[1]).read_text().strip()
    if not public_key.startswith('ssh-ed25519 ') or '\n' in public_key:
        raise ValueError('Expected one dedicated Ed25519 public key')
    if BASE.exists() or Path('/etc/nginx/sites-available/acceleret').exists():
        raise ValueError('Acceleret already exists; inspect it instead of overwriting')
    BASE.mkdir(mode=0o755)
    for name in ('releases', 'shared', 'secrets', 'postgres', 'backups', 'history', 'evidence'):
        (BASE / name).mkdir(mode=0o700 if name in ('secrets', 'postgres', 'backups', 'evidence') else 0o755)
    ids = run('docker', 'ps', '-aq', capture_output=True, text=True).stdout.split()
    before = json.loads(run('docker', 'inspect', *ids, capture_output=True, text=True).stdout)
    evidence = [{
        'name': item['Name'], 'id': item['Id'], 'started': item['State']['StartedAt'],
        'running': item['State']['Running'], 'image': item['Image'],
        'config_hash': hashlib.sha256(json.dumps([item['Config'], item['HostConfig']], sort_keys=True).encode()).hexdigest(),
    } for item in before]
    write_private(BASE / 'evidence' / 'containers-before.json', json.dumps(evidence, indent=2))
    run('useradd', '--system', '--no-create-home', '--shell', '/usr/sbin/nologin', 'acceleret')
    account = pwd.getpwnam('acceleret')
    for name in ('media', '.data'):
        target = BASE / 'shared' / name
        target.mkdir(mode=0o700)
        os.chown(target, account.pw_uid, account.pw_gid)
    password = secrets.token_hex(32)
    write_private(BASE / 'secrets' / 'db.env',
                  f'POSTGRES_USER=acceleret\nPOSTGRES_DB=acceleret\nPOSTGRES_PASSWORD={password}\n')
    write_private(BASE / 'secrets' / 'app.env',
                  f'NODE_ENV=production\nDATABASE_URI=postgres://acceleret:{password}@acceleret-db:5432/acceleret\n'
                  f'PAYLOAD_SECRET={secrets.token_hex(48)}\nLEADS_FILE=1\n'
                  'LEADS_TO_EMAIL=support@acceleret.com\n'
                  'LEADS_FROM_EMAIL=Acceleret website <website@acceleret.com>\n'
                  'NEXT_TELEMETRY_DISABLED=1\n')
    write_private(BASE / 'secrets' / 'admin.json', json.dumps({
        'email': 'support@acceleret.com', 'password': secrets.token_urlsafe(32),
        'name': 'Acceleret Administrator',
    }, indent=2))
    run('docker', 'pull', 'node:22.23.2-bookworm-slim')
    run('docker', 'pull', 'postgres:17.11-bookworm')
    image = run('docker', 'image', 'inspect', '--format', '{{index .RepoDigests 0}}',
                'node:22.23.2-bookworm-slim', capture_output=True, text=True).stdout.strip()
    write_private(BASE / 'config.json', json.dumps({
        'uid': account.pw_uid, 'gid': account.pw_gid, 'node_image': image,
    }, indent=2))
    run('docker', 'network', 'create', 'acceleret')
    run('docker', 'run', '-d', '--name', 'acceleret-db', '--network', 'acceleret',
        '--restart', 'unless-stopped', '--memory', '256m', '--memory-swap', '512m', '--cpus', '0.25',
        '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
        '--env-file', str(BASE / 'secrets' / 'db.env'),
        '-v', f'{BASE}/postgres:/var/lib/postgresql/data', 'postgres:17.11-bookworm',
        '-c', 'shared_buffers=64MB', '-c', 'max_connections=40')
    for attempt in range(30):
        ready = subprocess.run(['docker', 'exec', 'acceleret-db', 'pg_isready', '-U', 'acceleret', '-d', 'acceleret'],
                               capture_output=True)
        if ready.returncode == 0:
            break
        if attempt == 29:
            raise RuntimeError('PostgreSQL did not become ready')
        time.sleep(2)
    run('install', '-o', 'root', '-g', 'root', '-m', '755', str(BUNDLE / 'deploy.py'), '/usr/local/sbin/acceleret-deploy')
    run('install', '-o', 'root', '-g', 'root', '-m', '755', str(BUNDLE / 'ssh-command.sh'), '/usr/local/sbin/acceleret-ssh')
    run('useradd', '--system', '--create-home', '--home-dir', '/home/acceleret-deploy', '--shell', '/bin/sh', 'acceleret-deploy')
    deploy_account = pwd.getpwnam('acceleret-deploy')
    ssh = Path('/home/acceleret-deploy/.ssh')
    ssh.mkdir(mode=0o700)
    authorized = ssh / 'authorized_keys'
    write_private(authorized, f'restrict,command="/usr/local/sbin/acceleret-ssh" {public_key}\n')
    for target in (ssh, authorized):
        os.chown(target, deploy_account.pw_uid, deploy_account.pw_gid)
    sudoers = Path('/etc/sudoers.d/acceleret-deploy')
    write_private(sudoers, 'acceleret-deploy ALL=(root) NOPASSWD: /usr/local/sbin/acceleret-deploy *\n')
    sudoers.chmod(0o440)
    run('visudo', '-cf', str(sudoers))
    for name in ('acceleret-backup.service', 'acceleret-backup.timer'):
        run('install', '-m', '644', str(BUNDLE / name), f'/etc/systemd/system/{name}')
    run('systemctl', 'daemon-reload')
    run('systemctl', 'enable', '--now', 'acceleret-backup.timer')
    # Until the first healthy release is promoted, this exact host serves no other app.
    (BASE / 'nginx-upstream.conf').write_text('return 503;\n')
    Path('/var/lib/acceleret-acme').mkdir(mode=0o755, exist_ok=True)
    nginx = Path('/etc/nginx/sites-available/acceleret')
    nginx.write_text('server {\n listen 80; listen [::]:80;\n'
                     ' server_name acceleret.com www.acceleret.com;\n'
                     ' location /.well-known/acme-challenge/ { root /var/lib/acceleret-acme; }\n'
                     ' location / { return 503; }\n}\n')
    Path('/etc/nginx/sites-enabled/acceleret').symlink_to(nginx)
    run('nginx', '-t')
    run('systemctl', 'reload', 'nginx')
    print('Provisioned isolated Acceleret database, storage, deployment account, backup timer and HTTP host.')


if __name__ == '__main__':
    main()
