import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import fsExtra from "fs-extra";
const { outputFileSync } = fsExtra;
import { join } from "pathe";
import pc from "picocolors";

// ─── 类型转换工具 ────────────────────────────────────────────────────────────

/**
 * 将 JSON Schema 转换为 TypeScript 类型字符串
 * 返回类型字符串，若无法识别则返回 "any"
 */
function schemaToTS(schema: any): string {
  if (!schema) return "any";

  // $ref 直接取末段作为类型名，例如 "#/definitions/User" → "User"
  if (schema.$ref) return schema.$ref.split("/").pop() ?? "any";

  if (schema.allOf) return schema.allOf.map(schemaToTS).join(" & ") || "any";
  if (schema.oneOf) return schema.oneOf.map(schemaToTS).join(" | ") || "any";
  if (schema.anyOf) return schema.anyOf.map(schemaToTS).join(" | ") || "any";

  switch (schema.type) {
    case "string":
      // 枚举类型生成联合字面量
      if (schema.enum) return schema.enum.map((e: string) => `"${e}"`).join(" | ");
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return `Array<${schemaToTS(schema.items)}>`;
    case "object":
      return buildObjectType(schema);
    default:
      return "any";
  }
}

/** 将 object schema 转为内联对象类型字符串：{ id: number; name?: string } */
function buildObjectType(schema: any): string {
  if (!schema.properties) return "Record<string, any>";
  const required = new Set<string>(schema.required ?? []);
  const props = Object.entries(schema.properties)
    .map(([k, v]) => `${k}${required.has(k) ? "" : "?"}: ${schemaToTS(v)}`)
    .join("; ");
  return `{ ${props} }`;
}

/**
 * 将 schema 转换为 TypeScript interface 或 type alias 声明
 * 对象类型生成 interface，其余生成 type alias
 */
function schemaToInterface(name: string, schema: any): string {
  const hasProps = schema.properties || schema.type === "object";

  if (hasProps) {
    const required = new Set<string>(schema.required ?? []);
    const props = Object.entries(schema.properties ?? {})
      .map(([k, v]) => `  ${k}${required.has(k) ? "" : "?"}: ${schemaToTS(v)};`)
      .join("\n");
    return `export interface ${name} {\n${props}\n}`;
  }

  return `export type ${name} = ${schemaToTS(schema)};`;
}

// ─── 请求 / 响应类型提取 ──────────────────────────────────────────────────────

/**
 * 从 operation 中提取请求体 schema
 * - v3: requestBody.content["application/json"].schema
 * - v2: body 参数的 schema；GET 时取 query 参数构造对象类型
 */
function getRequestSchema(operation: any): any {
  // OpenAPI v3
  if (operation.requestBody) {
    return (
      operation.requestBody?.content?.["application/json"]?.schema ??
      operation.requestBody?.content?.["*/*"]?.schema ??
      null
    );
  }

  // Swagger v2: body 参数
  const bodyParam = (operation.parameters ?? []).find((p: any) => p.in === "body");
  if (bodyParam?.schema) return bodyParam.schema;

  // 查询参数：构造虚拟 object schema
  const queryParams: any[] = (operation.parameters ?? []).filter(
    (p: any) => p.in === "query",
  );
  if (queryParams.length === 0) return null;

  const properties: Record<string, any> = {};
  const required: string[] = [];
  for (const p of queryParams) {
    properties[p.name] = p.schema ?? { type: p.type ?? "string" };
    if (p.required) required.push(p.name);
  }
  return { type: "object", properties, required };
}

/**
 * 从 operation 中提取成功响应（200/201）的 schema
 * - v3: responses["200"].content["application/json"].schema
 * - v2: responses["200"].schema
 */
function getResponseSchema(operation: any): any {
  const code = ["200", "201"].find((c) => operation.responses?.[c]);
  if (!code) return null;
  const resp = operation.responses[code];
  // OpenAPI v3
  if (resp.content) return resp.content?.["application/json"]?.schema ?? null;
  // Swagger v2
  return resp.schema ?? null;
}

// ─── 函数名生成 ───────────────────────────────────────────────────────────────

/** 路径段转 PascalCase，路径参数 {id} → ById */
function segmentToPascal(seg: string): string {
  if (seg.startsWith("{") && seg.endsWith("}")) {
    const name = seg.slice(1, -1);
    return "By" + name.charAt(0).toUpperCase() + name.slice(1);
  }
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

/** /user/login + post → postUserLogin */
function buildFunctionName(urlPath: string, method: string): string {
  const pascal = urlPath.split("/").filter(Boolean).map(segmentToPascal).join("");
  return method.toLowerCase() + pascal;
}

/** 取 URL 第一段作为分组目录，/user/login → user */
function getGroup(urlPath: string): string {
  return urlPath.split("/").filter(Boolean)[0] ?? "common";
}

// ─── 代码生成 ─────────────────────────────────────────────────────────────────

/** 生成单个请求函数代码，携带具体的请求/响应类型 */
function buildFunction(
  urlPath: string,
  method: string,
  operationId: string | undefined,
  requestType: string,
  responseType: string,
): string {
  const fnName = operationId ?? buildFunctionName(urlPath, method);
  const httpMethod = method.toLowerCase();
  const isBody = ["post", "put", "patch"].includes(httpMethod);
  const requestCall = isBody
    ? `request.${httpMethod}<${responseType}>('${urlPath}', data, { signal: controller.signal })`
    : `request.${httpMethod}<${responseType}>('${urlPath}', { params: data, signal: controller.signal })`;

  return `
export const ${fnName} = async (data: ${requestType}): Promise<{ promise: Promise<${responseType}>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = ${requestCall};

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};`;
}

/** 文件头注释 + import */
function buildHeader(extraImports: string): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  return `/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : ${now}
 * @Description  :
 */
import request from '@/request/index';
${extraImports}`;
}

// ─── 全局 types.ts 生成 ───────────────────────────────────────────────────────

/**
 * 将文档中所有 definitions/components.schemas 转换为 types.ts 的内容
 */
function buildTypesFile(api: OpenAPI.Document): string {
  const doc = api as any;
  const schemas: Record<string, any> =
    doc.definitions ?? doc.components?.schemas ?? {};

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const header = `/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : ${now}
 * @Description  : Auto-generated types from Swagger/OpenAPI document
 */
`;

  const defs = Object.entries(schemas)
    .map(([name, schema]) => schemaToInterface(name, schema))
    .join("\n\n");

  return header + "\n" + defs + "\n";
}

// ─── 入口 ─────────────────────────────────────────────────────────────────────

interface EndpointEntry {
  urlPath: string;
  method: string;
  operationId?: string;
  requestSchema: any;
  responseSchema: any;
}

/**
 * 根据解析后的 OpenAPI 文档，按路径分组生成 TS 请求文件
 * @param api    解析后的 OpenAPI 文档
 * @param outDir 输出目录，默认 ./output
 */
export function generateCode(api: OpenAPI.Document, outDir = "./output"): void {
  const paths = (api as OpenAPIV2.Document | OpenAPIV3.Document).paths ?? {};

  // 收集所有全局 schema 名称，用于判断 $ref 是否需要 import
  const doc = api as any;
  const globalSchemas = new Set<string>(
    Object.keys(doc.definitions ?? doc.components?.schemas ?? {}),
  );

  // 按 URL 第一段分组
  const groups = new Map<string, EndpointEntry[]>();

  for (const [urlPath, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    const methods = ["get", "post", "put", "delete", "patch"] as const;

    for (const method of methods) {
      const operation = (pathItem as any)[method] as any;
      if (!operation) continue;

      const group = getGroup(urlPath);
      if (!groups.has(group)) groups.set(group, []);

      groups.get(group)!.push({
        urlPath,
        method,
        operationId: operation.operationId,
        requestSchema: getRequestSchema(operation),
        responseSchema: getResponseSchema(operation),
      });
    }
  }

  // 写出 types.ts（如果有全局 schema）
  if (globalSchemas.size > 0) {
    const typesPath = join(outDir, "types.ts");
    outputFileSync(typesPath, buildTypesFile(api), "utf-8");
    console.log(pc.cyan(`⠿ 已生成`) + pc.gray(` ${typesPath}`));
  }

  const total = groups.size;
  console.log(pc.cyan(`⠿ 共发现 ${pc.bold(String(total))} 个分组，开始生成文件...`));

  let fileCount = 0;
  for (const [group, entries] of groups) {
    // 收集本文件引用到的全局类型名，生成 import 语句
    const usedTypes = new Set<string>();

    const functions = entries.map(({ urlPath, method, operationId, requestSchema, responseSchema }) => {
      // 解析请求类型
      let reqType = "any";
      if (requestSchema) {
        const refName = requestSchema.$ref?.split("/").pop();
        reqType = refName ?? schemaToTS(requestSchema);
        if (refName && globalSchemas.has(refName)) usedTypes.add(refName);
      }

      // 解析响应类型
      let resType = "void";
      if (responseSchema) {
        const refName = responseSchema.$ref?.split("/").pop();
        resType = refName ?? schemaToTS(responseSchema);
        if (refName && globalSchemas.has(refName)) usedTypes.add(refName);
      }

      return buildFunction(urlPath, method, operationId, reqType, resType);
    });

    // 生成 types 导入行
    const importLine =
      usedTypes.size > 0
        ? `import type { ${[...usedTypes].join(", ")} } from '../types';\n`
        : "";

    const content = buildHeader(importLine) + functions.join("\n") + "\n";

    const filePath = join(outDir, group, "index.ts");
    outputFileSync(filePath, content, "utf-8");

    fileCount++;
    console.log(
      pc.green(`✔ [${fileCount}/${total}]`) +
        pc.gray(` ${filePath}`) +
        pc.dim(` (${entries.length} 个接口)`),
    );
  }

  console.log(pc.green(`\n✔ 生成完成`) + pc.gray(` — 共 ${fileCount} 个文件输出至 ${outDir}`));
}
