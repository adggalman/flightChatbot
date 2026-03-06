# GitHub Actions Shell Behavior

Reference for writing `run:` steps correctly. Applies to all jobs using the default shell.

---

## Default Shell

Every `run:` step uses:
```
bash --noprofile --norc -eo pipefail
```

| Flag | Effect |
|------|--------|
| `-e` | Exit immediately if any command returns non-zero |
| `-o pipefail` | Fail the pipeline if ANY command in a pipe fails (not just the last one) |
| `--noprofile` | Skip loading bash profile startup files |
| `--norc` | Skip loading `.bashrc` |

---

## Common Pitfalls

### Commands after a failing command don't run
```yaml
run: |
  npm test        # exits 1
  echo "done"     # NEVER RUNS — -e kills the script
```

### `2>&1` alone doesn't help if -e kills early
```yaml
run: |
  npm test 2>&1          # exits 1 — stderr captured but script exits here
  echo "exit: $?"        # NEVER RUNS
```

### Pipe failures are caught
```yaml
run: |
  npm test | tee output.log   # if npm test exits 1, whole pipeline fails due to pipefail
```

---

## Patterns

### Capture exit code without stopping the script
```bash
set +e          # disable -e temporarily
npm test 2>&1   # runs even if it fails, stderr piped to stdout
EXIT_CODE=$?    # capture exit code
set -e          # re-enable -e
echo "Exit: $EXIT_CODE"
exit $EXIT_CODE # propagate the real exit code
```

### Allow a step to fail without failing the job
```yaml
- name: Run tests
  run: npm test
  continue-on-error: true   # job continues even if step fails
```

### Run subsequent steps even after failure
```yaml
- name: Always runs
  if: always()
  run: echo "cleanup"
```

### Fail a step on purpose
```bash
exit 1
```

---

## Debugging Tips

- Always use `set +e` before commands you want to inspect the exit code of
- Use `echo "Exit: $?"` immediately after the command (before any other command resets `$?`)
- GitHub Actions shows step exit codes in the step summary — but only the final exit code of the whole `run:` block
- Stderr is shown in the Actions log by default — use `2>&1` only when you need stderr and stdout interleaved in the same stream

---

## Reference
- [Workflow syntax — shell](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsshell)
