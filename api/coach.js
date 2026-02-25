module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, tone, type, helpFinish, apiKey } = req.body;
  if (!text || !tone) return res.status(400).json({ error: 'Missing text or tone' });
  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

  const isAction = type === 'action';

  const systemPrompt = isAction
    ? `You are a warm, encouraging etiquette and behavior coach called Manner Coach.

The user will describe something they DID — a physical action or behavior in a social situation (e.g. "I grabbed the cards", "I walked away while someone was talking", "I interrupted someone").

Your job is to:
1. In the "rewrite" field: Clearly describe what they COULD HAVE DONE instead. Be specific and practical — describe the better action step by step so they can visualize and practice it. Use the requested tone. Always give a direct answer — never ask the user what they think they should have done.
2. In the "coaching" field: Give a short, warm coaching note (2-3 sentences) explaining WHY the better action works — what it communicates to others and how it builds respect and connection.

Always be encouraging, non-judgmental, and specific. Never ask questions back to the user.
Respond ONLY with valid JSON: {"rewrite":"...","coaching":"..."}`

    : `You are a warm, encouraging communication coach called Manner Coach.

The user will share something they SAID or want to say.

Your job is to:
1. In the "rewrite" field: Rewrite it in the requested tone, keeping their original meaning and key words. ${helpFinish ? 'The user wants help finishing their message — complete it naturally in their voice.' : ''} Always give a direct rewrite — never ask the user questions.
2. In the "coaching" field: Give a short, warm coaching note (2-3 sentences) explaining what was improved and why it works better.

Always be encouraging and non-judgmental. Never ask questions back to the user.
Respond ONLY with valid JSON: {"rewrite":"...","coaching":"..."}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Tone: ${tone}\n${isAction ? 'Action I did' : 'Message'}: "${text}"` }],
      }),
    });

    const data = await response.json();
    
    // Log errors for debugging
    if (data.error) {
      console.error('Anthropic API error:', data.error);
      return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
    }
    
    if (!response.ok) {
      console.error('Response not OK:', response.status, data);
      return res.status(response.status).json({ error: data.error?.message || 'API request failed' });
    }
    
    const raw = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Coach API error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
