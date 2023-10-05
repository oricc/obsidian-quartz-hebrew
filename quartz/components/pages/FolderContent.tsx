import { QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import path from "path"

import style from "../styles/listPage.scss"
import { PageList } from "../PageList"
import { _stripSlashes, simplifySlug } from "../../util/path"
import { Root } from "hast"
import { hebrewPluralize } from "../../util/lang"
import { ExplorerNode, FileNode, Options } from "../ExplorerNode"
import { QuartzPluginData } from "../../plugins/vfile"

function FolderContent(props: QuartzComponentProps) {
  const { tree, fileData, allFiles } = props
  const folderSlug = _stripSlashes(simplifySlug(fileData.slug!))
  const allPagesInFolder = allFiles.filter((file) => {
    const fileSlug = _stripSlashes(simplifySlug(file.slug!))
    const prefixed = fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug
    const folderParts = folderSlug.split(path.posix.sep)
    const fileParts = fileSlug.split(path.posix.sep)
    const isDirectChild = fileParts.length === folderParts.length + 1
    return prefixed && isDirectChild
  })

  const listProps = {
    ...props,
    allFiles: allPagesInFolder,
  }

  const content =
    (tree as Root).children.length === 0
      ? fileData.description
      : // @ts-ignore
        toJsxRuntime(tree, { Fragment, jsx, jsxs, elementAttributeNameCase: "html" })



// Options interface defined in `ExplorerNode` to avoid circular dependency
const defaultOptions = {
  title: "מגלה הקבצים",
  folderClickBehavior: "link",
  folderDefaultState: "open",
  useSavedState: true,
  sortFn: (a, b) => {
    // Sort order: folders first, then files. Sort folders and files alphabetically
    if ((!a.file && !b.file) || (a.file && b.file)) {
      // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
      // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    if (a.file && !b.file) {
      return 1
    } else {
      return -1
    }
  },
  filterFn: (node) => node.name !== "tags",
  order: ["filter", "map", "sort"],
} satisfies Options

// Parse config
const opts: Options = { ...defaultOptions }

// memoized
let fileTree: FileNode
let jsonTree: string

function constructFileTree(allFiles: QuartzPluginData[]) {
  if (!fileTree) {
    // Construct tree from allFiles
    fileTree = new FileNode("")
    allFiles.forEach((file) => fileTree.add(file, 1))

    /**
     * Keys of this object must match corresponding function name of `FileNode`,
     * while values must be the argument that will be passed to the function.
     *
     * e.g. entry for FileNode.sort: `sort: opts.sortFn` (value is sort function from options)
     */
    const functions = {
      map: opts.mapFn,
      sort: opts.sortFn,
      filter: opts.filterFn,
    }

    // Execute all functions (sort, filter, map) that were provided (if none were provided, only default "sort" is applied)
    if (opts.order) {
      // Order is important, use loop with index instead of order.map()
      for (let i = 0; i < opts.order.length; i++) {
        const functionName = opts.order[i]
        if (functions[functionName]) {
          // for every entry in order, call matching function in FileNode and pass matching argument
          // e.g. i = 0; functionName = "filter"
          // converted to: (if opts.filterFn) => fileTree.filter(opts.filterFn)

          // @ts-ignore
          // typescript cant statically check these dynamic references, so manually make sure reference is valid and ignore warning
          fileTree[functionName].call(fileTree, functions[functionName])
        }
      }
    }

    // Get all folders of tree. Initialize with collapsed state
    const folders = fileTree.getFolderPaths(opts.folderDefaultState === "collapsed")

    // Stringify to pass json tree as data attribute ([data-tree])
    jsonTree = JSON.stringify(folders)
  }
}
constructFileTree(allFiles.filter(file => file.slug?.startsWith(folderSlug)))


  return (
    <div class="popover-hint">
      <article>
        <p>{content}</p>
      </article>
      <p dir="auto">{hebrewPluralize(allPagesInFolder.length, "מסמך", "מסמכים")} בתיקייה זו.</p>
      <div>
        <PageList {...listProps} />
      </div>
      <div id="folder-explorer-content">
        {/*  @ts-ignore */}
        <ExplorerNode node={fileTree} opts={opts} fileData={fileData} fullPath={folderSlug}/>
      </div>
    </div>
  )
}

FolderContent.css = style + PageList.css
export default (() => FolderContent) satisfies QuartzComponentConstructor
