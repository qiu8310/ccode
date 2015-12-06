

const ALL = {
  editor: [
    // name, link, tags
    ['vim,plugin', 'http://vimawesome.com/']
  ],

  language: [

  ],

  system: [
    ['mac,shortcut', 'https://support.apple.com/zh-cn/HT201236']
  ]
};

export default function (yargs) {
  let argv = yargs.usage('$0 doc [keywords]\n\n' +
      '    个人文档')
    .argv;


  console.log(argv);
}
