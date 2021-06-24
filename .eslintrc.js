module.exports = {
  extends: "airbnb-base",
  plugins: ["prettier"],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: false,
    codeFrame: true
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  globals: {
    AMap: "readonly",
    layui: "readonly",
    $: "readonly",
    globalConfig:  "readonly",
  },
  rules: {
    "no-console": 0,
    "no-unused-vars": 0,
    "class-methods-use-this": 0,
    "no-unused-vars": [
      "error",
      {
        args: "none"
      }
    ],
    "no-underscore-dangle": 0,
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    // disallow parameter object manipulation except for specific exclusions
    "no-param-reassign": [
      "off",
      {
        props: true,
        ignorePropertyModificationsFor: [
          "state", // for vuex state
          "acc", // for reduce accumulators
          "e" // for e.returnvalue
        ]
      }
    ]
  },
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "docs/js/libs/"]
      }
    }
  }
};
