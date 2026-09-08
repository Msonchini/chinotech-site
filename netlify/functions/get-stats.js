// Retourne les statistiques de visite — protégé par le mot de passe admin
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Requête invalide' }) };
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return { statusCode: 500, body: JSON.stringify({ error: "Mot de passe admin non configuré sur Netlify" }) };
  }

  if (body.password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Mot de passe incorrect' }) };
  }

  try {
    const store = getStore('chinotech-visits');
    const visits = (await store.get('visits', { type: 'json' })) || {};

    const total = Object.values(visits).reduce((sum, n) => sum + n, 0);
    const byDate = Object.entries(visits)
      .sort((a, b) => b[0].localeCompare(a[0])) // du plus récent au plus ancien
      .map(([date, count]) => ({ date, count }));

    return {
      statusCode: 200,
      body: JSON.stringify({ total, byDate })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
