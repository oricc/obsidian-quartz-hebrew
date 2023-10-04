import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  getQuartzComponents() {
    return []
  },
  async emit({ argv, cfg }, _content, _resources, _emit): Promise<FilePath[]> {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    await fs.promises.cp(staticPath, joinSegments(argv.output, "static"), { recursive: true })

    // modules for rendering
    const modules = cfg.configuration.modulesToInclude;

    for(const module of modules){
      const staticPathModules = joinSegments('node_modules', module)
      const fpsModules = await glob("**", staticPathModules, cfg.configuration.ignorePatterns)
      await fs.promises.cp(staticPathModules, joinSegments(argv.output, "static",module), { recursive: true })
    }

    return fps.map((fp) => joinSegments(argv.output, "static", fp)) as FilePath[]
  },
})
