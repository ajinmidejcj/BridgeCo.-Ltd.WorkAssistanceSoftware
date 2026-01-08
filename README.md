# 大桥有限公司工作辅助系统

一个高性能的项目管理系统，用于管理建设单位的项目资料和日常事务。

## 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [安装和运行](#安装和运行)
- [使用指南](#使用指南)
- [数据存储](#数据存储)
- [开发指南](#开发指南)
- [浏览器支持](#浏览器支持)

## 功能特性

### 仪表板
- 显示今日日期和欢迎信息
- 各类待办事项统计和分类：
  - 超期未完成事项（加急 - 红色）
  - 今日必须完成事项（急 - 橙色）
  - 未来7日应完成事项（普通 - 蓝色）
  - 未来30日应完成事项（不急 - 绿色）
  - 其他待完成事项（不急 - 灰色）
- 存储健康监控和数据统计
- 数据备份与恢复功能

### 待办事项管理
- 创建、编辑、删除待办事项
- 自动计算截止日期（支持自然日和工作日）
- 基于时间限制的优先级分类
- 任务完成状态管理
- 与项目关联的任务自动生成

### 项目管理
- 按年度组织项目
- 按项目编号排序
- 项目详细信息管理
- 动态任务调整（删除或更改项目栏目时自动更新任务列表）

### 项目详细信息
每个项目包含以下信息：

#### 基本信息
- 项目类别（工程/服务/采购）
- 预估金额
- 预算价
- 招标日期

#### 中标通知书
- 中标日期
- 合同签订天数
- 是否使用工作日计算
- 中标单位
- 项目经理姓名
- 项目经理身份证号
- 中标价格
- 项目工期

#### 合同协议书
- 合同签订日期
- 履约保函提交日期
- 付款条款管理（支持多个付款条件）
- 保险条款管理（支持多个保险项目）

#### 开工资料
- 占道审批（可选）
- 开工申请（可选）
- 完工申请（可选）
- 竣工验收（可选）
- 结算审核（可选）

#### 其他事项
- 项目专属的待办事项
- 自定义任务管理

### 数据库
- 历史项目完整记录
- 所有待办事项记录
- 数据搜索和筛选
- 一键导出 Markdown 格式报告（按年份、可选择、全选）

### 数据备份与恢复
- 导出数据备份（JSON 格式）
- 导入数据备份（支持跨设备数据迁移）
- 自动保存机制
- 存储健康监控

## 项目结构

```
BridgeCo., Ltd.WorkAssistanceSoftware/
├── dist/                          # 构建输出目录
│   ├── assets/                    # 静态资源
│   └── index.html                 # 入口 HTML
├── src/                           # 源代码目录
│   ├── components/                # React 组件
│   │   ├── AddProjectModal.tsx    # 添加项目模态框
│   │   ├── AddTaskModal.tsx       # 添加任务模态框
│   │   ├── AddYearModal.tsx       # 添加年度模态框
│   │   ├── DatabaseDetailView.tsx # 数据库详情视图
│   │   ├── DatabaseView.tsx       # 数据库视图组件
│   │   └── TaskList.tsx           # 任务列表组件
│   ├── db/                        # 数据库配置
│   │   └── database.ts            # IndexedDB 数据库配置
│   ├── hooks/                     # React Hooks
│   │   ├── useProjects.ts         # 项目管理 Hook
│   │   └── useTasks.ts            # 任务管理 Hook
│   ├── pages/                     # 页面组件
│   │   ├── Dashboard.tsx          # 仪表板页面
│   │   ├── DatabasePage.tsx       # 数据库页面
│   │   └── YearProjects.tsx       # 年度项目页面
│   ├── services/                  # 业务逻辑服务
│   │   ├── fileStorageService.ts  # 文件存储服务（IndexedDB）
│   │   ├── holidayService.ts     # 节假日服务（API 集成）
│   │   ├── projectService.ts     # 项目服务
│   │   └── taskService.ts         # 任务服务
│   ├── types/                     # TypeScript 类型定义
│   │   └── index.ts               # 类型定义文件
│   ├── utils/                     # 工具函数
│   │   ├── dateUtils.ts           # 日期工具函数
│   │   └── exportUtils.ts         # 导出工具函数
│   ├── App.tsx                    # 应用根组件
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 应用入口
├── index.html                     # HTML 模板
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.node.json             # Node TypeScript 配置
├── vite.config.ts                 # Vite 配置
└── README.md                      # 项目说明文档
```

### 目录说明

#### `src/components/`
包含所有可复用的 React 组件：
- **模态框组件**：用于添加项目、任务、年度的弹窗
- **视图组件**：数据库和任务列表的展示组件

#### `src/db/`
IndexedDB 数据库配置：
- 定义数据表结构
- 配置索引和查询优化

#### `src/hooks/`
自定义 React Hooks：
- **useProjects**：封装项目数据的获取和更新逻辑
- **useTasks**：封装任务数据的获取和更新逻辑

#### `src/pages/`
主要页面组件：
- **Dashboard**：仪表板，显示待办事项统计和存储信息
- **DatabasePage**：数据库页面，支持搜索、筛选和导出
- **YearProjects**：年度项目详情页面，包含所有项目信息的编辑功能

#### `src/services/`
业务逻辑层：
- **fileStorageService**：封装 IndexedDB 操作，提供数据持久化
- **holidayService**：集成中国节假日 API，支持工作日计算
- **projectService**：项目 CRUD 操作
- **taskService**：任务 CRUD 操作

#### `src/types/`
TypeScript 类型定义：
- 定义所有数据模型（Project、Task、PaymentTerm 等）
- 定义枚举类型（TaskPriority、TaskStatus、ProjectCategory 等）

#### `src/utils/`
工具函数：
- **dateUtils**：日期计算、格式化、工作日计算
- **exportUtils**：Markdown 报告生成

## 技术栈

### 前端框架
- **React 18**：用于构建用户界面
- **TypeScript**：提供类型安全和更好的开发体验
- **Vite**：现代化的构建工具，提供快速的开发体验

### 路由
- **React Router DOM**：用于页面导航和路由管理

### 数据管理
- **Dexie**：IndexedDB 的封装库，提供更简洁的 API
- **IndexedDB**：浏览器内置的 NoSQL 数据库

### 日期处理
- **date-fns**：现代 JavaScript 日期工具库

### API 集成
- **中国节假日 API**：用于获取法定节假日信息

## 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd BridgeCo., Ltd.WorkAssistanceSoftware
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```
开发服务器将在 `http://localhost:5173` 启动

4. **构建生产版本**
```bash
npm run build
```
构建产物将输出到 `dist` 目录

5. **预览生产版本**
```bash
npm run preview
```

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run lint` - 运行 ESLint 检查代码质量

## 使用指南

### 首次使用

1. **启动应用**
   - 运行 `npm run dev` 启动开发服务器
   - 在浏览器中打开 `http://localhost:5173`

2. **创建年度**
   - 点击"添加年度"按钮
   - 输入年份（如 2024）
   - 点击"保存"

3. **创建项目**
   - 选择一个年度
   - 点击"添加项目"按钮
   - 填写项目基本信息：
     - 项目编号（自动生成）
     - 项目名称
     - 项目类别
     - 预估金额
     - 预算价
     - 招标日期
   - 填写中标通知书信息
   - 填写合同协议书信息（可选）
   - 填写开工资料信息（可选）
   - 点击"保存"

4. **创建待办事项**
   - 在 Dashboard 页面点击"添加待办事项"
   - 填写任务信息：
     - 任务标题
     - 任务描述
     - 开始日期
     - 截止天数
     - 是否使用工作日计算
   - 点击"保存"

### 日常使用

#### 查看待办事项
- 在 Dashboard 页面查看所有待办事项
- 事项按优先级分类显示
- 点击事项可查看详情

#### 完成待办事项
- 点击事项右侧的"完成"按钮
- 事项将移至已完成列表

#### 编辑项目信息
- 进入年度项目页面
- 点击各个栏目右侧的"编辑"按钮
- 修改信息后点击"保存"

#### 搜索和筛选
- 在数据库页面使用搜索框查找项目
- 使用筛选器按年份、类别等条件筛选

#### 导出数据
- 在 Dashboard 页面点击"导出数据备份"
- 下载 JSON 格式的备份文件

#### 导入数据
- 在 Dashboard 页面点击"导入数据备份"
- 选择之前导出的备份文件

### 高级功能

#### 工作日计算
系统支持两种日期计算方式：
- **自然日**：包括周末和节假日
- **工作日**：排除周末和法定节假日

工作日计算会自动查询中国法定节假日，确保截止日期的准确性。

#### 动态任务调整
当删除或更改项目栏目时，系统会自动调整任务列表：
- 删除付款条款 → 自动删除相关付款任务
- 删除保险条款 → 自动删除相关保险任务
- 更新项目名称 → 自动更新相关任务标题
- 更新项目编号 → 自动更新相关任务描述
- 完成里程碑 → 自动更新相关付款任务

#### Markdown 报告导出
在数据库页面可以导出 Markdown 格式的报告：
- 导出所有项目
- 按年份导出
- 选择特定项目导出

## 数据存储

### IndexedDB 概述

系统使用 IndexedDB 进行数据存储，无需后端服务器。IndexedDB 是浏览器提供的本地数据库，具有以下优势：

- **大容量存储**：可存储数百 MB 甚至 GB 级别的数据
- **高性能**：支持异步操作，不会阻塞主线程
- **结构化存储**：支持复杂的数据结构和索引查询
- **离线可用**：数据完全存储在本地浏览器中，无需网络连接

### 存储容量

- **总容量**：约 50 MB（浏览器限制）
- **预估容量**：
  - 约 3000-5000 个项目
  - 约 20000-30000 个任务
  - 具体容量取决于每个项目的数据量

### 数据模型

#### Project（项目）
```typescript
{
  id?: number;
  year: number;
  projectNumber: string;
  projectName: string;
  category: '工程' | '服务' | '采购';
  estimatedAmount: number;
  budgetPrice: number;
  tenderDate: string;
  awardNotice: AwardNotice;
  contract: Contract;
  constructionMaterial: ConstructionMaterial;
  createdAt: string;
}
```

#### Task（任务）
```typescript
{
  id?: number;
  title: string;
  description: string;
  startDate: string;
  deadlineDays: number;
  deadlineDate: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'completed';
  projectId?: number;
  projectNumber?: string;
  isProjectTask: boolean;
  createdAt: string;
  completedAt?: string;
}
```

### 数据备份与恢复

#### 导出数据备份
1. 在 Dashboard 页面点击"导出数据备份"按钮
2. 系统会下载 JSON 格式的备份文件
3. 文件名格式：`bridgeco_backup_YYYY-MM-DD.json`

#### 导入数据备份
1. 在 Dashboard 页面点击"导入数据备份"按钮
2. 选择之前导出的备份文件
3. 系统会覆盖当前所有数据并恢复备份内容

#### 更换电脑时的操作流程
1. 在旧电脑上导出数据备份
2. 将备份文件保存到 U 盘或云存储
3. 在新电脑上导入备份文件

### 存储健康监控

系统会实时监控存储空间使用情况，并在 Dashboard 页面显示：

#### 存储健康状态
- ✓ **健康 (0-80%)**：绿色提示，存储空间充足
- ⚡ **警告 (80-95%)**：黄色提示，建议定期备份
- ⚠️ **严重 (>95%)**：红色警告，必须立即备份

#### 数据统计
- 项目数量
- 任务数量
- 年度数量
- 存储大小

#### 存储空间
- 已使用空间
- 可用空间
- 使用率（带进度条）
- 预估剩余容量

## 开发指南

### 项目架构

#### 组件层次
```
App
├── Dashboard
│   ├── TaskList
│   └── StorageInfo
├── DatabasePage
│   └── DatabaseView
│       └── DatabaseDetailView
└── YearProjects
    ├── BasicInfoSection
    ├── AwardNoticeSection
    ├── ContractSection
    ├── ConstructionMaterialSection
    └── OtherTasksSection
```

#### 数据流
```
用户操作 → 组件事件处理 → Service 层 → IndexedDB → 状态更新 → UI 重新渲染
```

### 添加新功能

#### 1. 添加新的数据类型
在 `src/types/index.ts` 中定义新的类型：
```typescript
export interface NewDataType {
  id?: number;
  field1: string;
  field2: number;
  // ...
}
```

#### 2. 添加数据库表
在 `src/db/database.ts` 中添加新的表：
```typescript
db.version(1).stores({
  projects: '++id, year, projectNumber, projectName',
  tasks: '++id, projectId, title, deadlineDate, priority, status',
  newDataTable: '++id, field1, field2', // 新增表
});
```

#### 3. 创建 Service
在 `src/services/` 中创建新的服务文件：
```typescript
export async function createNewData(data: NewDataType): Promise<NewDataType> {
  const id = await db.newDataTable.add(data);
  return { ...data, id };
}
```

#### 4. 创建 Hook
在 `src/hooks/` 中创建新的 Hook：
```typescript
export function useNewData() {
  const [data, setData] = useState<NewDataType[]>([]);
  
  useEffect(() => {
    loadNewData().then(setData);
  }, []);
  
  return { data, createNewData, updateNewData, deleteNewData };
}
```

#### 5. 创建组件
在 `src/components/` 或 `src/pages/` 中创建组件：
```typescript
export function NewComponent() {
  const { data, createNewData } = useNewData();
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}
```

### 代码规范

#### TypeScript
- 使用严格的类型检查
- 为所有函数参数和返回值指定类型
- 使用接口定义数据模型

#### React
- 使用函数组件和 Hooks
- 避免使用类组件
- 使用 `useState` 和 `useEffect` 管理状态和副作用
- 使用自定义 Hooks 封装可复用逻辑

#### 样式
- 使用 Tailwind CSS 类名
- 保持样式一致性
- 使用语义化的 HTML 标签

### 调试技巧

#### 使用浏览器开发者工具
1. 打开开发者工具（F12）
2. 查看 Console 日志
3. 使用 Network 标签检查 API 调用
4. 使用 Application 标签查看 IndexedDB 数据

#### 添加日志
```typescript
console.log('调试信息', data);
console.error('错误信息', error);
```

#### 断点调试
在源代码中设置断点，使用浏览器调试器逐步执行代码。

### 性能优化

#### 使用 React.memo
```typescript
export const MemoizedComponent = React.memo(Component);
```

#### 使用 useMemo 和 useCallback
```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

#### 代码分割
使用动态导入减少初始加载时间：
```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));
```

## 浏览器支持

- Chrome/Edge (推荐) - 完全支持
- Firefox - 完全支持
- Safari - 完全支持（iOS 10+, macOS 10.12+）

### 浏览器要求
- 支持 IndexedDB
- 支持 ES6+ 语法
- 支持 React 18

## 常见问题

### Q: 数据会丢失吗？
A: 数据存储在浏览器的 IndexedDB 中，只要不清除浏览器数据，数据不会丢失。建议定期导出备份。

### Q: 可以在多台电脑上使用吗？
A: 可以通过导出/导入备份功能在多台电脑间同步数据。

### Q: 存储空间不够怎么办？
A: 当存储空间使用率超过 80% 时，系统会显示警告。建议定期导出备份并清理不必要的数据。

### Q: 工作日计算准确吗？
A: 系统集成了中国法定节假日 API，工作日计算会自动排除周末和法定节假日，确保准确性。

### Q: 如何升级到新版本？
A: 直接替换 `dist` 目录中的文件即可，数据不会丢失。

## 技术支持

如有问题或建议，请联系开发团队。

## 许可证

版权所有 © 2026 xx大桥有限公司
