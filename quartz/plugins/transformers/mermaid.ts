import { QuartzTransformerPlugin } from "../types"
import rehypeMermaid, {RehypeMermaidOptions} from 'rehype-mermaidjs'

export const Mermaid: QuartzTransformerPlugin = () => ({
  name: "AutoTextDirection",
  htmlPlugins() {
    return [
      [
        rehypeMermaid,
        {
          strategy: 'inline-svg'
        } satisfies Partial<RehypeMermaidOptions>,
      ],
    ]
  },
})
