exports.handler = async function (event, context) {
  const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!INSTAGRAM_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Token de Instagram no configurado." }),
    };
  }

  const cleanToken = INSTAGRAM_TOKEN.trim();

  // Si el token es de Meta Graph (empieza con EA) usa Facebook API, si no, usa Instagram Basic API
  const baseUrl = cleanToken.startsWith("EA")
    ? "https://graph.facebook.com/v19.0/me/media"
    : "https://graph.instagram.com/me/media";

  const url = `${baseUrl}?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=4&access_token=${cleanToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al consultar la API de Instagram" }),
    };
  }
};
