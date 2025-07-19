# NTXCore API 文档

本文档详细描述了NTXCore系统的所有API端点、请求格式和响应格式。

## 目录

1. [认证模块 (Auth)](#1-认证模块-auth)
2. [用户模块 (User)](#2-用户模块-user)
3. [挖矿模块 (Mining)](#3-挖矿模块-mining)
4. [管理员模块 (Admin)](#4-管理员模块-admin)
5. [系统模块 (System)](#5-系统模块-system)

---

## 1. 认证模块 (Auth)

### 1.1 用户注册

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **权限**: 无需认证

**请求体**:
```json
{
  "email": "user@example.com",
  "nickname": "用户昵称",
  "verification_code": "123456",
  "password": "Password123",
  "invite_code": "ABCDEFGH"
}
```

**响应**:
- 成功 (201 Created):
  ```json
  {
    "message": "注册成功"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "错误信息"
  }
  ```
  可能的错误信息:
  - "无效的邮箱格式"
  - "密码必须为8-32个字符且包含一个大写字母"
  - "验证码无效"
  - "验证码已过期"
  - "验证码不存在或已使用"
  - "邮箱已被注册"
  - "邀请码无效或不存在"

### 1.2 用户登录

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **权限**: 无需认证

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "登录成功",
    "token": "jwt_token_string",
    "userId": 123,
    "nickname": "用户昵称",
    "isAdmin": false
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "邮箱或密码无效"
  }
  ```
- 失败 (403 Forbidden):
  ```json
  {
    "error": "用户账户被封禁"
  }
  ```

### 1.3 发送验证码

- **URL**: `/api/auth/send_verification_code`
- **Method**: `POST`
- **权限**: 无需认证

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "验证码已发送"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "需要有效的邮箱地址"
  }
  ```

### 1.4 忘记密码

- **URL**: `/api/auth/forgot_password`
- **Method**: `POST`
- **权限**: 无需认证

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "密码重置码已发送"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "邮箱未注册"
  }
  ```

### 1.5 重置密码

- **URL**: `/api/auth/reset_password`
- **Method**: `POST`
- **权限**: 无需认证

**请求体**:
```json
{
  "email": "user@example.com",
  "reset_code": "123456",
  "new_password": "NewPassword123"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "密码已重置"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "错误信息"
  }
  ```
  可能的错误信息:
  - "重置码无效或已过期"
  - "密码必须为8-32个字符且包含一个大写字母"

### 1.6 使用旧密码更新密码

- **URL**: `/api/auth/edit_password`
- **Method**: `PUT`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "密码已更新"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "旧密码不正确"
  }
  ```

---

## 2. 用户模块 (User)

### 2.1 获取用户信息

- **URL**: `/api/user/get_user_info`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "id": 123,
    "nickname": "用户昵称",
    "email": "user@example.com",
    "myInviteCode": "ABCDEFGH",
    "invitedBy": "inviter@example.com",
    "exp": 1000,
    "role": "Normal User",
    "usdtBalance": 100.0,
    "ntxBalance": 500.0,
    "bscAddress": "0x1234567890abcdef",
    "gntxBalance": 50.0,
    "invitedUserCount": 5
  }
  ```
- 失败 (404 Not Found):
  ```json
  {
    "error": "未找到该用户"
  }
  ```

### 2.2 USDT提现申请

- **URL**: `/api/user/want_withdraw_usdt`
- **Method**: `POST`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "amount": 100,
  "toAddress": "0x1234567890abcdef"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "USDT提现申请成功，等待管理员确认"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "错误信息"
  }
  ```
  可能的错误信息:
  - "提现金额必须大于0"
  - "提现地址无效，请提供有效的EVM地址"
  - "USDT余额不足"

### 2.3 NTX提现申请

- **URL**: `/api/user/want_withdraw_ntx`
- **Method**: `POST`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "amount": 100,
  "toAddress": "0x1234567890abcdef"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "NTX提现申请成功，等待管理员确认"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "错误信息"
  }
  ```
  可能的错误信息与USDT提现类似

### 2.4 获取我的团队

- **URL**: `/api/user/get_my_teams`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "email": "team_member1@example.com",
      "nickname": "团队成员1",
      "joined_at": "2025-01-01T00:00:00Z"
    },
    {
      "email": "team_member2@example.com",
      "nickname": "团队成员2",
      "joined_at": "2025-01-02T00:00:00Z"
    }
  ]
  ```

### 2.5 获取佣金记录

- **URL**: `/api/user/commission_records`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "invitee_email": "invitee1@example.com",
      "invitee_nickname": "被邀请人1",
      "amount": 10.0,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```

### 2.6 获取提现记录

- **URL**: `/api/user/withdrawal_records`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "amount": 100.0,
      "currency": "USDT",
      "to_address": "0x1234567890abcdef",
      "status": "pending",
      "created_at": "2025-01-01T00:00:00Z",
      "confirmed_at": null
    }
  ]
  ```

### 2.7 绑定BSC地址

- **URL**: `/api/user/bind_bsc_address`
- **Method**: `POST`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "bscAddress": "0x1234567890abcdef"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "BSC地址绑定成功"
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "无效的BSC地址格式"
  }
  ```

### 2.8 获取当前DAO拍卖

- **URL**: `/api/user/get_current_dao_auction`
- **Method**: `GET`
- **权限**: 无需认证

**响应**:
- 成功 (200 OK):
  ```json
  {
    "isAuctionInProgress": true,
    "startTime": "2025-01-01T00:00:00Z",
    "endTime": "2025-01-08T00:00:00Z",
    "adminBscAddress": "0x1234567890abcdef"
  }
  ```

### 2.9 获取学院文章列表

- **URL**: `/api/user/get_articles`
- **Method**: `GET`
- **权限**: 无需认证

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "title": "文章标题",
      "summary": "文章摘要",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```

### 2.10 获取文章详情

- **URL**: `/api/user/get_article_detail/{id}`
- **Method**: `GET`
- **权限**: 无需认证

**参数**:
- `id`: 文章ID (路径参数)

**响应**:
- 成功 (200 OK):
  ```json
  {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容",
    "created_at": "2025-01-01T00:00:00Z"
  }
  ```
- 失败 (404 Not Found):
  ```json
  {
    "error": "文章不存在"
  }
  ```

### 2.11 更新用户昵称

- **URL**: `/api/user/nickname`
- **Method**: `PUT`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "nickname": "新昵称"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "昵称更新成功"
  }
  ```

---

## 3. 挖矿模块 (Mining)

### 3.1 获取平台数据

- **URL**: `/api/mining/platform_data`
- **Method**: `GET`
- **权限**: 无需认证

**响应**:
- 成功 (200 OK):
  ```json
  {
    "total_mined": 1000000.0,
    "total_commission": 50000.0,
    "total_burned": 20000.0,
    "total_trading_volume": 5000000.0,
    "platform_users": 1000
  }
  ```

### 3.2 获取每日平台数据

- **URL**: `/api/mining/daily_platform_data`
- **Method**: `GET`
- **权限**: 无需认证

**查询参数**:
- `date`: 日期，格式为YYYY-MM-DD

**响应**:
- 成功 (200 OK):
  ```json
  {
    "mining_output": 10000.0,
    "burned": 1000.0,
    "commission": 500.0,
    "trading_volume": 50000.0,
    "miners": 100
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "无效的日期格式，应为YYYY-MM-DD"
  }
  ```

### 3.3 获取交易所列表

- **URL**: `/api/mining/get_exchanges`
- **Method**: `GET`
- **权限**: 无需认证

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "name": "Binance",
      "logo_url": "https://example.com/binance.png",
      "mining_efficiency": 1.0,
      "is_active": true
    }
  ]
  ```

### 3.4 绑定交易所

- **URL**: `/api/mining/bind_exchange`
- **Method**: `POST`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "exchange_id": 1,
  "exchange_uid": "user_exchange_id"
}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "交易所绑定成功"
  }
  ```

### 3.5 获取用户绑定的交易所

- **URL**: `/api/mining/user_exchanges`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "name": 123,
      "logo_url": "https://example.com/binance.png",
      "mining_efficiency": 1.0
    }
  ]
  ```

### 3.6 获取用户总数据

- **URL**: `/api/mining/user_data`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "total_mining": 1000.0,
    "total_trading_cost": 500.0
  }
  ```

### 3.7 获取用户每日数据

- **URL**: `/api/mining/daily_user_data`
- **Method**: `GET`
- **权限**: 需要JWT认证

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**查询参数**:
- `date`: 日期，格式为YYYY-MM-DD

**响应**:
- 成功 (200 OK):
  ```json
  {
    "mining_output": 10.0,
    "total_trading_cost": 5.0
  }
  ```
- 失败 (400 Bad Request):
  ```json
  {
    "error": "无效的日期格式，应为YYYY-MM-DD"
  }
  ```

### 3.8 获取挖矿排行榜

- **URL**: `/api/mining/mining_leaderboard`
- **Method**: `GET`
- **权限**: 无需认证

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "nickname": "用户1",
      "email_masked": "u***@example.com",
      "mining_amount": 5000.0
    },
    {
      "nickname": "用户2",
      "email_masked": "u***@example.com",
      "mining_amount": 4500.0
    }
  ]
  ```

---

## 4. 管理员模块 (Admin)

所有管理员API都需要管理员权限和AdminAuth中间件验证。

### 4.1 获取仪表盘数据

- **URL**: `/api/admin/get_dashboard_data`
- **Method**: `GET`
- **权限**: 需要管理员权限

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "total_users": 1000,
    "active_users": 800,
    "total_mining": 1000000.0,
    "total_trading_volume": 5000000.0,
    "pending_withdrawals": 50
  }
  ```

### 4.2 获取所有用户

- **URL**: `/api/admin/get_all_users`
- **Method**: `GET`
- **权限**: 需要管理员权限

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  [
    {
      "id": 1,
      "email": "user1@example.com",
      "nickname": "用户1",
      "is_active": true,
      "invite_code": "ABC123",
      "invited_by": "admin@example.com",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```

### 4.3 管理员添加用户

- **URL**: `/api/admin/add_user_by_admin`
- **Method**: `POST`
- **权限**: 需要管理员权限

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**请求体**:
```json
{
  "email": "newuser@example.com",
  "nickname": "新用户",
  "password": "Password123",
  "invite_code": "ABC123"
}
```

**响应**:
- 成功 (201 Created):
  ```json
  {
    "message": "用户创建成功"
  }
  ```

### 4.4 获取用户完整信息

- **URL**: `/api/admin/get_user_full_info`
- **Method**: `GET`
- **权限**: 需要管理员权限

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**查询参数**:
- `user_id`: 用户ID

**响应**:
- 成功 (200 OK):
  ```json
  {
    "id": 1,
    "email": "user1@example.com",
    "nickname": "用户1",
    "is_active": true,
    "usdt_balance": 100.0,
    "ntx_balance": 500.0,
    "gntx_balance": 50.0,
    "invite_code": "ABC123",
    "invited_by": "admin@example.com",
    "is_admin": false,
    "created_at": "2025-01-01T00:00:00Z",
    "bound_exchanges": [
      {
        "exchange_id": 1,
        "exchange_name": "Binance",
        "exchange_uid": "user_exchange_id"
      }
    ]
  }
  ```

## 5. 系统模块 (System)

### 5.1 触发每日结算

- **URL**: `/api/system/trigger_daily_settlement`
- **Method**: `POST`
- **权限**: 需要管理员权限

**请求头**:
```
Authorization: Bearer {jwt_token}
```

**响应**:
- 成功 (200 OK):
  ```json
  {
    "message": "每日结算已触发",
    "processed_users": 1000,
    "total_mining": 10000.0
  }
  ```

---

## 身份验证

大多数API都需要JWT身份验证。在请求头中加入以下内容：

```
Authorization: Bearer {jwt_token}
```

JWT token可以通过登录API获取。token有效期为128小时。

## 错误处理

API返回以下HTTP状态码：

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权访问
- `403 Forbidden`: 禁止访问
- `404 Not Found`: 资源未找到
- `500 Internal Server Error`: 服务器内部错误

错误响应格式：
```json
{
  "error": "错误信息"
}
```

## API基础URL

所有API都以 `/api` 为前缀，后接具体模块名称，如 `/api/auth`, `/api/user`, `/api/mining`, `/api/admin`, `/api/system`。
