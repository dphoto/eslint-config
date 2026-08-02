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
	// is the deliberate opt-out for a parameter you must accept but not use.
	'no-unused-vars': [ 'error', { argsIgnorePattern: '^_' } ],

	// Console is a legitimate logging transport across these repos — Lambda
	// writes to CloudWatch with it, and the servers log to stdout.
	'no-console': 'off'
}

const languageOptions = {
	ecmaVersion: 'latest',
	sourceType: 'module'
}

// Rules only, no globals — compose with an environment layer, or use `node` /
// `browser` below.
export const base = [
	js.configs.recommended,
	{
		plugins: { '@stylistic': stylistic },
		languageOptions,
		rules: { ...formatting, ...logic }
	}
]

export const node = [
	...base,
	{ languageOptions: { ...languageOptions, globals: globals.node } }
]

// Globals shared by the Backbone-era frontends. App-specific ones (home's `m`
// and `state`, for instance) belong in that repo's own config, not here.
export const browserGlobals = {
	...globals.browser,
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

export default { base, node, browser, browserGlobals }
