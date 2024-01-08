<div align="center">
	<img src="https://github.com/vdegenne/stample/assets/2827383/900f945b-998f-4be9-ac61-c14eef3ba6f7" width=260 /><br>
	Mini tree mirroring tool with placeholders replacement capabilities.
</div>

## Usage

### Install

```bash
sudo npm i -g stample
```

### Command

```bash
stample SOURCE DEST GLOB1 [GLOB2, ...] [-<placeholder-name>=<placeholder-value>, ...]
```

_(short version `stpl` is also available.)_

### Example

Let say we have

`../shared/templates/index.html`:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>%title%</title>
	</head>
	<body>
		%content%
	</body>
</html>
```

With Stample we can easily copy this template somewhere else on the filesystem along with resolving the placeholders:

```bash
stample ../shared/templates . index.html
```

The command will prompt for `%title%` and `%content%`.

Placeholders can also be passed through the command directly to bypass user interaction, for instance

```bash
stample ../shared/templates . index.html -title=MyCoolApp -content='<h1>Hello</h1>'
```

###

### Glob patterns

Stample revolves around glob patterns, for instance

```bash
stample ./coding-templates/webdev ./src/ '**/*.ts' '**/*.html'
```

The command above will copy all TypeScript and HTML files from base `./coding-templates/webdev` to/in `src` with their respective paths.

**Note that: globs need to be surrounded in quotes (singles or doubles)**

## Help

Use `stample` without any arguments to see the help in the command line.

## License

2023-2024 (C) MIT License. Valentin Degenne
