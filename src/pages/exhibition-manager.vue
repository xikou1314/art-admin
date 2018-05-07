<template>
<div class="page-body"  
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="page-header">
    <div>
    <h1 class="page-title">画展管理</h1>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item >画展管理</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div>
    <el-form :inline="true" :model="searchArea" class="form-inline">
      <el-form-item label="画展编号">
        <el-input v-model="searchArea.id" placeholder="画展编号"></el-input>
      </el-form-item>
      <el-form-item label="画展名称">
        <el-input v-model="searchArea.name" placeholder="画展名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="createVisible = true; createData = {}; posterUrl = ''">创建画展</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>

  <div class="box">
    <el-table :data="exhibitionList">
      <el-table-column label="画展编号" prop="id" width="80"></el-table-column>
      <el-table-column label="画展名称" prop="name"></el-table-column>
      <el-table-column label="开始日期" prop="start"></el-table-column>
      <el-table-column label="结束日期" prop="end"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
          <m-button type="danger"  @click="deleteExhibition(scope.row.id)">删除</m-button>
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
      title="画展详情"
      :visible.sync="exhibitionDetailVisible"
      width="50%">
      <el-form>
        <el-form-item label="画展名称">
          <el-input v-model="exhibitionInfo.name"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-row :gutter="21">
            <el-col :span="9">
              <el-date-picker type="date" placeholder="开始日期" v-model="exhibitionInfo.start" style="width: 100%;"></el-date-picker>
            </el-col>
            <el-col class="line" :span="1" >-</el-col>
            <el-col :span="9">
              <el-date-picker type="date" placeholder="结束时间" v-model="exhibitionInfo.end" style="width: 100%;"></el-date-picker>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="exhibitionInfo.introduction"></el-input>
        </el-form-item>
        <el-form-item label="海报">
          <el-upload
            class="poster-uploader"
            :action="posterUploadUrl + '/uploadPoster'"
            :show-file-list="false"
            name="poster"
            :on-success="handlePosterUpdateSuccess"
            :before-upload="beforePosterUpload">
            <img v-if="exhibitionInfo.poster" :src="imgUrl + exhibitionInfo.poster" class="poster">
            <i v-else class="el-icon-plus poster-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exhibitionDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateExhibition()">更 新</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="创建画展"
      :visible.sync="createVisible"
      width="50%">
      <el-form>
        <el-form-item label="画展名称" required>
          <el-input v-model="createData.name"></el-input>
        </el-form-item>
        <el-form-item label="时间" required>
          <el-row :gutter="21">
          <el-col :span="9">
            <el-date-picker type="date" placeholder="开始日期" v-model="createData.start" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col class="line" :span="1" >-</el-col>
          <el-col :span="9">
            <el-date-picker type="date" placeholder="结束时间" v-model="createData.end" style="width: 100%;"></el-date-picker>
          </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="简介" required>
          <el-input type="textarea" v-model="createData.introduction"></el-input>
        </el-form-item>
        <el-form-item label="海报" required>
          <el-upload
            class="poster-uploader"
            :action="posterUploadUrl + '/uploadPoster'"
            :show-file-list="false"
            name="poster"
            :on-success="handlePosterSuccess"
            :before-upload="beforePosterUpload">
            <img v-if="posterUrl" :src="imgUrl + posterUrl" class="poster">
            <i v-else class="el-icon-plus poster-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createVisible = false">取 消</el-button>
        <el-button type="primary" @click="createExhibition()">新 建</el-button>
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
      exhibitionList: [],
      imgUrl: '',
      dataCount: 0,
      current: 1,
      size: 10,
      exhibitionDetailVisible: false,
      exhibitionInfo: {},
      loading: false,
      searchArea: {
        id: null,
        name: null
      },
      createVisible: false,
      createData: {},
      posterUrl: '',
      posterUploadUrl: ''
    }
  },
  methods: {
    getExhibitionList (current, size) {
      this.loadingTable = true
      Vue.http.get(process.env.baseUrl + '/exhibitionList', {
        params: {
          current,
          size
        }
      }).then(res => {
        console.log(res)
        this.loadingTable = false
        if (res.code === 0) {
          this.exhibitionList = res.exhibitionList
          this.dataCount = res.count
        } else {
          this.$message.warning('获得用户列表失败')
        }
      }
      )
    },
    handleCurrentChange (val) {
      this.current = val
      if (this.searchArea.id || this.searchArea.name) {
        this.searchExhibition(this.current, this.size)
      } else {
        this.getExhibitionList(this.current, this.size)
      }
    },
    handleDetail (index) {
      this.exhibitionDetailVisible = true
      this.exhibitionInfo = _.cloneDeep(this.exhibitionList[index])
    },
    updateExhibition () {
      this.loading = true
      Vue.http.post(process.env.baseUrl + '/updateExhibition', {
        id: this.exhibitionInfo.id,
        name: this.exhibitionInfo.name,
        start: this.exhibitionInfo.start,
        end: this.exhibitionInfo.end,
        poster: this.exhibitionInfo.poster,
        introduction: this.exhibitionInfo.introduction
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.$message.success('修改画展信息成功')
          this.exhibitionDetailVisible = false
          this.getExhibitionList(this.current, this.size)
          this.searchArea = {}
        } else {
          this.$message.warning('修改画展信息失败')
        }
      })
    },
    handleSearch () {
      this.current = 1
      if (this.searchArea.id || this.searchArea.name) {
        this.searchExhibition(this.current, this.size)
      } else {
        this.getExhibitionList(this.current, this.size)
      }
    },
    searchExhibition (current, size) {
      this.loading = true
      Vue.http.get(process.env.baseUrl + '/searchExhibition', {
        params: {
          id: this.searchArea.id ? this.searchArea.id : -1,
          name: this.searchArea.name ? this.searchArea.name : -1,
          size: size,
          current: current
        }
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.dataCount = res.count
          this.exhibitionList = res.data
          this.$message.success('查询画展成功')
        } else {
          this.$message.warning('查询画展失败')
        }
      })
    },
    deleteExhibition (id) {
      this.$confirm('此操作将永久删除该作品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/deleteExhibition', {
          id
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('删除画展成功')
            this.getExhibitionList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('删除画展失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    beforePosterUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传的海报图片只能是 JPG　格式')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB！')
      }
    },
    handlePosterSuccess (res, file) {
      if (res.code === 0) {
        this.posterUrl = res.filePath
      }
    },
    handlePosterUpdateSuccess (res, file) {
      console.log(res, file)
      if (res.code === 0) {
        this.exhibitionInfo.poster = res.filePath
      }
    },
    createExhibition () {
      Vue.http.post(process.env.baseUrl + '/createExhibition', {
        name: this.createData.name,
        start: this.createData.start,
        end: this.createData.end,
        poster: this.posterUrl,
        introduction: this.createData.introduction
      }).then(res => {
        if (res.code === 0) {
          this.createVisible = false
          this.current = 1
          this.getExhibitionList(this.current, this.size)
          this.$message.success('创建画展成功')
        } else {
          this.$message.errot('创建画展失败')
        }
      })
    }
  },
  created () {
    this.getExhibitionList(this.current, this.size)
    this.imgUrl = process.env.imgUrl
    this.posterUploadUrl = process.env.baseUrl
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
  .poster-uploader .el-upload{
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .poster-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .poster-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .poster {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
