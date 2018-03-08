let webpack = require('webpack');
let outputFile = 'nodecoin.js';
let fs = require('fs');

let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
let env = process.env.WEBPACK_ENV;
let libraryName = 'nodecoin';

let plugins = [ ];


if (env === 'build') {
	plugins.push(new UglifyJsPlugin({ minimize: true }));
	outputFile = `${libraryName }.min.js`;
} else {
	outputFile = `${libraryName }.js`;
}

let nodeModules = fs.readdirSync('node_modules')
	.reduce((acc, mod) => {
		if (mod === '.bin') {
			return acc;
		}

		acc[ mod ] = `commonjs ${ mod}`;
		return acc;
	}, {});

let config = {
	entry: `${__dirname }/src/index.js`,
	devtool: 'sourcemap',
	target: 'node',
  // mode: env === 'build' ? 'production' : 'development',
	output: {
		path: `${__dirname }/build`,
		filename: outputFile,
		library: 'events',
		libraryTarget: 'umd',
	},
	externals: nodeModules,
	module: {
		loaders: [
			{
				test: /(\.js)$/,
				loader: 'babel-loader',
				exclude: /(node_modules|build)/,
			},
		],
	},
	resolve: {
		extensions: [ '.js' ],
	},
};

module.exports = config;
