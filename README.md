# Stample

Mini tree mirroring tool with placeholders replacement capabilities.

## Usage

### Install

```bash
sudo npm i -g stample
```

### Example

Let say we have

`../shared/templates/index.html`:

```html
<!doctype html>
<html>
	<head>
		<title>%title%</title>
	</head>
	<body>
		%content%
	</body>
</html>
```

Using Stample we can easily copy this template somewhere else and resolves the placeholders:

```bash
stample ../shared/templates . 'index.html'
```

The command will prompt for `%title%` and `%content%`.

Placeholders can also be passed through the command directly to bypass user interaction, for instance

```bash
stample ../shared/templates . 'index.html' -title='My cool app' -content='<h1>Hello</h1>'
```

### Glob patterns

Stample revolves around glob patterns, for instance

```bash
stample ./coding-templates/webdev ./src/ '**/*.ts' '**/*.html'
```

The command above will copy all TypeScript and HTML files from base `./coding-templates/webdev` to/in `src` with their respective paths.

## License

MIT License (C) Valentin Degenne
