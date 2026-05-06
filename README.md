# 车型管理系统 (Car Model Management System)

这是一个基于 Vue 3 + Vuetify 的移动端车型管理系统前端项目。

## 项目结构

- `frontend/`: 前端源代码 (Vue 3, TypeScript, Vuetify)
- `Dockerfile`: Docker 构建文件
- `README.md`: 项目说明文档

## 技术栈

- **框架**: Vue 3
- **UI 组件库**: Vuetify
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **国际化**: Vue I18n
- **工具库**: Dayjs, Lodash, XLSX
- **图表**: Echarts
- **构建工具**: Vite

## 启动说明

### 本地开发启动

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 功能列表

- **仪表盘**: 数据概览，Echarts 统计图表，待办事项。
- **产品管理**: 产品列表，智能搜索 (支持拼音)，详情查看 (左滑/点击)，PDF 导出。
- **车型管理**: 车型库管理，类似产品管理的交互体验。
- **匹配管理**: 自动匹配规则配置，结果审核，历史记录。
- **文件管理**: Excel/CSV/ZIP 文件上传 (模拟断点续传)，进度显示。
- **用户管理**: 基于 RBAC 的角色权限展示。
- **系统设置**: 日/夜模式切换，中英文切换。

