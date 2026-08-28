exports.handler = async function (event, context) {
  const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!INSTAGRAM_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Token no configurado en Netlify." }),
    };
  }

  const cleanToken = INSTAGRAM_TOKEN.trim();

  // Consulta extendida con compatibilidad para Instagram Basic API y Graph API
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=4&access_token=${cleanToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Si devuelve error de campo no existente en Instagram Graph API, intentamos con /me?fields=media
    if (data.error && data.error.code === 100) {
      const fbUrl = `https://graph.facebook.com/v19.0/me?fields=media{id,caption,media_type,media_url,permalink,timestamp,thumbnail_url}&access_token=${cleanToken}`;
      const fbResponse = await fetch(fbUrl);
      const fbData = await fbResponse.json();

      if (fbData.media) {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
          body: JSON.stringify(fbData.media),
        };
      }
    }

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
