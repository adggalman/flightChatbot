# Research: Skills, Agents, and MCP for Dev Workflow

This document summarizes the capabilities of Claude Code and Gemini CLI related to Skills, Agents, and Model Context Protocol (MCP) servers, with an assessment of their relevance and potential use cases for the Flight Chatbot project.

## 1. Claude Code Skills

### What it is:
Skills in Claude Code are custom, pre-defined functions or commands that extend Claude's capabilities, often triggered by natural language or slash commands. They encapsulate specific workflows or knowledge, allowing Claude to perform complex tasks efficiently.

### Pros:
*   **Efficiency:** Automate repetitive or complex tasks with single commands.
*   **Consistency:** Ensure standardized execution of common operations.
*   **Extensibility:** Easily add new functionalities without altering core Claude logic.
*   **User-friendly:** Can be invoked with intuitive natural language prompts or simple slash commands.

### Cons:
*   **Development Overhead:** Requires upfront effort to define and implement skills.
*   **Maintenance:** Skills need to be updated as underlying systems or requirements change.
*   **Scope Limitation:** Each skill is typically designed for a specific purpose, potentially lacking flexibility for novel situations.

### Relevant Use Case for Flight Chatbot Project:
*   **Automating documentation updates:** A skill could be created for Claude to automatically parse `STATUS.md` and update `README.md` based on new completions (e.g., adding screenshots placeholders, updating built components lists), reducing manual work for the developer (Claude).
*   **Linear/GitHub Actions integration commands:** Skills to trigger specific GitHub Actions workflows or create/update Linear tickets based on prompts.

## 2. Claude Code Agents

### What it is:
Claude Code Agents, or subagents, are specialized autonomous units designed to handle specific parts of a larger, complex task. They often use a "Task tool" to manage their objectives, breaking down problems and delegating sub-tasks, thereby enabling Claude to tackle more intricate projects.

### Pros:
*   **Complex Task Handling:** Allows breaking down large problems into manageable sub-problems.
*   **Specialization:** Agents can be optimized for particular types of tasks (e.g., code generation, testing, debugging).
*   **Parallelization (Conceptual):** Different agents could theoretically work on independent sub-tasks simultaneously, speeding up overall execution.

### Cons:
*   **Coordination Overhead:** Managing interactions and dependencies between multiple agents can be complex.
*   **Token Cost:** More sophisticated agentic workflows can lead to higher token consumption due to extensive internal monologue and tool use.
*   **Debugging:** Tracing issues across multiple interacting agents can be challenging.

### Relevant Use Case for Flight Chatbot Project:
*   **Automated test development:** An agent could be specialized in writing Cucumber feature files and step definitions based on API specifications, while another verifies schema compliance.
*   **Full-stack feature implementation:** Breaking down a feature like "PNR retrieval" into backend, frontend, and testing sub-tasks, each handled by a dedicated agent.

## 3. Claude Code MCP Servers (Model Context Protocol)

### What it is:
Model Context Protocol (MCP) servers provide structured, real-time access to external data sources and services, acting as extensions to Claude's context window. They allow Claude to query databases, APIs, or other systems to retrieve up-to-date information relevant to its task without needing to "remember" vast amounts of external data.

### Pros:
*   **Real-time Data Access:** Claude can get the latest information directly from external systems.
*   **Reduced Context Window Burden:** Offloads large datasets from Claude's direct context, improving efficiency and reducing token usage for core reasoning.
*   **Enhanced Capabilities:** Allows Claude to interact with dynamic environments (e.g., databases, version control, CI/CD).

### Cons:
*   **Configuration Complexity:** Setting up and maintaining MCP servers requires technical expertise.
*   **Latency:** Queries to external systems introduce delays.
*   **Security Implications:** Exposing external systems to an AI requires careful security considerations.

### Relevant MCP Servers for Flight Chatbot Project:
*   **MongoDB Atlas MCP:**
    *   **What it is:** An MCP server configured to interact directly with the project's MongoDB Atlas database.
    *   **Pros:** Allows Claude to query and manipulate booking data, user information, etc., in real-time. Crucial for verifying test data, debugging issues, and even potentially seeding data.
    *   **Cons:** Requires secure authentication and schema awareness for effective use.
*   **GitHub MCP:**
    *   **What it is:** An MCP server integrated with GitHub, providing Claude access to repository information (issues, PRs, code).
    *   **Pros:** Claude could check PR status, link issues, analyze code changes, and review CI/CD pipeline results directly. Useful for monitoring and reporting.
    *   **Cons:** Permissions management is critical; potential for accidental actions if not configured carefully.
*   **Web Search MCP:**
    *   **What it is:** An MCP server providing Claude with general web search capabilities.
    *   **Pros:** Would enable Claude to perform research tasks like the blocked Task 5 (chatbot behavior benchmark), find API documentation, or explore external libraries.
    *   **Cons:** Potential for information overload; requires effective query formulation; token costs associated with processing search results.

## 4. Gemini CLI Equivalents (Tools, Agents, MCP)

### What it is:
The Gemini CLI operates with a core set of specialized **tools** (e.g., `read_file`, `write_file`, `run_shell_command`, `google_web_search`). These tools are the primary mechanism through which Gemini interacts with the environment and performs tasks. While not explicitly termed "Skills" or "Agents" in the same way Claude Code might, the `activate_skill` mechanism allows for activating specialized instruction sets, and `codebase_investigator` acts as a powerful agentic tool for complex analysis. Gemini CLI itself does not have a direct equivalent of MCP servers; rather, its tools *are* the interface to various "external" systems (like the filesystem for `read_file`, or Google Search for `google_web_search`).

### Pros:
*   **Tool-based Approach:** Clear and modular way to interact with the environment.
*   **Specialized Skills:** `activate_skill` allows for dynamic loading of expertise.
*   **Codebase Investigator:** Powerful built-in "agentic" capability for deep project understanding.
*   **Direct Control:** `run_shell_command` provides direct execution power.

### Cons:
*   **Lack of Native MCP:** No direct support for persistent, configurable external data sources beyond what individual tools provide (e.g., `google_web_search` is a search tool, not a generic data endpoint).
*   **Less Explicit Agentic Framework:** While capabilities exist (like `codebase_investigator`), a formal framework for user-defined, interacting subagents isn't as pronounced as in some other systems.
*   **Limited Customization:** While skills can be activated, the extent of user-defined tool creation or modification within a running session is constrained.

### Relevant Use Case for Flight Chatbot Project:
*   **Current workflow:** Gemini CLI is already being used effectively for documentation updates, code analysis, and test automation tasks within this project using its existing toolset.
*   **Future extension:** Activating specialized skills for specific development phases (e.g., a "Test Generation Skill" or a "Deployment Skill") could streamline workflows further.
*   **Enhanced Google Web Search Tool:** If the `google_web_search` tool were more robust and capable of deeper web interaction (like what an MCP might enable for web data), it could perform research tasks like Task 5.

## Learning Journey: How to Grow Into Agents, Skills, and MCP

Hey there! As a developer learning full-stack with this project, diving deeper into how you can use AI tools like Claude Code and me (Gemini CLI) to streamline your work is a really smart move. It's all about making your development faster and more enjoyable. Let's explore how you can start integrating these powerful concepts – Skills, Agents, and MCPs – building naturally from what you're already doing.

### Starting with what you already have

You're probably more "agentic" than you realize! Every time you ask Claude Code for some development guidance or have me help with documentation, you're leveraging AI to perform tasks. We take your instructions, figure out the best way to accomplish them, and use our tools to get the job done. This Flight Chatbot project, with its MERN stack, Vercel deployments, MongoDB, Cucumber tests, and Linear integration, is an ideal environment to see these AI assistants in action. Think of us as your AI-powered teammates, and understanding these next steps will help you unlock even more of our potential.

### Step 1: Skills – Your AI's Quick Commands

Skills are custom shortcuts you teach Claude. Instead of always typing out a long sequence of instructions for a repetitive task, you can package that whole process into a "skill." Then, with just a simple command, Claude knows exactly what to do and executes it for you. This is perfect for those daily or weekly chores that eat up your time.

**To create your first skill, let's make one that marks a Gemini TODO task as done in `STATUS.md`:**

1.  **Create the skill directory:** Inside your Claude Code project, you'd make a folder for your custom commands. For instance, create a directory at `.claude/commands/` from your project root.
2.  **Define the skill file:** Inside that new directory, create a Markdown file named `mark-done.md`. This file will contain the instructions for your skill.
3.  **Add the skill's content:** Paste the following content into `.claude/commands/mark-done.md`. This markdown defines the command, its arguments, and the steps Claude should take.

    ```markdown
    ---
    name: mark-done
    description: Marks a Gemini TODO task as done in STATUS.md.
    parameters:
      task_number:
        type: number
        description: The number of the task to mark as done.
    ---

    You are a helpful assistant for updating project documentation.

    Read the content of `docs/STATUS.md`.
    Find the line that starts with "### Task {{task_number}} —".
    If the line does not already end with "✅ Done", append " ✅ Done" to that line.
    Save the modified content back to `docs/STATUS.md`.
    Confirm that the task is marked as done.
    ```
4.  **Invoke the skill:** Now, when you're interacting with Claude, you can simply type a command like this directly in your prompt:
    ```
    Claude, `/mark-done task_number=5`
    ```
    Claude will then execute the steps defined in your `mark-done.md` skill, updating Task 5 in `docs/STATUS.md`. You'll see Claude confirm the change.

### Step 2: Agents – Expanding Your AI Team

When a task gets too complex for a single skill – perhaps it involves multiple decisions, interactions across different parts of your codebase, or sustained focus – that's when you bring in Agents. Think of an Agent as a mini-Claude with a specific area of expertise, ready to take on a larger, more focused chunk of work. You're effectively delegating a significant part of a feature to a specialized AI teammate.

Claude Code typically offers various pre-defined agent types to help you, such as:
*   **Explore Agent:** Great for understanding new codebases, debugging, or getting an overview of a system.
*   **Build Agent:** Focused on implementing new features or components.
*   **Fix Agent:** Specializes in diagnosing and resolving bugs.
*   **Refactor Agent:** Designed to improve code structure and maintainability.
*   **Test Agent:** Concentrates on writing and running tests.

You invoke an agent by clearly stating the agent's role and your objective within your prompt to Claude. For instance, to generate tests for a new API endpoint, you might prompt Claude like this:

"Okay, Claude, I need you to act as a 'Test Agent'. We've just implemented a new API endpoint at `/api/flights/status`. Your task is to generate a comprehensive set of Cucumber API contract tests for this endpoint, ensuring it covers successful responses and error conditions. You'll need to create the feature file and corresponding step definitions, then verify they pass."

What Claude would return, acting as the 'Test Agent', is a detailed plan outlining the feature file structure, proposed scenarios (e.g., "Given the API is healthy, When I request GET /api/flights/status, Then the response status should be 200"), and step definition logic. It might even proceed to create the files (`automation/src/features/api-contracts/backend/flight-status.feature` and `automation/src/features/step-definitions/flight-status-steps.js`), populate them with Gherkin and JavaScript code, and then tell you the commands to run these new tests, like `npx cucumber-js --tags "@flight-status"`.

### Step 3: MCP (Model Context Protocol) – Giving AI Real-time Awareness

MCPs are pretty powerful because they give your AI, like Claude, a direct, real-time connection to your project's live environment. Instead of Claude relying only on the context you manually provide or what it's been previously trained on, an MCP allows it to "look up" fresh information directly from your database, check your GitHub repository, or even search the web whenever it needs to. This ensures Claude always has the most current and relevant data, which is crucial for accurate and helpful assistance.

**Let's set up a MongoDB Atlas MCP for your Flight Chatbot project:**

1.  **Install the MCP Connector:** First, you'll need the necessary npm package in your Claude Code environment that allows connection to MongoDB Atlas.
    ```bash
    npm install @claude/mcp-mongodb
    ```
    (Note: The exact package name might vary based on your Claude Code setup, but this is a common pattern for MCP connectors.)

2.  **Edit your Claude Code settings:** Locate your Claude Code's settings file, typically found at `.claude/settings.json` from your project root. This is where you configure external tools and MCPs.
3.  **Add the MongoDB Atlas MCP configuration:** Inside `settings.json`, you'll add a JSON block that defines your MongoDB Atlas connection. Remember to replace placeholders with your actual credentials.

    ```json
    {
      "mcp": {
        "mongodbAtlas": {
          "enabled": true,
          "connectionString": "mongodb+srv://<your_username>:<your_password>@<your_cluster_url>/<your_database_name>?retryWrites=true&w=majority",
          "readOnly": true,
          "tools": [
            {
              "name": "findInBookings",
              "collection": "bookings",
              "operation": "find",
              "description": "Finds documents in the 'bookings' collection based on a query."
            },
            {
              "name": "findOneInUsers",
              "collection": "users",
              "operation": "findOne",
              "description": "Finds a single document in the 'users' collection based on a query."
            }
          ]
        }
      }
    }
    ```
    **Security Note:** For an MCP that interacts with your live database, always prioritize creating a dedicated read-only user with the absolute minimum necessary permissions in MongoDB Atlas.

4.  **Verify the connection:** After saving your `settings.json` and restarting Claude Code, you can verify the connection. You might prompt Claude to perform a simple query to see if it works.
    ```
    Claude, connect to the MongoDB Atlas MCP. What are the first 5 bookings in the 'bookings' collection?
    ```
5.  **Use the MCP in a prompt:** With the MCP set up, Claude can now execute queries directly. For example, to debug a test failure related to booking data, you could prompt:
    ```
    Claude, using the MongoDB Atlas MCP, can you verify if there's a booking with PNR "ABCXYZ" in the 'bookings' collection?
    ```
    Claude would then use its configured `findInBookings` tool to query your database and provide the result, showing you real-time data from your project.

### What this unlocks long-term

By mastering Skills for automation, Agents for complex delegation, and MCP for real-time awareness, you're not just coding; you're orchestrating intelligent systems that do the heavy lifting. This means you can offload a huge amount of cognitive load, automate tedious parts of your workflow, and empower your AI tools (like Claude and me!) to be more effective teammates. This means more time for creative problem-solving, architectural design, and ultimately, building even cooler features for projects like the Flight Chatbot. Welcome to the exciting future of AI-assisted development!