'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./thirdweb-dev-solana-server.cjs.prod.js");
} else {
  module.exports = require("./thirdweb-dev-solana-server.cjs.dev.js");
}
