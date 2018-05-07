<template>
<div class="page-body"  
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="box">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="旧密码" required>
        <el-input type="password" v-model="oldPwd" style="width: 30%;"></el-input>
      </el-form-item>
      <el-form-item label="新密码" required>
        <el-input type="password" v-model="newPwd" style="width: 30%;"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" required>
        <el-input type="password" v-model="confirmPwd" style="width: 30%;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updatePwd()">修改</el-button>
        <el-button @click="back()">取消</el-button>
      </el-form-item>
    </el-form>

  
  </div>
  
</div>
</template>
<script>
import Vue from 'vue'
import {cipher} from '../utils/secret'
export default {
  name: 'updatePwd',
  data () {
    return {
      oldPwd: '',
      newPwd: '',
      confirmPwd: '',
      userInfo: {}
    }
  },
  methods: {
    updatePwd () {
      if (!this.oldPwd || !this.newPwd || !this.confirmPwd) {
        this.$message.error('请输入完整信息')
      } else if (!(this.newPwd === this.confirmPwd)) {
        this.$message.error('确认密码需要与要修改的密码保持一致')
      } else {
        Vue.http.post(process.env.baseUrl + '/updatePwd', {
          userId: this.userInfo.id,
          oldPwd: cipher('aes192', '123', this.oldPwd),
          newPwd: cipher('aes192', '123', this.newPwd)
        }).then(res => {
          if (res.code === 0) {
            this.$message.success('修改密码成功')
            this.$router.push({name: 'home'})
          } else if (res.code === 2) {
            this.$message.error('旧密码验证失败')
          } else {
            this.$message.error('修改密码失败')
          }
        })
      }
    },
    back () {
      this.$router.push({name: 'home'})
      this.getLoginUser()
    }
  },
  created () {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  }
}
</script>

<style>
  .box-body{
    width: 100%;
    overflow: auto;
  }
</style>
