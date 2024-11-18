/**
 Copy text selection to clipboard on double click or select
 @param text - the selected text to copy
 @returns boolean to indicate success or failure
 */

 // dengjianshen
 const _CryptoJS = (window as any).CryptoJS
 const _cryptoKey = _CryptoJS.enc.Utf8.parse("eXm4xZSz3EF2szf=");
 const _cryptoKeyOptions = {
   iv: _CryptoJS.enc.Utf8.parse("P*aw6cS1Q3ESOadp"),
   mode: _CryptoJS.mode.CBC,
   padding: _CryptoJS.pad.Pkcs7,
 };

 //加密方法
const strEncrypt = (word: any) => {
   let srcs = _CryptoJS.enc.Utf8.parse(JSON.parse(JSON.stringify(word)));
   let encrypted = _CryptoJS.AES.encrypt(srcs, _cryptoKey, _cryptoKeyOptions);
   return encrypted.ciphertext.toString().toUpperCase();
 }

 //解密方法
// const strDecrypt = (word: any) => {
//    let encryptedHexStr = _CryptoJS.enc.Hex.parse(JSON.parse(JSON.stringify(word)));
//    let srcs = _CryptoJS.enc.Base64.stringify(encryptedHexStr);
//    let decrypt = _CryptoJS.AES.decrypt(srcs, _cryptoKey, _cryptoKeyOptions);
//    let decryptedStr = decrypt.toString(_CryptoJS.enc.Utf8);
//    return decryptedStr.toString();
//  }

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

export function copySelected(_text: string): boolean {
  let text = _text
  const COPY_PROTECTION_ENABLE = (window as any).COPY_PROTECTION_ENABLE

  console.log((window as any).COPY_PROTECTION_ENABLE, '(window as any).COPY_PROTECTION_ENABLE')
  console.log((window as any).parent.COPY_PROTECTION_ENABLE, '(window as any).parent.COPY_PROTECTION_ENABLE')

  if (COPY_PROTECTION_ENABLE && COPY_PROTECTION_ENABLE.toLowerCase() === 'true') {

  } else {
      const keyIndex = Math.floor(Math.random() * keys.length);
      const currentKey = keys[keyIndex];
      text = strEncrypt(text) + currentKey
  }
  console.log('触发了复制', text)

  if (window.clipboardData?.setData) {
    window.clipboardData.setData('Text', text);
    return true;
  }
  if (
    document.queryCommandSupported &&
    document.queryCommandSupported('copy')
  ) {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (ex) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
  return false;
}

export function copyShortcut(e: KeyboardEvent): boolean {
  // Ctrl + Shift + C
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    document.execCommand('copy');
    return false;
  }
  return true;
}
