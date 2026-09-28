var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    leaveStatus: '休假中',
    detail: {
      day: 0 // 初始化day数据
    },
    askForLeaveConfigs: [], // 请假类型配置
    askForLeaveSchoolConfigs: [], // 是否离校配置
    beginTimeFormat: '', // 离校时间
    endTimeFormat: '', // 返校时间
    location: '', // 外出地点
    leaveForReason: '', // 请假原因
    parentsPhone: '', // 家长电话
    studentName: '', // 姓名
    studentClass: '', // 班级
    counselorName: '', // 辅导员姓名
    schoolAuthorityName: '', // 校领导姓名
    headOfDepartmentName: '' // 系主任姓名
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var mesg = wx.getStorageSync('mesg');
    console.log(mesg);

    // 并行获取存储数据
    Promise.all([
      new Promise((resolve, reject) => {
        wx.getStorage({ key: 'aFL', success: resolve, fail: reject });
      }),
      new Promise((resolve, reject) => {
        wx.getStorage({ key: 'aFSL', success: resolve, fail: reject });
      })
    ]).then(([aFLRes, aFSLRes]) => {
      that.setData({
        askForLeaveConfigs: aFLRes.data,
        askForLeaveSchoolConfigs: aFSLRes.data
      });
    }).catch(err => {
      console.error('获取存储数据失败:', err);
    });

    // 设置基础数据
    this.setData({
      beginTimeFormat: mesg.beginTimeFormat,
      endTimeFormat: mesg.endTimeFormat,
      location: mesg.location,
      leaveForReason: mesg.leaveForReason,
      parentsPhone: mesg.parentsPhone,
      studentName: mesg.studentName,
      studentClass: mesg.studentClass,
      counselorName: mesg.counselorName,
      schoolAuthorityName: mesg.schoolAuthorityName,
      headOfDepartmentName: mesg.headOfDepartmentName
    });

    // 计算时间差并设置天数显示
    this.calculateAndSetDays(mesg);

    // 设置时间节点
    this.setTimeNodes(mesg);

    // 读取销假状态与自定义时间：都挂在当前这条申请记录上（Afls 第一条即最新申请），避免串到其他假条
    var Afls = wx.getStorageSync('Afls') || [];
    var rec = (Afls.length > 0) ? Afls[0] : {};
    var timesPatch = {
      leaveStatus: rec.canceled ? '已结束' : '休假中'
    };
    if (rec.applicationTime) {
      timesPatch.applicationTime = rec.applicationTime;
    }
    if (rec.counselorPassingTime) {
      timesPatch.counselorPassingTime = rec.counselorPassingTime;
    }
    if (rec.headOfDepartmentPassingTime) {
      timesPatch.headOfDepartmentPassingTime = rec.headOfDepartmentPassingTime;
    }
    if (rec.PassingTime) {
      timesPatch.PassingTime = rec.PassingTime;
    }
    this.setData(timesPatch);
  },

  /**
   * 计算并设置请假天数显示
   */
  calculateAndSetDays: function(mesg) {
    const stringEndTime = mesg.endTimeFormat;
    const stringBeginTime = mesg.beginTimeFormat;

    const endTime = new Date(stringEndTime);
    const beginTime = new Date(stringBeginTime);

    if (isNaN(endTime.getTime()) || isNaN(beginTime.getTime())) {
      console.error('无效的时间格式:', stringEndTime, stringBeginTime);
      this.setData({ "detail.day": '无效时间' });
      return;
    }

    const diffTime = endTime - beginTime; // 毫秒差
    const daysDiff = diffTime / (1000 * 60 * 60 * 24); // 转换为天数

    console.log('原始天数差:', daysDiff);

    let formattedDays;
    if (daysDiff < 1) {
      // 不足1天，显示1位小数（如 0.333 → 0.3）
      formattedDays = Math.round(daysDiff * 10) / 10; // 四舍五入到1位小数
      if (formattedDays === 0) {
        formattedDays = 0.1; // 如果不足0.1小时，显示0.1（避免显示0）
      } else {
        formattedDays = parseFloat(formattedDays.toFixed(1)); // 确保1位小数
      }
    } else {
      // 满1天，显示整数或1位小数（如 2.5 → 2.5，3 → 3）
      formattedDays = Math.round(daysDiff * 10) / 10; // 四舍五入到1位小数
      if (formattedDays === Math.floor(formattedDays)) {
        formattedDays = Math.floor(formattedDays); // 如果是整数，去掉小数点
      }
    }

    console.log('格式化后天数:', formattedDays);
    this.setData({ "detail.day": formattedDays });
  },

  /**
   * 设置时间节点
   */
  setTimeNodes: function(mesg) {
    const beginTime = Date.parse(new Date(mesg.beginTimeFormat)) / 1000;

    this.setData({
      applicationTime: util.formatTimeTwo(beginTime - 3600 * 27, 'Y-M-D h:m'),
      counselorPassingTime: util.formatTimeTwo(beginTime - 3600 * 26 + 360, 'Y-M-D h:m'),
      headOfDepartmentPassingTime: util.formatTimeTwo(beginTime - 3600 * 24 - 1080, 'Y-M-D h:m'),
      PassingTime: util.formatTimeTwo(beginTime - 1800 - 3600 * 24, 'Y-M-D h:m')
    });
  },

  // 销假：把“休假中”改为“已结束”，持久保存
  cancelLeave: function () {
    var that = this;
    wx.showModal({
      title: '销假',
      content: '确定销假吗？销假后状态将变为已结束。',
      confirmColor: '#7EC37B',
      success: function (res) {
        if (res.confirm) {
          that.setData({ leaveStatus: '已结束' });
          // 销假状态记录在这条申请上（Afls 第一条即最新申请），只有这条显示已结束
          var Afls = wx.getStorageSync('Afls') || [];
          if (Afls.length > 0) {
            Afls[0].canceled = true;
            wx.setStorageSync('Afls', Afls);
          }
          wx.showToast({ title: '已销假', icon: 'success' });
        }
      }
    });
  },

  // 长按时间节点：自定义修改申请时间 / 通过时间
  editTime: function (e) {
    var field = e.currentTarget.dataset.field;
    var that = this;
    wx.showModal({
      title: '修改时间',
      editable: true,
      placeholderText: that.data[field],
      content: '请输入新的时间（格式如 2026-09-27 14:00）',
      success: function (res) {
        if (res.confirm && res.content) {
          var val = res.content.trim();
          var obj = {};
          obj[field] = val;
          that.setData(obj);
          // 自定义时间记录到当前申请（Afls 第一条），避免影响其他假条
          var Afls = wx.getStorageSync('Afls') || [];
          if (Afls.length > 0) {
            Afls[0][field] = val;
            wx.setStorageSync('Afls', Afls);
          }
        }
      }
    });
  },

  /**
   * 格式化日期（原formatDate方法，但原代码中未使用）
   */
  formatDate: function(date) {
    let taskStartTime;
    if (date.getMonth() < 9) {
      taskStartTime = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-";
    } else {
      taskStartTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-";
    }
    if (date.getDate() < 10) {
      taskStartTime += "0" + date.getDate();
    } else {
      taskStartTime += date.getDate();
    }
    if (date.getHours() < 10) {
      taskStartTime += " " + "0" + date.getHours() + ":";
    } else {
      taskStartTime += " " + date.getHours() + ":";
    }
    if (date.getMinutes() < 10) {
      taskStartTime += "0" + date.getMinutes();
    } else {
      taskStartTime += date.getMinutes();
    }
    this.setData({ taskStartTime: taskStartTime });
    return taskStartTime;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});