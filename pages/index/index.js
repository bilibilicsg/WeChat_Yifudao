// 在微信小程序中定义一个页面，引入了Page方法  
Page({    
  // 定义页面的初始数据，其中包括一个imgPrefix的数组  
  data: {    
    imgPrefix: [    
      // 通知的名称、路径和图标  
      {name:'通知',path:'/pages/notice/notice',icon:'/assets/img/index/2000.png'},  
      // 健康上报的名称、路径和图标  
      {name:'健康上报',path:'/pages/healthy/healthy',icon:'/assets/img/index/2001.png'},  
      // 问卷填写的名称、路径和图标  
      {name:'问卷填写',path:'/pages/location/location',icon:'/assets/img/index/2002.png'},  
      // 定位签到的名称、路径和图标  
      {name:'定位签到',path:'/pages/signInList/signInList',icon:'/assets/img/index/2003.png'},  
      // 离校返校的名称和图标（没有路径）  
      {name:'离校返校',icon:'/assets/img/index/2004.png'},  
      // 活动签到的名称、路径和图标  
      {name:'活动签到',path:'/pages/activitySign/activitySign',icon:'/assets/img/index/2005.png'},  
      // 请假申请的名称、路径和图标  
      {name:'请假申请',path:'/pages/askForLeaveList/askForLeaveList',icon:'/assets/img/index/2006.png'},  
      // 出入校二维码的名称、路径和图标  
      {name:'出入校二维码',path:'/pages/QRcode/QRcode',icon:'/assets/img/index/2007.png'},   
    ],    
    // 轮播图列表（显示用：默认图 + 用户上传图）  
    swiperList: [],    
    // 是否显示默认图（可删除，删除后通过长按恢复）  
    showDefaultSwiper: true    
  },    

  // 页面显示时：读取用户上传的轮播图，过滤已失效的临时路径，按设置拼接默认图  
  onShow: function () {    
    var saved = wx.getStorageSync('swiperList') || [];    
    var valid = [];    
    saved.forEach(function (p) {    
      // 临时路径（http://tmp/ 或 wxfile://tmp_）重启后会失效，过滤掉
      if (typeof p === 'string' && p.indexOf('tmp') < 0) {    
        valid.push(p);    
      }    
    });    
    // 默认图是否显示：storage 里没存过则默认显示
    var showDefault = wx.getStorageSync('showDefaultSwiper');    
    if (showDefault === '') {    
      showDefault = true;    
    }    
    var list = (showDefault !== false) ? ['/assets/img/swiper/swiper-1.png'].concat(valid) : valid;    
    this.setData({    
      swiperList: list,    
      showDefaultSwiper: (showDefault !== false)    
    });    
  },    

  // 点击轮播图：上传新照片（持久保存，重启不失效）  
  upSwiperList: function () {    
    var that = this;    
    wx.chooseMedia({    
      count: 1,    
      mediaType: ['image'],    
      sizeType: ['compressed'],    
      sourceType: ['album', 'camera'],    
      success: function (res) {    
        var tempPath = res.tempFiles[0].tempFilePath;    
        // 转成持久文件，避免临时路径重启后失效
        wx.saveFile({    
          tempFilePath: tempPath,    
          success: function (r) {    
            var savedPath = r.savedFilePath;    
            var list = wx.getStorageSync('swiperList') || [];    
            list.push(savedPath);    
            wx.setStorageSync('swiperList', list);    
            var showDefault = wx.getStorageSync('showDefaultSwiper');    
            var show = (showDefault === '' || showDefault !== false);    
            that.setData({ swiperList: show ? ['/assets/img/swiper/swiper-1.png'].concat(list) : list });    
            wx.showToast({ title: '已添加', icon: 'success' });    
          },    
          fail: function () {    
            // 持久保存失败时降级使用临时路径
            var list = wx.getStorageSync('swiperList') || [];    
            list.push(tempPath);    
            wx.setStorageSync('swiperList', list);    
            var showDefault = wx.getStorageSync('showDefaultSwiper');    
            var show = (showDefault === '' || showDefault !== false);    
            that.setData({ swiperList: show ? ['/assets/img/swiper/swiper-1.png'].concat(list) : list });    
          }    
        });    
      }    
    });    
  },    

  // 长按轮播图：弹出操作菜单（删除照片 / 恢复默认图）  
  deleteSwiper: function (e) {    
    var idx = e.detail;    
    var that = this;    
    var itemList = ['删除这张照片'];    
    if (!that.data.showDefaultSwiper) {    
      itemList.push('恢复默认图');    
    }    
    wx.showActionSheet({    
      itemList: itemList,    
      success: function (res) {    
        var act = itemList[res.tapIndex];    
        if (act === '恢复默认图') {    
          that.restoreDefault();    
        } else if (act === '删除这张照片') {    
          that.confirmDelete(idx);    
        }    
      }    
    });    
  },    

  // 确认删除：默认图则隐藏默认图，用户图则从列表移除  
  confirmDelete: function (idx) {    
    var list = wx.getStorageSync('swiperList') || [];    
    var that = this;    
    // 判断长按的是不是默认图（显示列表第0位是默认图且默认图处于显示状态）
    var isDefault = that.data.showDefaultSwiper && idx === 0;    
    // 用户图在 storage 列表中的实际下标
    var realIdx = isDefault ? -1 : idx - (that.data.showDefaultSwiper ? 1 : 0);    
    if (!isDefault && (realIdx < 0 || realIdx >= list.length)) {    
      return;    
    }    
    wx.showModal({    
      title: '删除照片',    
      content: isDefault ? '确定删除默认图？删除后长按图片可恢复。' : '确定删除这张首页照片？',    
      confirmColor: '#ff594f',    
      success: function (res) {    
        if (res.confirm) {    
          if (isDefault) {    
            // 隐藏默认图
            wx.setStorageSync('showDefaultSwiper', false);    
            that.setData({    
              showDefaultSwiper: false,    
              swiperList: list    
            });    
          } else {    
            // 删除用户上传的图
            list.splice(realIdx, 1);    
            wx.setStorageSync('swiperList', list);    
            that.setData({    
              swiperList: that.data.showDefaultSwiper ? ['/assets/img/swiper/swiper-1.png'].concat(list) : list    
            });    
          }    
        }    
      }    
    });    
  },    

  // 恢复默认图  
  restoreDefault: function () {    
    var list = wx.getStorageSync('swiperList') || [];    
    wx.setStorageSync('showDefaultSwiper', true);    
    this.setData({    
      showDefaultSwiper: true,    
      swiperList: ['/assets/img/swiper/swiper-1.png'].concat(list)    
    });    
    wx.showToast({ title: '已恢复默认图', icon: 'success' });    
  }    
})    
