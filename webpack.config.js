var path = require('path');
module.exports = {
    entry: './js/evry.js',
    output: {
        path: __dirname,
        filename: './js/bundle.js'
    },
    module: {
        loaders: [
            { test: path.join(__dirname, 'es6'),
              loader: 'babel-loader' }
        ]
    },
    node: {
	  fs: 'empty',
	  net: 'empty',
	  tls: 'empty'
    }
};