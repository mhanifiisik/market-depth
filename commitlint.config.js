module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'test',     // Test-related changes
        'chore',    // Build process or auxiliary tool changes
        'ci',       // CI configuration changes
        'perf',     // Performance improvements
        'revert'    // Revert a previous commit
      ]
    ]
  }
};