/* global window*/
/* global localStorage*/

import $ from 'jquery'
import getData from './getData'

init()

function init() {

    const open_id = localStorage.getItem('CODE'),
          activity_number = localStorage.getItem('ACTIVE_NUMBER'),
          prize_item_id = getUseID('id');
    function getUseID (val) {
      var reg = new RegExp("(^|&)" + val + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
      if (r != null) return unescape(r[2]);
      return null;
    }
    function getPrizeDetail (activity_number, open_id, prize_item_id) {
      getData({
        url: '/tools/competition-set/get-one.do',
        type: 'GET',
        data:{
          activity_number,
          open_id,
          prize_item_id
        }
      }).then((res) => {
        if (res.status == 200) {
          const awards_info = res.data.awards_info
          $('.prize-name').text(awards_info.prize_name)
          $('.prize-status').text(awards_info.status == 0 ? '未兑奖': '已兑奖')
          $('.prize-exchange-code').text(awards_info.award_code)
          $('.prize-deadline').text(awards_info.time)
          $('.awards_address').text(awards_info.awards_address)
          $('.store-hotline').text(awards_info.consumer_hotline)
          $('.code-num').text(awards_info.award_code)
        }
      })
    }
    getPrizeDetail(activity_number, open_id, prize_item_id)
    $('.exchange-now').on('click', function () {
        $('.exchange-code-container').removeClass('hidden')
    })

    $('.close-exchange-code,.close-code').on('click', function () {
        $('.exchange-code-container').addClass('hidden')
    })

}
