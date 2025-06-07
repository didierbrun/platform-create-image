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

  const test = "red hair girl"

  updatePrompt.prompt['3'].inputs.seed = Math.floor(Math.random() * 1000000)
  updatePrompt.prompt['6'].inputs.text = `${test}, [light contrast], [hard shadows],(photo)`

  const response = await axios.post('http://192.168.1.58:8188/api/prompt', JSON.stringify(updatePrompt))



  const url = `http://192.168.1.58:8188/api/history/${response.data.prompt_id}`


  const result = await waitForCondition(url, response.data.prompt_id, log);

  const image0 = result.data[response.data.prompt_id].outputs['10'].images[0]
  const image1 = result.data[response.data.prompt_id].outputs['10'].images[1]
  const image2 = result.data[response.data.prompt_id].outputs['10'].images[2]
  const image3 = result.data[response.data.prompt_id].outputs['10'].images[3]

  const urlImage0 = `http://192.168.1.58:8188/api/view?filename=${image0.filename}&subfolder=${image0.subfolder}&type=${image0.type}&rand=${Math.random()}`
  const urlImage1 = `http://192.168.1.58:8188/api/view?filename=${image1.filename}&subfolder=${image1.subfolder}&type=${image1.type}&rand=${Math.random()}`
  const urlImage2 = `http://192.168.1.58:8188/api/view?filename=${image2.filename}&subfolder=${image2.subfolder}&type=${image2.type}&rand=${Math.random()}`
  const urlImage3 = `http://192.168.1.58:8188/api/view?filename=${image3.filename}&subfolder=${image3.subfolder}&type=${image3.type}&rand=${Math.random()}`

  const encodedImage0 = await encodeImageToBase64(urlImage0);
  const encodedImage1 = await encodeImageToBase64(urlImage1);
  const encodedImage2 = await encodeImageToBase64(urlImage2);
  const encodedImage3 = await encodeImageToBase64(urlImage3);


  // Gestion des requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.empty(headers);
  }

  return res.json({
    success: true,
    images: [
      encodedImage0.base64WithPrefix,
      encodedImage1.base64WithPrefix,
      encodedImage2.base64WithPrefix,
      encodedImage3.base64WithPrefix
    ]
  }, 200, headers);
}