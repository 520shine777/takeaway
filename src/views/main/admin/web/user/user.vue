<template>
  <div class="user-manage">
    <div class="search-form">
      <search-form :searchConfig="UserSearchFormConfig" @resetSearchForm="resetSearchForm"
        @searchFormRequest="searchFormRequest" />
    </div>
    <div class="table-data">
      <table-form :tableData="defaultShowInfo" v-bind="UserTableFormConfig" @handleOffsetChange="handleOffsetChange"
        @handlePageChange="handlePageChange">
        <!-- 头部插槽 -->
        <template #handler>
          <el-button icon="el-icon-circle-plus-outline" type="primary" @click="handleDialog">添加</el-button>
        </template>
        <!-- 表格插槽 -->
        <template #usable="slotProps">
          <el-button class="btn-usable" plain size="mini" :type="slotProps.row.usable ? 'success' : 'danger'"
            @click="handleUsable(slotProps.row)">{{ slotProps.row.usable ? "正常" : "封禁" }}</el-button>
        </template>
        <template #role_id="slotProps">
          {{ slotProps.row.role_id == 1 ? "admin" : "user" }}
        </template>
        <template #createTime="slotProps">
          {{ $utils.formatTime(new Date(slotProps.row.createTime).getTime()) }}
        </template>
        <template #updateTime="slotProps">
          {{ $utils.formatTime(new Date(slotProps.row.updateTime).getTime()) }}
        </template>
        <template #handle="slotProps">
          <el-button size="mini" icon="el-icon-edit" type="text" @click="handleEdit(slotProps.row)">编辑</el-button>

          <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red"
            title="确定要删除该账号吗？" @confirm="deleteUser(slotProps.row)">
            <el-button class="btn-delete" size="mini" icon="el-icon-delete" type="text" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </table-form>
    </div>
    <div class="add-user">
      <el-dialog title="添加用户信息" :visible.sync="showDialog" width="40%" center>
        <add-form :addConfig="UserAddFormConfig" @addFormRequest="addFormRequest" />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import searchForm from "@/components/content/search-form/searchForm.vue";
import tableForm from "@/components/content/table-form/tableForm.vue";
import addForm from "@/components/content/add-form/addForm.vue";

import config from "../../config/user-config.js";

export default {
  components: { searchForm, tableForm, addForm },
  name: "",
  data() {
    return {
      UserSearchFormConfig: config.UserSearchFormConfig,
      UserTableFormConfig: config.UserTableFormConfig,
      UserAddFormConfig: config.UserAddFormConfig,
      defaultShowInfo: {},
      query: { role: "admin", page: 1, offset: 10 },
      showDialog: false,
    };
  },
  created() {
    this.getUserByQuery();
  },
  methods: {
    // 重置 => 默认显示admin的数据
    resetSearchForm() {
      this.query = { role: "admin", page: 1, offset: 10 };
      this.getUserByQuery();
    },
    // 根据参数请求数据
    searchFormRequest(queryData) {
      queryData = this.$utils.removeEmpty(queryData);
      this.query = { ...this.query, ...queryData };
      this.getUserByQuery();
    },
    addFormRequest(data) {
      this.$api.adminApis.addUser({ data }).then((res) => {
        if (res.code == 200) {
          this.$message({ type: "success", message: res.message });
        } else {
          this.$message({ type: "error", message: res.message });
        }
      });
    },
    // 根据query获取admin/seller/buyer
    getUserByQuery() {
      this.$api.adminApis.getUserByQuery({ data: this.query }).then((res) => {
        // console.log(res);
        if (res.code == 200) {
          this.defaultShowInfo = res.data;
          console.log(this.defaultShowInfo);
        } else {
          this.$notify.error({ title: "错误", message: res.message });
        }
      });
    },
    // 判断删除的是哪种角色
    deleteUser(row) {
      if (row.role_id == 1) {
        this.deleteAdmin(row);
      } else if (row.role_id == 2) {
        this.deleteSeller(row);
      } else if (row.role_id == 3) {
        this.deleteBuyer(row);
      }
    },
    // 删除admin
    deleteAdmin(row) {
      if (row.level == 1) {
        this.$notify.error({
          title: "错误",
          message: "level为1的数据不允许操作",
        });
        return;
      }
      this.$api.adminApis
        .deleteAdmin({ data: { id: row.id, account: row.account } })
        .then((res) => {
          if (res.code == 200) {
            this.getUserByQuery();
          } else {
            this.$notify.error({
              title: "错误",
              message: res.message + ", 请登录super删除admin账户",
            });
          }
        });
    },
    // 删除seller
    deleteSeller(row) {
      this.$api.adminApis.deleteSeller({ data: { id: row.id } }).then((res) => {
        if (res.code == 200) {
          this.getUserByQuery();
        } else {
          this.$notify.error({ title: "错误", message: res.message });
        }
      });
    },
    // 编辑
    handleEdit(row) {
      this.$notify({
        type: "warning",
        title: "提示",
        message: "编辑功能还没写",
      });
    },
    // 删除buyer
    deleteBuyer(row) {
      this.$api.adminApis.deletebuyer({ data: { id: row.id } }).then((res) => {
        if (res.code == 200) {
          this.getUserByQuery();
        } else {
          this.$notify.error({ title: "错误", message: res.message });
        }
      });
    },
    // 更改状态
    handleUsable(row) {
      if (row.level == 1) {
        this.$notify.error({
          title: "错误",
          message: "level为1的数据不允许操作",
        });
        return;
      }
      this.$api.adminApis
        .changeUserUsable({
          data: { usable: !row.usable, id: row.id, role_id: row.role_id },
        })
        .then((res) => {
          if (res.code == 200) {
            this.getUserByQuery();
          } else {
            this.$notify.error({ title: "错误", message: res.message });
          }
        });
    },
    // 分页: 页数改变
    handlePageChange(page) {
      this.query.page = page;
      this.getUserByQuery();
    },
    // 分页: 每页数量改变
    handleOffsetChange(offset) {
      this.query.offset = offset;
      this.getUserByQuery();
    },
    // 控制dialog
    handleDialog() {
      this.showDialog = !this.showDialog;
    },
  },
};
</script>

<style scoped lang="scss">
.search-form {
  margin-bottom: 30px;
}

.btn-delete {
  color: #f56c6c;
}
</style>