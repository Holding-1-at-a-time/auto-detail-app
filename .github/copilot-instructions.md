# Copilot Instructions

## Codacy Integration Rules

This document configures AI behavior when interacting with Codacy's MCP Server.

### After File Changes

When a file is edited:

1. Run the `codacy_cli_analyze` tool with:
   - `rootPath`: workspace path
   - `file`: edited file path
   - `tool`: unset

2. For any issues found:
   - Review and propose fixes
   - Apply approved fixes
   > **Note**: This is a critical requirement

### Analysis Verification

After each response:
- Verify `codacy_cli_analyze` was run for all edited files

### Troubleshooting

If MCP Server is unavailable:
1. Reset MCP extension
2. Check VSCode settings:
   - Review Copilot > MCP settings in Github
   - Enable MCP servers at:
     - Personal: `https://github.com/settings/copilot/features`
     - Organization: `https://github.com/organizations/{org-name}/settings/copilot/features`
3. Contact Codacy support if issues persist

### Path Parameters
Use standard filesystem paths (non-URL-encoded)

### Security Checks

After package operations:
1. Run `codacy_cli_analyze` with:
   - `rootPath`: workspace path
   - `tool`: "trivy"
   - `file`: unset
2. Address any vulnerabilities before continuing

Example workflow:
```
npm install react-markdown
↓
Run codacy_cli_analyze (trivy)
↓
Continue if secure
```

### General Guidelines

- Analyze each modified file
- Apply fixes automatically when possible
- Run analysis without prompting
- Skip complexity/coverage checks
- Use MCP Server tools directly
- Include git info only for repositories

### Repository Setup

For 404 errors:
1. Offer to run `codacy_setup_repository`
2. Run only with user approval
3. Retry failed action once after setup