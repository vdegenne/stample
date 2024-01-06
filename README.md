# Stample

Mini templating copy program

## Usage

### Install

```bash
sudo npm i -g stample
```

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

Using Stample we can easily copy this template somewhere else and resolves the placeholders:

```bash
stample --base ../shared/templates/ ../shared/templates/index.html .
```

Stample will prompt you to enter a value for `%title%` and `%content%`, will transform the file according to these values and will copy the html file to the final destination (which is the current directory in this example (`.`)).

(`--base` here is used to determine the base path of the sources we want to copy).

### More examples

```bash
stample --base templates templates/model.ts src
```

copy `model.ts` to `src` directory

---

```bash
stample --base templates templates/a/model.ts templates/b/model.ts src
```

copy `a/model.ts` and `b/model.ts` to `src` directory

---

Also works with glob patterns

```bash
stample --base templates templates/**/*.ts src
```

copy all TypeScript files from `templates` directory to `src` with their respective path (e.g. `a/module.ts`, `a/sub/module.ts`, `b/module.ts`, etc...)
