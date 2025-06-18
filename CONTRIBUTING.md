# Contributing to Load Test UI

Thank you for your interest in contributing to Load Test UI! We welcome contributions from the community and are pleased to have you here.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node.js version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add tests if applicable
5. Ensure the test suite passes
6. Make sure your code follows the existing style
7. Write clear commit messages
8. Push to your branch: `git push origin feature/your-feature-name`
9. Submit a pull request

## Development Setup

1. **Prerequisites:**
   - Node.js v18+
   - npm or yarn
   - Git

2. **Clone and setup:**
   ```bash
   git clone https://github.com/your-username/load-test-ui.git
   cd load-test-ui
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

4. **Run tests (if available):**
   ```bash
   npm test
   ```

## Coding Standards

### JavaScript Style Guide

- Use modern ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code formatting
- Use `const` and `let` instead of `var`
- Use arrow functions where appropriate

### Accessibility Requirements

- All UI components must be keyboard accessible
- Include proper ARIA labels and roles
- Maintain color contrast ratios (WCAG 2.1 AA)
- Test with screen readers when possible
- Ensure proper focus management

### CSS Guidelines

- Use semantic class names
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theming
- Ensure high contrast mode compatibility

## Project Structure

```
load-test-ui/
├── server.js              # Express server with WebSocket handling
├── public/
│   ├── index.html        # Main UI with accessibility features
│   ├── app.js            # Frontend logic and real-time updates
│   └── styles.css        # Modern CSS with responsive design
├── package.json          # Dependencies and scripts
├── README.md            # Project documentation
├── CONTRIBUTING.md      # This file
├── LICENSE              # MIT license
└── test-history.json    # Auto-generated test history (gitignored)
```

## Testing Guidelines

When adding new features:

- Test across different browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on different screen sizes
- Test keyboard navigation
- Test with screen readers if possible
- Test with different network conditions
- Verify accessibility compliance

## Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
Add cURL import functionality

- Parse cURL commands with proper tokenization
- Extract URL, headers, method, and body
- Handle quoted strings and escaped characters
- Fixes #123
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new features and fixes
3. Create a pull request with the changes
4. Once merged, create a GitHub release with release notes
5. The release will be automatically tagged

## Questions?

If you have questions about contributing, please:

1. Check the [GitHub Discussions](https://github.com/your-username/load-test-ui/discussions)
2. Open an issue with the "question" label
3. Reach out to the maintainers

Thank you for contributing to Load Test UI! 🚀
