# Implementing Tool Use in Open Canvas

## Overview

Open Canvas currently uses GPT-4 but doesn't fully utilize its tool-use capabilities. This guide explains how to implement comprehensive tool use while maintaining the existing LangChain architecture.

## Current Implementation

The project currently uses tools in a limited way:
- `generateArtifact.ts` uses `bindTools` primarily for structured output
- `respondToQuery.ts` doesn't utilize tools at all
- The reflection agent uses tools for memory management

## Adding Full Tool Support

### 1. Tool Directory Structure

Create a dedicated tools directory to organize available tools:

```typescript
src/
  └── agent/
      └── tools/
          ├── index.ts        // Tool exports
          ├── search.ts       // Search functionality
          ├── code.ts         // Code analysis tools
          └── web.ts          // Web interaction tools
```

### 2. Tool Definitions

Define tools using LangChain's `DynamicStructuredTool`:

```typescript
// src/agent/tools/index.ts
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Search Tool
export const searchTool = new DynamicStructuredTool({
    name: "search",
    description: "Search for information on a given topic",
    schema: z.object({
        query: z.string().describe("The search query")
    }),
    func: async ({ query }) => {
        // Implement search functionality
        return "Search results for: " + query;
    }
});

// Code Analysis Tool
export const codeAnalysisTool = new DynamicStructuredTool({
    name: "analyze_code",
    description: "Analyze code for patterns, complexity, and potential issues",
    schema: z.object({
        code: z.string().describe("The code to analyze"),
        language: z.string().describe("Programming language of the code")
    }),
    func: async ({ code, language }) => {
        // Implement code analysis
        return "Analysis results";
    }
});

export const availableTools = [
    searchTool,
    codeAnalysisTool
];
```

### 3. Model Configuration

Update the model configuration to enable tool use:

```typescript
// src/agent/open-canvas/nodes/respondToQuery.ts
import { availableTools } from "../../tools";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.5
}).bind({
    tools: availableTools,
    tool_choice: "auto"  // Allows model to decide when to use tools
});
```

### 4. Prompt Engineering

Update prompts to inform the model about available tools:

```typescript
// src/agent/open-canvas/prompts.ts
export const RESPOND_TO_QUERY_PROMPT = `You are an AI assistant with access to the following tools:

Available Tools:
1. search
   - Purpose: Search for information on a given topic
   - Use when: You need current information or data not in your training
   
2. analyze_code
   - Purpose: Analyze code for patterns and issues
   - Use when: User asks about code quality or needs optimization suggestions

Guidelines for Tool Use:
- Use tools when you need external information or capabilities
- Explain your reasoning when choosing to use a tool
- Combine multiple tools when necessary to provide comprehensive answers

${APP_CONTEXT}

You also have the following reflections on the user's preferences:
<reflections>
{reflections}
</reflections>`;
```

### 5. Handling Tool Calls

Implement robust tool call handling:

```typescript
export const respondToQuery = async (
    state: typeof OpenCanvasGraphAnnotation.State,
    config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.5
    }).bind({
        tools: availableTools,
        tool_choice: "auto"
    });

    // Initial response
    const response = await model.invoke([
        { role: "system", content: RESPOND_TO_QUERY_PROMPT },
        ...state.messages
    ]);

    // Handle tool calls
    if (response.tool_calls) {
        const toolResults = [];
        
        // Execute each tool call
        for (const toolCall of response.tool_calls) {
            const tool = availableTools.find(t => t.name === toolCall.name);
            if (tool) {
                try {
                    const result = await tool.invoke(toolCall.args);
                    toolResults.push({
                        role: "tool",
                        content: result,
                        tool_call_id: toolCall.id
                    });
                } catch (error) {
                    console.error(`Tool ${toolCall.name} failed:`, error);
                    toolResults.push({
                        role: "tool",
                        content: `Error executing tool ${toolCall.name}`,
                        tool_call_id: toolCall.id
                    });
                }
            }
        }

        // Add tool results to conversation
        const updatedMessages = [
            ...state.messages,
            response,
            ...toolResults
        ];

        // Get final response incorporating tool results
        const finalResponse = await model.invoke(updatedMessages);
        return { messages: [finalResponse] };
    }

    return { messages: [response] };
};
```

### 6. Integration with Artifact Generation

Enhance artifact generation with tool use:

```typescript
// src/agent/open-canvas/nodes/generateArtifact.ts
const modelWithTools = smallModel.bind({
    tools: [
        ...availableTools,
        {
            name: "generate_artifact",
            schema: artifactSchema,
            func: async (args) => {
                // Existing artifact generation logic
            }
        }
    ],
    tool_choice: "auto"
});
```

## Example Tools to Implement

1. **Code Tools**
   - Syntax validation
   - Code complexity analysis
   - Dependency checking
   - Security scanning

2. **Web Tools**
   - URL content fetching
   - API interactions
   - Documentation searches

3. **Data Tools**
   - Database queries
   - File operations
   - Data format conversion

4. **Integration Tools**
   - Version control operations
   - CI/CD pipeline interactions
   - Deployment status checks

## Best Practices

1. **Tool Design**
   - Keep tools focused and single-purpose
   - Provide clear descriptions and examples
   - Include proper error handling
   - Document expected inputs and outputs

2. **Performance**
   - Implement caching where appropriate
   - Consider rate limiting for external services
   - Monitor tool execution time

3. **Security**
   - Validate all inputs
   - Implement proper authentication
   - Limit file system access
   - Log tool usage for auditing

4. **Error Handling**
   - Provide meaningful error messages
   - Implement fallback behavior
   - Log errors for debugging
   - Handle timeouts gracefully

## Testing

1. **Unit Tests**
```typescript
describe('searchTool', () => {
    it('should return search results', async () => {
        const result = await searchTool.invoke({ query: 'test' });
        expect(result).toBeDefined();
    });
});
```

2. **Integration Tests**
```typescript
describe('respondToQuery with tools', () => {
    it('should handle tool calls correctly', async () => {
        const response = await respondToQuery(mockState, mockConfig);
        expect(response.messages).toBeDefined();
    });
});
```

## Monitoring and Maintenance

1. **Usage Monitoring**
   - Track tool usage patterns
   - Monitor performance metrics
   - Log error rates

2. **Regular Updates**
   - Keep tool implementations current
   - Update tool descriptions
   - Refine error handling
   - Optimize based on usage patterns

## Conclusion

Implementing tool use in Open Canvas enhances its capabilities while maintaining the existing LangChain architecture. This implementation allows for:
- Dynamic information gathering
- Enhanced code analysis
