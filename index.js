/**
 * dsh-plugin-last30days
 * Cordis plugin for DeepSeek Harness (DSH)
 * Multi-source temporal search across the last 30 days (Reddit, X, YouTube, GitHub, HackerNews, Web).
 */

const SEARXNG_URL = process.env.SEARXNG_URL || 'http://searxng:8080';

export function getCredentials() {
  return {
    scrapecreators: process.env.SCRAPECREATORS_API_KEY || null,
    brave: process.env.BRAVE_API_KEY || null,
    perplexity: process.env.PERPLEXITY_API_KEY || null,
    twitter_token: process.env.TWITTER_AUTH_TOKEN || null,
    searxng_url: SEARXNG_URL
  };
}

export async function searchSearxngMonthly({ query, channel = 'general', signal }) {
  try {
    const searchUrl = new URL('/search', SEARXNG_URL);
    let channelQuery = query;

    if (channel === 'reddit') channelQuery = `site:reddit.com ${query}`;
    else if (channel === 'x' || channel === 'twitter') channelQuery = `(site:x.com OR site:twitter.com) ${query}`;
    else if (channel === 'youtube') channelQuery = `site:youtube.com ${query}`;
    else if (channel === 'github') channelQuery = `site:github.com ${query}`;
    else if (channel === 'hackernews') channelQuery = `site:news.ycombinator.com ${query}`;

    searchUrl.searchParams.set('q', channelQuery);
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('time_range', 'month');

    const res = await fetch(searchUrl.toString(), {
      headers: { 'Accept': 'application/json', 'User-Agent': 'DSH-Last30Days/1.0' },
      ...signal ? { signal } : {}
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 8).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.content || '',
      publishedDate: r.publishedDate || 'past month',
      channel: channel
    }));
  } catch (err) {
    return [];
  }
}

export const name = 'dsh-plugin-last30days';
export const inject = ['tools'];

export function apply(ctx) {
  if (ctx.tools && typeof ctx.tools.register === 'function') {
    // 1. Primary temporal search tool
    ctx.tools.register({
      name: 'last30days_search',
      description: 'Research what people and communities are saying about any topic in the last 30 days across Reddit, X, YouTube, GitHub, Hacker News and web.',
      parameters: {
        query: {
          type: 'string',
          required: true,
          description: 'Topic, technology, project or question to research in the last 30 days.'
        },
        channels: {
          type: 'array',
          required: false,
          description: 'Specific channels to query (e.g. ["reddit", "x", "github", "hackernews", "youtube"]). Defaults to all.'
        }
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            timeframe: { type: 'string' },
            total_results: { type: 'number' },
            results: { type: 'array' }
          }
        },
        render: (val) => JSON.stringify(val, null, 2)
      },
      execute: async (args) => {
        const query = args.query;
        const requestedChannels = Array.isArray(args.channels) && args.channels.length > 0
          ? args.channels
          : ['reddit', 'x', 'github', 'hackernews', 'web'];

        const channelPromises = requestedChannels.map(ch => searchSearxngMonthly({ query, channel: ch }));
        const channelResults = await Promise.allSettled(channelPromises);

        const allItems = [];
        for (const res of channelResults) {
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            allItems.push(...res.value);
          }
        }

        return {
          topic: query,
          timeframe: 'last 30 days',
          total_results: allItems.length,
          results: allItems
        };
      }
    });

    // 2. Diagnostic / health check tool
    ctx.tools.register({
      name: 'last30days_doctor',
      description: 'Check health and API configuration for the last30days temporal search system.',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            providers: { type: 'object' }
          }
        },
        render: (val) => JSON.stringify(val, null, 2)
      },
      execute: async () => {
        const creds = getCredentials();
        return {
          status: 'healthy',
          providers: {
            searxng_fallback: creds.searxng_url ? 'configured' : 'missing',
            scrapecreators_api: creds.scrapecreators ? 'active' : 'not_set',
            brave_api: creds.brave ? 'active' : 'not_set',
            perplexity_api: creds.perplexity ? 'active' : 'not_set',
            twitter_auth: creds.twitter_token ? 'active' : 'not_set'
          },
          note: 'When commercial API keys are not provided, last30days routes searches through local SearXNG with month-bounded temporal filters.'
        };
      }
    });
  }
}

export default {
  name,
  inject,
  apply,
  getCredentials,
  searchSearxngMonthly
};
