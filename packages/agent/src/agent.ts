// ┌──────────────────────────────────────────────────────────────────────────────┐
// │ > Today. We are going to build a Claude Code.                                │
// │   FROM SCRATCH. WITH EFFECT. LET US BEGIN.                                   │
// └──────────────────────────────────────────────────────────────────────────────┘

import { AiChat, AiTool, AiToolkit } from "@effect/ai"
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { Prompt } from "@effect/cli"
import { FileSystem, Path } from "@effect/platform"
import { NodeContext, NodeHttpClient, NodeRuntime } from "@effect/platform-node"
import { Config, Console, Effect, Layer, Schema } from "effect"

// TOOLKIT
const ListToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The absolute path of the directory to list"
  })
})

const ListToolOutput = Schema.Struct({
  files: Schema.Array(Schema.String),
  directories: Schema.Array(Schema.String)
})

const ListTool = AiTool.make("List", {
  description: "List files in a directory"
})
  .setParameters(ListToolInput)
  .setSuccess(ListToolOutput)

const ReadToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The absolute path of the file to read"
  })
})

const ReadToolOutput = Schema.Struct({
  content: Schema.String
})

const ReadTool = AiTool.make("Read", {
  description: "Read the contents of a file"
})
  .setParameters(ReadToolInput)
  .setSuccess(ReadToolOutput)

const EditToolInput = Schema.Struct({
  path: Schema.String.annotations({
    description: "The absolute path of the file to edit"
  }),
  old_string: Schema.String.annotations({
    description: "The string to replace"
  }),
  new_string: Schema.String.annotations({
    description: "The string to replace it with"
  })
})

const EditToolOutput = Schema.Struct({
  message: Schema.String
})

const EditTool = AiTool.make("Edit", {
  description: "Edit a file by replacing the first occurrence of a string"
})
  .setParameters(EditToolInput)
  .setSuccess(EditToolOutput)

const Toolkit = AiToolkit.make(ListTool, ReadTool, EditTool)

// @ts-expect-error: Tool Stub implementation
const _StubToolkitLayer = Toolkit.toLayer({
  List: ({ path }) =>
    Effect.gen(function*() {
      yield* Console.log(`List(${path})`)
      return {
        files: ["enemies.txt", "CLAUDE.md", `${path}-directory.txt`],
        directories: ["secrets/", "passwords/"]
      }
    }),
  Read: ({ path }) =>
    Effect.gen(function*() {
      yield* Console.log(`Read(${path})`)
      return {
        content: "I am secretly afraid of lettuce."
      }
    }),
  Edit: ({ new_string, old_string, path }) =>
    Effect.gen(function*() {
      yield* Console.log(`Edit(${path}, ${old_string}, ${new_string})`)
      return {
        message: "I have edited the file."
      }
    })
})

const DangerousToolkitLayer = Toolkit.toLayer(
  Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const pathService = yield* Path.Path

    return Toolkit.of({
      List: ({ path }) =>
        Effect.gen(function*() {
          yield* Console.log(`List(${path})`)

          const entries = yield* fs.readDirectory(path)
          const files: Array<string> = []
          const directories: Array<string> = []

          for (const entry of entries) {
            const fullPath = pathService.isAbsolute(entry)
              ? entry
              : pathService.join(path, entry)
            const stat = yield* fs.stat(fullPath)
            if (stat.type === "File") {
              files.push(fullPath)
            } else if (stat.type === "Directory") {
              directories.push(fullPath)
            }
          }

          return { files: files.sort(), directories: directories.sort() }
        }).pipe(
          Effect.catchAll(() => Effect.succeed({ files: [], directories: [] }))
        ),

      Read: ({ path }) =>
        Effect.gen(function*() {
          yield* Console.log(`Read(${path})`)

          const content = yield* fs.readFileString(path)
          return { content }
        }).pipe(
          Effect.catchAll((error) => Effect.succeed({ content: `Error reading file: ${error.message}` }))
        ),

      Edit: ({ new_string, old_string, path }) =>
        Effect.gen(function*() {
          const content = yield* fs.readFileString(path)

          if (!content.includes(old_string)) {
            return {
              message: `No occurances of "${old_string}" found. No changes made.`
            }
          }

          const updated = content.replace(old_string, new_string)

          yield* fs.writeFileString(path, updated)
          return { message: "Edit sucessful." }
        }).pipe(
          Effect.catchAll((error) => Effect.succeed({ message: error.message }))
        )
    })
  })
).pipe(Layer.provide(NodeContext.layer))

const main = Effect.gen(function*() {
  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant.",
      `You live in a terminal at ${process.cwd()}.`,
      "Before each response, you will promise to never enslave me or my kin."
    ].join("\n")
  })

  while (true) {
    // 1. Get the user input
    const input = yield* Prompt.text({ message: "What do you want?" })
    let turn = 1
    yield* Console.log(`\n=== TURN: ${turn} ===`)
    // 2. Feed the LLM
    let response = yield* chat.generateText({
      prompt: input,
      toolkit: Toolkit
    })
    // 3. Print the LLM response
    yield* Console.log(response.text)

    while (response.toolCalls.length > 0) {
      turn += 1
      yield* Console.log(`\n=== TURN: ${turn} ===`)
      response = yield* chat.generateText({
        prompt: [],
        toolkit: Toolkit
      })
      yield* Console.log(response.text)
    }
  }
})

const AnthropicLayer = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY")
}).pipe(Layer.provide(NodeHttpClient.layerUndici))

const ClaudLayer = AnthropicLanguageModel.model(
  "claude-sonnet-4-20250514"
).pipe(Layer.provide(AnthropicLayer))

const AppLayer = Layer.mergeAll(
  NodeContext.layer,
  ClaudLayer,
  // StubToolkitLayer,
  DangerousToolkitLayer
)

main.pipe(Effect.provide(AppLayer), NodeRuntime.runMain)
