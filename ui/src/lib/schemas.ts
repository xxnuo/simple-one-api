import { z } from 'zod';

// 基础类型
const limitSchema = z.object({
  qps: z.number().optional(),
  qpm: z.number().optional(),
  rpm: z.number().optional(),
  concurrency: z.number().optional(),
  timeout: z.number().optional(),
});

const rangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

const modelParamsSchema = z.object({
  temperatureRange: rangeSchema,
  topPRange: rangeSchema,
  maxTokens: z.number(),
});

const credentialsSchema = z.record(z.string(), z.any());

// 服务模型
const serviceModelSchema = z.object({
  provider: z.string().optional(),
  embedding_models: z.array(z.string()).optional(),
  embedding_limit: limitSchema.optional(),
  models: z.array(z.string()),
  reasoning_models: z.record(z.string(), z.string()).optional(),
  enabled: z.boolean(),
  credentials: credentialsSchema,
  credential_list: z.array(credentialsSchema).optional(),
  server_url: z.string().optional(),
  model_map: z.record(z.string(), z.string()).optional(),
  model_redirect: z.record(z.string(), z.string()).optional(),
  limit: limitSchema.optional(),
  use_proxy: z.boolean().optional(),
  timeout: z.number().optional(),
});

// 代理配置
const proxySchema = z.object({
  strategy: z.string().optional(),
  type: z.string().optional(),
  http_proxy: z.string().optional(),
  https_proxy: z.string().optional(),
  socks5_proxy: z.string().optional(),
  timeout: z.number().optional(),
});

// 翻译配置
const translationSchema = z.object({
  enable: z.boolean().optional(),
  promptTemplate: z.string().optional(),
  retry: z.number().optional(),
  concurrency: z.number().optional(),
});

// API密钥配置
const apiKeyConfigSchema = z.object({
  api_key: z.string(),
  supported_models: z.record(z.string(), z.array(z.string())).optional(),
});

// 完整配置
export const configSchema = z.object({
  server_port: z.string(),
  debug: z.boolean().optional(),
  log_level: z.string().optional(),
  proxy: proxySchema.optional(),
  api_key: z.string(),
  load_balancing: z.string().optional(),
  multi_content_models: z.array(z.string()).optional(),
  model_redirect: z.record(z.string(), z.string()).optional(),
  params_range: z.record(z.string(), modelParamsSchema).optional(),
  services: z.record(z.string(), z.array(serviceModelSchema)),
  translation: translationSchema.optional(),
  enable_web: z.boolean().optional(),
  api_keys: z.array(apiKeyConfigSchema).optional(),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

// 登录表单
export const loginSchema = z.object({
  apiKey: z.string().min(1, '请输入API Key'),
});

export type LoginFormValues = z.infer<typeof loginSchema>; 