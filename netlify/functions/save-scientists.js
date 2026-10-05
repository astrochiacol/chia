// netlify/functions/save-scientists.js
/**
 * Netlify Serverless Function
 * Receives a list of scientists from the client and forwards a GitHub repository_dispatch
 * event using the GTHUB_TOKEN secret defined in Netlify's environment variables.
 */
export async function handler(event, context) {
  try {
    const { scientists } = JSON.parse(event.body || "{}");
    if (!Array.isArray(scientists)) {
      return { statusCode: 400, body: "Invalid payload: 'scientists' must be an array" };
    }

    const payload = {
      event_type: "save_scientists",
      client_payload: { scientists }
    };

    const resp = await fetch(
      "https://api.github.com/repos/astrochiacol/chia/dispatches",
      {
        method: "POST",
        headers: {
          Authorization: `token ${process.env.GTHUB_TOKEN}`,
          Accept: "application/vnd.github.everest-preview+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, body: errText };
    }
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }, body: JSON.stringify({ message: "OK" }) };
  } catch (e) {
    console.error("Serverless function error:", e);
    return { statusCode: 500, body: e.message };
  }
}
