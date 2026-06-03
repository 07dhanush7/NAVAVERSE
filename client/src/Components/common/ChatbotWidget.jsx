import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "Hi, I'm NAVAVERSE Assistant. I can help you find Jobs, Events, Courses, Startups, and Blogs.",
};

const RESTRICTED_MESSAGE =
  "I can only help with NAVAVERSE features like Jobs, Events, Courses, Startups, and Blogs.";
const ERROR_MESSAGE = "Something went wrong, please try again";

const NAVAVERSE_TOPIC_PATTERNS = [
  /\bnavaverse\b/i,
  /\b(job|jobs|job board|opening|post|application|apply|recruiter|hiring)\b/i,
  /\b(event|events|registration|register|ticket|schedule)\b/i,
  /\b(course|courses|enroll|enrollment|lesson|module|learn|learning)\b/i,
  /\b(startup|startups|founder|company|collaboration|collaborate|partnership)\b/i,
  /\b(blog|blogs|post|write|publish|article|comment)\b/i,
  /\blogin\b/i,
  /\b(register|registration)\b/i,
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

const PAGE_HINTS = {
  jobs: {
    label: "Jobs page",
    title: "Need help with jobs?",
    text: "Ask me how to apply for a job or jump straight to the jobs board.",
    prompt: "How to apply job",
  },
  events: {
    label: "Events page",
    title: "Need help with events?",
    text: "I can explain event registration or take you to the events list.",
    prompt: "How to register event",
  },
  courses: {
    label: "Courses page",
    title: "Need help with courses?",
    text: "I can explain course creation or help you explore learning content.",
    prompt: "How to add course",
  },
  startups: {
    label: "Startups page",
    title: "Need help with startups?",
    text: "I can explain how to add a startup or open the startups board.",
    prompt: "How to add startup",
  },
  blogs: {
    label: "Blogs page",
    title: "Need help with blogs?",
    text: "I can guide you to the blog feed or related publishing actions.",
    prompt: "Explore blogs",
  },
};

const QUICK_ACTIONS = [
  { label: "Explore Jobs", path: "/jobs", reply: "Taking you to jobs." },
  { label: "Explore Events", path: "/events", reply: "Taking you to events." },
  { label: "Explore Courses", path: "/courses", reply: "Taking you to courses." },
  { label: "Explore Startups", path: "/startups", reply: "Taking you to startups." },
];

const normalizeText = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isNavaverseQuery = (value, pageKey) => {
  const message = normalizeText(value);
  if (!message) return false;

  if (NAVAVERSE_TOPIC_PATTERNS.some((pattern) => pattern.test(message))) {
    return true;
  }

  if (
    /\b(navaverse|platform|site|website|dashboard|profile|account|login|register)\b/i.test(message) &&
    NAVAVERSE_ACTION_PATTERNS.some((pattern) => pattern.test(message))
  ) {
    return true;
  }

  if (
    /\bhow (do i|to use|to work|to navigate)\b/i.test(message) &&
    /\b(platform|site|website|app|dashboard|profile|account)\b/i.test(message)
  ) {
    return true;
  }

  const pageRules = PAGE_RULES[pageKey];
  if (pageRules && pageRules.some((pattern) => pattern.test(message))) {
    return true;
  }

  return false;
};

const getPageKey = (pathname) => {
  if (pathname.startsWith("/jobs")) return "jobs";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/courses")) return "courses";
  if (pathname.startsWith("/startups")) return "startups";
  if (pathname.startsWith("/blogs") || pathname.startsWith("/blog")) return "blogs";
  return null;
};

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);

  const pageKey = useMemo(() => getPageKey(location.pathname), [location.pathname]);
  const pageHint = pageKey ? PAGE_HINTS[pageKey] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const addBotMessage = (botText) => {
    setMessages((current) => [
      ...current,
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: botText,
      },
    ]);
  };

  const sendMessage = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      },
    ]);
    setInputValue("");

    if (!isNavaverseQuery(trimmed, pageKey)) {
      addBotMessage(RESTRICTED_MESSAGE);
      return;
    }

    setIsSending(true);

    try {
      const { data } = await axios.post("/ai/chatbot", {
        message: trimmed,
        context: {
          pageKey,
          pathname: location.pathname,
        },
      });

      const botReply = data?.reply || ERROR_MESSAGE;

      addBotMessage(botReply);

      if (data?.route) {
        navigate(data.route);
      }
    } catch (error) {
      addBotMessage(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (path) => {
    navigate(path);
    const action = QUICK_ACTIONS.find((item) => item.path === path);

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: action?.label || `Open ${path.replace("/", "")}`,
      },
      {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: action?.reply || `Taking you to ${path.replace("/", "")}.`,
      },
    ]);

    setIsOpen(false);
  };

  const handleHintAction = () => {
    if (!pageHint) return;
    setInputValue(pageHint.prompt);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-launcher ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close NAVAVERSE Assistant" : "Open NAVAVERSE Assistant"}
        aria-expanded={isOpen}
        aria-controls="navaverse-assistant"
      >
        <MessageCircle size={22} />
        <span className="chatbot-launcher-glow" />
      </button>

      <section
        id="navaverse-assistant"
        className={`chatbot-panel ${isOpen ? "open" : ""}`}
        aria-hidden={!isOpen}
      >
        <header className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-badge">
              <Sparkles size={14} />
            </span>
            <div>
              <strong>NAVAVERSE Assistant</strong>
              <small>{pageHint ? pageHint.label : "Always ready to help"}</small>
            </div>
          </div>

          <button
            type="button"
            className="chatbot-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </header>

        <div className="chatbot-body">
          {pageHint ? (
            <div className="chatbot-hint">
              <p className="chatbot-hint-title">{pageHint.title}</p>
              <p className="chatbot-hint-copy">{pageHint.text}</p>
              <button type="button" className="chatbot-hint-action" onClick={handleHintAction}>
                {pageHint.prompt}
              </button>
            </div>
          ) : null}

          <div className="chatbot-quick-actions" aria-label="Quick actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className="chatbot-quick-action"
                onClick={() => handleQuickAction(action.path)}
              >
                {action.label}
              </button>
            ))}
        </div>

        {isSending ? <div className="chatbot-status">NAVAVERSE Assistant is thinking...</div> : null}

        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`chatbot-message-row ${message.role}`}>
              <div className={`chatbot-message-bubble ${message.role}`}>{message.text}</div>
            </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className="chatbot-input-row" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask NAVAVERSE Assistant..."
            aria-label="Chat message"
            disabled={isSending}
          />
          <button type="submit" className="chatbot-send" aria-label="Send message" disabled={isSending}>
            <Send size={16} />
          </button>
        </form>
      </section>
    </>
  );
};

export default ChatbotWidget;


