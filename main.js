import prompt from './prompt.json' assert { type: 'json' };
import axios from 'axios';

async function waitForCondition(url, uid) {
  while (true) {
    const imageResponse = await axios.get(url);
    
    // Remplacez par votre condition
    if (imageResponse.data && imageResponse.data[uid]) {
      return imageResponse;
    }
    
    // Attendre 2 secondes avant le prochain essai
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}


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

    log(url)

    const result = await waitForCondition(url, response.data.prompt_id);

    log (result.data)


    // Gestion des requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.empty(headers);
    }

    // Réponse normale avec les headers CORS
    return res.text("Hello World", 200, headers);
}