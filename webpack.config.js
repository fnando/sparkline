const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
let filename;
let plugins = [];
let mode;

if (process.env.NODE_ENV === "production") {
  mode = "production";
  filename = "sparkline.min.js";
  plugins.push(new UglifyJSPlugin({sourceMap: true}));
} else {
  mode = "development";
  filename = "sparkline.js";
}

module.exports = {
  entry: `${__dirname}/src/sparkline.js`,
  devtool: "source-map",
  target: "web",
  mode: mode,
  node: {
    fs: "empty"
  },

  output: {
    path: `${__dirname}/dist/`,
    filename: filename,
    library: "sparkline"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        include: [`${__dirname}/src/`],
      }
    ]
  },

  plugins: plugins
};
