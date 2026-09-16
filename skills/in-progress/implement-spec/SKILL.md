---
name: implement-spec
description: "Implement a specification in code."
disable-model-invocation: true
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The goal is a PR which implements the entire spec on a single branch.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for **maximum concurrency**.

## Delivery workflow selection

At the start of every invocation, before reading the spec or tickets and before changing the repository, ask the user:

```text
Quel mode de livraison utiliser ?
1. Workflow actuel (défaut)
2. no-mistakes
```

Wait for an explicit selection. Do not infer it from a previous invocation, the repository state, installed tools, remotes, or any persisted configuration. Do not persist the selection after this invocation.

- For **1**, use the existing workflow described below.
- For **2**, complete the no-mistakes preflight below before creating a branch, a draft PR, or making any other repository change.

### no-mistakes preflight

When the user selects **2**:

1. Check whether the `no-mistakes` executable is available and whether the current repository is initialized and usable. Use read-only checks such as `command -v no-mistakes`, `no-mistakes status`, and `no-mistakes doctor` as appropriate for the platform. Do not run `no-mistakes init` as a probe. The executable or a `no-mistakes` Git remote being present by itself does not prove that initialization is complete.
2. If the executable is missing, the repository is not initialized, or the initialization is incomplete, report the exact state. Ask for a separate confirmation for each operation that is needed: one confirmation to install the executable, then another confirmation to initialize the repository. Choosing option **2** is not permission to perform either operation.
3. Before asking for confirmation, show the operations and their effects:
   - the official installer may install or refresh the binary and background daemon. On macOS or Linux it is `curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh | sh`; on Windows it is `irm https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.ps1 | iex`. `go install github.com/kunchenguid/no-mistakes/cmd/no-mistakes@latest` is an alternative installation path;
   - `no-mistakes init` creates or refreshes a local gate, installs or refreshes its managed hooks, and adds or repairs the `no-mistakes` Git remote. It requires an `origin` remote and leaves `origin` unchanged;
   - initialization ensures that the no-mistakes daemon is running and installs or refreshes the no-mistakes agent skill at user level, under `~/.claude/skills` and `~/.agents/skills`;
   - official release binaries installed by the installer have telemetry enabled by default. `NO_MISTAKES_TELEMETRY=0` disables it.
4. Run the installer or `no-mistakes init` only after the user confirms that specific operation. If both operations are needed, do not treat one confirmation as permission for the other. After installation, verify that the executable is available before asking for or attempting initialization.
5. If the user declines, or if installation or initialization fails, stop this invocation. Report the failure or partial state, and do not silently fall back to the current workflow, create a branch, create a draft PR, or make other delivery changes.

This choice is per-invocation only. Never write it to the repository, a skill configuration file, or any other persistent configuration.

## Steps

1. Read the spec and tickets. Read enough to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create a feature branch for the entire implementation. Then:
   - in the **current workflow**, create a draft PR and mark it as closing the spec issue and tickets;
   - in **no-mistakes** mode, do not create or update a PR here. The final no-mistakes gate owns PR creation.

4. Use **implementer subagents** to implement each ticket. Each implementer subagent should work in its own worktree, on its own branch.

5. Once an **implementer subagent** completes, merge its work to the PR branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, run /code-review on the final integration branch. In the current workflow this is the PR branch. In no-mistakes mode it is the branch that will be submitted to the final gate. Fix all issues raised by the code review in a single **implementer subagent**.

8. Complete delivery according to the selected workflow:
   - in the **current workflow**, mark the existing draft PR as ready for review;
   - in **no-mistakes** mode, run the final gate described below. Do not mark a PR as ready manually.

9. Clean up all **implementer subagent** worktrees. If the no-mistakes gate fails or pauses, preserve the final branch and the gate run so the user can resume it. Do not abort the run or delete its branch as part of cleanup.

### Final no-mistakes delivery

Run this only at step 8, after every ticket has been merged and the final `/code-review` fixes have been applied. Run one validation pipeline for the final integration branch, never one pipeline per ticket or per implementer worktree.

1. Verify the final integration branch before submitting it:
   - the working tree is clean;
   - all implementation and review-fix changes are committed;
   - the branch is not the repository's default branch;
   - the branch contains the complete spec implementation.
2. Check the no-mistakes home view with `no-mistakes axi`. If there is already a run for the current branch, inspect it with `no-mistakes axi status` before starting anything:
   - if its submitted or pipeline `HEAD` matches the current `HEAD`, reattach to or drive that run with `no-mistakes axi run --intent "<same complete intent>"` instead of starting a duplicate pipeline;
   - if it belongs to another branch, leave it alone;
   - if it is stale or its `HEAD` differs, inspect the reported recovery path and only rerun or abort it when the user has explicitly decided to do so.
3. If there is no matching run, start validation with:

   ```sh
   no-mistakes axi run --intent "<complete user objective, spec acceptance criteria, and ticket references>"
   ```

   The intent must preserve the user's objective, constraints, exclusions, and acceptance criteria. Include the exact provider-supported closing references for the spec and tickets, for example:

   ```text
   Closes #123
   Closes #127
   Closes #131
   ```

   Do not reduce the intent to a diff summary. The intent is also used to draft the final PR description.
4. Follow the run through `no-mistakes axi status` and the output of the AXI commands:
   - when the run reaches a decision gate, explain the finding to the user and wait for an explicit decision;
   - use `no-mistakes axi respond` with the exact run, step, and action arguments required by the reported gate;
   - never approve an intent or functional decision on the user's behalf;
   - if the gate fails, report the failure and stop. Do not push directly to `origin`, create a manual fallback PR, silently switch to the current workflow, or start a second pipeline.
5. Continue or reattach until the run reports a successful checks-passed outcome. Retrieve the final PR URL from the run output or status. Verify that the generated PR description contains the spec and ticket closing references. If they are missing, report the problem and stop instead of replacing the generated body or bypassing no-mistakes' pipeline signature.
