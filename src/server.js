const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";

const server = http.createServer(async (req, res) => {
  const app = ReactDOMServer.renderToString(<App />);

  const data = fs.readFileSync("./public/index.html", "utf8");

  res.write(
    data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
  );

  res.end();
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(8080, () => {
  console.log(`Starting http server on ${server.address().port}`);
});
