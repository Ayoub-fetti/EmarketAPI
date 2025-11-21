module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === "import" &&
              path.node.property.name === "meta"
            ) {
              path.replaceWithSourceString(
                '({ env: { VITE_BACKEND_BASE_URL: "http://localhost:3000", VITE_API_URL: "http://localhost:3000/api" } })'
              );
            }
          },
        },
      };
    },
  ],
};
