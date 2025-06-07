import prompt from './prompt.json' with { type: 'json' };


export default async ({req, res, log, error}) => {
    // Headers CORS à inclure dans la réponse
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    };

    log(prompt);

    // Gestion des requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.empty(headers);
    }

    // Réponse normale avec les headers CORS
    return res.text("Hello World", 200, headers);
}