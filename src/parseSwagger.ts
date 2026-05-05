import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI } from "openapi-types";
import pc from "picocolors";

/**
 * 解析 Swagger/OpenAPI 文档，支持本地文件路径和远程 URL
 * @param urlOrPath Swagger 文档的 URL 或本地文件路径
 * @returns 解析并验证后的 OpenAPI 文档对象
 */
export async function parseSwagger(urlOrPath: string): Promise<OpenAPI.Document> {
  console.log(pc.cyan(`⠿ 正在解析: ${pc.bold(urlOrPath)}`));

  try {
    // validate 会同时完成解析和校验，确保文档符合 OpenAPI 规范
    const api = await SwaggerParser.validate(urlOrPath);
    const title = (api as any).info?.title ?? "未知";
    const version = (api as any).info?.version ?? "-";
    console.log(pc.green(`✔ 解析成功`) + pc.gray(` — ${title} v${version}`));
    return api;
  } catch (err) {
    console.error(pc.red(`✘ 解析失败: ${(err as Error).message}`));
    throw new Error(`Swagger 文档解析失败: ${(err as Error).message}`);
  }
}
