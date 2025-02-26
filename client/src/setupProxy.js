// FOR VIEWING THE LIVE STREAM ON A DEV SERVER
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/hls",
    createProxyMiddleware({
      target: "https://aprilslilpugs.com",
      changeOrigin: true,
      secure: true,
    }),
  );
};
