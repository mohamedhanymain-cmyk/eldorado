/**
 * Configurable message parser for stock channel automation.
 * Extracts account details from supplier stock messages using regex patterns.
 */

export interface ParsedAccount {
  platform: string;
  email: string;
  password: string;
  category?: string;
  price?: number;
}

export interface MessageTemplate {
  name: string;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => ParsedAccount | null;
}

/**
 * Default message templates for common stock message formats.
 * These can be extended or replaced via configuration.
 */
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    // Format: platform | email:password | $price
    name: "pipe-separated",
    pattern: /^(.+?)\s*\|\s*([^\s:]+):([^\s|]+)\s*\|\s*\$?([\d.]+)/gm,
    extract: (match) => ({
      platform: match[1]?.trim() || "",
      email: match[2]?.trim() || "",
      password: match[3]?.trim() || "",
      price: parseFloat(match[4] || "0"),
    }),
  },
  {
    // Format: email:password (platform) - $price
    name: "email-first",
    pattern: /^([^\s:]+):([^\s(]+)\s*\(([^)]+)\)\s*-?\s*\$?([\d.]+)?/gm,
    extract: (match) => ({
      email: match[1]?.trim() || "",
      password: match[2]?.trim() || "",
      platform: match[3]?.trim() || "",
      price: match[4] ? parseFloat(match[4]) : undefined,
    }),
  },
  {
    // Format: email:password
    name: "simple-credentials",
    pattern: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}):(.+)$/gm,
    extract: (match) => ({
      email: match[1]?.trim() || "",
      password: match[2]?.trim() || "",
      platform: "Unknown",
    }),
  },
];

/**
 * Parse a message using all registered templates.
 * Returns all accounts found across all template matches.
 */
export function parseMessage(
  content: string,
  templates: MessageTemplate[] = DEFAULT_TEMPLATES
): ParsedAccount[] {
  const results: ParsedAccount[] = [];

  for (const template of templates) {
    // Reset regex lastIndex
    template.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = template.pattern.exec(content)) !== null) {
      const account = template.extract(match);
      if (account && account.email && account.password) {
        results.push(account);
      }
    }

    // If we found results with this template, stop trying others
    if (results.length > 0) break;
  }

  return results;
}
