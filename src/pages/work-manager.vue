<template>
<div class="page-body"  
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="page-header">
    <div>
    <h1 class="page-title">作品管理</h1>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item >作品管理</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div>
    <el-form :inline="true" :model="searchArea" class="form-inline">
      <el-form-item label="作品编号">
        <el-input v-model="searchArea.workId" placeholder="作品编号"></el-input>
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
    <el-table :data="workList">
      <el-table-column label="作品编号" prop="id" width="80"></el-table-column>
      <el-table-column label="用户编号" prop="userId"></el-table-column>
      <el-table-column label="内容" prop="content"></el-table-column>
      <el-table-column label="类型" prop="type">
        <template slot-scope="scope">
          {{scope.row.type==0?"图片":"视频"}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
          <m-button type="danger"  @click="deleteWork(scope.row.id)">删除</m-button>
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
      title="作品详情"
      :visible.sync="workDetailVisible"
      width="30%">
      <el-form>
        <el-form-item label="作品编号">
          <el-input v-model="workInfo.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="workInfo.content"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <img class="img-thumb" v-if="workInfo.type===0" :src="imgUrl + workInfo.source"/>
          <img class="img-thumb" v-if="workInfo.type===1" :src="imgUrl + workInfo.thumb"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="workDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateWork()">更 新</el-button>
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
  name: 'workList',
  data () {
    return {
      workList: [],
      imgUrl: '',
      dataCount: 0,
      current: 1,
      size: 10,
      workDetailVisible: false,
      workInfo: {},
      loading: false,
      searchArea: {
        workId: null,
        userId: null
      }
    }
  },
  methods: {
    getWorkList (current, size) {
      this.loadingTable = true
      Vue.http.get(process.env.baseUrl + '/workList', {
        params: {
          current,
          size
        }
      }).then(res => {
        console.log(res)
        this.loadingTable = false
        if (res.code === 0) {
          this.workList = res.workList
          this.dataCount = res.count
        } else {
          this.$message.warning('获得用户列表失败')
        }
      }
      )
    },
    handleCurrentChange (val) {
      this.current = val
      if (this.searchArea.userId || this.searchArea.workId) {
        this.searchWork(this.current, this.size)
      } else {
        this.getWorkList(this.current, this.size)
      }
    },
    handleDetail (index) {
      this.workDetailVisible = true
      this.workInfo = _.cloneDeep(this.workList[index])
    },
    updateWork () {
      this.loading = true
      Vue.http.post(process.env.baseUrl + '/updateWork', this.workInfo).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.$message.success('修改作品信息成功')
          this.workDetailVisible = false
          this.getWorkList(this.current, this.size)
          this.searchArea = {}
        } else {
          this.$message.warning('修改作品信息失败')
        }
      })
    },
    handleSearch () {
      this.current = 1
      if (this.searchArea.userId || this.searchArea.workId) {
        this.searchWork(this.current, this.size)
      } else {
        this.getWorkList(this.current, this.size)
      }
    },
    searchWork (current, size) {
      this.loading = true
      Vue.http.get(process.env.baseUrl + '/searchWork', {
        params: {
          userId: this.searchArea.userId ? this.searchArea.userId : -1,
          workId: this.searchArea.workId ? this.searchArea.workId : -1,
          size: size,
          current: current
        }
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.dataCount = res.count
          this.workList = res.data
          this.$message.success('查询作品成功')
        } else {
          this.$message.warning('查询作品失败')
        }
      })
    },
    deleteWork (workId) {
      this.$confirm('此操作将永久删除该作品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/deleteWork', {
          workId
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('删除作品成功')
            this.getWorkList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('删除作品失败')
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
    this.getWorkList(this.current, this.size)
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
  .img-thumb{
    width: 160px;
    height: 160px;
  }
</style>
