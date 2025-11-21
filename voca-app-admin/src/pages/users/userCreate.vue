<template>
  <div class="user-create">
    <div class="page-header">
      <h1 class="page-title">添加用户</h1>
      <p class="page-description">创建新的系统用户</p>
    </div>

    <div class="page-content">
      <el-card>
        <el-form :model="userForm" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色">
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="userForm.status">
              <el-radio label="active">启用</el-radio>
              <el-radio label="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface UserForm {
  username: string
  email: string
  password: string
  role: string
  status: string
}

const formRef = ref<FormInstance>()
const userForm = reactive<UserForm>({
  username: '',
  email: '',
  password: '',
  role: '',
  status: 'active'
})

const rules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('用户创建成功')
      // 这里可以跳转到用户列表
    }
  })
}

const handleCancel = () => {
  ElMessage.info('已取消创建用户')
}
</script>