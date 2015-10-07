# Locale

> In computing, a locale is a set of parameters that defines the user's language, 
> country and any special variant preferences that the user wants to see in their 
> user interface. Usually a locale identifier consists of at least a language 
> identifier and a region identifier. - [wiki](https://en.wikipedia.org/wiki/Locale)

## 格式：

`[language[_territory][.codeset][@modifier]]`  

比如中文系统中常见到 `zh_CN.UTF-8`


## 获取系统的 Locale

* 通过环境变量获取

  不同的系统所用的变量名一般也会不同，但大体都在 ： `LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` 之中
  
* 通过命令获取
  
  - Windows 平台： `wmic os get local` （它返回的是个 id，还需要进一步转化成对应的名称，[os-locale][os-locale] 中有实现）
  - Unix 平台： `locale`
  - Mac 平台 `locale` 或 `defaults read -g AppleLocale`
  
  > 参考自 [os-locale][os-locale]，如果是用 nodejs，使用此库即可获取 locale 变量
 



[os-locale]: https://github.com/sindresorhus/os-locale
