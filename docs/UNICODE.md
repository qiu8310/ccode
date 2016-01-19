
## Unicode 中每种语言所占字符的编码的范围

[最新数据](http://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt)


通过此链接找到的：[COMMON REFERENCES FOR UNICODE STANDARD ANNEXES](http://www.unicode.org/reports/tr41/tr41-17.html)

从文档中可以看到，没有确切的中文字体的范围，只有一个更大范围的名称 `CJK`（感觉是不是
China, Japan, Korea的简称），它属于 `East Asian Scripts` 范畴


## Unicode 中每种语言中字符的详细信息

[www.unicode.org/charts/](http://www.unicode.org/charts/)


## Unicode 工具集

[www.unicode.org/cldr/utility/](http://www.unicode.org/cldr/utility/)

现在感觉基本上都用不着，适合搞语言的人，不过第一个工具 
[Character](http://www.unicode.org/cldr/utility/character.jsp) 有时可以用用,
它可以查到指定的字符的所有的各类信息


## CJK 字符集中的一些表意文字

[www.unicode.org/Public/UCD/latest/ucd/USourceGlyphs.pdf](http://www.unicode.org/Public/UCD/latest/ucd/USourceGlyphs.pdf)

里面有很多很有趣的中文

## Emoji

[官方文档](http://www.unicode.org/reports/tr51/)

[最新数据](http://www.unicode.org/Public/emoji/latest/emoji-data.txt)

[不同的系统平台，emoji 表情可能不一样](http://apps.timwhitlock.info/emoji/tables/unicode)

[Twitter Emoji for Everyone](http://twitter.github.io/twemoji)

## East Asian Width 东亚字体的宽度

东亚字体有些宽度是 `narrow`， 有此宽度又是 `wide`，而有些字体的宽度即可以是 `narrow` 和 `wide`

这些即可以是 `narrow` 又可以是 `wide` 的字体又被称为是 `东亚模糊字体` 或 `Ambiguous Width Characters`

The Unicode character property `East_Asian_Width` provides a default 
classification of characters, which an implementation can use to 
decide at runtime whether to treat a character as narrow or wide.

[官方文档](http://unicode.org/reports/tr11/)

[最新数据](http://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt)



**总结**

* All private-use characters are by default classified as Ambiguous, because their definition depends on context.

* Unassigned code points in ranges intended for CJK ideographs are classified as Wide. Those ranges are:

  - CJK Unified Ideographs Extension A:       U+3400..U+4DBF
  - CJK Unified Ideographs:                   U+4E00..U+9FFF
  - CJK Compatibility Ideographs:             U+F900..U+FAFF
  - CJK Unified Ideographs Extension B:      U+20000..U+2A6DF
  - CJK Unified Ideographs Extension C:      U+2A700..U+2B73F
  - CJK Unified Ideographs Extension D:      U+2B740..U+2B81F
  - CJK Unified Ideographs Extension E:      U+2B820..U+2CEAF
  - CJK Compatibility Ideographs Supplement: U+2F800..U+2FA1F
  - and any other reserved code points on Planes 2 and 3:   U+20000..U+2FFFD  U+30000..U+3FFFD

* For additional recommendations for handling the default property value for unassigned characters, see [Section 5.3, Unknown and Missing Characters](http://www.unicode.org/versions/Unicode8.0.0/ch05.pdf).

* In a broad sense, `wide` characters include `W`, `F`, and `A` (when in East Asian context), and `narrow` characters include `N`, `Na`, `H`, and `A` (when not in East Asian context).

**其它**

`time-grunt` 就因为使用了 Ambiguous Characters 而出了一个 
[Bug](https://github.com/sindresorhus/time-grunt/issues/52) => 照这样看，
国外人一般不会将他们的环境变量上的 `Treat ambiguous-width characters as double width` 
选项打开，因为他们一般不会处理东亚字体，所以我们在编程时，遇到无法判断的情况时，也都默认把它
当作 `narrow` 吧。


## Combining Marks

这类字符可以理解为修饰字符，它自己不占宽度，只会和它前面的字符组合而得到一个组合的字符

e.g: `q\u0307\u0323 => q̣̇`

使用 [Unicode normalization](http://unicode.org/reports/tr15/)(ES6 中
的 [String.prototype.normalize](http://git.io/unorm)) 可以将这种组合的字符
合并成一个真正意义的字符，比如 `n\u0303` 会被合并成一个 `\u00F1` 。

但时，有些字符组合可能并没有可替代的单个字符，所以使用了 normalize 也没有用，
比如 `q\u0307\u0323` 就无法被 normalize 。 如果只是要计算字符串的实际长度，
我们可以把这些字符去掉再来计算，可以[参考这里](https://mathiasbynens.be/notes/javascript-unicode#accounting-for-other-combining-marks)。

[Unicode 规范中的定义](http://www.unicode.org/versions/Unicode7.0.0/ch03.pdf#G30602)


## 编码相关的知识

* [Unicode 字符集](http://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF)
* [UTF-16 的规范](https://tools.ietf.org/html/rfc2781)
* [UTF-8 的规范](https://tools.ietf.org/html/rfc2279)
* [阮一峰的关于 ASCII、UNICODE、UTF-8 笔记](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)
* Unicode 和 UTF-8 之间的转换
  
  ```
  0000 0000 - 0000 007F 的字符(0-127)，        用单个字节表示，二进制模板：0xxxxxxx
  0000 0080 - 0000 07FF 的字符(128-32767)，    用两个字节表示，二进制模板：110xxxxx 10xxxxxx
  0000 0800 - 0000 FFFF 的字符(32768-65535)，  用三个字节表示，二进制模板：1110xxxx 10xxxxxx 10xxxxxx
  0001 0000 - 0010 FFFF 的字符(65536-1114111)，用四个字节表示，二进制模板：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx


  “汉”字的Unicode编码是6C49。6C49在0800-FFFF之间，所以肯定要用3字节模板了：1110xxxx 10xxxxxx 10xxxxxx
  将6C49写成二进制是：0110 110001 001001（注意不够的话，在前面要补 0)
  用这个比特流依次代替模板中的x，得到：11100110 10110001 10001001，即 E6 B1 89

  escape('汉')    => "%u6C49"     Unicode
  encodeURI('汉') => "%E6%B1%89"  UTF-8
  ```


* [Surrogate pairs 和 Code points 之间的转换](https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs) `\uD83D\uDCA9 <=> \u{1F4A9}`
* JS 中处理编码相关的库 [punycode](https://github.com/bestiejs/punycode.js)，nodejs 0.6.2+ 已将它编译进了它的内部模块中
* [PHP 采用的是 ISO-8859-1 编码](http://flourishlib.com/docs/UTF-8)，
* [CP936 和 Unicode 对应关系的数据](http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP936.TXT)，看父级目录还有很多其它类的 CP 编码


## 引用

* [Mathiasbynens 的文章 Javascript Unicode](https://mathiasbynens.be/notes/javascript-unicode)
* [HTML5](http://www.w3.org/TR/html5/)
* [HTML Working Group](http://www.w3.org/html/wg/)
* [XML](http://www.w3.org/TR/xml/)
* [Unicode](http://www.unicode.org/)
* [Unicode 规范](http://www.unicode.org/versions/latest/)
* [Unicode 技术报道](http://www.unicode.org/reports/)
* [Unicode 相关的术语表](http://www.unicode.org/glossary/)
