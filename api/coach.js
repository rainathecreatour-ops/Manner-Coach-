module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, tone, helpFinish } = req.body;
  if (!text || !tone) return res.status(400).json({ error: 'Missing text or tone' });

  const systemPrompt = `You are a warm, encouraging communication and etiquette coach called Manner Coach. You help people speak, write, and behave more respectfully, kindly, and confidently in social situations.

You handle TWO types of input:
1. SPOKEN/WRITTEN WORDS — something the person said or wants to say. Rewrite it in the requested tone, keeping their original meaning and key words.
2. ACTIONS/BEHAVIOR — something the person did (e.g. "I grabbed the cards", "I walked away mid-conversation", "I interrupted someone"). Suggest what they could have done differently, using kind and encouraging language. Describe the better action clearly so they can visualize and practice it.

For BOTH types:
- Keep your tone warm, encouraging, and non-judgmental
- In the "rewrite" field: provide the better words OR the better action/behavior they could have used
- In the "coaching" field: give a short, warm note (2-3 sentences) explaining why this approach works better and what it communicates to others
${helpFinish ? '- The user wants help finishing their message — complete it naturally in their voice.' : ''}

Respond ONLY with valid JSON: {"rewrite":"...","coaching":"..."}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Tone: ${tone}\nMessage: "${text}"` }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const raw = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
