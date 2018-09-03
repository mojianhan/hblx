// The config file of requirejs
// More: http://requirejs.org/docs/api.html#config

require.config({
  baseUrl: './scripts',
  paths: {
    jquery: 'https://cdn.bootcss.com/jquery/1.12.4/jquery.min',
    lodash: 'https://cdn.bootcss.com/lodash.js/4.16.4/lodash.min',
    weui: 'https://res.wx.qq.com/open/libs/weuijs/1.1.3/weui.min',
    purl: 'https://cdn.bootcss.com/purl/2.3.1/purl.min',
    wx: 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js',
    'rotate': 'lib/rotate',
    'sildeup': 'lib/sildeup',
  },

  shim: {
    'rotate': [ 'jquery' ],
    'sildeup': [ 'jquery' ],
  }
});
