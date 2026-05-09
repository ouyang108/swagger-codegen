# swagger-codegen



根据 Swagger / OpenAPI 文档自动生成 TypeScript 请求函数的 CLI 工具。

## 特性

- 支持 Swagger 2.0 / OpenAPI 3.0 远程 URL 或本地文件
- 按 URL 第一段自动分组，生成对应目录结构
- 自动提取请求体、响应体类型，生成强类型函数签名
- 统一输出 `types.ts` 全局接口定义文件
- 每个请求函数内置 `AbortController`，支持取消请求
- 生成文件默认输出到**执行命令所在项目**的根目录

## 安装

```bash
npm install -g @ouyangtianfeng/swagger-codegen
# 或
pnpm add -g @ouyangtianfeng/swagger-codegen
```

## 使用

```bash
swagger-codegen init <url> [--out <dir>]
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `url` | Swagger 文档地址（URL 或本地路径） | 必填 |
| `--out` | 输出目录，相对于当前工作目录 | `output` |

### 示例

```bash
# 远程 URL，输出到 ./output
swagger-codegen init https://petstore.swagger.io/v2/swagger.json

# 指定输出目录
swagger-codegen init https://petstore.swagger.io/v2/swagger.json --out src/api

# 本地文件
swagger-codegen init ./swagger.json --out src/api

# 或通过 npx 直接使用（无需安装）
npx @ouyangtianfeng/swagger-codegen init https://petstore.swagger.io/v2/swagger.json
```

## 输出结构

```
output/
├── types.ts          # 全局接口定义（来自 definitions / components.schemas）
├── pet/
│   └── index.ts      # /pet/** 相关接口
├── store/
│   └── index.ts      # /store/** 相关接口
└── user/
    └── index.ts      # /user/** 相关接口
```

## 生成代码示例

**`output/types.ts`**

```ts
export interface User {
  id?: number;
  username?: string;
  email?: string;
}
```

**`output/user/index.ts`**

```ts
import request from '@/request/index';
import type { User } from '../types';

export const createUser = async (data: User): Promise<{ promise: Promise<User>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<User>('/user', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};
```

每个函数均返回 `{ promise, cancel }`，可在组件卸载时调用 `cancel()` 中止请求。

## 本地开发

```bash
pnpm install

# 直接运行源码（无需构建）
npx tsx index.ts init <url>

# 构建
pnpm build

# 运行构建产物
node dist/index.js init <url>
```

## License

ISC
