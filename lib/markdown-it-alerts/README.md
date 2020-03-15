# markdown-it-alerts
[Markdown-it][markdown-it] plugin to create [Bootstrap alerts][bootstrap-alerts].

E.g.:

```md
::: warning
Hello world! [Link](#).
:::
```

Gets converted to:

```html
<div class="alert alert-warning" role="alert">
<p>Hello world! <a href="#" class="alert-link">Link</a>.</p>
</div>
```


## Install

```bash
$ npm install markdown-it-alerts --save
```



## Usage


### Enable plugin

```js
var md = require('markdown-it');
var alerts = require('markdown-it-alerts');

md().use(alerts);
```


### Options

Enable/disable adding class `alert-link` to links inside alerts.

```js
var md = require('markdown-it');
var alerts = require('markdown-it-alerts');

md().use(alerts, {links: false});
```

Enable/disable adding a matching glyphicon to alerts.

```js
var md = require('markdown-it');
var alerts = require('markdown-it-alerts');

md().use(alerts, {icons: true});
```

Note that this option adds extra markup that must be accommodated by your CSS.

### Example

With option `links` enabled (by default):

```md
This is a test. [Link](#).

::: success
Hello world! [Link](#).
:::

This is a test. [Link](#).
```

Gets converted to:

```html
<p>This is a test. <a href="#">Link</a>.</p>
<div class="alert alert-success" role="alert">
<p>Hello world! <a href="#" class="alert-link">Link</a>.</p>
</div>
<p>This is a test. <a href="#">Link</a>.</p>
```

With option `icons` enabled (not default):

```md
This is a test. [Link](#).

::: warning
Uh-oh! [Link](#).
:::

This is a test. [Link](#).
```

Gets converted to:

```html
<p>This is a test. <a href="#">Link</a>.</p>
<div class="alert alert-warning" role="alert">
<div class="alert-inner">
<div class="alert-icon"><span class="glyphicon glyphicon-alert" aria-hidden="true"></span></div>
<div class="alert-message"><p>Uh-oh! <a href="#" class="alert-link">Link</a>.</p>
</div>
</div>
</div>
<p>This is a test. <a href="#">Link</a>.</p>
```


[markdown-it]: https://github.com/markdown-it/markdown-it
[bootstrap-alerts]: http://getbootstrap.com/components/#alerts