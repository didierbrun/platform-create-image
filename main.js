import prompt from './prompt.json' assert { type: 'json' };
import axios from 'axios';

async function waitForCondition(url, uid, log) {
  while (true) {
    const imageResponse = await axios.get(url);

    // Remplacez par votre condition
    if (imageResponse.data && imageResponse.data[uid]) {
      return imageResponse;
    }

    // Attendre 2 secondes avant le prochain essai
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function encodeImageToBase64(urlImage) {
  try {
    const response = await axios.get(urlImage, {
      responseType: 'arraybuffer' // Important pour les données binaires
    });

    // Convertir en base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    // Optionnel : ajouter le préfixe data URL avec le type MIME
    const contentType = response.headers['content-type'] || 'image/png';
    const base64WithPrefix = `data:${contentType};base64,${base64}`;

    return {
      base64: base64,
      base64WithPrefix: base64WithPrefix,
      contentType: contentType
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'encodage de l'image: ${error.message}`);
  }
}


export default async ({ req, res, log, error }) => {
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


  const result = await waitForCondition(url, response.data.prompt_id, log);

  const image = result.data[response.data.prompt_id].outputs['10'].images[0]

  console.log(result.data[response.data.prompt_id].outputs['10'].images.length)

  const urlImage = `http://192.168.1.58:8188/api/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}&rand=${Math.random()}`

  const encodedImage = await encodeImageToBase64(urlImage);


  // Gestion des requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.empty(headers);
  }

  return res.json({
    success: true,
    base64: encodedImage.base64,
    base64WithPrefix: encodedImage.base64WithPrefix,
    contentType: encodedImage.contentType
  }, 200, headers);
}