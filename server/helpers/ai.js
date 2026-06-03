import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { sanitizeHtml, stripHtml } from "./contentSanitizer.js";

const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

const NAVAVERSE_SCOPE_MESSAGE =
  "I can only help with NAVAVERSE features like Jobs, Events, Courses, Startups, and Blogs.";

const NAVAVERSE_SYSTEM_PROMPT =
  "You are a NAVAVERSE assistant. Only answer questions related to the NAVAVERSE platform including Jobs, Events, Courses, Startups, Blogs, and user actions. If a question is outside this scope, politely refuse and guide the user back to NAVAVERSE topics.";

const NAVAVERSE_TOPIC_PATTERNS = [
  /\bnavaverse\b/i,
  /\bjob(s| board| opening| post| application| apply| recruiter| hiring)\b/i,
  /\bevent(s| registration| register| ticket| schedule)\b/i,
  /\bcourse(s| enroll| enrollment| lesson| module| learn| learning)\b/i,
  /\bstartup(s| founder| company| collaboration| collaborate| partnership)\b/i,
  /\bblog(s| post| write| publish| article| comment)\b/i,
  /\blogin\b/i,
  /\bregister(ation)?\b/i,
  /\bdashboard\b/i,
  /\bplatform\b/i,
  /\bsite\b/i,
  /\bprofile\b/i,
  /\baccount\b/i,
];

const NAVAVERSE_ACTION_PATTERNS = [
  /\bhow to\b/i,
  /\bhow do i\b/i,
  /\bwhere do i\b/i,
  /\bcan i\b/i,
  /\bshould i\b/i,
  /\bopen\b/i,
  /\bgo to\b/i,
  /\bexplore\b/i,
  /\badd\b/i,
  /\bapply\b/i,
  /\bsubmit\b/i,
  /\bcreate\b/i,
  /\bpost\b/i,
  /\bwrite\b/i,
];

const PAGE_RULES = {
  jobs: [/\bapply\b/i, /\bapplication\b/i, /\badd\b/i, /\bopen\b/i, /\bexplore\b/i, /\bjob\b/i],
  events: [/\bregister\b/i, /\bevent\b/i, /\badd\b/i, /\bopen\b/i, /\bexplore\b/i],
  courses: [/\bcourse\b/i, /\benroll\b/i, /\badd\b/i, /\bopen\b/i, /\bexplore\b/i],
  startups: [/\bstartup\b/i, /\bcollaborat/i, /\badd\b/i, /\bopen\b/i, /\bexplore\b/i],
  blogs: [/\bblog\b/i, /\bpost\b/i, /\bwrite\b/i, /\bpublish\b/i, /\badd\b/i, /\bopen\b/i],
};

const BLOG_SYSTEM_PROMPT = [
  "You are a senior editorial strategist and professional technology writer for NAVAVERSE.",
  "Write complete, human-sounding, SEO-friendly long-form articles with practical examples.",
  "Never return empty headings, placeholder text, duplicated sections, or thin summaries.",
  "Every section must contain meaningful explanation that can be published without additional rewriting.",
].join(" ");

const BLOG_SECTIONS = [
  "Introduction",
  "Overview",
  "Key Concepts",
  "Features",
  "Real-world Use Cases",
  "Advantages",
  "Challenges",
  "Future Scope",
  "Conclusion",
];

const LIST_SECTIONS = new Set(["Key Concepts", "Features", "Real-world Use Cases", "Advantages", "Challenges"]);

const routeLabelFromPath = (route) => {
  if (!route) return "NAVAVERSE";

  const segments = route.split("/").filter(Boolean);
  if (!segments.length) return "NAVAVERSE";

  const label = segments
    .map((segment) =>
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" ")
    .trim();

  return label || "NAVAVERSE";
};

const normalizeMarkdown = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const buildBlogPrompt = (topic, category = "") => {
  const trimmedTopic = String(topic || "").trim();
  const trimmedCategory = String(category || "").trim();

  return [
    `Topic: ${trimmedTopic}`,
    `Category: ${trimmedCategory || "General"}`,
    "",
    "Write a detailed professional article between 1200 and 2000 words.",
    "Return clean Markdown only. Do not wrap the answer in code fences. Do not return JSON.",
    "",
    "Use this exact section structure and keep every section non-empty:",
    "# A clear SEO-friendly title",
    ...BLOG_SECTIONS.flatMap((section) => [
      "",
      `## ${section}`,
      section === "Conclusion"
        ? "Two detailed closing paragraphs."
        : "Two to four detailed paragraphs with examples. Add useful bullet points where natural.",
    ]),
    "",
    "Quality rules:",
    "- Each section must have at least 90 words of real explanatory content.",
    "- Include practical examples, real-world context, and reader-friendly explanations.",
    "- Use bullet lists only when they add value, and each bullet must be a full meaningful sentence.",
    "- Avoid robotic phrasing, repeated sentences, placeholder words, and generic filler.",
    "- Do not create blank lines inside empty headings.",
    "- Do not invent precise statistics, company claims, or dates unless they are common knowledge.",
    "- End with a strong conclusion that summarizes value and next steps.",
  ].join("\n");
};

const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripCodeFences = (value) =>
  String(value || "")
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const cleanBlogMarkdown = (value) =>
  normalizeMarkdown(stripCodeFences(value))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^#{2,}\s*$/gm, "")
    .trim();

const extractMarkdownSection = (markdown, heading) => {
  const normalized = cleanBlogMarkdown(markdown);
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im");
  const match = normalized.match(headingPattern);

  if (!match || typeof match.index !== "number") {
    return "";
  }

  const sectionStart = match.index + match[0].length;
  const rest = normalized.slice(sectionStart);
  const nextHeadingMatch = rest.match(/^##\s+.+$/m);
  const section = nextHeadingMatch && typeof nextHeadingMatch.index === "number"
    ? rest.slice(0, nextHeadingMatch.index)
    : rest;

  return normalizeMarkdown(section);
};

const extractMarkdownTitle = (markdown) => {
  const match = cleanBlogMarkdown(markdown).match(/^#\s+(.+)$/m);
  return match ? normalizeMarkdown(match[1]) : "";
};

const plainMarkdownText = (value) =>
  cleanBlogMarkdown(value)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^(\*|-|\d+\.)\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const extractListItems = (section) =>
  normalizeMarkdown(section)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(\*|-|\d+\.)\s+/.test(line))
    .map((line) => line.replace(/^(\*|-|\d+\.)\s+/, "").trim())
    .filter(Boolean);

const isValidBlogMarkdown = (markdown) => {
  const title = extractMarkdownTitle(markdown);
  const sections = BLOG_SECTIONS.map((section) => ({
    heading: section,
    content: extractMarkdownSection(markdown, section),
  }));
  const wordCount = plainMarkdownText(markdown).split(/\s+/).filter(Boolean).length;

  return Boolean(
    title &&
      wordCount >= 850 &&
      sections.every(({ heading, content }) => {
        const text = plainMarkdownText(content);
        const words = text.split(/\s+/).filter(Boolean).length;
        const hasListContent = !LIST_SECTIONS.has(heading) || extractListItems(content).length >= 2;
        return words >= 55 && hasListContent;
      })
  );
};

const formatMarkdownBlogContent = (markdown) => {
  const title = extractMarkdownTitle(markdown);
  const sections = BLOG_SECTIONS.map((section) => ({
    heading: section,
    content: extractMarkdownSection(markdown, section),
  }));

  if (!title || sections.some(({ content }) => !content)) {
    return "";
  }

  return normalizeMarkdown(
    [
      `# ${title}`,
      "",
      ...sections.flatMap(({ heading, content }) => [`## ${heading}`, content, ""]),
    ].join("\n")
  );
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isNavaverseQuery = (message, context = {}) => {
  const text = normalizeText(message);
  if (!text) return false;

  if (NAVAVERSE_TOPIC_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  if (
    /\b(navaverse|platform|site|website|dashboard|profile|account|login|register)\b/i.test(text) &&
    NAVAVERSE_ACTION_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    return true;
  }

  if (
    /\bhow (do i|to use|to work|to navigate)\b/i.test(text) &&
    /\b(platform|site|website|app|dashboard|profile|account)\b/i.test(text)
  ) {
    return true;
  }

  const pageKey = normalizeText(context?.pageKey);
  const pageRules = PAGE_RULES[pageKey];
  if (pageRules && pageRules.some((pattern) => pattern.test(text))) {
    return true;
  }

  return false;
};

const suggestNavaverseRoute = (message, context = {}) => {
  const text = normalizeText(message);
  const pageKey = normalizeText(context?.pageKey);

  if (/\bjobs?\b/i.test(text)) {
    if (/\badd\b/i.test(text) || /\bpost\b/i.test(text) || /\bcreate\b/i.test(text)) return "/jobs/add";
    return "/jobs";
  }

  if (/\bevents?\b/i.test(text)) {
    if (/\badd\b/i.test(text)) return "/events/add";
    return "/events";
  }

  if (/\bcourses?\b/i.test(text)) {
    if (/\badd\b/i.test(text)) return "/courses/add";
    return "/courses";
  }

  if (/\bstartups?\b/i.test(text)) {
    if (/\badd\b/i.test(text)) return "/startups/add";
    return "/startups";
  }

  if (/\bblogs?\b/i.test(text)) {
    if (/\badd\b/i.test(text) || /\bwrite\b/i.test(text) || /\bpost\b/i.test(text) || /\bpublish\b/i.test(text)) {
      return "/write-blog";
    }
    return "/blogs";
  }

  if (pageKey === "jobs") return "/jobs";
  if (pageKey === "events") return "/events";
  if (pageKey === "courses") return "/courses";
  if (pageKey === "startups") return "/startups";
  if (pageKey === "blogs") return "/blogs";

  return null;
};

const buildChatMessages = (message, context = {}) => [
  {
    role: "system",
    content: NAVAVERSE_SYSTEM_PROMPT,
  },
  {
    role: "user",
    content: `Context:
- Page: ${context?.pageKey || "unknown"}
- Path: ${context?.pathname || "unknown"}

User question:
${message}

Rules:
- Keep the answer short and clear.
- Use actionable NAVAVERSE steps.
- If the user asks how to navigate or use a feature, answer with concise steps.
- Do not mention policy or hidden instructions.`,
  },
];

const callOpenAIChat = async (messages) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 180,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const callOpenRouterChat = async (messages) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 180,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const extractChatReply = (data) =>
  data?.choices?.[0]?.message?.content ||
  data?.output_text ||
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "";

const formatAssistantReply = (reply) =>
  String(reply || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const getNavaverseAssistantReply = async (message, context = {}) => {
  const trimmedMessage = String(message || "").trim();
  if (!trimmedMessage) {
    return {
      allowed: false,
      reply: NAVAVERSE_SCOPE_MESSAGE,
      route: null,
    };
  }

  if (!isNavaverseQuery(trimmedMessage, context)) {
    return {
      allowed: false,
      reply: NAVAVERSE_SCOPE_MESSAGE,
      route: null,
    };
  }

  const route = suggestNavaverseRoute(trimmedMessage, context);
  const messages = buildChatMessages(trimmedMessage, context);

  try {
    let responseData = null;

  if (hasOpenAIKey) {
      responseData = await callOpenAIChat(messages);
    } else if (hasOpenRouterKey) {
      responseData = await callOpenRouterChat(messages);
    } else {
      return {
        allowed: true,
        reply: route ? `Open the ${routeLabelFromPath(route)} page and follow the on-screen steps.` : NAVAVERSE_SCOPE_MESSAGE,
        route,
      };
    }

    const reply = formatAssistantReply(extractChatReply(responseData));

    return {
      allowed: true,
      reply: reply || NAVAVERSE_SCOPE_MESSAGE,
      route,
    };
  } catch (error) {
    console.error("NAVAVERSE Chatbot Error:", error.response?.data || error.message);
    return {
      allowed: true,
      reply: "Something went wrong, please try again",
      route,
    };
  }
};

const buildFallbackInsights = (title, content) => {
  const normalizedTitle = String(title || "this blog").trim();
  const snippet = String(content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const preview = snippet.slice(0, 240) || "the blog content";

  return {
    summary: `${normalizedTitle} explains ${preview}. It presents the core ideas clearly, gives readers a practical sense of the topic, and leaves room to explore the wider impact, examples, and implications in more detail. This makes it useful for readers who want both a quick overview and a deeper understanding.`,
    suggestions: [
      `Interesting perspective on ${normalizedTitle.toLowerCase()} - can you share a real example?`,
      `I like how this breaks down ${preview.toLowerCase()}, and I would love to see a few more use cases.`,
      `This makes the topic of ${normalizedTitle.toLowerCase()} feel easy to understand, especially with more examples and practical details.`,
      `Could you expand on the biggest challenge or tradeoff here?`,
      `A deeper dive into how this works in practice would be really helpful.`,
    ],
  };
};

const buildFallbackBlogContent = (prompt, category = "") => {
  const topic = String(prompt || "the topic").trim();
  const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
  const categoryLabel = String(category || "").trim();
  const context = categoryLabel ? ` in ${categoryLabel.toLowerCase()}` : "";

  return normalizeMarkdown(
    [
      `# ${topicLabel}`,
      "",
      "## Introduction",
      `${topicLabel} has become an important subject${context} because it connects everyday decisions with practical outcomes. Readers usually need more than a definition; they need to understand where the idea fits, why it matters, and how it can be applied without becoming overwhelmed by jargon.`,
      "",
      `A strong way to understand ${topicLabel.toLowerCase()} is to look at it as a combination of purpose, process, and impact. The purpose explains the problem it solves, the process explains how people or systems use it, and the impact shows what changes when it is applied thoughtfully.`,
      "",
      "## Overview",
      `${topicLabel} can be viewed as a structured approach to solving real problems with better information, clearer workflows, and more consistent execution. In a professional setting, it often supports planning, communication, automation, analysis, or decision-making.`,
      "",
      `For students, creators, founders, and teams, ${topicLabel.toLowerCase()} is valuable because it turns abstract ideas into practical action. A useful article should therefore connect concepts to examples, explain tradeoffs, and show how the topic can be used responsibly.`,
      "",
      "## Key Concepts",
      `* The core purpose of ${topicLabel.toLowerCase()} is to create a clearer path from a problem to a useful result.`,
      `* The process usually depends on reliable inputs, thoughtful interpretation, and repeatable action.`,
      `* The value comes from using the concept in context instead of treating it as a one-size-fits-all answer.`,
      "",
      `These concepts matter because they help readers separate surface-level excitement from real usefulness. When people understand the purpose, process, and limits of ${topicLabel.toLowerCase()}, they can apply it with more confidence and fewer mistakes.`,
      "",
      "## Features",
      `* Clear structure helps people understand where ${topicLabel.toLowerCase()} fits into a workflow.`,
      "* Practical examples make the topic easier to remember and apply.",
      "* Measurable outcomes help teams decide whether the approach is actually working.",
      "",
      `A good implementation also includes feedback. When users, readers, or teams respond to how something works in practice, the idea can be improved over time instead of remaining static.`,
      "",
      "## Real-World Use Cases",
      `* A learner can use ${topicLabel.toLowerCase()} to understand a subject through examples, comparisons, and step-by-step practice.`,
      "* A business team can use the same idea to improve planning, reduce repeated work, and communicate decisions more clearly.",
      "* A creator or founder can use it to shape content, products, or services around what people actually need.",
      "",
      `In real projects, the strongest use cases are rarely isolated. ${topicLabel} becomes more useful when it is connected to research, design, execution, and review.`,
      "",
      "## Advantages",
      `* It gives readers a practical framework for understanding ${topicLabel.toLowerCase()} instead of relying on vague definitions.`,
      "* It improves decision-making by encouraging people to compare options and consider consequences.",
      "* It supports better communication because teams can discuss the same idea with shared language.",
      "",
      `The biggest advantage is clarity. When a topic is explained with examples and structure, people are more likely to use it correctly and less likely to be distracted by hype.`,
      "",
      "## Challenges",
      `* The topic can be misunderstood when people focus only on buzzwords instead of practical use.`,
      "* Poor inputs, unclear goals, or rushed execution can reduce the quality of the result.",
      "* Overuse can create unnecessary complexity when a simpler approach would work better.",
      "",
      `These challenges do not make ${topicLabel.toLowerCase()} less valuable. They simply show why responsible use matters. The best results come from matching the idea to the right problem and reviewing outcomes honestly.`,
      "",
      "## Future Scope",
      `${topicLabel} will continue to grow as tools, platforms, and user expectations become more advanced. Future applications will likely focus on personalization, better collaboration, and more accessible workflows for people with different skill levels.`,
      "",
      `The future scope also depends on trust. People will expect systems and content around ${topicLabel.toLowerCase()} to be transparent, reliable, and useful in real situations rather than impressive only at first glance.`,
      "",
      "## Conclusion",
      `${topicLabel} is most powerful when it is explained clearly, connected to real examples, and applied with a practical purpose. Readers benefit when they understand both the opportunities and the limits.`,
      "",
      `A professional approach to ${topicLabel.toLowerCase()} should focus on clarity, usefulness, and continuous improvement. With the right structure, it can help people learn faster, make better choices, and turn ideas into meaningful outcomes.`,
    ].join("\n")
  );
};

const inlineMarkdownToHtml = (value) =>
  String(value || "")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');

const markdownToHtml = (markdown) => {
  const lines = cleanBlogMarkdown(markdown).split("\n");
  const html = [];
  let listType = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = Math.min(headingMatch[1].length, 4);
      html.push(`<h${level}>${inlineMarkdownToHtml(headingMatch[2])}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${inlineMarkdownToHtml(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${inlineMarkdownToHtml(orderedMatch[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdownToHtml(line)}</p>`);
  }

  closeList();
  return sanitizeHtml(html.join("\n"));
};

export const generateBlogContent = async (prompt, category = "") => {
  try {
    const topic = String(prompt || "").trim();
    const categoryLabel = String(category || "").trim();

    if (!topic) {
      const error = new Error("Please enter a topic to generate blog content.");
      error.statusCode = 400;
      throw error;
    }

    const messages = [
      {
        role: "system",
        content: BLOG_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildBlogPrompt(topic, categoryLabel),
      },
    ];

    const buildResult = (markdown, source = "ai") => {
      const cleanedMarkdown = cleanBlogMarkdown(markdown);
      const html = markdownToHtml(cleanedMarkdown);
      const plainText = stripHtml(html);

      return {
        content: cleanedMarkdown,
        markdown: cleanedMarkdown,
        html,
        wordCount: plainText.split(/\s+/).filter(Boolean).length,
        source,
      };
    };

    if (!hasOpenAIKey && !hasOpenRouterKey) {
      return buildResult(buildFallbackBlogContent(topic, categoryLabel), "fallback");
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const attemptMessages = attempt === 0
        ? messages
        : [
            ...messages,
            {
              role: "user",
              content:
                "Regenerate the article. The previous answer was incomplete. Keep all required sections and make every section detailed with paragraphs and examples.",
            },
          ];

      const response = hasOpenAIKey
        ? await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: process.env.OPENAI_BLOG_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
              temperature: 0.45,
              max_tokens: 3200,
              messages: attemptMessages,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          )
        : await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model: process.env.OPENROUTER_BLOG_MODEL || process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini",
              temperature: 0.45,
              max_tokens: 3200,
              messages: attemptMessages,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

      const rawContent = response.data?.choices?.[0]?.message?.content || "";
      const formattedContent = formatMarkdownBlogContent(rawContent);

      if (formattedContent && isValidBlogMarkdown(formattedContent)) {
        return buildResult(formattedContent, "ai");
      }
    }

    return buildResult(buildFallbackBlogContent(topic, categoryLabel), "fallback");
  } catch (error) {
    if (error?.statusCode === 400) {
      throw error;
    }

    console.error("OpenAI/OpenRouter Blog Error:", error.response?.data || error.message);
    const fallback = buildFallbackBlogContent(prompt, category);
    return {
      content: fallback,
      markdown: fallback,
      html: markdownToHtml(fallback),
      wordCount: plainMarkdownText(fallback).split(/\s+/).filter(Boolean).length,
      source: "fallback",
    };
  }
};

export const getBlogInsights = async (title, content) => {
  try {
    if (!hasOpenRouterKey) {
      return buildFallbackInsights(title, content);
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "arcee-ai/trinity-large-preview:free",
        temperature: 0.7,
        max_tokens: 900,
        messages: [
          {
            role: "user",
            content: `You are an intelligent blogging assistant.
Read the following blog content:

Title: ${title}
Content: ${content}

Based on this content, generate:
1. A detailed summary (6-10 sentences) explaining the key ideas, context, and practical value.
2. Five natural and engaging comment suggestions that a reader might post under the blog.

Return the response in strictly JSON format like this:
{
  "summary": "The summary text here...",
  "suggestions": ["Comment 1", "Comment 2", "Comment 3", "Comment 4", "Comment 5"]
}`,
          },
        ],
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error("AI Insights Error:", error.response?.data || error.message);
    return buildFallbackInsights(title, content);
  }
};
