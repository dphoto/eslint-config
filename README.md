# @lightboxco/eslint-config

Shared ESLint rules for the Lightbox JavaScript repos.

Formatting rules are built on [`@stylistic`](https://eslint.style). ESLint 10
deprecated every core formatting rule in favour of that plugin, so building on
it now avoids a second migration when they are removed.

## Install

Not published to npm yet — install from GitHub, pinned to a tag:

```json
"devDependencies": {
  "@lightboxco/eslint-config": "github:dphoto/eslint-config#v0.1.0",
  "eslint": "^10.7.0"
}
```

**Pin the tag, not a branch.** On `#main`, an unrelated `npm install` would pull
a rule change and silently reformat someone's working tree. On a tag, adopting
a new version is a deliberate one-line commit per repo.

## Use

Pick the layer that matches the runtime:

```js
// eslint.config.js — node service
import { node } from '@lightboxco/eslint-config'

export default node
```

```js
// eslint.config.js — browser app
import { browser } from '@lightboxco/eslint-config'

export default browser
```

### Adding to a layer

Append a config object. App-specific globals belong here, not in the shared
package:

```js
import { browser } from '@lightboxco/eslint-config'

export default [
	...browser,
	{
		languageOptions: { globals: { m: 'writable', state: 'writable' } },
		ignores: [ 'vendor/' ]
	}
]
```

### Exports

| Export | What it is |
|---|---|
| `node` | rules + Node globals |
| `browser` | rules + browser globals + the shared frontend globals |
| `base` | rules only, no globals — compose your own environment |
| `browserGlobals` | the frontend globals object, for extending |

## The style

Tabs, no semicolons, single quotes. The house signature is **padding inside
brackets, none before them**:

```js
function build( id, size ){
	const opts = { live: true, sizes: [ 'thumb', 'large' ] }

	if( opts.live ){
		return fetch( id, size )
	}

	return null
}
```

`if( x ){` rather than `if ( x ) {` — `keyword-spacing` is configured with
overrides so `if`, `for`, `while`, `switch`, `catch`, `else`, `try`, `finally`
and `do` follow the same no-gap-before-the-paren rule as function names.

Non-formatting choices worth knowing:

- **`no-console` is off.** Console is a legitimate transport across these repos
  — Lambda writes to CloudWatch with it, the servers log to stdout.
- **`no-unused-vars` is an error, not a warning.** Warnings get scrolled past.
  Prefix a parameter with `_` to opt out: `function f( a, _b ){}`.
  Note this applies to *arguments only* — an unused `const _scratch` still
  errors.

## Adopting in a repo

Every formatting rule here is auto-fixable, so adoption is one run and one
commit:

```
npm install
npx eslint . --fix
```

Keep that reformat as its own commit so it never mixes with real changes.

## What is deliberately not here

Lambda carries a set of layout rules — `padded-blocks`,
`padding-line-between-statements`, `multiline-ternary`,
`newline-per-chained-call`, `max-len` and friends — that dictate where blank
lines and line breaks go. They are not in the shared base because they rewrite
whole files rather than just whitespace. A repo that wants them can add them to
its own config.
