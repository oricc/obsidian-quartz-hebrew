import { QuartzTransformerPlugin } from "../types"
import rehypeRewrite, { RehypeRewriteOptions } from "rehype-rewrite"

export const TextDirection: QuartzTransformerPlugin = () => ({
  name: "AutoTextDirection",
  htmlPlugins() {
    return [
      [
        rehypeRewrite,
        {
          selector: "p",
          rewrite(node, index, parent) {
            if (node.type == "element") {
              node.properties = { ...node.properties, dir: "auto" }
            }
          },
        } satisfies Partial<RehypeRewriteOptions>,
      ],
    ]
  },
})
