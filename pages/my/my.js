// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userStatusList: ['请假（出校）'],
    avatarUrl: '',
    defaultAvatar: '/assets/img/touxiang.png',
    // 是否显示"使用微信头像"的透明选择按钮
    showWxAvatar: false
  },

  onLoad: function () {
    var collegeName = wx.getStorageSync('col');
    var mesg = wx.getStorageSync('mesg');
    this.setData({
      studentName: (mesg && mesg.studentName) || '',
      collegeConfigs: (mesg && mesg.collegeConfigs) || collegeName || '',
      avatarUrl: wx.getStorageSync('avatar') || ''
    })
  },

  // 空方法：阻止透明微信头像按钮的点击冒泡到父级菜单
  noop: function () {},

  // 点击头像：从相册/拍照选择自定义头像（持久保存）
  chooseAvatar: function () {
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempPath = res.tempFiles[0].tempFilePath;
        wx.saveFile({
          tempFilePath: tempPath,
          success: function (r) {
            wx.setStorageSync('avatar', r.savedFilePath);
            that.setData({ avatarUrl: r.savedFilePath });
            wx.showToast({ title: '头像已更换', icon: 'success' });
          },
          fail: function () {
            // 持久保存失败时降级使用临时路径
            wx.setStorageSync('avatar', tempPath);
            that.setData({ avatarUrl: tempPath });
            wx.showToast({ title: '头像已更换', icon: 'success' });
          }
        });
      }
    });
  },

  // 长按头像：弹出选择菜单（自定义头像 / 微信头像）
  showAvatarMenu: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册选择', '使用微信头像'],
      success: function (res) {
        if (res.tapIndex === 0) {
          that.chooseAvatar();
        } else if (res.tapIndex === 1) {
          // 微信头像必须由用户点击 open-type="chooseAvatar" 的按钮触发，
          // 因此先显示透明选择按钮，用户再点一下头像位置即可弹出微信头像选择器
          that.setData({ showWxAvatar: true });
          wx.showToast({ title: '请点击头像使用微信头像', icon: 'none' });
        }
      }
    });
  },

  // 微信头像回调（button open-type="chooseAvatar"）
  onChooseAvatar: function (e) {
    var avatarUrl = e.detail && e.detail.avatarUrl;
    var that = this;
    if (!avatarUrl) {
      that.setData({ showWxAvatar: false });
      return;
    }
    wx.saveFile({
      tempFilePath: avatarUrl,
      success: function (r) {
        wx.setStorageSync('avatar', r.savedFilePath);
        that.setData({ avatarUrl: r.savedFilePath, showWxAvatar: false });
        wx.showToast({ title: '已使用微信头像', icon: 'success' });
      },
      fail: function () {
        // 持久保存失败时降级使用临时路径
        wx.setStorageSync('avatar', avatarUrl);
        that.setData({ avatarUrl: avatarUrl, showWxAvatar: false });
        wx.showToast({ title: '已使用微信头像', icon: 'success' });
      }
    });
  },

  toCode: function () {
    wx.navigateTo({
      url: '../QRcode/QRcode'
    })
  },
  toScan: function () {
    wx.scanCode({
      success (res) {
        console.log(res)
      }
    })
  }

})
