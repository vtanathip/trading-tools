# Subproject Documentation Guide

## When to Create Documentation

Create a README.md for a subproject when:

- You create a new subproject/module/tool
- You make significant changes to an existing subproject (API changes, new features, structure changes)

## When to Update Documentation

Update the subproject README.md when:

- **Installation changes**: New dependencies, different setup steps
- **Configuration changes**: New environment variables, config files, or settings
- **API/Interface changes**: Function signatures, CLI commands, input/output formats
- **Project structure changes**: New directories, reorganized files
- **Breaking changes**: Anything that would break existing usage

## What NOT to Document

Don't create documentation for:

- Internal implementation details (code comments are better)
- Temporary scripts or experiments
- Work-in-progress features (document when complete)
- Things that are self-explanatory from the code

## README Template

Use the template at `.specify/templates/subproject-readme-template.md` as a starting point.

### Required Sections

Every subproject README MUST have:

1. **Title and summary** - One sentence describing what it does
2. **Installation** - How to install and configure
3. **Quick Start** - Minimal example to get started
4. **Project Structure** - Overview of folders and files
5. **Running Tests** - How to run the test suite

### Optional Sections

Include these sections if relevant:

- **Usage Examples** - If there are multiple use cases
- **Configuration** - If it needs environment variables or config files
- **Development** - If others will contribute to this subproject
- **Common Issues** - If there are known gotchas or frequent problems
- **Contributing** - If there are specific contribution guidelines

## Keeping Documentation Current

### The Update Trigger Rule

**If you change it, document it in the same commit/PR.**

Examples:

- Add a new CLI flag → Update Usage Examples section
- Add a configuration option → Update Configuration section
- Refactor directory structure → Update Project Structure section
- Change installation requirements → Update Installation section

### Avoiding Stale Documentation

Stale documentation is worse than no documentation. When in doubt:

1. Check if the documentation accurately reflects current behavior
2. Test the examples - do they actually work?
3. Remove or update sections that are outdated
4. Mark uncertain sections with `TODO` if you can't verify them

## Documentation Style Guidelines

### Be Concise

- Use short sentences
- One idea per paragraph
- Remove unnecessary words

### Be Specific

Bad: "Install dependencies"
Good: "Run `pip install -r requirements.txt`"

Bad: "Configure the settings"
Good: "Set `TRADING_API_KEY` environment variable to your API key"

### Use Examples

Every feature should have a concrete example showing how to use it.

```bash
# Bad: Explain in prose
# Good: Show an example
python -m trading_tool --symbol AAPL --period 1d
```

### Test Your Examples

Before documenting an example:

1. Run the command yourself
2. Verify it works as described
3. Copy-paste the actual command (don't paraphrase)

## Constitution Compliance

Subproject documentation supports these constitution principles:

- **Code Quality**: Clear documentation makes code easier to understand and maintain
- **Testing Standards**: Document how to run tests, what coverage is expected
- **User Experience Consistency**: Consistent documentation format across all subprojects
- **Simplicity**: Document only what's necessary, when it's necessary

## Review Checklist

Before committing documentation changes, verify:

- [ ] All code examples are tested and work
- [ ] Installation steps are accurate
- [ ] Project structure matches actual directory layout
- [ ] Configuration options are complete and correct
- [ ] No broken links to other documents
- [ ] Markdown is properly formatted
- [ ] No outdated information from previous versions

## Questions?

If you're unsure whether something needs documentation, ask:

1. Would a new team member be confused without this?
2. Will I remember this in 6 months?
3. Does this change how someone uses or contributes to the subproject?

If yes to any of these, document it.
