import ttyWrap from 'tty-wrap';
import Char from '../lib/Char';

export default function (yargs) {


  Char.fromGroup('space').forEach(c => console.log(c.spaceName))

  // 终端上效果不明显，http://www.smashingmagazine.com/2015/10/space-yourself/#all-together-now
  //
  //
  // https://en.wikipedia.org/wiki/Whitespace_character
  //
  //
  /*

  Use breakable space:

    由于它们有不同的宽度，所以可以添加在某些字符的两端，适当的撑开此字符，使布局更美观

  Use no-break space:

    它们默认是无法被自动断开的，浏览器在自动换行时，不会在这些 space 上换行，所以当你不
    想要浏览器拆分某些字符时，可以在它们之间用这些 space 连接起来

  Use zero-width space:

    和 no-break space 相反，浏览器会在这些字符上换行，所以可以不用 css 的 break-word 而使用此
    来使文本在某些连接在一起的地方可以自动换行

    另外它还可以扰乱默认的算法，比如某些应用程序会使用 @someone 来推送一个消息给 someone，但
    如果 @ 和 someone 之间有一个 zero-width space 的话，那此应用程序是不会推送消息的（除非
    它过滤了这种空白字符）
   */

  /*
  使用时的注意事项：

  因为这些空白字符看上去是一样的，所以在使用它时要写上注释
  不同的字体对这些字符的支持度是不一样的，有些字体可能不支持此类字符
   */


}
