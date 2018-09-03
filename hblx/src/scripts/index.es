/* global document */
/* global location*/
/* global window*/
/* global localStorage*/
/* global wx*/
/* global history*/
import $ from 'jquery'
import getData from './getData'
import weui from 'weui'
init()

history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
})
function init() {

    var _code = getUseID('code'), //用户code
    open_id = '', //用户的open_id
    showTip = getUseID('showTip'),
    _active_number = getUseID('state'), //活动id
    distribution_type = '', //派奖方式
    start_time = '', //活动开始时间
    end_time = '', //活动结束时间
    total_margin = 0, //库存数量
    userRankingList = ''; //用户排名
    localStorage.setItem('CODE',_code)
    localStorage.setItem('ACTIVE_NUMBER',_active_number)
    //获取用户code和活动ID
    function getUseID (val) {
        var reg = new RegExp("(^|&)" + val + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]);
        return null;
    }
    //获取用户信息
    function getUseInfo(id) {
      $.ajax({
        url: '/tools/user/get-one.do',
        type: 'GET',
        data: {
          code: id
        },
        success: function (res) {
          if (res.status == 200) {
            open_id = res.data.open_id
            if (showTip ==2) {
              $('.top-nav').click()
            }
          } else {
            weui.alert(res.data.errMsg)
          }
        }
      })
    }
    getUseInfo(_code)
    //获取活动总信息
    function getAlldetailMsg(activity_number) {

      $.ajax({
        url: '/tools/tools-crm/get-all.do',
        type: 'GET',
        data: {
            activity_number: activity_number
        },
        success: function(res) {
          if (res.status == 200) {
            const active_info = res.data;
            let participate_num = 0;
            if (active_info.setting_info.virtual_number_participants_status == 1) {
              participate_num = Number(active_info.participate_number || 0 ) + Number(active_info.setting_info.virtual_number_participants || 0)
              $('.participate-number').text(participate_num)
            } else {
              $('.participate-number').text(active_info.participate_number || 0)
            }

            start_time = res.data.toolsSetting_info.start_time
            end_time = res.data.toolsSetting_info.end_time
            distribution_type = res.data.setting_info.distribution_type
            total_margin = active_info.total_margin
            // $('.qr-code-img').attr('src', res.data.setting_info.qr_code_url)
          } else {
            weui.alert(res.data.errMsg)
          }
        },
        error: function (err) {
          weui.alert(err.data.errMsg)
        }
      })
    }

    getAlldetailMsg(_active_number)

    //用户游戏次数控制
    $('.to-game').on('click', function () {
      $('.qr-code-container').addClass('hidden')
      $('.share-container').addClass('hidden')
      $('.error-alert-container').addClass('hidden')
      var now = new Date().getTime();
      var start = new Date(start_time);
      var end = new Date(end_time);
      if (now < start) {
        $('.error-alert-container').removeClass('hidden')
        $('.error-status[data-status="1"]').removeClass('hidden')
        $('.start-time').text(start_time)
        return
      }
      if ( now > end) {
        $('.error-alert-container').removeClass('hidden')
        $('.error-status[data-status="2"]').removeClass('hidden')
        $('.end-time').text(end_time)
        return
      }
      if (distribution_type == 2) {
        // location.href = './game.html'
        location.href = '/active/hblx/dist/game.html'
      }
      if (distribution_type == 3) {
        getUserCounts(open_id,_active_number)
      }

      if (total_margin == 0) {
        $('.error-alert-container').removeClass('hidden')
        $('.error-status[data-status="5"]').removeClass('hidden').text('奖项库存已被兑完，是否还要玩？')
        $('.confim-msg').off().on('click', function () {
          location.href = '/active/hblx/dist/game.html'
        })
      }
    })

    //获取用户参与次数
    function getUserCounts (code, activity_number) {
      getData({
        url: '/tools/tools-crm/get-selected.do',
        type: 'GET',
        data: {
          open_id: code,
          activity_number: activity_number
        }
      }).then((res) => {
        if (res.status == 200) {
          const player_info = res.data.player_info
          if (Number(player_info.already_participate_number) >= Number(res.data.distribution_info.total_participate_times)) {
            $('.error-alert-container').removeClass('hidden')
            $('.error-status[data-status="5"]').removeClass('hidden')
            return
          }
          if (player_info.use_participate_number == 0 && player_info.use_share_number == 0) {
            $('.error-alert-container').removeClass('hidden')
            $('.error-status[data-status="4"]').removeClass('hidden')
            return
          }
          if (player_info.use_participate_number == 0 && Number(player_info.use_share_number) > 0){
            $('.error-alert-container').removeClass('hidden')
            $('.error-status[data-status="3"]').removeClass('hidden')
            $('#share-btn').removeClass('hidden')
            return
          }
          location.href = '/active/hblx/dist/game.html'
        }
        if (res.status == 25090) {
          location.href = '/active/hblx/dist/game.html'
        }
      })
    }

    //获取排行榜信息
    function getrankingList (code,activity_number) {
        getData({
            url: '/tools/competition-set/get-all.do',
            type: 'GET',
            data: {
                open_id: code,
                activity_number: activity_number
            }
        }).then((res) => {
          if (res.status != 200) {
            return
          }
            var list_info = res.data.order_info
            list_info.forEach((item,index) => {
                $('.list-uls').append(`
                    <li class="li-item">
                        <p>No.${ index+1 }</p>
                        <div class="img-mini">
                            <img src="${ item.headimgurl || '' }" alt="">
                        </div>
                        <p>${ item.nickname || '' }</p>
                        <p>${ item.score || '' }分</p>
                    </li>
                `)
            })
            userRankingList = Object.keys(res.data.player_info)
            $('.level').text(userRankingList.length === 0 ? '无': userRankingList[0])
        })
    }

    $('.ranking-list').on('click', function () {
      $('.list-uls').text('')
      getrankingList(open_id, _active_number)
    })

    //我的奖品
    function getmyPrize(code, activity_number) {
      getData({
        url: '/tools/competition-set/get-multi.do',
        type: 'GET',
        data: {
          activity_number: activity_number,
          open_id: code
        }
      }).then((res) => {
        if (res.status == 200) {
          const data = res.data.awards_info
          if (data.length == 0) {
            $('.no-prize-container').removeClass('hidden')
            return
          }
          $('.prize-uls').removeClass('hidden')
          $('.prize-level').text(data.level + ':')
          $('.prize-name').text(data.name)
          $('.prize-status').text(data.status == 0 ? '未兑奖': '已兑奖')
          $('.prize-deadline-detail').text(data.awards_end_time)
          $('.prize-lis').attr('data-id', data.prize_item_id)
        }
        if (res.status == 25017) {
          $('.no-prize-container').removeClass('hidden')
        }
      })
    }

    $('.my-prize').on('click', function () {
      getmyPrize(open_id, _active_number)
    })

    //游戏规则
    function gameRule (activity_number) {
      getData({
        url: '/tools/tools-crm/get-all.do',
        type: 'GET',
        data: {
          activity_number: activity_number
        }
      }).then((res) => {
        if (res.status == 200) {
          const active_info = res.data
          active_info.awards_info.forEach((item, index) => {
            $('.prize-list-detail').append(`
              <p key=${index}>
                  <span>${item.level}:</span>
                  <span>${item.prize_name}</span>
              </p>
            `)
          })
          $('.active-time-start').text(active_info.toolsSetting_info.start_time)
          $('.active-time-end').text(active_info.toolsSetting_info.end_time)
          $('.describe-detail').text(active_info.setting_info.comment)
          $('.redeem-address').text(active_info.awards_info[0].awards_address)
        }
      })
    }

    $('.game-rule').on('click', function () {
      $('.prize-list-detail').text('')
      gameRule(_active_number)
    })

    $('.top-nav,.alert-close').on('click', function () {
        var className = $(this).attr('data-id')
        if (className) {
            if ($('.'+className).hasClass('hidden')) {
                $('.'+className).removeClass('hidden')
            } else {
                $('.'+ className).addClass('hidden')
            }
        }
    })
    $('.follow').on('click', function () {
        var className = $(this).attr('data-id')
        $('.'+className).addClass('hidden')
    })

    $('.prize-lis').on('click', function () {
        if ($(this).attr('data-id')) {
            // location.href = './prizeDetail.html?id=' + $(this).attr('data-id')
            location.href = './active/hblx/dist/prizeDetail.html?id=' + $(this).attr('data-id')
        }
    })

    $('#share-btn').on('click', function () {
        $('.share-container').removeClass('hidden')
    })
    $('.share-container').on('click', function () {
        $(this).addClass('hidden')
    })

    $('.follow[data-id="follow-us"]').on('click', function () {
      $('.qr-code-container').removeClass('hidden')
    })

    //隐藏二维码
    $('.qr-code-container').on('click', function () {
      $(this).addClass('hidden')
    })
    $('.qr-code-img').on('click', function (e) {
      e.stopPropagation()
    })


      // 微信分享
  function wechatShare() {
    var img = '';
    var title = '红包来袭';
    var desc = '玩游戏，赢大奖！'
    var url = window.location.href;
    $.ajax({
        url: '/tools/sign-package/get-one.do',
        data: {
            url: url
        },
        success: function(res) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: res.data.appId, // 必填，公众号的唯一标识
                timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                signature: res.data.signature,// 必填，签名，见附录1
                jsApiList: [ 'checkJsApi','getLocation','chooseImage','uploadImage', 'onMenuShareWeibo', 'onMenuShareQZone', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ' ]
            });
            wx.ready(function() {
                //分享到朋友圈
                wx.onMenuShareTimeline({
                    title: title, // 分享标题
                    link: location.origin + '/active', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: img, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                        $.ajax({
                          url: '/tools/competition-set/post-one.do',
                          type: 'POST',
                          data: {
                            activity_number: _active_number,
                            open_id: open_id,
                            share_success: 1
                          },
                          success: function(res) {
                            if (res.status == 200) {
                              weui.confirm('分享成功！是否开始游戏？', {
                                title: '分享成功',
                                buttons: [ {
                                    label: '取消',
                                    type: 'default',
                                    onClick: function() {

                                    }
                                }, {
                                    label: '确定',
                                    type: 'primary',
                                    onClick: function() {
                                      $('.to-game').click()
                                    }
                                } ]
                              })
                            }
                          }
                        })
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //分享给朋友
                wx.onMenuShareAppMessage({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: location.origin + '/active', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: img, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        // 用户确认分享后执行的回调函数
                        $.ajax({
                          url: '/tools/competition-set/post-one.do',
                          type: 'POST',
                          data: {
                            activity_number: _active_number,
                            open_id: open_id,
                            share_success: 1
                          },
                          success: function(res) {
                            if (res.status == 200) {
                              weui.confirm('分享成功！是否开始游戏？', {
                                title: '分享成功',
                                buttons: [ {
                                    label: '取消',
                                    type: 'default',
                                    onClick: function() {
                                    }
                                }, {
                                    label: '确定',
                                    type: 'primary',
                                    onClick: function() {
                                      $('.to-game').click()
                                    }
                                } ]
                              })
                            }
                          }
                        })
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //分享到QQ
                wx.onMenuShareQQ({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: 'http://dev.commodity.crm.9daye.com.cn/active', // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: open_id,
                          share_success: 1,
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '取消',
                                  type: 'default',
                                  onClick: function() {
                                  }
                              }, {
                                  label: '确定',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.to-game').click()
                                  }
                              } ]
                            })
                          }
                        }
                      })
                    },
                    cancel: function () {
                       // 用户取消分享后执行的回调函数
                    }
                });
                //分享到QQ微博
                wx.onMenuShareWeibo({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: url, // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: open_id,
                          share_success: 1
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '取消',
                                  type: 'default',
                                  onClick: function() {
                                  }
                              }, {
                                  label: '确定',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.to-game').click()
                                  }
                              } ]
                            })
                          }
                        }
                      })
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //分享到QQ空间
                wx.onMenuShareQZone({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: url, // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: open_id,
                          share_success: 1
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '取消',
                                  type: 'default',
                                  onClick: function() {
                                  }
                              }, {
                                  label: '确定',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.to-game').click()
                                  }
                              } ]
                            })
                          }
                        }
                      })
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
            })
        },
        error: function(err) {
          weui.alert(err.data.errMsg)
        }
    })
  }

  wechatShare()

}
