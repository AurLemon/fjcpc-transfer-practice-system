```markdown
src
│
├── auth                    # 鉴权模块
│   ├── auth.controller.ts   # 处理登录/Token等接口
│   ├── auth.service.ts      # 处理登录、Token的业务逻辑
│   ├── auth.module.ts       # 鉴权模块
│   ├── auth.guard.ts        # 自定义守卫，验证Token
│   ├── jwt.strategy.ts      # JWT策略，解析和验证Token
│
├── common                   # 公共模块（包含加密、解密、返回API封装等）
│   ├── crypto.util.ts       # AES加密、解密工具
│   ├── rsa.util.ts          # RSA加密、解密工具
│   ├── api.response.ts      # API返回格式封装
│
├── config                   # 配置文件
│   ├── config.module.ts     # 导入配置文件
│   ├── config.service.ts    # 获取配置信息
│   ├── config.ts            # 存储私钥、公钥、数据库连接信息等
│
├── database                 # 数据库模块
│   ├── database.module.ts   # 数据库连接配置
│   ├── entities             # 实体类（用于TypeORM）
│   │   ├── user.entity.ts   # 用户表的实体定义
│   │   ├── token.entity.ts  # Token表的实体定义
│
├── user                     # 用户模块
│   ├── user.controller.ts   # 用户相关接口（注册、登录等）
│   ├── user.service.ts      # 用户业务逻辑处理
│   ├── user.module.ts       # 用户模块
│
├── app.module.ts            # 根模块，导入其他模块
├── main.ts                  # 应用入口
```