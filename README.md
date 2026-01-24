# Coolify MCP Server

[![npm version](https://badge.fury.io/js/@softtor%2Fcoolify-mcp-server.svg)](https://www.npmjs.com/package/@softtor/coolify-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for [Coolify](https://coolify.io) API integration. Manage your applications, databases, services, servers, and deployments directly from Claude Code or any MCP-compatible client.

## Features

- Multi-team support with dynamic API key configuration
- 27 tools covering all major Coolify operations
- Full TypeScript support
- Compatible with Claude Code and other MCP clients

## Installation

### Using npx (Recommended)

No installation required. Configure directly in your MCP settings:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@softtor/coolify-mcp-server"],
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Global Installation

```bash
npm install -g @softtor/coolify-mcp-server
```

Then configure in your MCP settings:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "coolify-mcp-server",
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com",
        "COOLIFY_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COOLIFY_BASE_URL` | No | Coolify instance URL (default: `https://cloud.softtor.com.br`) |
| `COOLIFY_API_KEY` | No* | Default API key |
| `COOLIFY_DEFAULT_TEAM` | No | Default team name (default: `default`) |
| `COOLIFY_TEAM_<NAME>_API_KEY` | No* | Team-specific API key |

*At least one API key must be provided.

### Multi-Team Configuration

For organizations with multiple Coolify teams, configure team-specific API keys:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "@softtor/coolify-mcp-server"],
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com",
        "COOLIFY_DEFAULT_TEAM": "production",
        "COOLIFY_TEAM_PRODUCTION_API_KEY": "prod-api-key",
        "COOLIFY_TEAM_STAGING_API_KEY": "staging-api-key",
        "COOLIFY_TEAM_DEV_API_KEY": "dev-api-key"
      }
    }
  }
}
```

Then use the `team` parameter in any tool:

```
coolify_list_applications { team: "staging" }
```

### Getting Your API Key

1. Log in to your Coolify instance
2. Go to **Settings** > **API Tokens**
3. Create a new token with appropriate permissions
4. Copy the token and use it as your API key

## Available Tools

### Applications (6 tools)

| Tool | Description |
|------|-------------|
| `coolify_list_applications` | List all applications |
| `coolify_get_application` | Get application details by UUID |
| `coolify_start_application` | Start/deploy an application |
| `coolify_stop_application` | Stop a running application |
| `coolify_restart_application` | Restart an application |
| `coolify_get_application_logs` | Get container logs |

### Databases (6 tools)

| Tool | Description |
|------|-------------|
| `coolify_list_databases` | List all databases |
| `coolify_get_database` | Get database details by UUID |
| `coolify_start_database` | Start a database |
| `coolify_stop_database` | Stop a running database |
| `coolify_restart_database` | Restart a database |
| `coolify_list_database_backups` | List database backups |

### Services (5 tools)

| Tool | Description |
|------|-------------|
| `coolify_list_services` | List all services |
| `coolify_get_service` | Get service details by UUID |
| `coolify_start_service` | Start a service |
| `coolify_stop_service` | Stop a running service |
| `coolify_restart_service` | Restart a service |

### Servers (4 tools)

| Tool | Description |
|------|-------------|
| `coolify_list_servers` | List all servers |
| `coolify_get_server` | Get server details by UUID |
| `coolify_get_server_resources` | Get all resources on a server |
| `coolify_get_server_domains` | Get all domains mapped on a server |

### Deployments (2 tools)

| Tool | Description |
|------|-------------|
| `coolify_deploy` | Deploy by UUID or tag |
| `coolify_list_deployments` | List deployment history |

### Projects & Teams (4 tools)

| Tool | Description |
|------|-------------|
| `coolify_list_projects` | List all projects |
| `coolify_get_project` | Get project details by UUID |
| `coolify_list_teams` | List all accessible teams |
| `coolify_get_team` | Get team details by ID |

## Usage Examples

### List all applications

```
coolify_list_applications
```

### Deploy an application

```
coolify_deploy { uuid: "app-uuid-here" }
```

### Deploy with force rebuild

```
coolify_deploy { uuid: "app-uuid-here", force: true }
```

### Deploy all applications with a tag

```
coolify_deploy { tag: "production" }
```

### Get application logs

```
coolify_get_application_logs { uuid: "app-uuid-here", since: 3600 }
```

### Use a specific team

```
coolify_list_applications { team: "staging" }
```

## Development

```bash
# Clone the repository
git clone https://github.com/Softtor/coolify-mcp-server.git
cd coolify-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run locally
COOLIFY_API_KEY=your-key npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related

- [Coolify](https://coolify.io) - Self-hostable Heroku/Netlify alternative
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol for AI tool integration
- [Claude Code](https://claude.ai/code) - Anthropic's CLI for Claude
