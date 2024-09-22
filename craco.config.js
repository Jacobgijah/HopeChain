const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Modify existing rules for source-map-loader
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes("source-map-loader")) {
              // Exclude the simple-cbor package from source map processing
              rule.exclude = (rule.exclude || []).concat(/node_modules\/simple-cbor/);
            }
          });
        }
      });

      // Add a rule to handle modern JavaScript syntax in @dfinity/agent and @noble/curves
      webpackConfig.module.rules.push({
        test: /\.m?js$/, // Match .js and .mjs files
        include: [
          path.resolve(__dirname, 'node_modules/@dfinity'),
          path.resolve(__dirname, 'node_modules/@noble/curves')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-optional-chaining'
            ]
          }
        }
      });

      return webpackConfig;
    },
  },
};
