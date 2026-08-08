// Shared ESLint rules for Lightbox JavaScript repos.
//
// Consumers pick an environment layer rather than assembling rules:
//
//   import { node } from '@lightboxco/eslint-config'
//   export default node
//
// Formatting rules live under @stylistic. ESLint 10 deprecated every core
// formatting rule in favour of that plugin, so building on it now avoids a
// second migration when they are removed.

import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

// Whitespace and punctuation. Every rule here is auto-fixable, which is what
// lets a repo adopt the config with a single `eslint --fix` run.
const formatting = {
	'@stylistic/indent': [ 'error', 'tab', { SwitchCase: 1, ignoredNodes: [ 'ConditionalExpression' ] } ],
	'@stylistic/quotes': [ 'error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' } ],
	'@stylistic/semi': [ 'error', 'never' ],
	'@stylistic/comma-dangle': [ 'error', 'never' ],
	'@stylistic/comma-style': [ 'error', 'last' ],
	'@stylistic/linebreak-style': [ 'error', 'unix' ],
	'@stylistic/key-spacing': [ 'error', { beforeColon: false, mode: 'strict' } ],
	'@stylistic/lines-around-comment': [ 'error', { beforeBlockComment: true, beforeLineComment: true } ],

	// The house signature: padding inside parens and brackets, but none
	// between a function name and its argument list.
	'@stylistic/space-in-parens': [ 'error', 'always' ],
	'@stylistic/array-bracket-spacing': [ 'error', 'always' ],
	'@stylistic/object-curly-spacing': [ 'error', 'always' ],
	'@stylistic/space-before-function-paren': [ 'error', 'never' ],
	'@stylistic/space-before-blocks': [ 'error', 'never' ],

	'@stylistic/space-infix-ops': 'error',
	'@stylistic/space-unary-ops': [ 'error', { words: true } ],
	'@stylistic/spaced-comment': [ 'error', 'always' ],
	'@stylistic/no-multi-spaces': 'error',
	'@stylistic/no-trailing-spaces': 'error',

	// A ceiling only. padding-line-between-statements sets the floor at one and
	// has no count option, so "exactly two" is not expressible — two blank
	// lines between functions is a convention this rule protects rather than
	// enforces.
	'@stylistic/no-multiple-empty-lines': [ 'error', { max: 2, maxEOF: 1, maxBOF: 0 } ],
	'@stylistic/eol-last': [ 'error', 'always' ],

	// Fine-grained spacing. Low churn — existing code mostly satisfies these
	// already — but they stop sloppiness drifting back in.
	'@stylistic/arrow-spacing': [ 'error', { before: true, after: true } ],
	'@stylistic/comma-spacing': [ 'error', { before: false, after: true } ],

	// The house rule is that nothing gets a gap before an opening paren or
	// brace — `space-before-function-paren` and `space-before-blocks` already
	// say so for functions and blocks. These overrides extend the same
	// principle to keywords, which is what the existing code already does:
	// `if( ready ){`, not `if ( ready ) {`. Without them this rule would
	// rewrite every conditional in every repo.
	'@stylistic/keyword-spacing': [ 'error', { before: true, after: true, overrides: {
		if: { after: false },
		for: { after: false },
		while: { after: false },
		switch: { after: false },
		catch: { after: false },
		else: { after: false },
		try: { after: false },
		finally: { after: false },
		do: { after: false }
	} } ],
	'@stylistic/block-spacing': 'error',
	'@stylistic/switch-colon-spacing': 'error',
	'@stylistic/template-tag-spacing': [ 'error', 'never' ],
	'@stylistic/function-call-spacing': [ 'error', 'never' ],
	'@stylistic/no-whitespace-before-property': 'error',

	// Layout. Unlike everything above these move whole lines around, so they
	// reformat well beyond whitespace on first adoption.
	'@stylistic/newline-per-chained-call': [ 'error', { ignoreChainWithDepth: 2 } ],

	// Blank lines where the kind of statement changes: after the import block,
	// around function declarations, after a run of declarations, and before
	// every return. Consecutive declarations stay grouped.
	//
	// Note the rule enforces "at least one" blank line — listing an entry
	// twice does not produce two, which is what lambda's config assumed.
	'@stylistic/padding-line-between-statements': [ 'error',
		{ blankLine: 'always', prev: 'import', next: '*' },
		{ blankLine: 'any', prev: 'import', next: 'import' },
		{ blankLine: 'always', prev: '*', next: 'function' },
		{ blankLine: 'always', prev: 'function', next: '*' },
		{ blankLine: 'always', prev: [ 'const', 'let', 'var' ], next: '*' },
		{ blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: [ 'const', 'let', 'var' ] },
		{ blankLine: 'always', prev: '*', next: 'return' }
	]
}

// Correctness, not style. None of these are auto-fixable.
const logic = {
	'no-undef': 'error',

	// Errors, not warnings: warnings get scrolled past. An underscore prefix
	// is the deliberate opt-out for a parameter you must accept but not use —
	// and, since ESLint 9 started checking catch clauses, for a caught error
	// you inspect only in a debugger. Rest siblings are exempt because
	// `const { omitted, ...rest } = obj` names `omitted` precisely to keep it
	// out of `rest`.
	'no-unused-vars': [ 'error', {
		argsIgnorePattern: '^_',
		caughtErrorsIgnorePattern: '^_',
		ignoreRestSiblings: true
	} ],

	// Console is a legitimate logging transport across these repos — Lambda
	// writes to CloudWatch with it, and the servers log to stdout.
	'no-console': 'off',

	// A bare `catch{}` around a best-effort call (localStorage, JSON.parse,
	// a fire-and-forget request) is an established idiom in these repos —
	// web alone has dozens. Dropping the binding already signals the error
	// is deliberately ignored; a filler comment on top adds nothing.
	'no-empty': [ 'error', { allowEmptyCatch: true } ]
}

const languageOptions = {
	ecmaVersion: 'latest',
	sourceType: 'module'
}

// Rules only, no globals — compose with an environment layer, or use `node` /
// `browser` below.
export const base = [

	// Claude Code keeps session worktrees — full checkouts of the repo — under
	// .claude/worktrees/, and a lint sweep of the main checkout would descend
	// into them and report their problems as the repo's own. Ignoring the
	// directory only affects the outer checkout: ignore patterns resolve
	// relative to the config file that declares them, so a lint run *inside* a
	// worktree still covers all of that worktree's files.
	{ ignores: [ '.claude/' ] },

	js.configs.recommended,
	{
		plugins: { '@stylistic': stylistic },
		languageOptions,
		rules: { ...formatting, ...logic }
	}
]

// Exported alongside the layer so a mixed repo can scope environments by path
// — home lints src/ as browser and scripts/ + rspack.config.js as node.
export const nodeGlobals = globals.node

export const node = [
	...base,
	{ languageOptions: { ...languageOptions, globals: nodeGlobals } }
]

export const browserGlobals = globals.browser

// The Backbone-era frontend globals. Kept apart from browserGlobals because
// only web still uses them (17 files); folding them in would let `model`,
// `select`, `view` and `_` pass no-undef everywhere, and those are ordinary
// enough words to mask a real typo in a repo that never defined them.
//
// Compose where they are wanted:
//   globals: { ...browserGlobals, ...legacyGlobals }
//
// App-specific globals (home's `m` and `state`) belong in that repo's own
// config rather than here.
export const legacyGlobals = {
	app: 'writable',
	utils: 'readonly',
	Hammer: 'readonly',
	Backbone: 'writable',
	_: 'readonly',
	view: 'writable',
	model: 'writable',
	collection: 'writable',
	selection: 'writable',
	select: 'writable'
}

export const browser = [
	...base,
	{ languageOptions: { ...languageOptions, globals: browserGlobals } }
]

export default { base, node, browser, nodeGlobals, browserGlobals, legacyGlobals }
