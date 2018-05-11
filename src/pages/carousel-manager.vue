<template>
  <div class="page-body"
       v-loading="loading"
       element-loading-text="拼命加载中"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="page-header">
      <div>
        <h1 class="page-title">轮播管理</h1>
        <el-breadcrumb>
          <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
          <el-breadcrumb-item >轮播管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div>
        <el-form :inline="true" :model="searchArea" class="form-inline">
          <el-form-item label="编号">
            <el-input v-model="searchArea.id" placeholder="编号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch()">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="createVisible = true; createData = {}; posterUrl = ''">创建轮播</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="box">
      <el-table :data="carouselList">
        <el-table-column label="编号" prop="id" width="80"></el-table-column>
        <el-table-column label="标题" prop="title"></el-table-column>
        <el-table-column label="图片" prop="url">
          <template slot-scope="scope">
            <img class="img-small" :src='imgUrl + scope.row.url' alt="头像图片">
          </template>
        </el-table-column>
        <el-table-column label="跳转地址" prop="href"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
            <m-button type="danger"  @click="deleteCarousel(scope.row.id)">删除</m-button>
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
        title="轮播图详情"
        :visible.sync="carouselDetailVisible"
        width="50%">
        <el-form>
          <el-form-item label="编号">
            <el-input v-model="carouselInfo.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="carouselInfo.title"></el-input>
          </el-form-item>
          <el-form-item label="跳转地址">
            <el-input v-model="carouselInfo.href"></el-input>
          </el-form-item>
          <el-form-item label="海报">
            <el-upload
              class="poster-uploader"
              :action="posterUploadUrl + '/uploadPoster'"
              :show-file-list="false"
              name="poster"
              :on-success="handlePosterUpdateSuccess"
              :before-upload="beforePosterUpload">
              <img v-if="carouselInfo.url" :src="imgUrl + carouselInfo.url" class="poster">
              <i v-else class="el-icon-plus poster-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="carouselDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCarousel()">更 新</el-button>
      </span>
      </el-dialog>
      <el-dialog
        title="创建轮播"
        :visible.sync="createVisible"
        width="50%">
        <el-form>
          <el-form-item label="标题" required>
            <el-input v-model="createData.title"></el-input>
          </el-form-item>
          <el-form-item label="跳转地址" required>
            <el-input type="textarea" v-model="createData.href"></el-input>
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
        <el-button type="primary" @click="createCarousel()">新 建</el-button>
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
        carouselList: [],
        imgUrl: '',
        dataCount: 0,
        current: 1,
        size: 10,
        carouselDetailVisible: false,
        carouselInfo: {},
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
      getCarouselList (current, size) {
        this.loadingTable = true
        Vue.http.get(process.env.baseUrl + '/carouselList', {
          params: {
            current,
            size
          }
        }).then(res => {
          this.loadingTable = false
          if (res.code === 0) {
            this.carouselList = res.List
            this.dataCount = res.count
          } else {
            this.$message.warning('获得轮播图列表失败')
          }
        }
        )
      },
      handleCurrentChange (val) {
        this.current = val
        if (this.searchArea.id) {
          this.searchCarousel(this.current, this.size)
        } else {
          this.getCarouselList(this.current, this.size)
        }
      },
      handleDetail (index) {
        this.carouselDetailVisible = true
        this.carouselInfo = _.cloneDeep(this.carouselList[index])
      },
      updateCarousel () {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/updateCarousel', {
          id: this.carouselInfo.id,
          title: this.carouselInfo.title,
          url: this.carouselInfo.url,
          href: this.carouselInfo.href
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('修改轮播信息成功')
            this.carouselDetailVisible = false
            this.getCarouselList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('修改轮播信息失败')
          }
        })
      },
      handleSearch () {
        this.current = 1
        if (this.searchArea.id || this.searchArea.name) {
          this.searchCarousel(this.current, this.size)
        } else {
          this.getCarouselList(this.current, this.size)
        }
      },
      searchCarousel (current, size) {
        this.loading = true
        Vue.http.get(process.env.baseUrl + '/searchCarousel', {
          params: {
            id: this.searchArea.id ? this.searchArea.id : -1,
            size: size,
            current: current
          }
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.dataCount = res.count
            this.carouselList = res.data
            this.$message.success('查询画展成功')
          } else {
            this.$message.warning('查询画展失败')
          }
        })
      },
      deleteCarousel (id) {
        this.$confirm('此操作将永久删除该轮播，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          Vue.http.post(process.env.baseUrl + '/deleteCarousel', {
            id
          }).then(res => {
            this.loading = false
            if (res.code === 0) {
              this.$message.success('删除轮播成功')
              this.getCarouselList(this.current, this.size)
              this.searchArea = {}
            } else {
              this.$message.warning('删除轮播失败')
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
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isJPG) {
          this.$message.error('上传的海报图片只能是 JPG　格式')
        }
        if (!isLt5M) {
          this.$message.error('上传头像图片大小不能超过 5MB！')
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
          this.carouselInfo.url = res.filePath
        }
      },
      createCarousel () {
        Vue.http.post(process.env.baseUrl + '/createCarousel', {
          title: this.createData.title,
          href: this.createData.href,
          url: this.posterUrl
        }).then(res => {
          if (res.code === 0) {
            this.createVisible = false
            this.current = 1
            this.getCarouselList(this.current, this.size)
            this.$message.success('创建轮播成功')
          } else {
            this.$message.errot('创建轮播失败')
          }
        })
      }
    },
    created () {
      this.getCarouselList(this.current, this.size)
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
