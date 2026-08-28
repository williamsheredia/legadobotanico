exports.handler = async function (event, context) {
  let token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Token no configurado en Netlify." }),
    };
  }

  // Limpiar espacios en blanco, comillas dobles/simples y comas invisibles
  token = token.trim().replace(/^["']|["']$/g, '');

  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=4&access_token=${encodeURIComponent(token)}`;

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
