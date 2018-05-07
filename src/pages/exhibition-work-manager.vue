<template>
<div class="page-body"  
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="page-header">
    <div>
    <h1 class="page-title">画展作品管理</h1>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item >画展作品管理</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div>
    <el-form :inline="true" :model="searchArea" class="form-inline">
      <el-form-item label="用户昵称">
        <el-input v-model="searchArea.nickName" placeholder="用户昵称"></el-input>
      </el-form-item>
      <el-form-item label="画展名称">
        <el-input v-model="searchArea.exhibitionName" placeholder="画展名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch()">查询</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>

  <div class="box">
    <el-table :data="exWorkList">
      <el-table-column label="作品编号" prop="id" width="80"></el-table-column>
      <el-table-column label="用户昵称" prop="nickName"></el-table-column>
      <el-table-column label="画展名称" prop="exhibitionName"></el-table-column>
      <el-table-column label="图片" prop="source">
        <template slot-scope="scope">
          <img  :src="imgUrl + scope.row.source" class="img-small"/>
        </template>
      </el-table-column>
      <el-table-column label="喜欢" prop="score"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
          <m-button type="danger"  @click="deleteExWork(scope.row.id)">删除</m-button>
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
      title="画展作品详情"
      :visible.sync="exWorkDetailVisible"
      width="50%">
      <el-form>
        <el-form-item label="作品编号">
          <el-input v-model="exWorkInfo.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户编号">
          <el-input v-model="exWorkInfo.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="exWorkInfo.nickName" disabled></el-input>
        </el-form-item>
        <el-form-item label="画展编号">
          <el-input v-model="exWorkInfo.exhibitionId" disabled></el-input>
        </el-form-item>
        <el-form-item label="画展名称">
          <el-input v-model="exWorkInfo.exhibitionName" disabled></el-input>
        </el-form-item>
        <el-form-item label="喜欢的人数">
          <el-input v-model="exWorkInfo.score" disabled></el-input>
        </el-form-item>
        <el-form-item label="作品图片">
          <el-upload
            class="ex-work-uploader"
            :action="exhibitionUploadUrl + '/uploadExhibition'"
            :show-file-list="false"
            name="exhibition"
            :on-success="handleExWorkSuccess"
            :before-upload="beforeExWorkUpload">
            <img v-if="exWorkInfo.source" :src="imgUrl + exWorkInfo.source" class="ex-work">
            <i v-else class="el-icon-plus ex-work-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exWorkDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateExWork()">更 新</el-button>
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
      exWorkList: [],
      imgUrl: '',
      dataCount: 0,
      current: 1,
      size: 10,
      exWorkDetailVisible: false,
      exWorkInfo: {},
      loading: false,
      searchArea: {
        nickName: null,
        exhibitionName: null
      },
      exhibitionUploadUrl: ''
    }
  },
  methods: {
    getExWorkList (current, size) {
      this.loadingTable = true
      Vue.http.get(process.env.baseUrl + '/exWorkList', {
        params: {
          current,
          size
        }
      }).then(res => {
        console.log(res)
        this.loadingTable = false
        if (res.code === 0) {
          this.exWorkList = res.exWorkList
          this.dataCount = res.count
        } else {
          this.$message.warning('获得画展作品列表失败')
        }
      }
      )
    },
    handleCurrentChange (val) {
      this.current = val
      if (this.searchArea.nickName || this.searchArea.exhibitionName) {
        this.searchExWork(this.current, this.size)
      } else {
        this.getExWorkList(this.current, this.size)
      }
    },
    handleDetail (index) {
      this.exWorkDetailVisible = true
      this.exWorkInfo = _.cloneDeep(this.exWorkList[index])
    },
    updateExWork () {
      this.loading = true
      Vue.http.post(process.env.baseUrl + '/updateExWork', this.exWorkInfo).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.$message.success('修改画展作品信息成功')
          this.exWorkDetailVisible = false
          this.getExWorkList(this.current, this.size)
          this.searchArea = {}
        } else {
          this.$message.warning('修改画展作品信息失败')
        }
      })
    },
    handleSearch () {
      this.current = 1
      if (this.searchArea.nickName || this.searchArea.exhibitionName) {
        this.searchExWork(this.current, this.size)
      } else {
        this.getExWorkList(this.current, this.size)
      }
    },
    searchExWork (current, size) {
      this.loading = true
      Vue.http.get(process.env.baseUrl + '/searchExWork', {
        params: {
          nickName: this.searchArea.nickName ? this.searchArea.nickName : ' ',
          exhibitionName: this.searchArea.exhibitionName ? this.searchArea.exhibitionName : ' ',
          size: size,
          current: current
        }
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.dataCount = res.count
          this.exWorkList = res.data
          this.$message.success('查询画展作品成功')
        } else {
          this.$message.warning('查询画展作品失败')
        }
      })
    },
    deleteExWork (id) {
      this.$confirm('此操作将永久删除该画展作品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/deleteExWork', {
          id
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('删除画展作品成功')
            this.getExWorkList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('删除画展作品失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    beforeExWorkUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传的海报图片只能是 JPG　格式')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB！')
      }
    },
    handleExWorkSuccess (res, file) {
      console.log(res)
      if (res.code === 0) {
        this.exWorkInfo.source = res.filePath
      }
    }
  },
  created () {
    this.getExWorkList(this.current, this.size)
    this.imgUrl = process.env.imgUrl
    this.exhibitionUploadUrl = process.env.baseUrl
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
  .ex-work-uploader .el-upload{
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .ex-work-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .ex-work-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .ex-work {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
