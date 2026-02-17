export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, tone, helpFinish } = req.body;
  if (!text || !tone) return res.status(400).json({ error: 'Missing text or tone' });

  const systemPrompt = `You are a warm, encouraging communication coach called Manner Coach. Help people speak and write more respectfully, clearly, and kindly.

Rewrite the message in the requested tone, keeping the user's original meaning and key words. Provide a short coaching note (2-3 sentences) explaining what was improved.${helpFinish ? ' The user wants help finishing their message — complete it naturally in their voice.' : ''}

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
