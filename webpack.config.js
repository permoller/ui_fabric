"use strict";

const path = require("path");

module.exports = {
  // Set debugging source maps to be seperat file
  // An alternative is inline-source-map
  devtool: "source-map",
  // The application entry point
  // Used for building the dependency graph that defines what gets included in the bundle
  entry: "./src/index.tsx",
  // Where to compile the bundle
  // By default the output directory is `dist`
  output: {
    filename: "bundle.js"
  },
  // Supported file loaders
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  // File extensions to support resolving
  resolve: {
    extensions: [
      ".ts",
      ".tsx",
      ".js"
    ]
  }
};
