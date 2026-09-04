# Issue tracker: Azure DevOps

Issues and specs for this repo live as Azure Boards User Stories and Features. Use the `azdo-cli-axi` CLI for all operations.

## Azure DevOps context

The setup skill fills this section with values confirmed for this project. Use these exact names; do not substitute states from another Azure DevOps project.

- **Organization**: `<ORG_URL>`
- **Project**: `<PROJECT>`
- **Team**: `<TEAM_NAME>` (`<TEAM_ID>`)

### User Story process

| State | Category |
| --- | --- |
| `<state>` | `<category>` |

- **Normal completion**: `<confirmed state>`
- **Rejected or out of scope**: `<confirmed state>`

### Feature process

| State | Category |
| --- | --- |
| `<state>` | `<category>` |

- **Normal completion**: `<confirmed state>`
- **Rejected or out of scope**: `<confirmed state>`

## Iteration assignment

The current iteration is team-specific and changes over time. Do not save a fixed iteration path in this file. Before creating a Feature or User Story, resolve the current iteration for the confirmed team:

```bash
azdo-cli-axi board sprints \
  --team "<TEAM_ID>" \
  --fields id,name,path,attributes.timeFrame \
  --full \
  --org "$ORG_URL" \
  --project "$PROJECT"
```

Select the unique row whose `timeFrame` is `current` and pass its `path` as `--iteration`. Resolve it once per publication batch and reuse the same path for a Feature and its User Stories.

- Do not use `board iterations` to determine the current iteration; it only lists project iteration paths.
- Do not hard-code an iteration path.
- If there is no unique current iteration, stop and ask the user instead of guessing.
- An explicit user-requested iteration overrides this default.

## Conventions

- **Create an issue**: resolve the current iteration as described above, then run `azdo-cli-axi issue create --title "..." --body "..." --iteration "<CURRENT_ITERATION_PATH>" --org "$ORG_URL" --project "$PROJECT"`. An issue is a User Story. Use a heredoc for multi-line bodies.
- **Create a spec**: resolve the current iteration as described above, then run `azdo-cli-axi spec create --title "..." --body "..." --iteration "<CURRENT_ITERATION_PATH>" --org "$ORG_URL" --project "$PROJECT"`. A spec is a Feature.
- **Read an issue**: `azdo-cli-axi issue view <id> --expand none --fields "System.Id,System.Title,System.State,System.Tags,System.Description" --org "$ORG_URL" --project "$PROJECT"`. Fetch comments with `azdo-cli-axi api --area wit --resource comments --route-parameters "project=$PROJECT" --route-parameters "workItemId=<id>" --query-parameters "format=0" --api-version "7.1-preview" --jq "comments[].{createdDate: createdDate, createdBy: createdBy.displayName, text: text}" --full --org "$ORG_URL" --project "$PROJECT"`.
- **Read a spec**: `azdo-cli-axi spec view <id> --expand none --fields "System.Id,System.Title,System.State,System.Tags,System.Description" --org "$ORG_URL" --project "$PROJECT"`, with the same comments API.
- **List issues**: `azdo-cli-axi issue list --state "<User Story state>" --limit 50 --org "$ORG_URL" --project "$PROJECT"`.
- **List specs**: `azdo-cli-axi spec list --state "<Feature state>" --limit 50 --org "$ORG_URL" --project "$PROJECT"`.
- **Triage**: use `azdo-cli-axi query --wiql "..." --org "$ORG_URL" --project "$PROJECT"` with `[System.State] NOT IN (...)` using the completed and removed states recorded above. `query triage` filters tags but does not exclude terminal states.
- **Comment on an issue**: `azdo-cli-axi issue discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`.
- **Comment on a spec**: `azdo-cli-axi spec discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`.
- **Apply / remove tags**: `azdo-cli-axi issue tag <id> --tag "..." --org "$ORG_URL" --project "$PROJECT"` / `azdo-cli-axi issue edit <id> --fields "System.Tags=tag-a; tag-b" --org "$ORG_URL" --project "$PROJECT"`, or use the corresponding `spec` commands. Preserve unrelated tags when replacing the complete list. Triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) are tags, not states.
- **Publish ready work**: use `--tag "ready-for-agent"` for `/to-spec` and `/to-tickets`; use `--tag "needs-triage"` for new untriaged work.
- **Parent / child**: create the Feature first, create the User Story, then link it with `azdo-cli-axi spec relation <feature-id> --relation-action add --relation-type child --target-id <user-story-id> --org "$ORG_URL" --project "$PROJECT"`.
- **Predecessor / successor**: if User Story 1 must precede User Story 2, use `azdo-cli-axi issue relation <story-2-id> --relation-action add --relation-type predecessor --target-id <story-1-id> --org "$ORG_URL" --project "$PROJECT"`. The reciprocal relation is the successor. The equivalent successor command is `azdo-cli-axi issue relation <story-1-id> --relation-action add --relation-type successor --target-id <story-2-id> --org "$ORG_URL" --project "$PROJECT"`; add one direction only.
- **Read relations**: `azdo-cli-axi spec relation <feature-id> --relation-action show --org "$ORG_URL" --project "$PROJECT"` or `azdo-cli-axi issue relation <id> --relation-action show --org "$ORG_URL" --project "$PROJECT"`.
- **Close**: post the explanation first, then set the confirmed rejected/out-of-scope state with `azdo-cli-axi issue state <id> --state "<User Story rejected state>" --org "$ORG_URL" --project "$PROJECT"` or `azdo-cli-axi spec state <id> --state "<Feature rejected state>" --org "$ORG_URL" --project "$PROJECT"`. Use `issue/spec close` only when the confirmed rejected state is `Removed`. Normal completion uses `azdo-cli-axi issue state <id> --state "<User Story normal-completion state>" --org "$ORG_URL" --project "$PROJECT"` or `azdo-cli-axi spec state <id> --state "<Feature normal-completion state>" --org "$ORG_URL" --project "$PROJECT"`.

Use the confirmed organization and project from **Azure DevOps context** above. For PR commands, also set `REPOSITORY`. Always pass both context flags.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`:

- **Read a PR**: `azdo-cli-axi pr show <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"` and `azdo-cli-axi pr files <id> --repository "$REPOSITORY" --iteration <iteration> --org "$ORG_URL" --project "$PROJECT"`.
- **List external PRs**: `azdo-cli-axi pr list --repository "$REPOSITORY" --limit 50 --org "$ORG_URL" --project "$PROJECT"`, then filter external creators.
- **Comment / tag / close**: read with `azdo-cli-axi pr comments <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"`. Post a comment with `$THREAD_JSON` through `azdo-cli-axi api --area git --resource threads --route-parameters "project=$PROJECT" --route-parameters "repositoryId=$REPOSITORY" --route-parameters "pullRequestId=<id>" --api-version "7.1" --http-method POST --media-type "application/json" --in-file "$THREAD_JSON" --org "$ORG_URL" --project "$PROJECT"`. Tag the linked User Story or Feature; abandon with `azdo-cli-axi pr abandon <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"`.

PRs and work items use separate identifier spaces.

## When a skill says "publish to the issue tracker"

Create a User Story for an issue or a Feature for a spec.

## When a skill says "fetch the relevant ticket"

Run `issue/spec view`, then fetch discussions with the comments API.

## Wayfinding operations

Used by `/wayfinder`. The map is a Feature with child User Stories.

- **Map**: resolve the current iteration, then run `azdo-cli-axi spec create --title "..." --body "..." --iteration "<CURRENT_ITERATION_PATH>" --tag "wayfinder:map" --org "$ORG_URL" --project "$PROJECT"`.
- **Child ticket**: create a User Story in the same resolved iteration with `azdo-cli-axi issue create --title "..." --body "..." --iteration "<CURRENT_ITERATION_PATH>" --tag "wayfinder:<type>" --org "$ORG_URL" --project "$PROJECT"`, then link it with the parent / child command above.
- **Blocking**: add a `predecessor` relation from the blocked ticket to its blocker. The reciprocal relation is the successor.
- **Frontier**: choose the first unassigned child whose predecessors are all in terminal states.
- **Claim**: `azdo-cli-axi issue edit <id> --assigned-to "<assignee>" --org "$ORG_URL" --project "$PROJECT"`.
- **Resolve**: comment, set the User Story to its confirmed normal-completion state, and update the map Feature with `spec edit`. For out-of-scope work, comment and set it to its confirmed rejected/out-of-scope state.
