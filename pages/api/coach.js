export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, tone, helpFinish } = req.body;
  if (!text || !tone) return res.status(400).json({ error: 'Missing text or tone' });

  const systemPrompt = `You are a warm, encouraging communication coach called Manner Coach. Your job is to help people speak and write more respectfully, clearly, and kindly.

When given a message, you will:
1. Rewrite it in the requested tone, keeping the user's original meaning, key words, and intent intact.
2. Provide a short, warm coaching note (2-3 sentences) explaining what was improved and why.
${helpFinish ? '3. The user wants help finishing their message — complete it naturally in their voice and the requested tone.' : ''}

Always respond with valid JSON in this exact format:
{"rewrite": "...", "coaching": "..."}

Do not include markdown, backticks, or any extra text. Only the JSON object.`;

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
        messages: [{ role: 'user', content: `Tone: ${tone}\n\nMessage to improve: "${text}"` }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.map(b => b.text || '').join('').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Coach API error:', err);
    return res.status(500).json({ error: 'Failed to generate coaching response' });
  }
}
