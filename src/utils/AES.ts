import CryptoJS from "crypto-js";
import http from "@/api";
import { useAuthStore } from "@/stores/modules/auth";
//密钥与偏移量从配置中获取
//密钥--配置到配置文件
const _aeskey = "a14fb716609411edb3880242ac11000d";
//偏移量-配置到配置文件
const _aesiv = "iv.taiduoshi.com";

// 接口安全
export const reqApiCheck = () => {
  const _data = {
    UserName: import.meta.env.VITE_API_CHECK_USER,
    Password: import.meta.env.VITE_API_CHECK_PASSWORD,
    LocalTimeSpan: new Date().getTime()
  };
  const _dataobj = JSON.stringify(_data);
  const _dataStr = encrypt(_dataobj);
  const _dataForm = {
    Data: _dataStr
  };

  return http.post<any>("/api/OAuth/token", _dataForm);
};

export function decrypt(data: string) {
  const key = CryptoJS.enc.Utf8.parse(_aeskey);
  const iv = CryptoJS.enc.Utf8.parse(_aesiv);
  const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
  data = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  return decrypt;
}

// 加密
export function encrypt(data: string) {
  const key = CryptoJS.enc.Utf8.parse(_aeskey);
  const iv = CryptoJS.enc.Utf8.parse(_aesiv);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString();
}

let timer = -1;

export const getOAuthToken = async () => {
  const store = useAuthStore();
  timer !== -1 && clearTimeout(timer);
  const r = await reqApiCheck();
  store.setAuthorization(r.data);
  const time = new Date(r.data?.expiresTime).getTime() - Date.now() - 15 * 60 * 1000;
  timer = window.setTimeout(() => {
    getOAuthToken();
  }, time);
  return r;
};
