import { ChatOpenAI } from "@langchain/openai";
import { OpenCanvasGraphAnnotation, OpenCanvasGraphReturnType } from "../state";
import { FOLLOWUP_ARTIFACT_PROMPT } from "../prompts";
import { ensureStoreInConfig, formatReflections } from "../../utils";
import { Reflections } from "../../../types";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getArtifactContent } from "../../../hooks/use-graph/utils";
import { isArtifactMarkdownContent } from "../../../lib/artifact_content_types";

/**
 * Generate a followup message after generating or updating an artifact.
 */
export const generateFollowup = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  const smallModel = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.5,
    maxTokens: 250,
  });

  const store = ensureStoreInConfig(config);
  const assistantId = config.configurable?.assistant_id;
  if (!assistantId) {
    throw new Error("`assistant_id` not found in configurable");
  }
  const memoryNamespace = ["memories", assistantId];
  const memoryKey = "reflection";
  const memories = await store.get(memoryNamespace, memoryKey);

  // Initialize reflections properly
  const reflections: Reflections = {
    styleRules: [],
    content: [],
  };

  // Only populate reflections if memories.value exists and has the correct shape
  if (memories?.value && typeof memories.value === "object") {
    if (memories.value.styleRules) {
      reflections.styleRules = Array.isArray(memories.value.styleRules)
        ? memories.value.styleRules
        : [String(memories.value.styleRules)];
    }
    if (memories.value.content) {
      reflections.content = Array.isArray(memories.value.content)
        ? memories.value.content
        : [String(memories.value.content)];
    }
  }

  const memoriesAsString = formatReflections(reflections, {
    onlyContent: true,
  });

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;

  const artifactContent = currentArtifactContent
    ? isArtifactMarkdownContent(currentArtifactContent)
      ? currentArtifactContent.fullMarkdown
      : currentArtifactContent.code
    : undefined;

  const formattedPrompt = FOLLOWUP_ARTIFACT_PROMPT.replace(
    "{artifactContent}",
    artifactContent || "No artifacts generated yet."
  )
    .replace("{reflections}", memoriesAsString)
    .replace(
      "{conversation}",
      state.messages
        .map((msg) => `<${msg.getType()}>\n${msg.content}\n</${msg.getType()}>`)
        .join("\n\n")
    );

  // TODO: Include the chat history as well.
  const response = await smallModel.invoke([
    { role: "user", content: formattedPrompt },
  ]);

  return {
    messages: [response],
  };
};
