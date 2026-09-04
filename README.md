# 📅 dsh-plugin-last30days

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DSH Compatibility](https://img.shields.io/badge/DeepSeek%20Harness-Plugin-blue.svg)](https://github.com/deepseek-ai/dsh)

**Multi-Source Temporal Intelligence & 30-Day Research Plugin for DeepSeek Harness (DSH).**

AI agents frequently suffer from **recency bias** or **stale web search results**, retrieving articles and discussions from years ago when researching rapidly evolving software, APIs, models, or community reactions.

`dsh-plugin-last30days` equips DeepSeek Harness with dedicated tools to extract what developers, communities, and users actually said in the **last 30 days** across **Reddit**, **X (Twitter)**, **GitHub**, **YouTube**, and **Hacker News**.

---

## ✨ Features

- **⏱️ Strictly Bounded Temporal Search**: Enforces a 30-day window (`time_range: 'month'`) on all queries.
- **🌐 Multi-Channel Support**:
  - `reddit`: Subreddit discussions, sentiment, and user feedback.
  - `x`: Real-time announcements, engineering threads, and hot takes.
  - `github`: Recent releases, trending issues, and pull requests.
  - `hackernews`: Hacker News stories and high-signal comments.
  - `youtube`: Video titles, transcripts, and commentary.
- **🛡️ Zero-Disk Secrets & Smart Fallback**:
  - Commercial API keys (`SCRAPECREATORS_API_KEY`, `BRAVE_API_KEY`, `PERPLEXITY_API_KEY`) can be provided via environment variables.
  - **Zero-Key Fallback**: When commercial keys are absent, it automatically queries the local [SearXNG](https://github.com/Bebbolus/dsh-plugin-searxng) instance with monthly boundary filters, ensuring zero costs and 100% privacy.
- **🩺 Doctor Diagnostic Tool**: Run `last30days_doctor` anytime to audit provider health and channel status.

---

## 🛠️ Tool Schemas

### 1. `last30days_search`
```json
{
  "name": "last30days_search",
  "description": "Research what people and communities are saying about any topic in the last 30 days across Reddit, X, YouTube, GitHub, Hacker News and web.",
  "parameters": {
    "query": {
      "type": "string",
      "required": true,
      "description": "Topic, technology, project or question to research in the last 30 days."
    },
    "channels": {
      "type": "array",
      "required": false,
      "description": "Specific channels to query (e.g. [\"reddit\", \"x\", \"github\", \"hackernews\", \"youtube\"]). Defaults to all."
    }
  }
}
```

### 2. `last30days_doctor`
```json
{
  "name": "last30days_doctor",
  "description": "Check health and API configuration for the last30days temporal search system.",
  "parameters": {}
}
```

---

## 📦 Installation in DeepSeek Harness

### 1. Via DSH CLI
```bash
dsh plugin --profile web add dsh-plugin-last30days
```

### 2. In Docker (`entrypoint.sh`)
```bash
ln -sfn /home/node/plugins/dsh-plugin-last30days /workspace/node_modules/dsh-plugin-last30days
dsh plugin --profile web add -w /home/node/plugins/dsh-plugin-last30days
```

---

## 📄 License

MIT © [Bebbolus](https://github.com/Bebbolus)
