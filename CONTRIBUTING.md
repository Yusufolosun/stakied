# Contributing to Stakied

Thanks for your interest in contributing to Stakied Protocol!

## Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   clarinet test
   clarinet check
   ```
5. **Commit with conventional commits**
6. **Submit a pull request**

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring without behavior change
- `chore:` - Tooling, dependencies, config
- `deploy:` - Contract deployment

### Examples:
```
feat: add yield calculation oracle integration
fix: correct PT redemption maturity check
docs: update SY contract API documentation
test: add edge cases for zero amount transfers
```

## Testing Requirements

All PRs must:
- Include tests for new features
- Pass all existing tests
- Pass `clarinet check` validation
- Have 100% test coverage for new code

Run tests with:
```bash
npm test
```

## Code Style

### Clarity Contracts
- **Minimal comments** - code should be self-documenting
- Clear, descriptive function names
- Consistent formatting
- Use built-in Clarity features only (no hallucination)

### TypeScript Tests
- Descriptive test names
- One assertion per test when possible
- Cover happy path and edge cases
- Test error conditions

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md if applicable
5. Request review from maintainers

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stakied.git
cd stakied

# Install dependencies
npm install

# Run tests
npm test

# Check contracts
clarinet check
```

## Project Structure

```
stakied/
├── contracts/          # Clarity smart contracts
├── tests/             # Test files
├── docs/              # Documentation
├── deployments/       # Deployment scripts
└── settings/          # Network configurations
```

## Getting Help

- Open an issue for bugs
- Discussions for questions
- Discord: [link]
- Twitter: [@Yusufolosun](https://twitter.com/Yusufolosun)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
