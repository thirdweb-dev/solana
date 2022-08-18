'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sdk = require('../../dist/sdk-70cc8f7d.cjs.dev.js');
var web3_js = require('@solana/web3.js');
var fs = require('fs');
var os = require('os');
var path = require('path');
var yaml = require('yaml');
require('@metaplex-foundation/js');
require('tiny-invariant');
require('form-data');
require('@metaplex-foundation/mpl-token-metadata');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefault(fs);
var os__default = /*#__PURE__*/_interopDefault(os);
var path__default = /*#__PURE__*/_interopDefault(path);
var yaml__default = /*#__PURE__*/_interopDefault(yaml);

/**
 * @internal
 */

function getConfig() {
  return _getConfig.apply(this, arguments);
}
/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */


function _getConfig() {
  _getConfig = sdk._asyncToGenerator( /*#__PURE__*/sdk._regeneratorRuntime().mark(function _callee() {
    var CONFIG_FILE_PATH, configYml;
    return sdk._regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Path to Solana CLI config file
            CONFIG_FILE_PATH = path__default["default"].resolve(os__default["default"].homedir(), ".config", "solana", "cli", "config.yml");
            configYml = fs__default["default"].readFileSync(CONFIG_FILE_PATH, {
              encoding: "utf8"
            });
            return _context.abrupt("return", yaml__default["default"].parse(configYml));

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getConfig.apply(this, arguments);
}

function getPayer() {
  return _getPayer.apply(this, arguments);
}
/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */

function _getPayer() {
  _getPayer = sdk._asyncToGenerator( /*#__PURE__*/sdk._regeneratorRuntime().mark(function _callee3() {
    var config;
    return sdk._regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return getConfig();

          case 3:
            config = _context3.sent;

            if (config.keypair_path) {
              _context3.next = 6;
              break;
            }

            throw new Error("Missing keypair path");

          case 6:
            _context3.next = 8;
            return createKeypairFromFile(config.keypair_path);

          case 8:
            return _context3.abrupt("return", _context3.sent);

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);
            console.warn("Failed to create keypair from CLI config file, falling back to new random keypair");
            return _context3.abrupt("return", web3_js.Keypair.generate());

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 11]]);
  }));
  return _getPayer.apply(this, arguments);
}

function createKeypairFromFile(_x) {
  return _createKeypairFromFile.apply(this, arguments);
}

function _createKeypairFromFile() {
  _createKeypairFromFile = sdk._asyncToGenerator( /*#__PURE__*/sdk._regeneratorRuntime().mark(function _callee4(filePath) {
    var secretKeyString, secretKey;
    return sdk._regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            secretKeyString = fs__default["default"].readFileSync(filePath, {
              encoding: "utf8"
            });
            secretKey = Uint8Array.from(JSON.parse(secretKeyString));
            return _context4.abrupt("return", web3_js.Keypair.fromSecretKey(secretKey));

          case 3:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _createKeypairFromFile.apply(this, arguments);
}

function NodeThirdwebSDK(_x) {
  return _NodeThirdwebSDK.apply(this, arguments);
}

function _NodeThirdwebSDK() {
  _NodeThirdwebSDK = sdk._asyncToGenerator( /*#__PURE__*/sdk._regeneratorRuntime().mark(function _callee(network) {
    var payer, signer, sdk$1;
    return sdk._regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getPayer();

          case 2:
            payer = _context.sent;
            signer = {
              publicKey: payer.publicKey,
              secretKey: payer.secretKey
            };
            sdk$1 = new sdk.ThirdwebSDK(new web3_js.Connection(network));
            sdk$1.wallet.connect(signer);
            return _context.abrupt("return", sdk$1);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _NodeThirdwebSDK.apply(this, arguments);
}

exports.NodeThirdwebSDK = NodeThirdwebSDK;
