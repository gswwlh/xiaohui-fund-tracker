# 🚀 Vercel 部署指南

## ✅ 准备工作

你的文件已经准备好了：
- ✅ `index.html` - 主文件（已重命名）
- ✅ Supabase 配置已集成
- ✅ 云端存储功能已启用

---

## 📋 部署步骤（5分钟完成）

### 第1步：访问 Vercel

打开浏览器，访问：https://vercel.com

### 第2步：注册/登录

**推荐方式：使用 GitHub 登录**
1. 点击 "Sign Up"（注册）或 "Log In"（登录）
2. 选择 "Continue with GitHub"
3. 授权 Vercel 访问你的 GitHub 账号

**或者使用邮箱注册：**
1. 输入邮箱
2. 验证邮箱
3. 设置密码

### 第3步：创建新项目

1. 登录后，点击右上角 "Add New..."
2. 选择 "Project"
3. 你会看到两个选项：
   - Import Git Repository（从 Git 导入）
   - Deploy from template（从模板部署）

### 第4步：选择部署方式

#### 方式A：直接上传文件（最简单）⭐

1. 在页面底部找到 "Or, deploy without Git"
2. 点击 "Browse" 或直接拖拽文件
3. 选择你的 `index.html` 文件
4. 点击 "Upload"

#### 方式B：通过 GitHub（推荐长期使用）

1. 先在 GitHub 创建仓库（参考下面的 GitHub 步骤）
2. 在 Vercel 选择 "Import Git Repository"
3. 选择你的仓库
4. 点击 "Import"

### 第5步：配置项目

1. **Project Name**（项目名称）：
   - 输入：`fund-portfolio` 或任意名称
   - 这将成为你的网址的一部分

2. **Framework Preset**（框架预设）：
   - 选择 "Other"（其他）

3. **Root Directory**（根目录）：
   - 保持默认（不用改）

4. 点击 "Deploy"（部署）

### 第6步：等待部署完成

- 部署过程约 30 秒 - 1 分钟
- 你会看到一个进度动画
- 完成后会显示 "Congratulations!" 🎉

### 第7步：获取你的网址

部署成功后，你会看到：
```
https://fund-portfolio-xxx.vercel.app
```

点击这个网址就可以访问你的系统了！

---

## 🎯 如果选择方式A（直接上传）

### 完整步骤：

1. 访问 https://vercel.com
2. 登录（推荐用 GitHub）
3. 点击 "Add New..." → "Project"
4. 滚动到页面底部
5. 找到 "Or, deploy without Git"
6. 点击 "Browse" 选择 `index.html`
7. 或者直接把 `index.html` 拖到页面上
8. 点击 "Upload"
9. 项目名称输入：`fund-portfolio`
10. 点击 "Deploy"
11. 等待完成
12. 复制你的网址

---

## 🎯 如果选择方式B（通过 GitHub）

### 先在 GitHub 创建仓库：

1. 访问 https://github.com
2. 登录后点击右上角 "+" → "New repository"
3. 仓库名：`fund-portfolio`
4. 选择 "Public"
5. 勾选 "Add a README file"
6. 点击 "Create repository"
7. 点击 "Add file" → "Upload files"
8. 上传 `index.html`
9. 点击 "Commit changes"

### 然后在 Vercel 导入：

1. 在 Vercel 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 找到你的 `fund-portfolio` 仓库
4. 点击 "Import"
5. 保持默认设置
6. 点击 "Deploy"
7. 等待完成

---

## 🔧 部署后的配置

### 1. 自定义域名（可选）

如果你有自己的域名：
1. 在 Vercel 项目页面点击 "Settings"
2. 点击 "Domains"
3. 输入你的域名
4. 按照提示配置 DNS

### 2. 环境变量（当前不需要）

你的 Supabase 配置已经在代码中，不需要额外配置。

### 3. 更新网站

**如果用方式A（直接上传）：**
- 需要重新上传文件

**如果用方式B（GitHub）：**
- 只需要在 GitHub 更新文件
- Vercel 会自动重新部署

---

## 📱 访问你的网站

### 在电脑上：
直接访问你的 Vercel 网址

### 在手机上：
1. 打开手机浏览器
2. 输入你的 Vercel 网址
3. 建议添加到主屏幕（像 App 一样使用）

**iOS（iPhone/iPad）：**
1. 在 Safari 中打开网址
2. 点击底部分享按钮
3. 选择"添加到主屏幕"

**Android：**
1. 在 Chrome 中打开网址
2. 点击右上角菜单
3. 选择"添加到主屏幕"

---

## 🔐 数据同步

### 首次访问：
1. 打开网址
2. 系统会自动生成用户ID
3. 数据保存到 Supabase

### 在其他设备访问：

**方法1：使用相同的用户ID**
1. 在第一台设备按 F12 打开控制台
2. 输入：`console.log(userId)`
3. 复制显示的用户ID
4. 在第二台设备打开网址
5. 按 F12 打开控制台
6. 输入：`localStorage.setItem('userId', '你的用户ID'); location.reload();`

**方法2：导入导出**
1. 在第一台设备点击"⬇️ 备份配置"
2. 将 JSON 文件发送到第二台设备
3. 在第二台设备点击"⬆️ 恢复配置"

---

## ⚠️ 重要提示

### 1. 网址是公开的
- 任何人都可以访问这个网址
- 但他们看不到你的数据（需要你的用户ID）
- 建议不要分享你的网址

### 2. 数据安全
- 你的数据存储在 Supabase
- 只有知道你的用户ID才能访问
- 建议启用 Supabase RLS（行级安全）

### 3. 用户ID 很重要
- 这是访问你数据的唯一凭证
- 建议记录下来
- 或者使用"备份配置"功能

---

## 🎉 完成后的效果

✅ 在任何设备上通过网址访问  
✅ 数据自动保存到云端  
✅ 多设备数据同步  
✅ 不需要下载或安装  
✅ 像使用网站一样方便  

---

## 🐛 常见问题

### Q1: 部署失败怎么办？

**检查清单：**
- [ ] 文件名是否为 `index.html`？
- [ ] 文件是否完整（没有损坏）？
- [ ] 网络连接是否正常？

**解决方法：**
1. 重新上传文件
2. 尝试换个浏览器
3. 清空浏览器缓存后重试

### Q2: 网址打不开？

**可能原因：**
- 部署还在进行中（等待1-2分钟）
- 网络问题
- Vercel 服务暂时不可用

**解决方法：**
1. 等待几分钟后重试
2. 检查 Vercel 项目状态
3. 尝试重新部署

### Q3: 数据没有保存？

**检查清单：**
- [ ] Supabase 表是否已创建？
- [ ] 浏览器控制台是否有错误？
- [ ] 网络连接是否正常？

**解决方法：**
1. 按 F12 查看控制台错误
2. 确认 Supabase 表已创建
3. 检查 Supabase 项目状态

### Q4: 如何更新网站？

**如果用方式A（直接上传）：**
1. 在 Vercel 项目页面点击 "Deployments"
2. 点击 "Redeploy"
3. 上传新的 `index.html`

**如果用方式B（GitHub）：**
1. 在 GitHub 更新 `index.html`
2. Vercel 会自动检测并重新部署

### Q5: 可以绑定自己的域名吗？

可以！步骤：
1. 在 Vercel 项目页面点击 "Settings"
2. 点击 "Domains"
3. 输入你的域名（如：fund.example.com）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel 的部署日志
2. 检查浏览器控制台的错误信息
3. 参考 Vercel 官方文档：https://vercel.com/docs

---

## 🎊 恭喜！

完成部署后，你就拥有了一个：
- 可以通过网址访问的智能定投系统
- 数据保存在云端
- 在任何设备上都能使用
- 完全免费

开始使用你的在线投资管理系统吧！📈
