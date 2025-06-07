export default async ({req, res, log, error}) => {
    res.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'false' // Doit être false quand Origin est *
    };

    // Gérer les requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.send('', 200);
    }

    return res.send("Hello Test");
}