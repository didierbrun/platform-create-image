import prompt from './prompt.json' assert { type: 'json' };
import axios from 'axios';

export default async ({req, res, log, error}) => {
    // Headers CORS à inclure dans la réponse
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    };

    let updatePrompt = JSON.parse(JSON.stringify(prompt))

    updatePrompt.prompt['3'].inputs.seed = Math.floor(Math.random() * 1000000)
    
    const response = await axios.post('http://192.168.1.58:8188/api/prompt', JSON.stringify(updatePrompt))



    const url = `http://192.168.1.58:8188/api/history/${response.data.prompt_id}`

    const imageResponse = await axios.get(url)

    log(imageResponse.data)


    // Gestion des requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.empty(headers);
    }

    // Réponse normale avec les headers CORS
    return res.text("Hello World", 200, headers);
}