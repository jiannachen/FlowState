# FlowState 数据库设置指南

## ✅ 已完成的数据库迁移

你的 FlowState 项目已经成功迁移到使用 **PostgreSQL (Neon) + Drizzle ORM** 进行数据持久化。

---

## 🎯 当前状态

### ✅ 已完成:
- 数据库 schema 定义 (`db/schema.ts`)
- Drizzle 配置 (`drizzle.config.ts`)
- 数据库表已创建 (users, plans, documents, prompts)
- 数据服务层已实现 (`services/storage.ts`)
- 自动 fallback 机制(如果数据库不可用,自动使用 localStorage)

### ⚠️ 需要配置:
- Gemini API Key (必须配置才能使用 AI 功能)

---

## 📋 配置步骤

### 1. 配置 Gemini API Key

编辑 `.env.development` 文件:

```bash
VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

获取 API Key: https://aistudio.google.com/app/apikey

### 2. 验证数据库连接

运行测试脚本:

```bash
npx tsx test-db.ts
```

应该看到:
```
✅ Connection successful!
📋 Tables in database:
   - documents
   - plans
   - prompts
   - users
```

### 3. 启动应用

```bash
npm run dev
```

访问: http://localhost:3001

---

## 🗄️ 数据库架构

### Users 表
```typescript
{
  id: UUID (主键)
  name: string
  strengthsRawText: text
  topStrengths: string[] (JSONB)
  createdAt: timestamp
}
```

### Plans 表
```typescript
{
  id: string (主键)
  userId: UUID (外键 → users)
  goal: string
  tasks: Task[] (JSONB)
  energyDistribution: object[] (JSONB)
  journalNotes: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Documents 表
```typescript
{
  id: string (主键)
  userId: UUID (外键 → users)
  title: string
  category: string
  blocks: DocBlock[] (JSONB)
  lastModified: timestamp
}
```

### Prompts 表
```typescript
{
  id: string (主键)
  userId: UUID (外键 → users)
  title: string
  content: text
  category: string
  usageCount: integer
  tags: string[] (JSONB)
  createdAt: timestamp
}
```

---

## 🔧 常用命令

### 生成新的 migration
```bash
npx drizzle-kit generate
```

### 推送到数据库
```bash
npx drizzle-kit push
```

### 查看数据库状态
```bash
npx drizzle-kit studio
```
然后访问 https://local.drizzle.studio

---

## 🛡️ 安全提示

⚠️ **重要**: 当前配置将数据库凭证暴露在客户端代码中(通过 `VITE_` 前缀)。

**这仅适用于开发/演示环境!**

### 生产环境建议:
1. 创建 Next.js/Express 后端 API
2. 将数据库操作移到服务器端
3. 客户端通过 API 调用访问数据
4. 使用环境变量保护敏感信息

---

## 🎉 功能特性

### 数据持久化
- ✅ 所有用户数据保存到 PostgreSQL
- ✅ 跨设备同步 (同一数据库)
- ✅ 数据备份和恢复
- ✅ 支持多用户 (通过 userId 关联)

### Fallback 机制
如果数据库连接失败,应用会自动切换到 localStorage,确保应用仍可使用。

### 测试
运行 `npx tsx test-db.ts` 可以:
- 验证数据库连接
- 查看表结构
- 检查数据记录数量

---

## 🐛 故障排查

### 问题: "DATABASE_URL not found"
**解决**: 检查 `.env.development` 文件中是否配置了 `VITE_DATABASE_URL`

### 问题: AI 功能不工作
**解决**: 配置 `VITE_GEMINI_API_KEY` 在 `.env.development` 文件中

### 问题: 数据未保存到数据库
**解决**:
1. 打开浏览器开发者工具 Console
2. 查看是否有 "Database error" 或 "falling back to localStorage" 警告
3. 运行 `npx tsx test-db.ts` 验证数据库连接

---

## 📚 相关文档

- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon Postgres](https://neon.tech/)
- [Gemini API](https://ai.google.dev/)
