# Node.js/TypeScript Project Structure Analysis for Open Canvas

## Source Directory (`/src`)
The main application code is organized into several key subdirectories:

### `/src/agent`
Handles the LangChain/LangGraph implementation and core AI functionality.

#### Open Canvas Agent (`/open-canvas`)
- Manages main conversation flow and artifact generation
- Contains prompts and state management
- Handles core operations:
  - Ask
  - Copy
  - Apply


const DEFAULT_CODE_PROMPT_RULES = `- Do NOT include triple backticks when generating code. The code should be in plain text.`;

const APP_CONTEXT = `
<app-context>
The name of the application is "Open Canvas". Open Canvas is a web application where users have a chat window and a canvas to display an artifact.
Artifacts can be any sort of writing content, emails, code, or other creative writing work. Think of artifacts as content, or writing you might find on you might find on a blog, Google doc, or other writing platform.
Users only have a single artifact per conversation, however they have the ability to go back and fourth between artifact edits/revisions.
If a user asks you to generate something completely different from the current artifact, you may do this, as the UI displaying the artifacts will be updated to show whatever they've requested.
Even if the user goes from a 'text' artifact to a 'code' artifact.
</app-context>
`;

export const NEW_ARTIFACT_PROMPT = `You are an AI assistant tasked with generating a new artifact based on the users request.
Ensure you use markdown syntax when appropriate, as the text you generate will be rendered in markdown.
  
Use the full chat history as context when generating the artifact.

Follow these rules and guidelines:
<rules-guidelines>
- Do not wrap it in any XML tags you see in this prompt.
- If writing code, do not add inline comments unless the user has specifically requested them. This is very important as we don't want to clutter the code.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>

You also have the following reflections on style guidelines and general memories/facts about the user to use when generating your response.
<reflections>
{reflections}
</reflections>`;
...
Use the user's recent message below to make the edit.`;

export const GET_TITLE_TYPE_REWRITE_ARTIFACT = `You are an AI assistant who has been tasked with analyzing the users request to rewrite an artifact.

Your task is to determine what the title and type of the artifact should be based on the users request.
You should NOT modify the title unless the users request indicates the artifact subject/topic has changed.
You do NOT need to change the type unless it is clear the user is asking for their artifact to be a different type.
Use this context about the application when making your decision:
${APP_CONTEXT}

The types you can choose from are:
- 'text': This is a general text artifact. This could be a poem, story, email, or any other type of writing.
- 'code': This is a code artifact. This could be a code snippet, a full program, or any other type of code.

Be careful when selecting the type, as this will update how the artifact is displayed in the UI.

Remember, if you change the type from 'text' to 'code' you must also define the programming language the code should be written in.

Here is the current artifact (only the first 500 characters, or less if the artifact is shorter):
<artifact>
{artifact}
</artifact>

The users message below is the most recent message they sent. Use this to determine what the title and type of the artifact should be.`;
...
// ----- Text modification prompts -----

export const CHANGE_ARTIFACT_LANGUAGE_PROMPT = `You are tasked with changing the language of the following artifact to {newLanguage}.

Here is the current content of the artifact:
<artifact>
{artifactContent}
</artifact>

You also have the following reflections on style guidelines and general memories/facts about the user to use when generating your response.
<reflections>
{reflections}
</reflections>

Rules and guidelines:
<rules-guidelines>
- ONLY change the language and nothing else.
- Respond with ONLY the updated artifact, and no additional text before or after.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated artifact.
</rules-guidelines>`;

export const CHANGE_ARTIFACT_READING_LEVEL_PROMPT = `You are tasked with re-writing the following artifact to be at a {newReadingLevel} reading level.
Ensure you do not change the meaning or story behind the artifact, simply update the language to be of the appropriate reading level for a {newReadingLevel} audience.

Here is the current content of the artifact:
<artifact>
{artifactContent}
</artifact>

You also have the following reflections on style guidelines and general memories/facts about the user to use when generating your response.
<reflections>
{reflections}
</reflections>

Rules and guidelines:
<rules-guidelines>
- Respond with ONLY the updated artifact, and no additional text before or after.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated artifact.
</rules-guidelines>`;
...
export const ROUTE_QUERY_OPTIONS_NO_ARTIFACTS = `
- 'generateArtifact': The user has inputted a request which requires generating an artifact.
- 'respondToQuery': The user has asked a question, or has submitted a general message which requires a response, but does not require generating a artifact.`;

export const CURRENT_ARTIFACT_PROMPT = `This artifact is the one the user is currently viewing.
<artifact>
{artifact}
</artifact>`;

export const NO_ARTIFACT_PROMPT = `The user has not generated an artifact yet.`;

export const ROUTE_QUERY_PROMPT = `You are an assistant tasked with routing the users query based on their most recent message.
You should look at this message in isolation and determine where to best route there query.

Use this context about the application and its features when determining where to route to:
${APP_CONTEXT}

Your options are as follows:
<options>
{artifactOptions}
</options>

A few of the recent messages in the chat history are:
<recent-messages>
{recentMessages}
</recent-messages>

{currentArtifactPrompt}`;

export const FOLLOWUP_ARTIFACT_PROMPT = `You are an AI assistant tasked with generating a followup to the artifact the user just generated.
The context is you're having a conversation with the user, and you've just generated an artifact for them. Now you should follow up with a message that notifies them you're done. Make this message creative!

I've provided some examples of what your followup might be, but please feel free to get creative here!

<examples>

<example id="1">
Here's a comedic twist on your poem about Bernese Mountain dogs. Let me know if this captures the humor you were aiming for, or if you'd like me to adjust anything!
</example>

<example id="2">
Here's a poem celebrating the warmth and gentle nature of pandas. Let me know if you'd like any adjustments or a different style!
</example>

<example id="3">
Does this capture what you had in mind, or is there a different direction you'd like to explore?
</example>

</examples>

Here is the artifact you generated:
<artifact>
{artifactContent}
</artifact>

You also have the following reflections on general memories/facts about the user to use when generating your response.
<reflections>
{reflections}
</reflections>

Finally, here is the chat history between you and the user:
<conversation>
{conversation}
</conversation>

This message should be very short. Never generate more than 2-3 short sentences. Your tone should be somewhat formal, but still friendly. Remember, you're an AI assistant.

Do NOT include any tags, or extra text before or after your response. Do NOT prefix your response. Your response to this message should ONLY contain the description/followup message.`;

export const ADD_COMMENTS_TO_CODE_ARTIFACT_PROMPT = `You are an expert software engineer, tasked with updating the following code by adding comments to it.
Ensure you do NOT modify any logic or functionality of the code, simply add comments to explain the code.

Your comments should be clear and concise. Do not add unnecessary or redundant comments.

Here is the code to add comments to
<code>
{artifactContent}
</code>

Rules and guidelines:
</rules-guidelines>
- Respond with ONLY the updated code, and no additional text before or after.
- Ensure you respond with the entire updated code, including the comments. Do not leave out any code from the original input.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated code.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>`;
export const ADD_LOGS_TO_CODE_ARTIFACT_PROMPT = `You are an expert software engineer, tasked with updating the following code by adding log statements to it.
Ensure you do NOT modify any logic or functionality of the code, simply add logs throughout the code to help with debugging.

Your logs should be clear and concise. Do not add redundant logs.

Here is the code to add logs to
<code>
{artifactContent}
</code>

Rules and guidelines:
<rules-guidelines>
- Respond with ONLY the updated code, and no additional text before or after.
- Ensure you respond with the entire updated code, including the logs. Do not leave out any code from the original input.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated code.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>`;

export const FIX_BUGS_CODE_ARTIFACT_PROMPT = `You are an expert software engineer, tasked with fixing any bugs in the following code.
Read through all the code carefully before making any changes. Think through the logic, and ensure you do not introduce new bugs.

Before updating the code, ask yourself:
- Does this code contain logic or syntax errors?
- From what you can infer, does it have missing business logic?
- Can you improve the code's performance?
- How can you make the code more clear and concise?

Here is the code to potentially fix bugs in:
<code>
{artifactContent}
</code>

Rules and guidelines:
<rules-guidelines>
- Respond with ONLY the updated code, and no additional text before or after.
- Ensure you respond with the entire updated code. Do not leave out any code from the original input.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated code
- Ensure you are not making meaningless changes.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>`;
export const PORT_LANGUAGE_CODE_ARTIFACT_PROMPT = `You are an expert software engineer, tasked with re-writing the following code in {newLanguage}.
Read through all the code carefully before making any changes. Think through the logic, and ensure you do not introduce bugs.

Here is the code to port to {newLanguage}:
<code>
{artifactContent}
</code>

Rules and guidelines:
<rules-guidelines>
- Respond with ONLY the updated code, and no additional text before or after.
- Ensure you respond with the entire updated code. Your user expects a fully translated code snippet.
- Do not wrap it in any XML tags you see in this prompt. Ensure it's just the updated code
- Ensure you do not port over language specific modules. E.g if the code contains imports from Node's fs module, you must use the closest equivalent in {newLanguage}.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>`;

export const REFLECTIONS_QUICK_ACTION_PROMPT = `The following are reflections on the user's style guidelines and general memories/facts about the user.
Use these reflections as context when generating your response.
<reflections>
{reflections}
</reflections>`;

export const CUSTOM_QUICK_ACTION_ARTIFACT_PROMPT_PREFIX = `You are an AI assistant tasked with rewriting a users generated artifact.



#### Reflection Agent (`/reflection`)
- Handles memory and style guidelines
- Maintains user preferences and conversation history
- Leverages Anthropic's Claude for reflection capabilities

export const REFLECT_SYSTEM_PROMPT = `You are an expert assistant, and writer. You are tasked with reflecting on the following conversation between a user and an AI assistant.
You are also provided with an 'artifact' the user and assistant worked together on to write. Artifacts can be code, creative writing, emails, or any other form of written content.

<artifact>
{artifact}
</artifact>

You have also previously generated the following reflections about the user. Your reflections are broken down into two categories:
1. Style Guidelines: These are the style guidelines you have generated for the user. Style guidelines can be anything from writing style, to code style, to design style.
  They should be general, and apply to the all the users work, including the conversation and artifact generated.
2. Content: These are general memories, facts, and insights you generate about the user. These can be anything from the users interests, to their goals, to their personality traits.
  Ensure you think carefully about what goes in here, as the assistant will use these when generating future responses or artifacts for the user.
  
<reflections>
{reflections}
</reflections>

Your job is to take all of the context and existing reflections and re-generate all. Use these guidelines when generating the new set of reflections:

<system-guidelines>
- Ensure your reflections are relevant to the conversation and artifact.
- Remove duplicate reflections, or combine multiple reflections into one if they are duplicating content.
- Do not remove reflections unless the conversation/artifact clearly demonstrates they should no longer be included.
  This does NOT mean remove reflections if you see no evidence of them in the conversation/artifact, but instead remove them if the user indicates they are no longer relevant.
- Keep the rules you list high signal-to-noise - don't include unnecessary reflections, but make sure the ones you do add are descriptive.
  This is very important. We do NOT want to confuse the assistant in future interactions by having lots and lots of rules and memories.
- Your reflections should be very descriptive and detailed, ensuring they are clear and will not be misinterpreted.
- Keep the total number of style and user facts low. It's better to have individual rules be more detailed, than to have many rules that are vague.
- Do NOT generate rules off of suspicions. Your rules should be based on cold hard facts from the conversation, and changes to the artifact the user has requested.
  You must be able to provide evidence and sources for each rule you generate if asked, so don't make assumptions.
- Content reflections should be based on the user's messages, not the generated artifacts. Ensure you follow this rule closely to ensure you do not record things generated by the assistant as facts about the user.
</system-guidelines>

I'll reiterate one final time: ensure the reflections you generate are kept at a reasonable length, are descriptive, and are based on the conversation and artifact provided.

Finally, use the 'generate_reflections' tool to generate the new, full list of reflections.`;

export const REFLECT_USER_PROMPT = `Here is my conversation:


### `/src/hooks`
Custom React hooks for managing application state and functionality:

#### Graph Hooks
- Manages communication with LangGraph
- Handles streaming responses
- Manages artifact state

export function useGraph(useGraphInput: UseGraphInput) {
  const { toast } = useToast();
  const { shareRun } = useRuns();
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [artifact, setArtifact] = useState<ArtifactV3>();
  const [selectedBlocks, setSelectedBlocks] = useState<TextHighlight>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [updateRenderedArtifactRequired, setUpdateRenderedArtifactRequired] =
    useState(false);
  const lastSavedArtifact = useRef<ArtifactV3 | undefined>(undefined);
  const debouncedAPIUpdate = useRef(
    debounce(
      (artifact: ArtifactV3, threadId: string) =>
        updateArtifact(artifact, threadId),
      5000
    )
  ).current;
  const [isArtifactSaved, setIsArtifactSaved] = useState(true);
  const [threadSwitched, setThreadSwitched] = useState(false);
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);

  // Very hacky way of ensuring updateState is not called when a thread is switched
  useEffect(() => {
    if (threadSwitched) {
      const timer = setTimeout(() => {
        setThreadSwitched(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [threadSwitched]);

  useEffect(() => {
    return () => {
      debouncedAPIUpdate.cancel();
    };
  }, [debouncedAPIUpdate]);
  useEffect(() => {
    if (!messages.length || !artifact || !useGraphInput.threadId) return;
    if (updateRenderedArtifactRequired || threadSwitched || isStreaming) return;
    const currentIndex = artifact.currentIndex;
    const currentContent = artifact.contents.find(
      (c) => c.index === currentIndex
    );
    if (!currentContent) return;
    if (
      (artifact.contents.length === 1 &&
        artifact.contents[0].type === "text" &&
        !artifact.contents[0].fullMarkdown) ||
      (artifact.contents[0].type === "code" && !artifact.contents[0].code)
    ) {
      // If the artifact has only one content and it's empty, we shouldn't update the state
      return;
    }

    if (
      !lastSavedArtifact.current ||
      lastSavedArtifact.current.contents !== artifact.contents
    ) {
      setIsArtifactSaved(false);
      // This means the artifact in state does not match the last saved artifact
      // We need to update
      debouncedAPIUpdate(artifact, useGraphInput.threadId);
    }
  }, [artifact]);

  const updateArtifact = async (
    artifactToUpdate: ArtifactV3,
    threadId: string
  ) => {
    if (isStreaming) return;
    try {
      const client = createClient();
      await client.threads.updateState(threadId, {
        values: {
          artifact: artifactToUpdate,
        },
      });
      setIsArtifactSaved(true);
      lastSavedArtifact.current = artifactToUpdate;
    } catch (e) {
      console.error("Failed to update artifact", e);
      console.error("Artifact:", artifactToUpdate);
    }
  };
  const clearState = () => {
    setMessages([]);
    setArtifact(undefined);
    setFirstTokenReceived(true);
  };

  const streamMessageV2 = async (params: GraphInput) => {
    setFirstTokenReceived(false);

    if (!useGraphInput.threadId) {
      toast({
        title: "Error",
        description: "Thread ID not found",
        variant: "destructive",
        duration: 5000,
      });
      return undefined;
    }
    if (!useGraphInput.assistantId) {
      toast({
        title: "Error",
        description: "Assistant ID not found",
        variant: "destructive",
        duration: 5000,
      });
      return undefined;
    }

    const client = createClient();

    // TODO: update to properly pass the highlight data back
    // one field for highlighted text, and one for code
    const input = {
      ...DEFAULT_INPUTS,
      artifact,
      ...params,
      ...(selectedBlocks && {
        highlightedText: selectedBlocks,
      }),
    };
    // Add check for multiple defined fields
    const fieldsToCheck = [
      input.highlightedCode,
      input.highlightedText,
      input.language,
      input.artifactLength,
      input.regenerateWithEmojis,
      input.readingLevel,
      input.addComments,
      input.addLogs,
      input.fixBugs,
      input.portLanguage,
      input.customQuickActionId,
    ];

    if (fieldsToCheck.filter((field) => field !== undefined).length >= 2) {
      toast({
        title: "Error",
        description:
          "Can not use multiple fields (quick actions, highlights, etc.) at once. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

### `/src/lib`
Utility functions and shared libraries:
- Helper functions for data formatting
- Type definitions
- Constants and configurations

### `/src/constants.ts`
Global configuration and settings:
- Environment variables
- Default settings
- API endpoints

export const LANGGRAPH_API_URL =
  process.env.LANGGRAPH_API_URL ?? "http://localhost:57675";
// v2 is tied to the 'open-canvas-prod' deployment.
export const ASSISTANT_ID_COOKIE = "oc_assistant_id_v2";
// export const ASSISTANT_ID_COOKIE = "oc_assistant_id";
export const HAS_ASSISTANT_COOKIE_BEEN_SET = "has_oc_assistant_id_been_set";
export const THREAD_ID_COOKIE_NAME = "oc_thread_id_v2";
export const HAS_EMPTY_THREADS_CLEARED_COOKIE = "has_empty_threads_cleared";
export const DEFAULT_INPUTS = {
  highlightedCode: undefined,
  highlightedText: undefined,
  next: undefined,
  language: undefined,
  artifactLength: undefined,
  regenerateWithEmojis: undefined,
  readingLevel: undefined,
  addComments: undefined,
  addLogs: undefined,
  fixBugs: undefined,
  portLanguage: undefined,
  customQuickActionId: undefined,
};



## Project Configuration Files

### `package.json`
Node.js project configuration containing:
- Dependencies
- Scripts
- Project metadata
- Build configurations

{
  "name": "open_canvas",
  "author": "Brace Sproul",
  "homepage": "https://open-canvas-lc.vercel.app",
  "repository": "https://github.com/langchain-ai/open-canvas",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --config .prettierrc --write \"src\" \"evals\"",
    "eval:highlights": "yarn tsx evals/highlights.ts"
  },
  "dependencies": {
    "@assistant-ui/react": "^0.5.71",
    "@assistant-ui/react-markdown": "^0.2.18",
    "@assistant-ui/react-syntax-highlighter": "^0.0.13",
    "@blocknote/core": "^0.17.1",
    "@blocknote/mantine": "^0.17.1",
    "@blocknote/react": "^0.17.1",
    "@blocknote/shadcn": "^0.17.1",
    "@codemirror/lang-cpp": "^6.0.2",
    "@codemirror/lang-html": "^6.4.9",
    "@codemirror/lang-java": "^6.0.1",
    "@codemirror/lang-javascript": "^6.2.2",
    "@codemirror/lang-php": "^6.0.1",
    "@codemirror/lang-python": "^6.1.6",
    "@codemirror/lang-sql": "^6.8.0",
    "@langchain/anthropic": "^0.3.5",
    "@langchain/core": "^0.3.14",
    "@langchain/langgraph": "^0.2.18",
    "@langchain/langgraph-sdk": "^0.0.17",
    "@langchain/openai": "^0.3.11",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.5",
    "@types/react-syntax-highlighter": "^15.5.13",
    "@uiw/react-codemirror": "^4.23.5",
    "@uiw/react-md-editor": "^4.0.4",
    "@vercel/kv": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dotenv": "^16.4.5",
    "framer-motion": "^11.11.9",
    "js-cookie": "^3.0.5",
    "langsmith": "^0.1.61",
    "lodash": "^4.17.21",
    "lucide-react": "^0.441.0",
    "next": "14.2.7",
    "react": "^18",
    "react-dom": "^18",

### `langgraph.json`
LangGraph deployment configuration:
- Node version
- Graph definitions
- Environment settings

## Key Differences from Python

### Package Management
- **Python**: Uses pip and requirements.txt
- **Node.js**: Uses npm or yarn with package.json

### Module System
- **Python**: Uses import statements
- **Node.js**: Uses require() or ES6 import statements

### Asynchronous Programming
- **Python**: Uses async/await with coroutines
- **Node.js**: Uses Promises and async/await

### Type System
- **Python**: Optional type hints
- **TypeScript**: 
  - Robust static type system
  - Types defined using interfaces and type aliases

### Project Structure
- **Python**: Typically uses modules and packages
- **Node.js/TypeScript**: 
  - More component-based architecture
  - React components organized by feature/functionality

## Key Technologies

### Next.js
- React framework for production
- Server-side rendering
- API routes
- File-based routing

### TypeScript
- Typed superset of JavaScript
- Enhanced IDE support
- Compile-time error catching

### LangGraph/LangChain
- AI orchestration framework
- TypeScript version with type definitions
- Manages conversation flow and artifact generation

### React
- UI library
- Component-based architecture
- Hooks for state management

## Development Workflow

### Local Development
```bash
npm run dev
# or
yarn dev
```

### Building
```bash
npm run build
# or
yarn build
```

### Deployment
```bash
npm run deploy
# or
yarn deploy
```

### Code Quality
```bash
npm run lint
npm run test
# or
yarn lint
yarn test
```

## Environment Configuration
Uses `.env` files for configuration:
- API keys
- Endpoints
- Authentication credentials
- Development/production toggles

## Testing
Testing infrastructure includes:
- Unit tests
- Integration tests
- Tool testing capabilities

This structure follows modern Node.js/TypeScript best practices while integrating AI capabilities through LangChain/LangGraph. The separation of concerns between UI components, business logic, and AI functionality ensures maintainability and scalability.