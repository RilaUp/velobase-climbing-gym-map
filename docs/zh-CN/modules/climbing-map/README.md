# Climbing Map 模块（launchpad_flow）

本文档用于承接 Launchpad 交接需求，并按 Harness Phase 0 输出领域设计与模块拆分。

## 入口确认

- 入口类型: launchpad_flow
- 结论: 交接信息完整，可直接进入实现

## 产品概要

```yaml
product:
  name: Velobase Climbing Gym Map
  one_liner: 面向中国攀岩者的岩馆地图与社区协作平台
  target_users:
    - consumer
    - marketplace
    - operator
  core_user_stories:
    - 作为攀岩者，我要按城市查看附近岩馆及路线信息，减少踩空。
    - 作为常去岩馆用户，我要查看换线时间和活动安排，规划出行。
    - 作为进阶玩家，我要提交线路质量和风格评价，帮助他人决策。
    - 作为社交需求用户，我要发布找搭子需求并匹配附近岩友。
    - 作为岩馆运营方，我要购买推广位提高曝光和活动转化。
  business_model: hybrid
  ai_capabilities:
    - analysis
  target_regions:
    - CN
  third_party_services:
    - AMap
    - NextAuth
    - Stripe
    - PostHog
    - Resend
    - BullMQ
```

## 核心业务域分析

### 1) 业务对象

- 岩馆: 地理位置、联系方式、数据来源、可信状态
- 换线计划: 岩馆分区、换线日期、补充说明
- 活动: 时间、价格、报名入口、状态
- 线路评价: 难度、风格、质量评分、文本评价
- 搭子帖: 城市、目标岩馆、可约时间、联系方式、状态
- 用户补充信息: 对岩馆/活动/线路的待审核贡献
- 商业化对象: 岩馆推广位、品牌广告活动、活动票务订单

### 2) 用户关键动作

- 搜索并筛选岩馆
- 查询换线时间
- 查看活动并跳转报名
- 提交线路评价
- 发布找搭子帖/浏览搭子帖
- 提交信息补充（待审核）
- 岩馆购买推广位（后续）

### 3) 用户价值

- 降低信息碎片化成本
- 降低到馆后“线路不匹配”风险
- 提高活动参与率
- 提升同城社交效率
- 为岩馆和品牌提供精准触达

### 4) 影响商业模式或 MVP 闭环的规则

- 评价与补充信息必须关联用户与时间戳，保证可追溯
- 搭子帖需要过期机制，避免陈旧供需
- 推广位需有起止时间和状态，支持计费对账
- 活动票务订单必须记录平台手续费字段，支持分成
- 列表接口统一 cursor 分页（默认 20）保证性能和可扩展

## 领域决策

```yaml
domains:
  user:
    - auth_methods: [nextauth_google, nextauth_github, email]
    - roles_permissions: [user, admin]
    - profile_fields: [name, city(optional), climbing_style(optional)]
  billing:
    - billing_model: hybrid
    - sku_catalog: [gym_promotion_slot, brand_campaign_package, activity_ticket_fee]
    - credit_consumption: []
  operations:
    - analytics_events: [gym_viewed, route_review_created, partner_post_created, gym_update_submitted]
    - notifications: [partner_match_optional, activity_reminder_optional]
    - lifecycle_touch: [new_user_first_gym_view]
  integrations:
    - auth_provider: NextAuth (enable)
    - payment_provider: Stripe (enable)
    - email_provider: Resend (later)
    - storage_provider: framework storage (disable for MVP)
    - analytics_provider: PostHog (enable)
    - ai_provider: optional(OpenAI/Anthropic, later)
  non_functional:
    - security: login-required mutations, anti-abuse for public write endpoints (later)
    - deployment_mode: web,worker
    - observability: structured logger + PostHog
```

## 模块拆分

```yaml
modules:
  - name: climbing-map
    path: src/modules/climbing-map
    responsibilities:
      - gym_discovery
      - reset_schedule
      - activity_feed
      - route_reviews
      - partner_matching
      - user_submissions
      - monetization_scaffolding
    router:
      - procedure: listGyms
        type: query
        access: public
        pagination: true
      - procedure: listPartnerPosts
        type: query
        access: public
        pagination: true
      - procedure: createRouteReview
        type: mutation
        access: protected
        pagination: false
      - procedure: createPartnerPost
        type: mutation
        access: protected
        pagination: false
      - procedure: submitGymUpdate
        type: mutation
        access: protected
        pagination: false
```

## MVP 范围

```yaml
mvp_scope:
  product_name: Velobase Climbing Gym Map
  one_liner: 中国攀岩岩馆地图与搭子协作平台
  target_users: [consumer, marketplace]
  core_user_stories:
    - 城市内查岩馆
    - 看换线与活动
    - 贡献线路评价
    - 发布找搭子
  must_have_features:
    - 岩馆列表查询
    - 换线计划和活动基础展示
    - 线路质量评价提交
    - 搭子帖发布与浏览
    - 用户补充信息提交通道
  nice_to_have_features:
    - 地图点位聚类
    - 智能搭子推荐
    - 活动提醒通知
  explicitly_out_of_scope:
    - 自动抓取与持续同步高德地图（先手动导入）
    - 复杂广告投放系统
    - 完整活动票务闭环
  business_model: hybrid
  required_integrations:
    - NextAuth
    - Stripe
    - PostHog
    - AMap
  first_demo_path: 首页进入 /climbing -> 搜索岩馆 -> 选择岩馆 -> 提交评价或发布搭子
  acceptance_criteria:
    - 非登录用户可浏览岩馆和搭子信息
    - 登录用户可提交评价与搭子帖
    - 所有列表接口支持 cursor 分页
    - 数据模型覆盖推广位与票务分成字段
```

## 三方服务建议（仅配置说明）

- 必须配置:
  - NEXT_PUBLIC_AMAP_WEB_KEY: 前端地图展示与地理编码
  - AMAP_SECURITY_JS_CODE: 高德安全校验码（若前端域名限制启用）
  - DATABASE_URL / REDIS_*: 核心数据与队列
- 上线前建议配置:
  - NEXTAUTH_SECRET / OAuth keys: 登录体系
  - STRIPE_*: 推广位和票务支付
  - NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST / POSTHOG_API_KEY: 漏斗分析
- 可选增强:
  - RESEND_API_KEY: 活动提醒与匹配通知邮件
  - OPENAI_API_KEY 或 ANTHROPIC_API_KEY: 评价摘要和内容风控辅助

## 测试计划

```yaml
tests:
  - module: climbing-map
    service_unit: required
    router_integration: optional
    worker: optional
    e2e: optional
```
