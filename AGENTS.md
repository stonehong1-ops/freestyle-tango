<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Windows Shell Environment Rules

This project is developed in a **Windows (PowerShell/CMD)** environment. Agents MUST follow these shell conventions:

1. **No `grep`**: Use `findstr` (CMD) or `Select-String` (PowerShell) instead.
2. **Command Chaining**: Use `;` (PowerShell) or `&` (CMD) instead of `&&` if the shell version is uncertain (PowerShell < 7 does not support `&&`).
3. **Paths**: Use Backslashes `\` for Windows-specific commands, or Forward slashes `/` for Node-based tools (PowerShell handles both).
4. **Encoding**: Ensure file outputs are UTF-8.

# User Interaction Rules

1. **External Resource Links**: When requesting that the USER perform an action on a web service or platform (e.g., Vercel, Firebase settings, AWS, domain settings), ALWAYS provide the most direct link possible to the relevant settings/configuration page.

