// Netlify (or Vercel) Function to persist the directory data
// Receives an array of scientists and triggers a repository_dispatch
// that updates cientificas.json via the existing GitHub Actions workflow.

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { scientists } = JSON.parse(event.body);
    if (!Array.isArray(scientists)) throw new Error('Payload must contain an array');

    // Token is provided as an environment variable in the deployment platform
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not defined in environment');

    const owner = 'astrochiacol';
    const repo = 'chia';
    const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.everest-preview+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'save_scientists',
        client_payload: { scientists },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: resp.status, body: `GitHub error: ${txt}` };
    }
    return { statusCode: 200, body: '✅ dispatched' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: e.message };
  }
};
