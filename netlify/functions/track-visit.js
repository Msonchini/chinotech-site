// Enregistre une visite du site (appelée automatiquement depuis index.html)
const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event) => {
  connectLambda(event);
  try {
    const store = getStore('chinotech-visits');
    const today = new Date().toISOString().slice(0, 10); // format AAAA-MM-JJ

    const visits = (await store.get('visits', { type: 'json' })) || {};
    visits[today] = (visits[today] || 0) + 1;

    await store.setJSON('visits', visits);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    // On ne bloque jamais l'affichage du site à cause d'une erreur de comptage
    return { statusCode: 200, body: JSON.stringify({ ok: false }) };
  }
};
