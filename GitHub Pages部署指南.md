# 🚀 GitHub Pages 部署指南

## ✅ 准备工作

- ✅ `index.html` 已准备好
- ✅ Supabase 已配置
- ✅ 云端存储已启用

---

## 📋 部署步骤（5分钟完成）

### 第1步：访问 GitHub

打开浏览器，访问：https://github.com

### 第2步：注册/登录

**如果还没有账号：**
1. 点击右上角 "Sign up"（注册）
2. 输入邮箱
3. 创建密码
4. 选择用户名（这个很重要，会成为你网址的一部分）
5. 验证邮箱

**如果已有账号：**
1. 点击 "Sign in"（登录）
2. 输入用户名和密码

### 第3步：创建新仓库

1. 登录后，点击右上角的 **"+"** 号
2. 选择 **"New repository"**（新建仓库）
3. 填写信息：
   - **Repository name**（仓库名）：`fund-portfolio`
   - **Description**（描述，可选）：`智能定投系统`
   - **Public**（公开）：选择这个（必须）
   - **Add a README file**：勾选这个
4. 点击 **"Create repository"**（创建仓库）

### 第4步：上传文件

1. 在仓库页面，点击 **"Add file"**
2. 选择 **"Upload files"**
3. 把你的 `index.html` 文件拖到页面上
   - 或者点击 "choose your files" 选择文件
4. 在底部的 "Commit changes" 输入框中：
   - 可以写：`上传主文件`（可选）
5. 点击 **"Commit changes"**（提交更改）

### 第5步：启用 GitHub Pages

1. 在仓库页面，点击顶部的 **"Settings"**（设置）
2. 在左侧菜单中，找到并点击 **"Pages"**
3. 在 "Source" 部分：
   - **Branch**（分支）：选择 **"main"**
   - **Folder**（文件夹）：保持 **"/ (root)"**
4. 点击 **"Save"**（保存）
5. 等待 1-2 分钟

### 第6步：获取你的网址

1. 刷新页面
2. 在 Pages 设置页面顶部，你会看到：
   ```
   Your site is live at https://你的用户名.github.io/fund-portfolio/
   ```
3. 点击这个网址，就可以访问你的系统了！

---

## 🎯 完整示例

假设你的 GitHub 用户名是 `zhangsan`：

1. 创建仓库：`fund-portfolio`
2. 上传文件：`index.html`
3. 启用 Pages
4. 你的网址：`https://zhangsan.github.io/fund-portfolio/`

---

## 📱 在手机上使用

### iOS（iPhone/iPad）：
1. 在 Safari 中打开你的网址
2. 点击底部的分享按钮
3. 选择 "添加到主屏幕"
4. 输入名称：`智能定投`
5. 点击 "添加"

### Android：
1. 在 Chrome 中打开你的网址
2. 点击右上角菜单（三个点）
3. 选择 "添加到主屏幕"
4. 输入名称：`智能定投`
5. 点击 "添加"

---

## 🔄 如何更新网站

### 方法1：在 GitHub 网页上更新

1. 访问你的仓库：`https://github.com/你的用户名/fund-portfolio`
2. 点击 `index.html` 文件
3. 点击右上角的铅笔图标（编辑）
4. 修改内容
5. 点击 "Commit changes"
6. 等待 1-2 分钟，网站自动更新

### 方法2：重新上传文件

1. 访问你的仓库
2. 点击 `index.html` 文件
3. 点击右上角的垃圾桶图标（删除）
4. 确认删除
5. 点击 "Add file" → "Upload files"
6. 上传新的 `index.html`
7. 提交更改

---

## 🔐 数据同步

### 首次访问：
1. 打开你的 GitHub Pages 网址
2. 系统会自动生成用户ID
3. 数据保存到 Supabase

### 记住你的用户ID：
1. 打开网站
2. 按 **F12** 打开控制台
3. 输入：`console.log(userId)`
4. 记录显示的用户ID（如：`user_1770384235028_s9grthupq`）

### 在其他设备使用相同数据：
1. 在新设备打开网站
2. 按 **F12** 打开控制台
3. 输入：
```javascript
localStorage.setItem('userId', '你的用户ID');
location.reload();
```

---

## 🎨 自定义域名（可选）

如果你有自己的域名（如：fund.example.com）：

1. 在 GitHub 仓库的 Settings → Pages
2. 在 "Custom domain" 输入你的域名
3. 点击 "Save"
4. 在你的域名服务商添加 DNS 记录：
   - 类型：CNAME
   - 名称：fund（或你想要的子域名）
   - 值：你的用户名.github.io
5. 等待 DNS 生效（几分钟到几小时）

---

## ⚠️ 重要提示

### 1. 仓库必须是 Public（公开）
- GitHub Pages 免费版只支持公开仓库
- 任何人都可以访问你的网址
- 但他们看不到你的数据（需要你的用户ID）

### 2. 网址是固定的
```
https://你的GitHub用户名.github.io/仓库名/
```

### 3. 更新需要时间
- 修改文件后，等待 1-2 分钟
- GitHub 会自动重新部署
- 刷新浏览器查看更新

### 4. 数据安全
- 你的数据存储在 Supabase，不在 GitHub
- 只有知道你的用户ID才能访问你的数据
- 建议不要分享你的网址和用户ID

---

## 🐛 常见问题

### Q1: 网址打不开，显示 404？

**可能原因：**
- Pages 还在部署中（等待 1-2 分钟）
- 没有启用 Pages
- 文件名不是 `index.html`

**解决方法：**
1. 确认文件名是 `index.html`（不是其他名字）
2. 确认已启用 Pages（Settings → Pages）
3. 等待几分钟后重试
4. 检查 Pages 设置页面是否显示 "Your site is live"

### Q2: 网址可以访问，但显示空白？

**可能原因：**
- 文件上传不完整
- 浏览器缓存问题

**解决方法：**
1. 按 **Ctrl + Shift + R** 强制刷新
2. 按 **F12** 查看控制台错误
3. 重新上传 `index.html`

### Q3: 数据没有保存？

**检查清单：**
- [ ] Supabase 表是否已创建？
- [ ] 浏览器控制台是否有错误？
- [ ] 网络连接是否正常？

**解决方法：**
1. 按 F12 查看控制台
2. 确认 Supabase 表已创建
3. 查看是否有错误信息

### Q4: 如何删除网站？

1. 访问你的仓库
2. 点击 "Settings"
3. 滚动到最底部
4. 点击 "Delete this repository"
5. 按照提示确认删除

### Q5: 可以改仓库名吗？

可以！但网址也会改变：

1. 访问你的仓库
2. 点击 "Settings"
3. 在 "Repository name" 修改名称
4. 点击 "Rename"
5. 新网址：`https://你的用户名.github.io/新仓库名/`

---

## 📊 GitHub Pages 限制

### 免费版限制：
- ✅ 仓库大小：1 GB
- ✅ 带宽：100 GB/月
- ✅ 构建次数：10 次/小时
- ✅ 完全够用！

### 你的使用情况：
- 文件大小：约 100 KB
- 每月访问：假设 1000 次
- 流量使用：约 100 MB
- 远低于限制 ✅

---

## 🎉 完成后的效果

✅ 通过网址访问系统  
✅ 在任何设备上使用  
✅ 数据自动云端同步  
✅ 完全免费  
✅ 永久在线  

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Pages 文档：https://pages.github.com
2. 检查浏览器控制台的错误信息
3. 确认 Supabase 配置正确

---

## 🎊 恭喜！

完成部署后，你就拥有了：
- 一个可以通过网址访问的智能定投系统
- 数据保存在云端
- 在任何设备上都能使用
- 完全免费且永久在线

开始使用你的在线投资管理系统吧！📈
