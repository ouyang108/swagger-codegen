import { readFileSync } from "fs";
import type { OpenAPI } from "openapi-types";
import pc from "picocolors";

/**
 * 获取 Swagger/OpenAPI 文档原始 JSON，支持 HTTP URL 和本地文件路径
 * 直接 fetch/读取，不走 SwaggerParser 解析，避免 $ref 循环解析报错
 */
export async function parseSwagger(urlOrPath: string): Promise<OpenAPI.Document> {
  console.log(pc.cyan(`⠿ 正在获取: ${pc.bold(urlOrPath)}`));

  try {
    let json: OpenAPI.Document;

    if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
      // 远程 URL：使用 Node 内置 fetch（Node 18+）
      const res = await fetch(urlOrPath);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      json = (await res.json()) as OpenAPI.Document;
    } else {
      // 本地文件
      const content = readFileSync(urlOrPath, "utf-8");
      json = JSON.parse(content) as OpenAPI.Document;
    }

    const title = (json as any).info?.title ?? "未知";
    const version = (json as any).info?.version ?? "-";
    console.log(pc.green(`✔ 获取成功`) + pc.gray(` — ${title} v${version}`));
    return json;
  } catch (err) {
    console.error(pc.red(`✘ 获取失败: ${(err as Error).message}`));
    throw new Error(`Swagger 文档获取失败: ${(err as Error).message}`);
  }
}
