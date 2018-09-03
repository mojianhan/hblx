/* global document */
/* global window */
/* global localStorage */
/* global location*/
/* global navigator*/
/* global wx*/
import $ from 'jquery'
import weui from 'weui'

init()

function init() {
  var award = null,
    awardArr = [], //存放奖品或炸弹的数组
    scoreInt = 0, //分数
    _uuid = '',
    timer = null,
    awardTime = 250, //产生奖品的速度
    setTime = null,
    cent = 3, //炸弹所占比例 1/3
    audio = document.getElementById('audio-msc'),
    bodyBg = document.getElementById('body-bg'),
    screenHeght = document.documentElement.clientHeight,
    distribution_type = '', //派奖方式
    start_time = '', //活动开始时间
		end_time = '', //活动结束时间
    ens = 1,			//物品掉落速度
    lottery_limit = '', //当派奖方式是参与派奖时，最低分数限制
		musicFlag = true,
		timeout = 30,	//游戏时间
		_code = localStorage.getItem('CODE'),
    _active_number = localStorage.getItem('ACTIVE_NUMBER'),
    _flag_count = 0;
  var person = {
    open_id: '',
    nickname: '',
    headimgurl: ''
  }

  //获取用户信息
  function getUseInfo(id) {
		$.ajax({
			url: '/tools/user/get-one.do',
      type: 'GET',
      data: {
				code: id
      },
      success: function(res) {
        if (res.status === 200) {
          person.headimgurl = res.data.headimgurl
          person.open_id = res.data.open_id
          person.nickname = res.data.nickname
          $('.user-img').attr('src', res.data.headimgurl)
          _flag_count++

          getUserbegain(res.data.open_id, _active_number)
          setFirstMsg(_active_number, res.data.open_id)
          if (_flag_count == 2) {
            gameTimeout()
          }

        }
      },
      error: function () {
        setTime && clearInterval(setTime)
        timer && clearInterval(timer)
        over_timer && clearInterval(over_timer)
				weui.alert('用户未登录,请先登陆')
				location.href = 'http://dev.commodity.crm.9daye.com.cn/active/'
      }
    })
  }

  // getUseInfo(_code)
  // getactiveInfo(_active_number)

  //初始获取用户次数
  function getUserbegain (open_id, active_number){
    $.ajax({
      url: '/tools/tools-crm/get-selected.do',
      type: 'GET',
      data: {
        open_id: open_id,
        activity_number: active_number
      },
      success: function (res) {
        const player_info = res.data.player_info;
        if (Number(player_info.already_participate_number) >= Number(res.data.distribution_info.total_participate_times)) {
          $('.audio-music')[0].pause()
          $('.score-alert').text(scoreInt + '分')
          setTime && clearInterval(setTime)
          timer && clearInterval(timer)
          over_timer && clearInterval(over_timer)
          $('.error-alert-container').removeClass('hidden')
          $('.error-status[data-status="5"]').removeClass('hidden').siblings().addClass('hidden')
          $('.confim-msg').off().on('click', function () {
            location.href = './?code='+_code+'&state='+_active_number
          })
          return
        }
        if (Number(player_info.use_participate_number) == 0 && Number(player_info.use_share_number) == 0) {
          $('.audio-music')[0].pause()
          $('.score-alert').text(scoreInt + '分')
          setTime && clearInterval(setTime)
          timer && clearInterval(timer)
          over_timer && clearInterval(over_timer)
          $('.error-alert-close').addClass('hidden')
          $('.error-alert-container').removeClass('hidden')
          $('.error-status[data-status="4"]').removeClass('hidden').siblings().addClass('hidden')
          $('.share-btn').addClass('hidden')
          $('.confim-msg').off().on('click', function () {
            location.href = './?code='+_code+'&state='+_active_number
          })
          return
        }
        if (Number(player_info.use_participate_number) == 0 && Number(player_info.use_share_number) > 0) {
            $('.audio-music')[0].pause()
            $('.score-alert').text(scoreInt + '分')
            $('.error-alert-close').addClass('hidden')
            setTime && clearInterval(setTime)
            timer && clearInterval(timer)
            over_timer && clearInterval(over_timer)
            $('.error-alert-container').removeClass('hidden')
            $('.error-status[data-status="3"]').removeClass('hidden').siblings().addClass('hidden')
            $('#share-btn').removeClass('hidden')
            $('.confim-msg').off().on('click', function () {
              location.href = './?code='+_code+'&state='+_active_number
            })
          return
        }

      },
      error: function (err) {
        weui.alert(err.data.errMsg)
      }
    })
  }

  //初次进来提交游戏信息
  function setFirstMsg(active_number, open_id) {
    $.ajax({
      url: '/tools/competition-set/post-selected.do',
      type: 'POST',
      data: {
        activity_number: active_number,
        open_id: open_id
      },
      success: function(res) {
        if (res.status == 200) {
          _uuid = res.data.player_info.uuid
        }
      },
      error: function (err) {
        weui.alert(err.data.errMsg)
      }
    })
  }

  //获取活动信息
  function getactiveInfo(active_number) {
		$.ajax({
			url: '/tools/tools-crm/get-all.do',
      type: 'GET',
      data: {
				activity_number: active_number
      },
      success: function (res) {
				if (res.status == 200) {
          const toolsSetting_info = res.data.toolsSetting_info,
                setting_info = res.data.setting_info,
                distribution_info = res.data.distribution_info;
          if (toolsSetting_info.status == 0) {
            weui.alert('活动已结束！')
            setTime && clearInterval(setTime)
            timer && clearInterval(timer)
            over_timer && clearInterval(over_timer)
          }
          if (toolsSetting_info.status == 1) {
            weui.alert('活动还未开始！')
            setTime && clearInterval(setTime)
            timer && clearInterval(timer)
            over_timer && clearInterval(over_timer)
          }

          setting_info.bottom_button == 1 ? $('.follow[data-id="follow-us"]').removeClass('hidden') :''

          if (setting_info.background_music_status == 1) {
            $('.audio-music')[0].play()
            $('.music').removeClass('music-disable')
            musicFlag = true
          } else {
            $('.audio-music')[0].pause()
            $('.music').addClass('music-disable')
            musicFlag = false
          }

          var u = navigator.userAgent,
            isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
          if (isiOS) {
            $('.audio-music')[0].pause()
            musicFlag = false
            $('.music').addClass('music-disable')
          }


          if (setting_info.participate_number_limit_status == 0) {
            const now_num = Number(res.data.participate_number),
                  max_num = Number(setting_info.participate_number_limit)
            if (now_num>= max_num) {
              weui.alert('当前参与人数已满，无法再参与!')
              $('.audio-music')[0].pause()
              $('.music').addClass('music-disable')
              setTime && clearInterval(setTime)
              timer && clearInterval(timer)
              over_timer && clearInterval(over_timer)
            }
          }
          _flag_count++
          if (_flag_count == 2) {
            gameTimeout()
          }

          // $('.qr-code-img').attr('src', setting_info.qr_code_url)
					distribution_type = setting_info.distribution_type
          start_time = toolsSetting_info.start_time
          end_time = toolsSetting_info.end_time
          distribution_type == 2 ? lottery_limit = distribution_info.lottery_limit : lottery_limit = ''
        }
      },
      error: function () {
        setTime && clearInterval(setTime)
        timer && clearInterval(timer)
        over_timer && clearInterval(over_timer)
        $('.audio-music')[0].pause()
        musicFlag = false
        $('.music').addClass('music-disable')
        weui.alert('未获取到活动信息，请重新登陆！')
        location.href = 'http://dev.commodity.crm.9daye.com.cn/active/'
      }
    })
  }

	//游戏结束判断
	//定时结束游戏
	var over_timer = setInterval(setToptime, 1000)
	function setToptime() {
		timeout = timeout - 1
		timeout = timeout > -1 ? timeout : 0
		$('.game-time').text(timeout + 's')
	}

	function gameTimeout () {
			setTimeout(function () {
				over_timer && clearInterval(over_timer)
				gameOver()
			}, (timeout + 1) * 1000)
	}


	// gameOver()
	function gameOver() {
      _flag_count = 0
      setTime && clearInterval(setTime)
			timer && clearInterval(timer)
      over_timer && clearInterval(over_timer)

      $('.audio-music')[0].pause()
      $('.music').addClass('music-disable')
      musicFlag = false
			$('.game-over-alert-container').removeClass('hidden')
			$('.score-alert').text(scoreInt + '分')
			sendScore(_active_number, person.open_id, scoreInt, _uuid)
		}

	function setScore(value) {
    value = value - 0
    if (scoreInt + value < 0) {
      scoreInt = 0
    } else {
			scoreInt = scoreInt + value
    }
    $('#score').text(scoreInt)
  }

  //提交分数拉去剩余次数
  function sendScore(activity_number, open_id, score, uuid) {
		$.ajax({
			url: '/tools/competition-set/put-one.do',
      type: 'POST',
      data: {
				activity_number: activity_number,
        open_id: open_id,
        score: score,
        uuid: uuid
      },
      success: function (res) {
				if (res.status == 200) {
          $('.best-score').text(res.data.highest_score || '暂无')
          const use_participate_number = res.data.prize_info.use_participate_number || 0
          if (distribution_type == 3) {
            $('.reminder-msg').text('您还有' + use_participate_number +'次游戏机会!')
            if (Object.keys(res.data.prize_info.order_info)[0]) {
              $('.score-ranking-list').text(Object.keys(res.data.prize_info.order_info)[0])
            } else {
              $('.score-ranking-list').text('暂无')
            }
          } else {
            $('.reminder-msg').text('返回首页').off().on('click', function () {
              location.href = '/?code='+_code+'&state='+_active_number
            })
            $('.to-index').addClass('hidden')
          }

          if (distribution_type == 2) {
            $('.score-ranking-list-container').addClass('hidden')
            if (score < lottery_limit) {
              $('.game-over-alert-list-container').addClass('failed-alert-container')
              $('.failed-reason').removeClass('hidden').text('成绩必须达到' + lottery_limit + '分才能获得奖品')
            } else {
              $('.to-prize').removeClass('hidden').off().on('click', function () {
                location.href = './?code=' + _code + '&state=' + _active_number + '&showTip=2'
              })
            }
          }
        }
      }
    })
  }

  //获取用户参与次数
  function getUserCounts(code, activity_number) {
    $.ajax({
      url: '/tools/tools-crm/get-selected.do',
      type: 'GET',
      data: {
        open_id: code,
        activity_number: activity_number
      },
      success: function (res) {
        if (res.status == 200) {
          const player_info = res.data.player_info;
          if (Number(player_info.already_participate_number) >= Number(res.data.distribution_info.total_participate_times)) {
            $('.audio-music')[0].pause()
            $('.score-alert').text(scoreInt + '分')
            setTime && clearInterval(setTime)
            timer && clearInterval(timer)
            over_timer && clearInterval(over_timer)
            $('.error-alert-container').removeClass('hidden')
            $('.error-status[data-status="5"]').removeClass('hidden').siblings().addClass('hidden')

            $('.confim-msg').off().on('click', function () {
              location.href = './?code='+_code+'&state='+_active_number
            })
            return
          }
          if (player_info.use_participate_number == 0 && player_info.use_share_number == 0) {
            $('.audio-music')[0].pause()
            $('.score-alert').text(scoreInt + '分')
            setTime && clearInterval(setTime)
            timer && clearInterval(timer)
            over_timer && clearInterval(over_timer)
            $('.error-alert-container').removeClass('hidden')
            $('.share-btn').addClass('hidden')
            $('.error-status[data-status="4"]').removeClass('hidden').siblings().addClass('hidden')

            $('.confim-msg').off().on('click', function () {
              location.href = './?code='+_code+'&state='+_active_number
            })
            return
          }
          if (player_info.use_participate_number == 0 && Number(player_info.use_share_number) > 0) {
              $('.audio-music')[0].pause()
              $('.error-alert-close').addClass('hidden')
              $('.score-alert').text(scoreInt + '分')
              setTime && clearInterval(setTime)
              timer && clearInterval(timer)
              over_timer && clearInterval(over_timer)
              $('.error-alert-container').removeClass('hidden')
              $('.error-status[data-status="3"]').removeClass('hidden').siblings().addClass('hidden')
              $('#share-btn').removeClass('hidden')
              $('.confim-msg').off().on('click', function () {
                location.href = './?code='+_code+'&state='+_active_number
              })
              return
            }

          againGame()
          }
      },
      error: function(err) {
        weui.alert(err.data.errMsg)
      }
    })
  }
  //再玩一次
  $('.again-game').off().on('click', function () {
    var now = new Date().getTime();
    var start = new Date(start_time);
    var end = new Date(end_time);
    $('.game-over-alert-container').addClass('hidden')
    $('.error-alert-container').addClass('hidden')
    $('.share-container').addClass('hidden')
    $('.qr-code-container').addClass('hidden')
		timeout = 30
    ens = 1
    awardTime = 250
    scoreInt = 0
    $('#score').text(scoreInt)
    awardArr = []
    bodyBg.innerHTML =''
    setTime && clearInterval(setTime)
    timer && clearInterval(timer)
    over_timer && clearInterval(over_timer)
    if (now < start) {
			$('.error-alert-container').removeClass('hidden')
      $('.error-status[data-status="1"]').removeClass('hidden').siblings().addClass('hidden')
      $('.start-time').text(start_time)
    }
    if (now > end) {
			$('.error-alert-container').removeClass('hidden')
      $('.error-status[data-status="2"]').removeClass('hidden').siblings().addClass('hidden')
      $('.end-time').text(end_time)
    }
    if (distribution_type == 3) {
      getUserCounts(person.open_id, _active_number)
    }
    if (distribution_type == 2) {
			againGame()
    }
  })

  //重新开始游戏
  function againGame() {
    $('.game-over-alert-container').addClass('hidden')
		timeout = 30
    ens = 1
    awardTime = 250
    scoreInt = 0
    $('#score').text(scoreInt)
    awardArr = []
    bodyBg.innerHTML =''
    setTime && clearInterval(setTime)
    timer && clearInterval(timer)
    over_timer && clearInterval(over_timer)

    over_timer = setInterval(setToptime, 1000)
    setTime = setInterval(setAward, awardTime)
    timer = setInterval(moveScore, ens)
    musicFlag = true
    audio.currentTime = 0;
    $('.audio-music')[0].play()
    $('.music').removeClass('music-disable')
    setFirstMsg(_active_number, person.open_id)
    gameTimeout()
  }

  // 微信分享
  function wechatShare() {
    var img = '';
    var title = '红包来袭';
    var desc = '玩游戏，赢大奖！';
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
                            open_id: person.open_id,
                            share_success: 1
                          },
                          success: function(res) {
                            if (res.status == 200) {
                              weui.confirm('分享成功！是否重新开始游戏？', {
                                title: '分享成功',
                                buttons: [ {
                                    label: '返回首页',
                                    type: 'default',
                                    onClick: function() {
                                      location.href = './?code='+_code+'&state='+_active_number
                                    }
                                }, {
                                    label: '重新开始',
                                    type: 'primary',
                                    onClick: function() {
                                      $('.again-game').click()
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
                            open_id: person.open_id,
                            share_success: 1
                          },
                          success: function(res) {
                            if (res.status == 200) {
                              weui.confirm('分享成功！是否重新开始游戏？', {
                                title: '分享成功',
                                buttons: [ {
                                    label: '返回首页',
                                    type: 'default',
                                    onClick: function() {
                                      location.href = './?code='+_code+'&state='+_active_number
                                    }
                                }, {
                                    label: '重新开始',
                                    type: 'primary',
                                    onClick: function() {
                                      $('.again-game').click()
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
                    link: location.origin + '/active', // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: person.open_id,
                          share_success: 1
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否重新开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '返回首页',
                                  type: 'default',
                                  onClick: function() {
                                    location.href = './?code='+_code+'&state='+_active_number
                                  }
                              }, {
                                  label: '重新开始',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.again-game').click()
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
                    link: location.origin + '/active', // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: person.open_id,
                          share_success: 1
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否重新开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '返回首页',
                                  type: 'default',
                                  onClick: function() {
                                    location.href = './?code='+_code+'&state='+_active_number
                                  }
                              }, {
                                  label: '重新开始',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.again-game').click()
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
                    link: location.origin + '/active', // 分享链接
                    imgUrl: img, // 分享图标
                    success: function () {
                       // 用户确认分享后执行的回调函数
                       $.ajax({
                        url: '/tools/competition-set/post-one.do',
                        type: 'POST',
                        data: {
                          activity_number: _active_number,
                          open_id: person.open_id,
                          share_success: 1
                        },
                        success: function(res) {
                          if (res.status == 200) {
                            weui.confirm('分享成功！是否重新开始游戏？', {
                              title: '分享成功',
                              buttons: [ {
                                  label: '返回首页',
                                  type: 'default',
                                  onClick: function() {
                                    location.href = './?code='+_code+'&state='+_active_number
                                  }
                              }, {
                                  label: '重新开始',
                                  type: 'primary',
                                  onClick: function() {
                                    $('.again-game').click()
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
//	以下无数据交互

  // 物品掉落
	timer = setInterval(moveScore, ens)
	function moveScore() {
		if (awardArr != null) {
			for (var j = 0; j < awardArr.length; j++) {
				var awardSpeed = parseInt(awardArr[j].style.top.substring(0, 3))
				awardSpeed += ens;
				awardArr[j].style.top = awardSpeed + 'px'
				if (timeout == 15) {
					ens = 2
					awardTime = 100
				}
				if (hitTestObject(awardArr[j], oPuppet)) {
					setScore(hitTestObject(awardArr[j], oPuppet))

					if (hitTestObject(awardArr[j], oPuppet) == 5) {
						$('#puppet').addClass('get-score5')
						setTimeout(() => {
							$('#puppet').removeClass('get-score5')
						}, 200);
					}
					if (hitTestObject(awardArr[j], oPuppet) == 10) {
						$('#puppet').addClass('get-score10')
						setTimeout(() => {
							$('#puppet').removeClass('get-score10')
						}, 200);
					}
					if (hitTestObject(awardArr[j], oPuppet) == -20) {
						$('#puppet').addClass('lose-score20')
						$('#puppet').addClass('puppet-bomb')
						setTimeout(() => {
							$('#puppet').removeClass('lose-score20')
							$('#puppet').removeClass('puppet-bomb')
						}, 200);
					}
					bodyBg.removeChild(awardArr[j])
					awardArr.splice(j, 1)
				}
				if (awardSpeed > screenHeght - 100) {
					bodyBg.removeChild(awardArr[j])
					awardArr.splice(j, 1)
				}
			}
		}
	}
	//设置奖励
	setTime = setInterval(setAward, awardTime)
	function setAward() {
		setBombPercent(cent)
	}
	//封装物品几率,通过炸弹几率去计算红包和大红包几率，
	//大红包的几率小于小红包1点
	function setBombPercent(cent) {
		const percent = Math.floor(cent / 10 * 100)
		var money = Math.floor((100 - percent) / 2) + percent + 10
		if (cent > 9 || cent < 1) {
			return
		}
		award = document.createElement('span')
		var Num = Math.floor(Math.random() * 100) + 1 //1-100之间的随机数
		//先定下炸弹几率
		if (Num < percent) {
			award.setAttribute('class', 'bomb')
			award.setAttribute('data-value', -20)
		}
		//小红包几率
		if (Num >= percent && Num < money) {
			award.setAttribute('class', 'money')
			award.setAttribute('data-value', 5)
		}
		//大红包几率
		if (Num >= money) {
			award.setAttribute('class', 'money-db')
			award.setAttribute('data-value', 10)
		}
		bodyBg.appendChild(award)
		var i = Math.floor(Math.random() * 10) * award.offsetWidth
		if (i + award.offsetWidth > document.documentElement.clientWidth) {
			i = document.documentElement.clientWidth - award.offsetWidth
		}
		award.style.left = i + 'px'
		award.style.top = '100px'
		awardArr.push(award)
	}

	// 碰撞检测
	function hitTestObject(item, hitObj) {
		if (item == null || hitObj == null) {
			return
		}
		//检测碰撞元素的上下左右位置
		var itemTop = item.offsetTop,
			itemFoot = item.offsetTop + item.offsetHeight,
			itemLeft = item.offsetLeft,
			itemRight = item.offsetLeft + item.offsetWidth,
			itemMiddleLine = item.offsetLeft + item.offsetWidth / 2;
		/*被碰撞元素的上下左右的位置*/
		var hitTop = hitObj.offsetTop,
			hitFoot = hitObj.offsetTop + hitObj.offsetHeight,
			hitLeft = hitObj.offsetLeft,
			hitRight = hitObj.offsetLeft + hitObj.offsetWidth,
			hitMiddleLine = hitObj.offsetLeft + hitObj.offsetWidth / 2;
		// if (itemFoot > hitTop && itemRight > hitLeft && itemTop < hitFoot && itemLeft < hitRight){
		//     return item.getAttribute('data-value');
		// }
		if (itemMiddleLine > hitMiddleLine - 30 && itemMiddleLine < hitMiddleLine + 30 && itemFoot > hitTop && itemRight > hitLeft && itemTop < hitFoot && itemLeft < hitRight && itemFoot < hitTop + 20) {
			return item.getAttribute('data-value');
		}
	}

  // 人物移动
  var oPuppet = document.getElementById('puppet');
  var disX, moveX, L; //starXEnd,starX

  oPuppet.addEventListener('touchstart', function (e) {
    e.preventDefault();
    disX = e.touches[0].clientX - this.offsetLeft;
    // starX = e.touches[0].clientXl
  })

  oPuppet.addEventListener('touchmove', function (e) {
    L = e.touches[0].clientX - disX
    // starXEnd = e.touches[0].clientX - starX
    if (L < 5) {
      L = '10px'
    } else if (L > document.documentElement.clientWidth - this.offsetWidth) {
      L = document.documentElement.clientWidth - this.offsetWidth
    }

    moveX = L + 'px'
    this.style.left = moveX
  })

  $('.follow[data-id="follow-us"]').on('click', function () {
    $('.qr-code-container').removeClass('hidden')
  })

  $('.share-container').on('click', function () {
    $(this).addClass('hidden')
  })

  $('#share-btn').on('click', function () {
    $('.share-container').removeClass('hidden')
  })
  //隐藏二维码
  $('.qr-code-container').on('click', function () {
    $(this).addClass('hidden')
  })
  $('.qr-code-img').on('click', function (e) {
    e.stopPropagation()
  })
  //音乐关停
  $('.music').off().on('click', function () {
    if (musicFlag) {
      $('.audio-music')[0].pause()
      $(this).addClass('music-disable')
    } else {
      $('.audio-music')[0].play()
      $(this).removeClass('music-disable')
    }
    musicFlag = !musicFlag
  })



  $('.close-follow').off().on('click', function () {
    var className = $(this).attr('data-id')
    $('.' + className).addClass('hidden')
  })

  $('.alert-close').off().on('click', function () {
    var className = $(this).attr('data-id')
    if (className) {
      if ($('.' + className).hasClass('hidden')) {
        $('.' + className).removeClass('hidden')
      } else {
        $('.' + className).addClass('hidden')
      }
    }
  })
  $('.error-alert-top-close').off().on('click', function () {
    location.href = './?code='+_code+'&state='+_active_number
  })
  $('.to-index').off().on('click', function () {
    location.href = './?code='+_code+'&state='+_active_number
  })
}

