import cac from "cac";
import { join } from "pathe";
import { parseSwagger } from "./parseSwagger";
import { generateCode } from "./generateCode";

const cli = cac("swagger");

// 注册 init 命令，接收 url 参数，--out 可指定输出目录（相对于执行命令的项目根目录）
cli
  .command("init <url>", "根据指定的 URL 初始化 swagger 配置")
  .option("--out <dir>", "输出目录，相对于当前工作目录", { default: "output" })
  .action(async (url: string, options: { out: string }) => {
    // process.cwd() 是执行命令时所在的目录，而非工具本身的目录
    const outDir = join(process.cwd(), options.out);
    const api = await parseSwagger(url);
    generateCode(api, outDir);
  });

// 解析命令行参数
cli.parse();

// 导出 cli 实例供外部使用
export { cli };
