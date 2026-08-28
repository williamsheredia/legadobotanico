exports.handler = async function (event, context) {
  // El Token lo leeremos de las variables de entorno de Netlify por seguridad
  const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!INSTAGRAM_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Token de Instagram no configurado." }),
    };
  }

  const response = await fetch(
  `https://graph.facebook.com/v19.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
);
  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache en navegador por 1 hora para evitar rebasar límites de API
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
