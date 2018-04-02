# sparkline

[![NPM package version](https://img.shields.io/npm/v/@fnando/sparkline.svg)](https://www.npmjs.com/package/@fnando/sparkline)
![License: MIT](https://img.shields.io/npm/l/@fnando/sparkline.svg)
![Minified size](http://img.badgesize.io/fnando/sparkline/master/dist/sparkline.min.js.svg?label=min+size)
![Minified+Gzip size](http://img.badgesize.io/fnando/sparkline/master/dist/sparkline.min.js.svg?compression=gzip&label=min%2Bgzip+size)

Generate SVG sparklines with JavaScript without any external dependency.

## Instalation

This lib is available as a NPM package. To install it, use the following command:

```
npm install @fnando/sparkline --save
```

If you're using Yarn (and you should):

```
yarn add @fnando/sparkline
```

You'll have to call `sparkline.sparkline(svg, values, options)` directly if you're loading the script without compiling your script (e.g. [webpack](https://webpack.js.org/)). Otherwise you can simply `import sparkline from "@fnando/sparkline";`.

## API

### `sparkline(svg, values, options = {})`

- `svg`: This is a `<svg>` reference that must contain three required attributes (`width`, `height`, and `stroke-width`). These attributes are used to calculate the drawing area.
- `values`: You can either provide an array of numbers or an array of objects that respond to `.value`. If you have a different data structure, see `options.fetch`.
- `options`: This optional argument allows you to further customize the sparkline. The available options are:
    - `fetch`: Use this function to return the value if you have a different data structure that's not natively supported by sparkline.
    - `onmousemove`: By setting this callback function, you'll enable the interactive mode (unless you set `options.interactive` to `false`). The callback signature is `callback(event, datapoint)`, where `datapoint` is an object containing the value, x/y coordinates, and the item index.
    - `onmouseout`: This callback function is called every time the mouse leaves the SVG area. You can use it to hide things like tooltips.
    - `spotRadius`: Set the spot radius. The default is `2`.
    - `cursorWidth`: Set the cursor width. The default is `2`.
    - `interactive`: When `true`, this enables the interactive mode. You don't have to set this option if you're providing a `onmousemove` callback.

## Usage

This is the minimum working example:

```html
<!-- width, height and stroke-width attributes must be defined on the target SVG -->
<svg class="sparkline" width="100" height="30" stroke-width="3"></svg>

<script>
  sparkline(document.querySelector(".sparkline"), [1, 5, 2, 4, 8, 3, 7]);
</script>
```

You can change the colors by either setting the attributes directly to the SVG element or using CSS, like the following:

```css
/* just the line */
.sparkline {
  stroke: red;
  fill: none;
}

/* line with highlight area */
.sparkline {
  stroke: red;
  fill: rgba(255, 0, 0, .3);
}

/* change the spot color */
.sparkline--spot {
  stroke: blue;
  fill: blue;
}

/* change the cursor color */
.sparkline--cursor {
  stroke: orange;
}

/* style fill area and line colors using specific class name */
.sparkline--fill {
  fill: rgba(255, 0, 0, .3);
}

.sparkline--line {
  stroke: red;
}
```

## Examples

### Static

Available at https://codepen.io/fnando/full/KyZLLV/

[![](https://github.com/fnando/sparkline/blob/master/sparkline.gif?raw=true)](https://codepen.io/fnando/full/KyZLLV/)

### Interactive

Available at https://codepen.io/fnando/full/GOQLVE/

[![](https://github.com/fnando/sparkline/blob/master/sparkline-interactive.gif?raw=true)](https://codepen.io/fnando/full/GOQLVE)

## License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
