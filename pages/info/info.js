// pages/info/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infosAd: [],
    infos: [],
  },

  // 默认班级成员（首次使用时写入本地存储，之后由用户自由管理）
  defaultAd: [
    { name: '曾俊风', phone: '18040013960' },
    { name: '康露', phone: '14929031980' },
    { name: '陆烟湄', phone: '16632894166' },
    { name: '钱琼', phone: '15038632660' },
    { name: '孟高远', phone: '19857468762' },
    { name: '姜元勋', phone: '13461541427' },
    { name: '郑俊能', phone: '16608035668' }
  ],
  defaultInfos: [
    { name: '史艺', phone: '18844524220' },
    { name: '石琴', phone: '17510948140' },
    { name: '萧玲丽', phone: '13459018177' },
    { name: '魏晓', phone: '16684833946' },
    { name: '夏和豫', phone: '18188876577' },
    { name: '黄永茹', phone: '13640445679' },
    { name: '苏靖巧', phone: '13794418253' },
    { name: '钱汇', phone: '13830298062' },
    { name: '白睿慈', phone: '14704847876' },
    { name: '邱文栋', phone: '15200467716' },
    { name: '丁志行', phone: '15601565207' },
    { name: '戴高远', phone: '15113623374' },
    { name: '史亿', phone: '17375804734' },
    { name: '段涵育', phone: '14920302664' },
    { name: '韩鸿光', phone: '19958641834' },
    { name: '马霭', phone: '17540773862' },
    { name: '夏建元', phone: '13086371759' },
    { name: '金华翰', phone: '15824272965' },
    { name: '黎飞星', phone: '16603687213' },
    { name: '张俊艾', phone: '14508195320' },
    { name: '孔喜', phone: '17179102840' },
    { name: '谭越彬', phone: '17802382684' },
    { name: '苏紫薇', phone: '17840592262' },
    { name: '熊雁', phone: '13171976381' },
    { name: '汤菀', phone: '13468786913' },
    { name: '廖承平', phone: '15613188289' },
    { name: '郭鹏云', phone: '17527713865' },
    { name: '漕忆南', phone: '15041518628' },
    { name: '蒋明亮', phone: '16633092593' },
    { name: '沈映梦', phone: '17280106335' },
    { name: '朱伟泽', phone: '17312344152' }
  ],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var mesg = wx.getStorageSync('mesg');
    var col = wx.getStorageSync('col');
    this.setData({
      // <!-- 选择学院 -->// <!-- collegeConfigs -->
      collegeConfigs: col || '',
      // <!-- 班级 -->// <!-- studentClass -->
      studentClass: (mesg && mesg.studentClass) || '',
      // <!-- 辅导员姓名 -->// <!-- counselorName -->
      counselorName: (mesg && mesg.counselorName) || '',
      // <!-- 辅导员电话 -->// <!-- counselorPhone -->
      counselorPhone: (mesg && mesg.counselorPhone) || ''
    });
    // 渲染班级成员（首次自动写入默认名单）
    this.renderMembers();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // ===== 班级成员管理 =====

  // 读取本地成员并渲染（班干 / 普通学生分开显示）
  renderMembers: function () {
    var members = wx.getStorageSync('classMembers');
    if (!members || !members.length) {
      members = [];
      var i = 0;
      var that = this;
      this.defaultAd.forEach(function (m) {
        members.push({ id: 'm' + (i++), name: m.name, phone: m.phone, isLeader: true });
      });
      this.defaultInfos.forEach(function (m) {
        members.push({ id: 'm' + (i++), name: m.name, phone: m.phone, isLeader: false });
      });
      wx.setStorageSync('classMembers', members);
    }
    var ad = [];
    var nor = [];
    members.forEach(function (m) {
      if (m.isLeader) {
        ad.push(m);
      } else {
        nor.push(m);
      }
    });
    this.setData({ infosAd: ad, infos: nor });
  },

  // 点击成员头像：弹出操作菜单（按钮都隐藏在头像上）
  onMemberTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var members = wx.getStorageSync('classMembers') || [];
    var idx = -1;
    for (var k = 0; k < members.length; k++) {
      if (members[k].id === id) {
        idx = k;
        break;
      }
    }
    if (idx < 0) {
      return;
    }
    var mem = members[idx];
    var itemList = ['修改姓名', '修改手机号'];
    if (mem.isLeader) {
      itemList.push('撤销班干');
    } else {
      itemList.push('设为班干');
    }
    itemList.push('删除成员');
    var that = this;
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        var act = itemList[res.tapIndex];
        if (act === '修改姓名') {
          that.editName(idx);
        } else if (act === '修改手机号') {
          that.editPhone(idx);
        } else if (act === '设为班干') {
          that.setLeader(idx, true);
        } else if (act === '撤销班干') {
          that.setLeader(idx, false);
        } else if (act === '删除成员') {
          that.removeMember(idx);
        }
      }
    });
  },

  // 修改姓名
  editName: function (idx) {
    var members = wx.getStorageSync('classMembers') || [];
    var that = this;
    wx.showModal({
      title: '修改姓名',
      editable: true,
      placeholderText: '请输入新姓名',
      success: function (res) {
        if (res.confirm && res.content) {
          members[idx].name = res.content.trim();
          wx.setStorageSync('classMembers', members);
          that.renderMembers();
        }
      }
    });
  },

  // 修改手机号
  editPhone: function (idx) {
    var members = wx.getStorageSync('classMembers') || [];
    var that = this;
    wx.showModal({
      title: '修改手机号',
      editable: true,
      placeholderText: '请输入新手机号',
      success: function (res) {
        if (res.confirm && res.content) {
          members[idx].phone = res.content.trim();
          wx.setStorageSync('classMembers', members);
          that.renderMembers();
        }
      }
    });
  },

  // 设为班干 / 撤销班干
  setLeader: function (idx, val) {
    var members = wx.getStorageSync('classMembers') || [];
    members[idx].isLeader = val;
    wx.setStorageSync('classMembers', members);
    this.renderMembers();
  },

  // 删除成员
  removeMember: function (idx) {
    var members = wx.getStorageSync('classMembers') || [];
    var that = this;
    wx.showModal({
      title: '删除成员',
      content: '确定删除该成员？',
      confirmColor: '#ff594f',
      success: function (res) {
        if (res.confirm) {
          members.splice(idx, 1);
          wx.setStorageSync('classMembers', members);
          that.renderMembers();
        }
      }
    });
  },

  // 添加新成员：先输入姓名，再输入手机号，默认普通学生
  addMember: function () {
    var that = this;
    wx.showModal({
      title: '添加新成员',
      content: '请输入成员姓名',
      editable: true,
      placeholderText: '姓名',
      success: function (res) {
        if (res.confirm && res.content) {
          var name = res.content.trim();
          wx.showModal({
            title: '添加新成员',
            content: '请输入成员手机号',
            editable: true,
            placeholderText: '手机号',
            success: function (res2) {
              if (res2.confirm && res2.content) {
                var members = wx.getStorageSync('classMembers') || [];
                members.push({
                  id: 'm' + new Date().getTime(),
                  name: name,
                  phone: res2.content.trim(),
                  isLeader: false
                });
                wx.setStorageSync('classMembers', members);
                that.renderMembers();
                wx.showToast({ title: '已添加', icon: 'success' });
              }
            }
          });
        }
      }
    });
  }
})
