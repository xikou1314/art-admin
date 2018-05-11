<template>
<div class="page-body"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="page-header">
    <div>
    <h1 class="page-title">教程管理</h1>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item >教程管理</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div>
    <el-form :inline="true" :model="searchArea" class="form-inline">
      <el-form-item label="教程编号">
        <el-input v-model="searchArea.id" placeholder="教程编号"></el-input>
      </el-form-item>
      <el-form-item label="分类">
        <el-input v-model="searchArea.typeName" placeholder="分类"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="createVisible = true; createData = {}; thumbUrl = ''">创建教程</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>

  <div class="box">
    <el-table :data="courseList">
      <el-table-column label="教程编号" prop="id" width="80"></el-table-column>
      <el-table-column label="教程标题" prop="title"></el-table-column>
      <el-table-column label="分类" prop="typeName"></el-table-column>
      <el-table-column label="图片" prop="thumb">
        <template slot-scope="scope">
          <img :src="imgUrl + scope.row.thumb" class="img-small" />
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="url"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <m-button type="info"  @click="handleDetail(scope.$index)">详情</m-button>
          <m-button type="danger"  @click="deleteCourse(scope.row.id)">删除</m-button>
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
      title="教程详情"
      :visible.sync="courseDetailVisible"
      width="50%">
      <el-form>
        <el-form-item label="教程标题" required>
          <el-input v-model="courseInfo.title"></el-input>
        </el-form-item>
        <el-form-item label="分类" required>
          <!--<el-input v-model="courseInfo.typeName"></el-input>-->
          <el-select v-model="courseInfo.typeId" placeholder="请选择">
            <el-option
              v-for="item in type"
              :key="type.id"
              :label="item.typeName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="courseInfo.url"></el-input>
        </el-form-item>
        <el-form-item label="缩略图" required>
          <el-upload
            class="thumb-uploader"
            :action="thumbUploadUrl + '/uploadThumb'"
            :show-file-list="false"
            name="thumb"
            :on-success="handleThumbUpdateSuccess"
            :before-upload="beforeThumbUpload">
            <img v-if="courseInfo.thumb" :src="imgUrl + courseInfo.thumb" class="thumb">
            <i v-else class="el-icon-plus thumb-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="courseDetailVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCourse()">更 新</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="创建教程"
      :visible.sync="createVisible"
      width="50%">
      <el-form>
        <el-form-item label="教程标题" required>
          <el-input v-model="createData.title"></el-input>
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="createData.type" placeholder="请选择">
            <el-option
              v-for="item in type"
              :key="type.id"
              :label="item.typeName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="createData.url"></el-input>
        </el-form-item>
        <el-form-item label="缩略图" required>
          <el-upload
            class="thumb-uploader"
            :action="thumbUploadUrl + '/uploadThumb'"
            :show-file-list="false"
            name="thumb"
            :on-success="handleThumbSuccess"
            :before-upload="beforeThumbUpload">
            <img v-if="thumbUrl" :src="imgUrl + thumbUrl" class="thumb">
            <i v-else class="el-icon-plus thumb-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createVisible = false">取 消</el-button>
        <el-button type="primary" @click="createCourse()">新 建</el-button>
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
      courseList: [],
      imgUrl: '',
      dataCount: 0,
      current: 1,
      size: 10,
      courseDetailVisible: false,
      courseInfo: {},
      loading: false,
      searchArea: {
        id: null,
        type: null
      },
      createVisible: false,
      createData: {},
      thumbUrl: '',
      thumbUploadUrl: '',
      type: null
    }
  },
  methods: {
    getCourseList (current, size) {
      this.loadingTable = true
      Vue.http.get(process.env.baseUrl + '/courseList', {
        params: {
          current,
          size
        }
      }).then(res => {
        this.loadingTable = false
        console.log(res)
        if (res.code === 0) {
          this.courseList = res.courseList
          this.dataCount = res.count
        } else {
          this.$message.warning('获得教程列表失败')
        }
      }
      )
    },
    handleCurrentChange (val) {
      this.current = val
      if (this.searchArea.id || this.searchArea.typeName) {
        this.searchCourse(this.current, this.size)
      } else {
        this.getCourseList(this.current, this.size)
      }
    },
    handleDetail (index) {
      this.courseDetailVisible = true
      this.courseInfo = _.cloneDeep(this.courseList[index])
    },
    updateCourse () {
      this.loading = true
      Vue.http.post(process.env.baseUrl + '/updateCourse', {
        id: this.courseInfo.id,
        title: this.courseInfo.title,
        typeId: this.courseInfo.typeId,
        thumb: this.courseInfo.thumb,
        url: this.courseInfo.url
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.$message.success('修改教程信息成功')
          this.courseDetailVisible = false
          this.getCourseList(this.current, this.size)
          this.searchArea = {}
        } else {
          this.$message.warning('修改教程信息失败')
        }
      })
    },
    handleSearch () {
      this.current = 1
      if (this.searchArea.id || this.searchArea.typeName) {
        this.searchCourse(this.current, this.size)
      } else {
        this.getCourseList(this.current, this.size)
      }
    },
    searchCourse (current, size) {
      this.loading = true
      Vue.http.get(process.env.baseUrl + '/searchCourse', {
        params: {
          id: this.searchArea.id ? this.searchArea.id : -1,
          typeName: this.searchArea.typeName ? this.searchArea.typeName : -1,
          size: size,
          current: current
        }
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.dataCount = res.count
          this.courseList = res.data
          this.$message.success('查询教程成功')
        } else {
          this.$message.warning('查询教程失败')
        }
      })
    },
    deleteCourse (id) {
      this.$confirm('此操作将永久删除该教程，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        Vue.http.post(process.env.baseUrl + '/deleteCourse', {
          id
        }).then(res => {
          this.loading = false
          if (res.code === 0) {
            this.$message.success('删除教程成功')
            this.getCourseList(this.current, this.size)
            this.searchArea = {}
          } else {
            this.$message.warning('删除教程失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    beforeThumbUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传的海报图片只能是 JPG　格式')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB！')
      }
    },
    handleThumbSuccess (res, file) {
      if (res.code === 0) {
        this.thumbUrl = res.filePath
      }
    },
    handleThumbUpdateSuccess (res, file) {
      console.log(res, file)
      if (res.code === 0) {
        this.courseInfo.thumb = res.filePath
      }
    },
    createCourse () {
      Vue.http.post(process.env.baseUrl + '/createCourse', {
        title: this.createData.title,
        type: this.createData.type,
        thumb: this.thumbUrl,
        url: this.createData.url
      }).then(res => {
        if (res.code === 0) {
          this.createVisible = false
          this.current = 1
          this.getCourseList(this.current, this.size)
          this.$message.success('创建教程成功')
        } else {
          this.$message.errot('创建教程失败')
        }
      })
    },
    getType () {
      Vue.http.get(process.env.baseUrl + '/getType').then(res => {
        if (res.code === 0) {
          this.type = res.data
        } else {
          this.$message.warning('获得类型失败')
        }
      })
    }
  },
  created () {
    this.getCourseList(this.current, this.size)
    this.imgUrl = process.env.imgUrl
    this.thumbUploadUrl = process.env.baseUrl
    this.getType()
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
  .thumb-uploader .el-upload{
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .thumb-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .thumb-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .thumb {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
