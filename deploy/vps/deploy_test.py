import io
import importlib.util
from contextlib import nullcontext
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('deploy', Path(__file__).with_name('deploy.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeploymentTests(unittest.TestCase):
    def workspace(self):
        # Retain generated test files; local policy forbids permanent file removal.
        return nullcontext(tempfile.mkdtemp(prefix='acceleret-deploy-test-'))

    def test_accepts_full_commit_and_fixed_operational_commands(self):
        sha = 'a' * 40
        self.assertEqual(deploy.parse_command(f'deploy {sha}'), ('deploy', sha))
        self.assertEqual(deploy.parse_command('backup'), ('backup', None))
        self.assertEqual(deploy.parse_command('status'), ('status', None))

    def test_rejects_shell_commands_short_refs_and_extra_arguments(self):
        for command in ('bash', 'deploy main', 'deploy ' + 'a' * 40 + '; id',
                        'deploy ' + 'a' * 40 + ' extra', 'deploy ../main', 'backup anything'):
            with self.subTest(command=command), self.assertRaises(ValueError):
                deploy.parse_command(command)

    def archive(self, name, kind=tarfile.REGTYPE):
        data = io.BytesIO()
        with tarfile.open(fileobj=data, mode='w:gz') as archive:
            entry = tarfile.TarInfo(name)
            entry.type = kind
            entry.size = 2 if kind == tarfile.REGTYPE else 0
            entry.linkname = '/etc/passwd' if kind == tarfile.SYMTYPE else ''
            archive.addfile(entry, io.BytesIO(b'{}') if entry.size else None)
        return data.getvalue()

    def test_extracts_source_under_its_release_root(self):
        with self.workspace() as temporary:
            target = Path(temporary)
            deploy.extract_source(self.archive('repository/src/example.json'), target)
            self.assertEqual((target / 'src/example.json').read_text(), '{}')

    def test_rejects_archive_traversal_and_links(self):
        for name, kind in (('repository/../../escape', tarfile.REGTYPE),
                           ('/etc/passwd', tarfile.REGTYPE),
                           ('repository/link', tarfile.SYMTYPE),
                           ('repository/hardlink', tarfile.LNKTYPE)):
            with self.workspace() as temporary:
                with self.subTest(name=name, kind=kind), self.assertRaises(ValueError):
                    deploy.extract_source(self.archive(name, kind), Path(temporary))

    def test_alternates_loopback_ports_to_keep_current_app_running(self):
        self.assertEqual(deploy.next_port(None), 3210)
        self.assertEqual(deploy.next_port({'port': 3210}), 3211)
        self.assertEqual(deploy.next_port({'port': 3211}), 3210)
        self.assertIn('127.0.0.1:3211', deploy.proxy_config(3211, 'a' * 40))

    def test_promotion_checks_nginx_before_reloading(self):
        with self.workspace() as temporary:
            upstream = Path(temporary) / 'upstream.conf'
            upstream.write_text('old')
            calls = []
            self.assertEqual(deploy.promote(upstream, 'new', lambda *args: calls.append(args)), 'old')
            self.assertEqual(upstream.read_text(), 'new')
            self.assertEqual(calls, [('nginx', '-t'), ('systemctl', 'reload', 'nginx')])

    def test_failed_promotion_restores_previous_proxy(self):
        with self.workspace() as temporary:
            upstream = Path(temporary) / 'upstream.conf'
            upstream.write_text('old')
            calls = []

            def runner(*args):
                calls.append(args)
                if len(calls) == 1:
                    raise subprocess.CalledProcessError(1, args)

            with self.assertRaises(subprocess.CalledProcessError):
                deploy.promote(upstream, 'broken', runner)
            self.assertEqual(upstream.read_text(), 'old')
            self.assertEqual(calls[-1], ('systemctl', 'reload', 'nginx'))

    def test_waits_for_reloaded_workers_after_a_maintenance_response(self):
        calls = []
        pauses = []
        sha = 'a' * 40

        def runner(*args, **kwargs):
            calls.append(args)
            if len(calls) == 1:
                raise subprocess.CalledProcessError(22, args)
            return subprocess.CompletedProcess(args, 0, f'HTTP/2 200\nX-Acceleret-Release: {sha}\n')

        deploy.wait_public(sha, runner, pauses.append)
        self.assertEqual(len(calls), 2)
        self.assertEqual(pauses, [2])

    def test_does_not_accept_a_healthy_previous_release_as_the_new_release(self):
        calls = []
        sha = 'a' * 40

        def runner(*args, **kwargs):
            calls.append(args)
            served = 'b' * 40 if len(calls) == 1 else sha
            return subprocess.CompletedProcess(args, 0, f'X-Acceleret-Release: {served}\n')

        deploy.wait_public(sha, runner, lambda _: None)
        self.assertEqual(len(calls), 2)

    def test_fails_when_the_new_release_never_appears(self):
        def runner(*args, **kwargs):
            return subprocess.CompletedProcess(args, 0, 'HTTP/2 200\n')

        with self.assertRaisesRegex(RuntimeError, 'expected release'):
            deploy.wait_public('a' * 40, runner, lambda _: None)


if __name__ == '__main__':
    unittest.main()
