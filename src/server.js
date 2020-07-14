const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";

const server = http.createServer(async (req, res) => {
  const context = {};

  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  console.log(`${ip} ${req.method} ${req.url}`);

  let reader;
  const u = url.parse(req.url);

  const p = path.parse(u.pathname);

  switch (p.ext) {
    case ".js":
      res.setHeader("Content-Type", "text/javascript");
      reader = fs.createReadStream(path.join(__dirname, "../", "dist", p.base));
      break;
    default:

      if (context.url) {
        res.writeHead(301, {
          Location: context.url,
        });
        res.end();
      } else {
        const app = ReactDOMServer.renderToString(
            <App />
        );

        const data = fs.readFileSync("./public/index.html", "utf8");

        res.write(
          data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
        );

        res.end();
        return;
      }
  }

  reader.on("error", (error) => {
    console.log(error.message);
    return res.end(JSON.stringify({ code: 500, message: error.message }));
  });

  reader.pipe(res);
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// 启动http服务
server.listen(8080, () => {
  console.log(`Starting http server on ${server.address().port}`);
});
