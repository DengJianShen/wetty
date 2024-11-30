import type { Socket } from 'socket.io-client';
import _ from 'lodash';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { ImageAddon } from 'xterm-addon-image';

import type { Options } from './term/options';
import { loadOptions } from './term/load';
import { configureTerm } from './term/confiruragtion';
import { terminal as termElement } from './disconnect/elements';

// dengjianshen
const _CryptoJS = (window as any).CryptoJS
const _cryptoKey = _CryptoJS.enc.Utf8.parse("eXm4xZSz3EF2szf=");
const _cryptoKeyOptions = {
  iv: _CryptoJS.enc.Utf8.parse("P*aw6cS1Q3ESOadp"),
  mode: _CryptoJS.mode.CBC,
  padding: _CryptoJS.pad.Pkcs7,
};

//加密方法
// const strEncrypt = (word: any) => {
//   let srcs = _CryptoJS.enc.Utf8.parse(JSON.parse(JSON.stringify(word)));
//   let encrypted = _CryptoJS.AES.encrypt(srcs, _cryptoKey, _cryptoKeyOptions);
//   return encrypted.ciphertext.toString().toUpperCase();
// }

//解密方法
const strDecrypt = (word: any) => {
  let encryptedHexStr = _CryptoJS.enc.Hex.parse(JSON.parse(JSON.stringify(word)));
  let srcs = _CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let decrypt = _CryptoJS.AES.decrypt(srcs, _cryptoKey, _cryptoKeyOptions);
  let decryptedStr = decrypt.toString(_CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

const keys: any = [
  'C2%A4%C3%89%C2%AC%C2%A1',
  '8B%C2%99%C2%88%C2%BE%C3',
  'r%C2%AA%C2%9F%C2%8D%C2%',
  'B7%C3%94%C2%B6%C2%B4%C2',
  'C3%8A%C3%96%C3%A1%C3%8C',
  'B6%C3%90%C3%9A%C3%C2%A1',
  'A3%C2%AA%C3%80%C2%BE%C3'
]
export const keyLen: number = 23

export class Term extends Terminal {
  socket: Socket;
  fitAddon: FitAddon;
  loadOptions: () => Options;

  constructor(socket: Socket) {
    super({ allowProposedApi: true });
    this.socket = socket;
    this.fitAddon = new FitAddon();
    this.loadAddon(this.fitAddon);

    this.loadAddon(new WebLinksAddon());
    // Note: worker file is currently hard copied from xterm-addon-image,
    // the file needs to be refreshed upon a newer package version
    this.loadAddon(new ImageAddon('/wetty/assets/xterm-addon-image-worker.js'));
    this.loadOptions = loadOptions;

    (window as any).resizeTerm = this.fitAddon.fit

  }

  resizeTerm(): void {
    this.refresh(0, this.rows - 1);
    if (this.shouldFitTerm) this.fitAddon.fit();
    this.socket.emit('resize', { cols: this.cols, rows: this.rows });
  }

  get shouldFitTerm(): boolean {
    return this.loadOptions().wettyFitTerminal ?? true;
  }
}

declare global {
  interface Window {
    wetty_term?: Term;
    wetty_close_config?: () => void;
    wetty_save_config?: (newConfig: Options) => void;
    clipboardData: DataTransfer;
    loadOptions: (conf: Options) => void;
  }
}

export function terminal(socket: Socket): Term | undefined {
  const term = new Term(socket);
  if (_.isNull(termElement)) return undefined;
  termElement.innerHTML = '';
  term.open(termElement);
  configureTerm(term);

  ((term as any).element).addEventListener('keydown', (event: any) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      event.preventDefault();
      navigator.clipboard.readText().then(clipboardText => {
        let text = clipboardText;
        const COPY_PROTECTION_ENABLE = (window as any).COPY_PROTECTION_ENABLE
        if (COPY_PROTECTION_ENABLE && COPY_PROTECTION_ENABLE.toLowerCase() === 'true') {

        } else {
          let realLen = text.length - keyLen
          if (realLen > 0) {
            const currentKey = text.substring(realLen, text.length)
            const keyIndex = keys.findIndex((v: any) => v === currentKey)
            if (keyIndex > -1) text = strDecrypt(text.substring(0, realLen))
          }
        }
        console.log('触发了粘贴1', text)
        term.write(text);
      }).catch(err => {
        console.error('Failed to read clipboard contents: ', err);
      });
    }
  });

  ((term as any).element).addEventListener('paste', (event: any) => {
    event.preventDefault();
    navigator.clipboard.readText().then(clipboardText => {
      let text = clipboardText;
      const COPY_PROTECTION_ENABLE = (window as any).COPY_PROTECTION_ENABLE
      if (COPY_PROTECTION_ENABLE && COPY_PROTECTION_ENABLE.toLowerCase() === 'true') {

      } else {
        let realLen = text.length - keyLen
        if (realLen > 0) {
          const currentKey = text.substring(realLen, text.length)
          const keyIndex = keys.findIndex((v: any) => v === currentKey)
          if (keyIndex > -1) text = strDecrypt(text.substring(0, realLen))
        }
      }
      console.log('触发了粘贴1', text)
      term.write(text);
    }).catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  });

  window.onresize = function onResize() {
    term.resizeTerm();
  };
  window.wetty_term = term;
  return term;
}
