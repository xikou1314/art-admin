<template>
<div class="page-body"  
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="page-header">
    <div>
    <h1 class="page-title">用户管理</h1>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item >用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div>
    <el-form :inline="true" :model="searchArea" class="form-inline">
      <el-form-item label="用户名">
        <el-input v-model="searchArea.userName" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item label="用户编号">
        <el-input v-model="searchArea.userId" placeholder="用户编号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch()">查询</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>

  <div class="box">
    <el-table :data="userList">
      <el-table-column label="用户编号" prop="id" width="80"></el-table-column>
      <el-table-column label="用户名" prop="userName"></el-table-column>
      <el-table-column label="昵称" prop="nickName"></el-table-column>
      <el-table-column label="性别" prop="gender">
        <template slot-scope="scope">
          {{scope.row.gender==0?"男":scope.row.gender==1?"女":"隐藏"}}
        </template>
      </el-table-column>
      <el-table-column label="头像" prop="avatar" width="80" >
        <template slot-scope="scope">
          <img class="img-small" :src='imgUrl + scope.row.avatar' alt="头像图片">
        </template>
      </el-table-column>
      <el-table-column label="个性签名" prop="signature"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
          <m-button type="danger"  @click="deleteUser(scope.row.id)">删除</m-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row :gutter="20" type="flex" justify="end">
      <el-col :span="6">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
          :current-page.sync="current"
          :total="dataCount">
        </el-pagination>
      </el-col>

    </el-row>
    <el-dialog
      title="用户详情"
      :visible.sync="userDetailVisible"
      width="30%">
      <el-form>
        <el-form-item label="昵称">
          <el-input v-model="userInfo.nickName"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="userInfo.gender" placeholder="请选择您的性别">
            <el-option label="男" :value="0"></el-option>
            <el-option label="女" :value="1"></el-option>
            <el-option label="隐藏" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input type="textarea" v-model="userInfo.signature"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser()">更 新</el-button>
      </span>
    </el-dialog>
    </div>
  </div>
  
</div>
</template>
<script>
import Vue from 'vue'
import _ from 'lodash'
export default {
  name: 'userList',
  data () {
    return {
      userList: [],
      imgUrl: '',
      dataCount: 0,
      current: 1,
      size: 10,
      userDetailVisible: false,
      userInfo: {},
      loading: false,
      searchArea: {
        userName: null,
        userId: null
      }
    }
  },
  methods: {
    getUserList (current, size) {
      this.loadingTable = true
      Vue.http.get(process.env.baseUrl + '/userList', {
        params: {
          current,
          size
        }
      }).then(res => {
        this.loadingTable = false
        if (res.code === 0) {
          this.userList = res.userList
          this.dataCount = res.count
        } else {
          this.$message.warning('获得用户列表失败')
        }
      }
      )
    },
    handleCurrentChange (val) {
      this.current = val
      if (this.searchArea.userId || this.searchArea.userName) {
        this.searchUser(this.current, this.size)
      } else {
        this.getUserList(this.current, this.size)
      }
    },
    handleDetail (index) {
      this.userDetailVisible = true
      this.userInfo = _.cloneDeep(this.userList[index])
    },
    handleSearch () {
      if (this.searchArea.userId || this.searchArea.userName) {
        this.searchUser(this.current, this.size)
      } else {
        this.getUserList(this.current, this.size)
      }
    },
    updateUser () {
      this.loading = true
      Vue.http.post(process.env.baseUrl + '/updateUser', this.userInfo).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.$message.success('修改用户信息成功')
          this.userDetailVisible = false
          this.getUserList(this.current, this.size)
          this.searchArea = {}
        } else {
          this.$message.warning('修改用户信息失败')
        }
      })
    },
    searchUser (current, size) {
      this.loading = true
      Vue.http.get(process.env.baseUrl + '/searchUser', {
        params: {
          userId: this.searchArea.userId ? this.searchArea.userId : -1,
          userName: this.searchArea.userName ? this.searchArea.userName : ' ',
          size: size,
          current: current
        }
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.dataCount = res.count
          this.userList = res.data
          this.$message.success('查询用户成功')
        } else {
          this.$message.warning('查询用户失败')
        }
      })
    },
    deleteUser (userId) {
      this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/deleteUser', {
          userId
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('删除用户成功')
            this.getUserList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('删除用户失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  created () {
    this.getUserList(this.current, this.size)
    this.imgUrl = process.env.imgUrl
  }
}
</script>

<style>
  .box-body{
    width: 100%;
    overflow: auto;
  }
  .img-small{
    width: 30px;
    height: 30px;
  }
  .page-header > div{
    float: left;
  }
  .page-header::after{
    content: "";
    display: block;
    clear: both;
  }
  .form-inline{
    margin-left: 20px;
  }
</style>
