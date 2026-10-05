// netlify/functions/upload-image.js
/**
 * Netlify Serverless Function
 * Receives a base64 image and stores it in the repository under images/cientificas/
 * Returns the raw GitHub URL to the committed file.
 */
export async function handler(event, context) {
  try {
    const { imageBase64, fileName } = JSON.parse(event.body || "{}");
    if (!imageBase64 || !fileName) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing imageBase64 or fileName" })
      };
    }
    const repoOwner = "astrochiacol";
    const repoName = "chia";
    const path = `images/cientificas/${fileName}`;
    // GitHub API to create or update file content
    const resp = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodeURIComponent(path)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Add scientist image ${fileName}`,
          content: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          branch: "main"
        })
      }
    );
    if (!resp.ok) {
      const err = await resp.text();
      return { statusCode: resp.status, body: err };
    }
    const data = await resp.json();
    // Raw URL to the file (via GitHub raw content)
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${path}`;
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ url: rawUrl })
    };
  } catch (e) {
    console.error("upload-image function error:", e);
    return { statusCode: 500, body: e.message };
  }
}
