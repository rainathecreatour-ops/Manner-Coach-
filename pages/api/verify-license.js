export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ success: false, error: 'No license key provided' });

  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_permalink: process.env.GUMROAD_PRODUCT_PERMALINK,
        license_key: licenseKey,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, error: 'Invalid or expired license key.' });
    }
  } catch (err) {
    console.error('License verify error:', err);
    return res.status(500).json({ success: false, error: 'Verification failed. Please try again.' });
  }
}
