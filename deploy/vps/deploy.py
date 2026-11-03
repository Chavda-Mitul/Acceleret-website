#!/usr/bin/env python3
"""Root-owned, fixed-purpose VPS1 deployment command. No shell or file removal."""
import datetime as dt
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
import time
import urllib.error
import urllib.request
import uuid

BASE = Path('/opt/acceleret')
REPOSITORY = 'https://github.com/Chavda-Mitul/Acceleret-website.git'


def parse_command(command):
    if command in ('status', 'backup'):
        return command, None
    match = re.fullmatch(r'deploy ([0-9a-f]{40})', command)
    if not match:
        raise ValueError('Allowed commands: deploy <full main SHA>, status, backup')
    return 'deploy', match.group(1)


def run(*args, **kwargs):
    return subprocess.run(list(args), check=True, **kwargs)


def main_sha():
    result = run('git', 'ls-remote', REPOSITORY, 'refs/heads/main', capture_output=True, text=True)
    return result.stdout.split()[0]


def extract_source(data, destination):
    """GitHub archives must contain only regular files/directories under one root."""
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        entries = archive.getmembers()
        roots = set()
        total = 0
        for entry in entries:
            parts = PurePosixPath(entry.name).parts
            if not parts or entry.name.startswith('/') or '..' in parts or '\\' in entry.name:
                raise ValueError('Unsafe source archive path')
            if not (entry.isdir() or entry.isfile()):
                raise ValueError('Source archive contains links or special files')
            roots.add(parts[0])
            total += entry.size
        if len(roots) != 1 or total > 100 * 1024 * 1024:
            raise ValueError('Unexpected source archive size or root')
        for entry in entries:
            parts = PurePosixPath(entry.name).parts[1:]
            if not parts:
                continue
            target = destination.joinpath(*parts)
            if entry.isdir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.extractfile(entry) as source, target.open('xb') as output:
                    output.write(source.read())
                target.chmod(0o644)


def next_port(current):
    return 3211 if current and current['port'] == 3210 else 3210


def proxy_config(port, sha):
    return f'proxy_pass http://127.0.0.1:{port};\nadd_header X-Acceleret-Release {sha} always;\n'


def promote(upstream, text, runner=run):
    previous = upstream.read_text()
    upstream.write_text(text)
    try:
        runner('nginx', '-t')
        runner('systemctl', 'reload', 'nginx')
    except Exception:
        upstream.write_text(previous)
        runner('nginx', '-t')
        runner('systemctl', 'reload', 'nginx')
        raise
    return previous


def probe(port):
    for route in ('/', '/blog', '/case-studies', '/api/case-studies?limit=1'):
        request = urllib.request.Request(
            f'http://127.0.0.1:{port}{route}',
            headers={'Host': 'acceleret.com', 'X-Forwarded-Proto': 'https'},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status != 200:
                raise RuntimeError(f'Health check failed: {route}')


def wait_public(sha, runner=run, pause=time.sleep):
    # Nginx's reload command returns before replacement workers accept requests.
    for attempt in range(15):
        try:
            result = runner(
                'curl', '--fail', '--silent', '--show-error', '--max-time', '30',
                '--resolve', 'acceleret.com:443:127.0.0.1', '-D', '-', '-o', '/dev/null',
                'https://acceleret.com/', capture_output=True, text=True,
            )
            if f'x-acceleret-release: {sha}' in result.stdout.lower().splitlines():
                return
        except subprocess.CalledProcessError:
            pass
        if attempt < 14:
            pause(2)
    raise RuntimeError('HTTPS did not serve the expected release after Nginx reload')


def backup():
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8]
    target = BASE / 'backups' / stamp
    target.mkdir(mode=0o700, parents=True)
    with (target / 'database.dump').open('xb') as output:
        run('docker', 'exec', 'acceleret-db', 'pg_dump', '-U', 'acceleret', '-d', 'acceleret', '-Fc', stdout=output)
    with tarfile.open(target / 'files.tar.gz', 'w:gz') as archive:
        for name in ('media', '.data'):
            archive.add(BASE / 'shared' / name, arcname=name)
    if (BASE / 'current.json').exists():
        (target / 'release.json').write_text((BASE / 'current.json').read_text())
    print(f'Backup saved: {target}', flush=True)
    return target


def bootstrap_admin(port):
    count = run('docker', 'exec', 'acceleret-db', 'psql', '-U', 'acceleret', '-d', 'acceleret', '-Atc',
                'SELECT count(*) FROM users', capture_output=True, text=True).stdout.strip()
    if count != '0':
        return
    credentials = json.loads((BASE / 'secrets' / 'admin.json').read_text())
    request = urllib.request.Request(
        f'http://127.0.0.1:{port}/api/users/first-register',
        data=json.dumps(credentials).encode(),
        headers={'Content-Type': 'application/json', 'Host': 'acceleret.com'},
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status not in (200, 201):
            raise RuntimeError('Private administrator bootstrap failed')
    print('Initial CMS administrator provisioned privately.', flush=True)


def deploy(sha):
    if sha != main_sha():
        raise ValueError('Only the current main commit can be deployed')
    if os.statvfs(BASE).f_bavail * os.statvfs(BASE).f_frsize < 6 * 1024**3:
        raise RuntimeError('At least 6 GiB free is required before creating a release')
    current_file = BASE / 'current.json'
    current = json.loads(current_file.read_text()) if current_file.exists() else None
    if current and current['sha'] == sha:
        probe(current['port'])
        print(f'Already serving healthy release {sha}', flush=True)
        return
    config = json.loads((BASE / 'config.json').read_text())
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    release_id = f'{sha[:12]}-{stamp}-{uuid.uuid4().hex[:6]}'
    release = BASE / 'releases' / release_id
    release.mkdir(parents=True)
    url = f'https://codeload.github.com/Chavda-Mitul/Acceleret-website/tar.gz/{sha}'
    with urllib.request.urlopen(url, timeout=90) as response:
        data = response.read(25 * 1024 * 1024 + 1)
    if len(data) > 25 * 1024 * 1024:
        raise ValueError('Source archive exceeds download limit')
    extract_source(data, release)
    for path in [release, *release.rglob('*')]:
        os.chown(path, config['uid'], config['gid'])
    backup()
    common = [
        '--user', f"{config['uid']}:{config['gid']}", '--network', 'acceleret',
        '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL', '--pids-limit', '512',
        '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
        '--env-file', str(BASE / 'secrets' / 'app.env'),
        '-e', 'HOME=/tmp', '-e', 'NEXT_TELEMETRY_DISABLED=1',
        '-v', f'{release}:/app', '-v', f'{BASE}/shared/media:/app/media',
        '-v', f'{BASE}/shared/.data:/app/.data', '-w', '/app',
    ]
    # A fresh release has no node_modules to overwrite. Build only inside its container.
    build = 'npm ci --include=dev --no-audit --no-fund && npm run migrate'
    if not current:
        build += ' && SEED_PUBLISH=1 npm run seed:work'
    build += ' && npm run build'
    run('docker', 'run', '--name', f'acceleret-build-{release_id}',
        '--memory', '2g', '--memory-swap', '3g', '--cpus', '1',
        *common, '-e', 'NODE_OPTIONS=--max-old-space-size=1536',
        config['node_image'], 'sh', '-c', build)
    port = next_port(current)
    container = f'acceleret-web-{release_id}'
    run('docker', 'run', '-d', '--name', container, '--restart', 'unless-stopped',
        '--memory', '768m', '--memory-swap', '1g', '--cpus', '1',
        *common, '-e', 'NODE_OPTIONS=--max-old-space-size=512',
        '-p', f'127.0.0.1:{port}:3000', config['node_image'],
        'node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '0.0.0.0', '--port', '3000')
    upstream = BASE / 'nginx-upstream.conf'
    previous_proxy = None
    try:
        for attempt in range(45):
            try:
                probe(port)
                break
            except (OSError, urllib.error.URLError):
                if attempt == 44:
                    raise
                time.sleep(2)
        bootstrap_admin(port)
        if sha != main_sha():
            raise RuntimeError('main changed during build; candidate retained without promotion')
        previous_proxy = promote(upstream, proxy_config(port, sha))
        wait_public(sha)
        state = {'sha': sha, 'container': container, 'port': port, 'release': str(release), 'previous': current}
        if current:
            (BASE / 'history' / f'{release_id}.json').write_text(json.dumps(current, indent=2))
        temporary = BASE / f'current-{release_id}.json'
        temporary.write_text(json.dumps(state, indent=2))
        temporary.replace(current_file)
    except Exception:
        if previous_proxy is not None:
            promote(upstream, previous_proxy)
        run('docker', 'update', '--restart=no', container)
        run('docker', 'stop', '--timeout', '30', container)
        raise
    if current:
        run('docker', 'update', '--restart=no', current['container'])
        run('docker', 'stop', '--timeout', '30', current['container'])
    print(f'Deployed {sha} on acceleret.com; previous files and containers retained.', flush=True)


def main():
    if len(sys.argv) != 2:
        raise ValueError('Pass exactly one command argument')
    action, sha = parse_command(sys.argv[1])
    if os.geteuid() != 0:
        raise PermissionError('Run through the installed restricted sudo command')
    os.umask(0o077)
    import fcntl
    with (BASE / 'deployment.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if action == 'deploy':
            deploy(sha)
        elif action == 'backup':
            backup()
        else:
            print((BASE / 'current.json').read_text())


if __name__ == '__main__':
    main()
