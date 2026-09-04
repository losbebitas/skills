# Issue tracker: Azure DevOps

Issues and specs for this repo live as Azure Boards User Stories and Features. Use the `azdo-cli-axi` CLI for all operations.

## Conventions

- **Create an issue**: `azdo-cli-axi issue create --title "..." --body "..." --org "$ORG_URL" --project "$PROJECT"`. Use a heredoc for multi-line bodies.
- **Create a spec**: `azdo-cli-axi spec create --title "..." --body "..." --org "$ORG_URL" --project "$PROJECT"`. A spec is an Azure Boards Feature.
- **Read an issue**: `azdo-cli-axi issue view <id> --expand none --fields "System.Id,System.Title,System.State,System.Tags,System.Description" --org "$ORG_URL" --project "$PROJECT"`, filtering comments with `azdo-cli-axi api --area wit --resource comments --route-parameters "project=$PROJECT" --route-parameters "workItemId=<id>" --query-parameters "format=0" --api-version "7.1-preview" --jq "comments[].text" --org "$ORG_URL" --project "$PROJECT"`.
- **Read a spec**: `azdo-cli-axi spec view <id> --expand none --fields "System.Id,System.Title,System.State,System.Tags,System.Description" --org "$ORG_URL" --project "$PROJECT"`, filtering comments with `azdo-cli-axi api --area wit --resource comments --route-parameters "project=$PROJECT" --route-parameters "workItemId=<id>" --query-parameters "format=0" --api-version "7.1-preview" --jq "comments[].text" --org "$ORG_URL" --project "$PROJECT"`.
- **List issues**: `azdo-cli-axi issue list --state "<User Story state>" --limit 50 --org "$ORG_URL" --project "$PROJECT"` with appropriate `--state` filters. For triage roles, use `azdo-cli-axi query triage --type "User Story" --tag "<triage tag>" --org "$ORG_URL" --project "$PROJECT"` with appropriate `--tag` filters.
- **List specs**: `azdo-cli-axi spec list --state "<Feature state>" --limit 50 --org "$ORG_URL" --project "$PROJECT"` with appropriate `--state` filters. For triage roles, use `azdo-cli-axi query triage --type "Feature" --tag "<triage tag>" --org "$ORG_URL" --project "$PROJECT"` with appropriate `--tag` filters.
- **Comment on an issue**: `azdo-cli-axi issue discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`
- **Comment on a spec**: `azdo-cli-axi spec discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`
- **Apply / remove tags**: `azdo-cli-axi issue tag <id> --tag "..." --org "$ORG_URL" --project "$PROJECT"` to add a tag; use `azdo-cli-axi issue edit <id> --fields "System.Tags=tag-a; tag-b" --org "$ORG_URL" --project "$PROJECT"` to replace the complete tag list, including removal. For a Feature, use `azdo-cli-axi spec tag <id> --tag "..." --org "$ORG_URL" --project "$PROJECT"` or `azdo-cli-axi spec edit <id> --fields "System.Tags=tag-a; tag-b" --org "$ORG_URL" --project "$PROJECT"`.
- **Close**: For a rejected or out-of-scope User Story, post the explanation with `azdo-cli-axi issue discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`, then use `azdo-cli-axi issue close <id> --org "$ORG_URL" --project "$PROJECT"`; for a rejected or out-of-scope Feature, post it with `azdo-cli-axi spec discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"`, then use `azdo-cli-axi spec close <id> --org "$ORG_URL" --project "$PROJECT"`. Both set `System.State` to `Removed`. For normal completion, post the final discussion with `azdo-cli-axi issue discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"` and then use `azdo-cli-axi issue state <id> --state "Done" --org "$ORG_URL" --project "$PROJECT"` for a User Story; for a Feature, post it with `azdo-cli-axi spec discussion <id> --discussion "..." --org "$ORG_URL" --project "$PROJECT"` and then use `azdo-cli-axi spec state <id> --state "Released" --org "$ORG_URL" --project "$PROJECT"`.
  The `Done`, `Released`, and `Removed` values are the OneForge workflow examples; discover the valid states for another project with `azdo-cli-axi board states --type "User Story" --org "$ORG_URL" --project "$PROJECT"` or `azdo-cli-axi board states --type "Feature" --org "$ORG_URL" --project "$PROJECT"`.

Set `ORG_URL` to the Azure DevOps organization URL and `PROJECT` to the Azure DevOps project name. For Pull Request commands, also set `REPOSITORY`; for PR comment API commands, set `THREAD_JSON` to the JSON request file. Pass the organization and project explicitly; do not infer the project from `git remote -v`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through Azure Repos commands. PRs do not use Azure Boards `System.Tags`; apply triage tags to the linked User Story or Feature:

- **Read a PR**: `azdo-cli-axi pr show <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"` and `azdo-cli-axi pr files <id> --repository "$REPOSITORY" --iteration <iteration> --org "$ORG_URL" --project "$PROJECT"` for the diff.
- **List external PRs for triage**: `azdo-cli-axi pr list --repository "$REPOSITORY" --limit 50 --org "$ORG_URL" --project "$PROJECT"`, then keep only PRs whose creator is external according to the repository policy.
- **Comment / tag / close**: Read PR comments with `azdo-cli-axi pr comments <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"`. To post a PR comment, create `$THREAD_JSON` with `{"comments":[{"parentCommentId":0,"content":"...","commentType":1}],"status":1}`, then use `azdo-cli-axi api --area git --resource threads --route-parameters "project=$PROJECT" --route-parameters "repositoryId=$REPOSITORY" --route-parameters "pullRequestId=<id>" --api-version "7.1" --http-method POST --media-type "application/json" --in-file "$THREAD_JSON" --org "$ORG_URL" --project "$PROJECT"`. Apply triage tags to the linked User Story with `issue tag` or to the linked Feature with `spec tag`, and close a PR with `azdo-cli-axi pr abandon <id> --repository "$REPOSITORY" --org "$ORG_URL" --project "$PROJECT"`.

Azure PRs and work items have separate identifier spaces. Resolve a PR with `pr show`, and resolve a User Story or Feature with `issue view` or `spec view`.

## When a skill says "publish to the issue tracker"

Create an Azure Boards User Story for an issue, or an Azure Boards Feature for a spec.

## When a skill says "fetch the relevant ticket"

Run `azdo-cli-axi issue view <id>` for a User Story or `azdo-cli-axi spec view <id>` for a Feature, then fetch discussions with the comments API.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Feature with child User Stories as tickets.

- **Map**: a single Feature tagged `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `azdo-cli-axi spec create --title "..." --body "..." --tag "wayfinder:map" --org "$ORG_URL" --project "$PROJECT"`.
- **Child ticket**: create a User Story with `azdo-cli-axi issue create --title "..." --body "..." --tag "wayfinder:<type>" --org "$ORG_URL" --project "$PROJECT"`, then link it to the map Feature with a native `child` relation: `azdo-cli-axi spec relation <map-id> --relation-action add --relation-type child --target-id <child-id> --org "$ORG_URL" --project "$PROJECT"`. Use `wayfinder:<type>` tags (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: Azure's **native work-item dependency relation**, the canonical, UI-visible representation. Add an edge with `azdo-cli-axi issue relation <child-id> --relation-action add --relation-type predecessor --target-id <blocker-id> --org "$ORG_URL" --project "$PROJECT"`. A ticket is unblocked when every predecessor is no longer active.
- **Frontier query**: list the map's child User Stories with `azdo-cli-axi spec relation <map-id> --relation-action show --relation-type child --org "$ORG_URL" --project "$PROJECT"`, inspect each child with `azdo-cli-axi issue view <child-id> --expand none --fields "System.Id,System.State,System.AssignedTo" --org "$ORG_URL" --project "$PROJECT"`, and inspect its predecessor IDs with `azdo-cli-axi issue relation <child-id> --relation-action show --relation-type predecessor --org "$ORG_URL" --project "$PROJECT"`. For every returned predecessor ID, run `azdo-cli-axi issue view <predecessor-id> --expand none --fields "System.Id,System.State" --org "$ORG_URL" --project "$PROJECT"`. Drop any child with an assignee or a predecessor whose User Story state is not `Done` or `Removed`; first in map order wins.
- **Claim**: `azdo-cli-axi issue edit <id> --assigned-to "<assignee>" --org "$ORG_URL" --project "$PROJECT"`, the session's first write.
- **Resolve**: `azdo-cli-axi issue discussion <id> --discussion "<answer>" --org "$ORG_URL" --project "$PROJECT"`, then `azdo-cli-axi issue state <id> --state "Done" --org "$ORG_URL" --project "$PROJECT"`, then update the map Feature's Decisions-so-far with `azdo-cli-axi spec edit <map-id> --body-file <body-file> --org "$ORG_URL" --project "$PROJECT"`. If the ticket is out of scope instead, post the explanation, use `azdo-cli-axi issue close <id> --org "$ORG_URL" --project "$PROJECT"` to set `Removed`, and update the map Feature's Out of scope section with `spec edit`.
