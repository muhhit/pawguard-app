# Agents Orchestration (Mac + Codespaces)

This repo is wired for a hands-off flow: a Mac local agent handles OS tasks and GitHub operations, while Codespaces runs IDE agents (Cline/Continue) that execute SPEC.md tasks across providers.

## Components

- Local agent (optional): Open Interpreter (OS mode) to automate desktop tasks.
- IDE agents: Cline (primary) and Continue (secondary) in Codespaces.
- Prompt library: `vendor/ai-prompts` (GPL-3.0). Internal use recommended.
- MCP servers: `vendor/mcp-servers` for filesystem/git/http/etc. tools.
- Provider router (optional): LiteLLM gateway to unify OpenAI/Anthropic/Google.

## Flow

1. Use `scripts/gh-bootstrap.sh` to push the repo and create a Codespace.
2. Open Codespaces. Devcontainer installs extensions and inits submodules.
3. Set Secrets: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`.
4. Default provider is Anthropic Claude (Sonnet). Run `npm run spec:claude` (or `:openai`, `:gemini`).
5. In the IDE, run Cline or Continue and feed SPEC.md task to apply diffs.

## Recommended Repos

- Continue (Apache-2.0): https://github.com/continuedev/continue
- Cline (Apache-2.0): https://github.com/cline/cline
- MCP Servers (MIT): https://github.com/modelcontextprotocol/servers
- Open Interpreter (AGPL-3.0): https://github.com/openinterpreter/open-interpreter
- LiteLLM (proxy, route multiple providers): https://github.com/BerriAI/litellm
- OpenHands (autonomous dev agent): https://github.com/All-Hands-AI/OpenHands
- LangGraph (stateful multi-agent): https://github.com/langchain-ai/langgraph
- Smolagents (light multi-agent): https://github.com/huggingface/smolagents
- Sweep (PR agent – GitHub App): https://github.com/sweepai/sweep
- Promptfoo (prompt eval): https://github.com/promptfoo/promptfoo

Licenses vary; prefer Apache/MIT for product code. Keep GPL content vendorized for internal workflows.

## Cline/Continue Setup

- Cline: set the system prompt or rules to files under `rules/` and `vendor/ai-prompts/VSCode Agent/*`. Enable MCP tools pointing to `vendor/mcp-servers` per server docs.
- Continue: `.continue/config.yaml` references rules and a spec agent prompt. Configure models and keys in the Continue settings.

## LiteLLM (optional)

Run as a local proxy and point agents at a single endpoint:

```bash
docker run -p 4001:4000 \
  -e OPENAI_API_KEY=... -e ANTHROPIC_API_KEY=... -e GOOGLE_API_KEY=... \
  ghcr.io/berriai/litellm:main
```

Then set model names accordingly (e.g., `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`).

## Spec Tasks (short)

- T1 Iyzico integration; T2 Notifications dispatch; T3 RLS; T4 DevEx.
