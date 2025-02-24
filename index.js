const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const nltk = require('nltk');
const path = require('path');
const fs = require('fs');  // Ajout de cette ligne
const stopwords = require('nltk-stopwords');
const { Tokenizer, FrequencyDistribution } = require('natural');
const sbd = require('sbd');
const axios = require('axios');
//const mysql = require('mysql2');
const mysql = require('mysql2/promise');



// const Spellchecker = require('hunspell-spellchecker');
// const frDictionary = require('dictionary-fr');

// const dictionary = new Spellchecker();
// dictionary.use(frDictionary);




// const punkt = require('nltk-punkt');
// const random = require('random');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//const pool = new Pool({
  //user: 'root',
  //host: '172.16.10.6',  // Replace with your host
  //database: 'test',
  //password: 'chakaweb',  // Replace with your password
  //port: '5432',  // Replace with your port
//});


const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'chatboot',
  port: 8889, // Si vous utilisez MAMP
});



const SEUIL_DE_SIMILARITE = 0.005; // Replace with your similarity threshold

//feedback 
const feedbackModel = {};

// nltk.download('stopwords');
// nltk.download('punkt');

// Spécifiez le chemin vers le répertoire contenant les données nltk téléchargées localement.
// const nltkDataPath = path.join(__dirname, 'stopwords');

// Chargez les mots d'arrêt localement
// stopwords.load(path.join(nltkDataPath, 'corpora', 'stopwords'));
console.log('Chemin d\'accès aux stopwords :', path.join(__dirname, 'stopwords'));
// stopwords.load(path.join(__dirname, 'stopwords'));
// stopwords.load(path.join(__dirname, 'node_modules', 'nltk-stopwords', 'data', 'stopwords', 'corpora', 'stopwords'));
const stopwordsPath = path.join(__dirname, 'node_modules', 'nltk-stopwords', 'data', 'stopwords', 'corpora', 'stopwords');
if (fs.existsSync(stopwordsPath)) {
  stopwords.load(stopwordsPath);
} else {
  console.error('Stopwords file not found:', stopwordsPath);
}


// Initialisez le module nltk-punkt avec le chemin local pour les données
// punkt.loadData(path.join(nltkDataPath, 'tokenizers', 'punkt'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Your functions

// function normalizeString(s) {
//   return s ? s.toLowerCase().split(/\s+/).join(' ') : '';
// }

function normalizeString(s) {
  return s ? s.toLowerCase().match(/\b\w+\b/g).join(' ') : '';
}

async function getConversationHistory(user_ip, source) {
  const query = "SELECT message, user_ip, sens, is_bot, date_upload FROM chat_history WHERE user_ip = ? AND source = ? ORDER BY date_upload ASC";
  const values = [user_ip, source];

  try {
    const result = await pool.query(query, values);
    return result.rows;

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}

function extractSerializableData(conversationHistoryResponse) {
  try {
    // Vérifiez si la réponse est bien définie
    if (!conversationHistoryResponse || !Array.isArray(conversationHistoryResponse)) {
      console.error('Invalid conversation history:', conversationHistoryResponse);
      return {}; // Retourne un objet vide en cas de problème
    }
    const conversationHistory = conversationHistoryResponse;

    console.log('Conversation History Structure:', conversationHistory);

    return {
      'user_message': conversationHistory.map(entry => entry.message),
      'user_ip': conversationHistory.map(entry => entry.user_ip),
      'sens': conversationHistory.map(entry => entry.sens),
      'is_bot': conversationHistory.map(entry => entry.is_bot),
      'timestamp': conversationHistory.map(entry => entry.date_upload),
    };

  } catch (error) {
    console.error('Error extracting conversation history data:', error);
    return {};
  }
}




async function correctSpellingOnline(text) {
  try {
    const response = await axios.post('https://languagetool.org/api/v2/check', null, {
      params: {
        text: text,
        language: 'fr',
      },
    });

    console.log('API Response:', response.data);

    const matches = response.data.matches;

    if (matches.length > 0) {
      console.log('Spelling Corrections:');
      // Correction suggérée (premier remplacement suggéré pour chaque match)
      for (const match of matches) {
        const suggestion = match.replacements[0].value;
        console.log(`Replace '${match.context.text}' with '${suggestion}'`);
        text = text.replace(new RegExp(match.context.text, 'g'), suggestion);
      }
    }

    console.log('Corrected Text:', text);

    return text;
  } catch (error) {
    console.error('Error correcting spelling online:', error.message);
    throw error;
  }
}

async function mainLogic(userMessage, source) {
  console.log('Original User Message:', userMessage);
  
  const correctedUserMessage = await correctSpellingOnline(userMessage);
  console.log('Corrected User Message:', correctedUserMessage);
  
  const keywordResponse = await getResponseFromDb(correctedUserMessage, source);  
  if (keywordResponse) {
    return keywordResponse;
  }

  // Si aucun mot-clé spécifique n'est trouvé, utiliser une réponse par défaut
  const defaultResponses = [
    "Désolé, je n'ai pas compris.",
    "Je n'ai pas saisi cela. Pourriez-vous reformuler?",
    "Essayez d'être plus explicite.",
    "Excusez-moi, je ne suis pas sûr de comprendre.",
  ];

  // Assurez-vous que le tableau n'est pas vide avant d'utiliser getRandomElement
  if (defaultResponses.length > 0) {
     // Collecter le feedback des utilisateurs après chaque réponse
    // const userFeedback = /* Logique pour obtenir le feedback de l'utilisateur (par exemple, à partir de la requête HTTP) */;
    // await collectUserFeedback(userMessage, botResponse, userFeedback);

    return getRandomElement(defaultResponses);
  } else {
    // Si le tableau est vide, retournez une chaîne vide ou un message d'erreur
    return "Réponse par défaut non définie.";
  }
}


// Fonction pour obtenir un élément aléatoire d'un tableau
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}




// get_response_from_db avec correcteur orthographe
async function getResponseFromDb(user_message, source) {
  const query = "SELECT text FROM intents WHERE source = ?";
  const values = [source];

  try {
    const [rows] = await pool.query(query, values); // De nouveau, la déstructuration pour obtenir les résultats
    console.log('Rows from DB:', rows); // Afficher les résultats pour voir si cela correspond à ce que vous attendez

    const normalizedUserWords = normalizeString(user_message).split(' ').filter(word => word !== '');
    const userWords = new Set(normalizedUserWords);
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const row of rows) {  // Parcourez directement `rows`
      const text = row.text;

      console.log('Text from Database:', text);

      // Utiliser sbd pour découper le texte en phrases
      const sentences = sbd.sentences(text, { newline_boundaries: true });

      // Parcourir les phrases et trouver la correspondance
      for (const sentence of sentences) {
        const normalizedSentence = normalizeString(sentence);
        const normalizedUserMessage = normalizeString(user_message);

        const sentenceWords = normalizedSentence.split(' ').filter(word => word !== '');
        const userWords = normalizedUserMessage.split(' ').filter(word => word !== '');

        const intersectionSize = [...userWords].filter(word => sentenceWords.includes(word)).length;
        const unionSize = userWords.length + sentenceWords.length - intersectionSize;
        const similarity = intersectionSize / unionSize;

        console.log('Sentence:', sentence);
        console.log('Similarity:', similarity);

        // Mettre à jour la meilleure correspondance si la similarité est supérieure au seuil défini
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = sentence; // Stocker la meilleure correspondance (phrase)
        }
      }
    }

    // Utiliser la meilleure correspondance trouvée
    console.log('Best Match:', bestMatch);

    return bestMatch !== null ? bestMatch : '';

  } catch (error) {
    console.error('Error fetching response from database:', error);
    throw error;
  }
}


// get_response_from_db avec correcteur orthographe
// async function getResponseFromDb(user_message, source) {
//   const query = "SELECT text FROM intents WHERE source = $1";
//   const values = [source];

//   try {
//       const result = await pool.query(query, values);

//       const normalizedUserSentences = sbd.sentences(user_message, { newline_boundaries: true }).map(sentence => {
//           const normalizedSentence = normalizeString(sentence);
//           console.log("message corrigé ",dictionary.correct(normalizedSentence))
//           return dictionary.correct(normalizedSentence);
//       });

//       let bestMatch = null;
//       let bestSimilarity = 0;

//       for (const row of result.rows) {
//           const text = row.text;
//           console.log('Text from Database:', text);

//           // Utiliser sbd pour découper le texte en phrases
//           const sentences = sbd.sentences(text, { newline_boundaries: true });

//           // Parcourir les phrases et trouver la correspondance
//           for (const sentence of sentences) {
//               const normalizedSentence = normalizeString(sentence);

//               // Comparer la similarité Jaccard pour chaque sous-ensemble de mots
//               const sentenceWords = normalizedSentence.split(' ').filter(word => word !== '');
//               const userWords = normalizedUserSentences.join(' ').split(' ').filter(word => word !== '');

//               const intersectionSize = [...userWords].filter(word => sentenceWords.includes(word)).length;
//               const unionSize = userWords.length + sentenceWords.length - intersectionSize;
//               const similarity = intersectionSize / unionSize;

//               console.log('Sentence:', sentence);
//               console.log('Similarity:', similarity);

//               // Mettre à jour la meilleure correspondance si la similarité est supérieure au seuil défini
//               if (similarity > bestSimilarity) {
//                   bestSimilarity = similarity;
//                   bestMatch = sentence; // Stocker la meilleure correspondance (phrase)
//               }
//           }
//       }

//       // Utiliser la meilleure correspondance trouvée
//       console.log('Best Match:', bestMatch);

//       return bestMatch !== null ? bestMatch : '';

//   } catch (error) {
//       console.error('Error fetching response from database:', error);
//       throw error;
//   }
// }



// async function getResponseFromDb(user_message, source) {
//   const query = "SELECT text FROM intents WHERE source = $1";
//   const values = [source];

//   try {
//     const result = await pool.query(query, values);

//     const userWords = new Set(normalizeString(user_message).split());
//     let bestMatch = null;
//     let bestSimilarity = 0;

//     for (const row of result.rows) {
//       const text = row.text;
//       console.log('Text from Database:', text);
//       if (text) {
//         const normalizedText = normalizeString(text);

//         const textWords = new Set(normalizedText.split());
//         const intersectionSize = [...userWords].filter(word => textWords.has(word)).length;
//         const unionSize = userWords.size + textWords.size - intersectionSize;

//         // Utilisez la similarité de Jaccard pour calculer la similarité
//         const similarity = intersectionSize / unionSize;
//         console.log("textWords",textWords)
//         console.log("intersectionSize",intersectionSize)
//         console.log("unionSize",unionSize)
//         console.log("similarity",similarity)

//         // Ajoutez une logique pour prendre en compte une similarité plus faible
//         if (similarity >= bestSimilarity) {
//           bestSimilarity = similarity;
//           bestMatch = text;
//         }
//       }
//     }

//     return bestMatch !== null ? bestMatch : ''; // Explicitement renvoyer une chaîne vide si aucune correspondance n'est trouvée

//   } catch (error) {
//     console.error('Error fetching response from database:', error);
//     throw error;
//   }
// }


app.post('/get_response', async (req, res) => {
  const user_message = req.body.user_message;
  const user_ip = req.connection.remoteAddress;
  const referer = req.get('referer');
  const source_info = getSourceInfo(referer);

  console.log('Adresse IP de l\'utilisateur :', user_ip);
  console.log('Nom d\'hôte du site source :', source_info);

  try {
    const timestamp_user = new Date().toISOString().slice(0, 19).replace("T", " ");

    // 1. Insérer le message de l'utilisateur dans la base de données
    const insertUserQuery = `
      INSERT INTO chat_history (message, user_ip, is_bot, sens, date_upload, source,bot_response,chat_id)
      VALUES (?, ?, ?, ?, ?, ?,?,?)
    `;
    const userValues = [user_message, user_ip, 0, "IN", timestamp_user, source_info,""," "];
    const [userInsertResult] = await pool.query(insertUserQuery, userValues);

    const userChatId = userInsertResult.insertId;  // Récupérer l'ID du message de l'utilisateur

    // Attendre un instant avant de générer la réponse du bot
    await new Promise(resolve => setTimeout(resolve, 1000));

    const timestamp_bot = new Date().toISOString().slice(0, 19).replace("T", " ");
    let botResponse;

    // Vérifier si une réponse est disponible dans la base de données
    const dbResponse = await getResponseFromDb(user_message, source_info);

    if (dbResponse) {
      botResponse = dbResponse;
    } else {
      botResponse = await mainLogic(user_message, source_info);
    }

    // 2. Insérer la réponse du bot dans la base de données en utilisant le chat_id de l'utilisateur
    const insertBotQuery = `
      INSERT INTO chat_history (message, chat_id, user_ip, is_bot, sens, date_upload, source,bot_response)
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;
    const botValues = [botResponse, userChatId, user_ip, 1, "OUT", timestamp_bot, source_info," "];
    await pool.query(insertBotQuery, botValues);

    // Récupérer l'historique de la conversation
    const conversationHistory = await getConversationHistory(user_ip, source_info);
    const extractedConversationHistory = extractSerializableData(conversationHistory);

    // Préparer les données de réponse
    const responseData = {
      bot_response: botResponse,
      conversation_history: extractedConversationHistory,
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/get_conversation_history', async (req, res) => {
  const user_ip = req.connection.remoteAddress;
  const source_info = getSourceInfo(req.headers.referer);

  try {
    const query = "SELECT message, user_ip, sens, is_bot, date_upload FROM chat_history WHERE user_ip = ? AND source = ? ORDER BY date_upload ASC";
    const values = [user_ip, source_info];

    const [result] = await pool.query(query, values); // Déstructurer pour obtenir les résultats
    res.json({ 'conversation_history': result });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique de la conversation:', error);
    res.status(500).json({ 'error': 'Internal Server Error' });
  }
});


function getSourceInfo(referer) {
  try {
    const parsedUrl = new URL(referer || '');
    const hostname = parsedUrl.hostname;

    console.log('Referer:', referer);
    console.log('Hostname:', hostname);

    if (!hostname) {
      console.error('Erreur: nom d\'hôte non trouvé');
      return ''; // ou une valeur par défaut appropriée
    }

    // Supprimez www du début du nom d'hôte si présent
    const cleanedHostname = hostname.replace(/^www\./, '');

    // Découpez le nom d'hôte en parties en utilisant le point comme séparateur
    const parts = cleanedHostname.split('.');

    // Utilisez la première partie comme sourceSite, même si parts.length === 1
    const sourceSite = parts[0];

    console.log('SourceSite:', sourceSite);

    return sourceSite;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la source:', error);
    return ''; // ou une valeur par défaut appropriée
  }
}

// Endpoint pour recueillir le feedback de l'utilisateur
app.post('/collect_feedback', (req, res) => {
    const userMessage = req.body.user_message;
    const botResponse = req.body.bot_response;
    const userFeedback = req.body.user_feedback;

    // Enregistrez ces données dans votre base de données
    // Exemple avec une base de données PostgreSQL
    const query = 'INSERT INTO feedback (user_message, bot_response, user_feedback) VALUES (?, ?, ?)';
    const values = [userMessage, botResponse, userFeedback];

    pool.query(query, values)
        .then(result => {
            console.log('Feedback enregistré avec succès dans la base de données');
            // Mettez à jour le modèle d'apprentissage automatique si nécessaire
            // ...
            res.json({ success: true });
        })
        .catch(error => {
            console.error('Erreur lors de l\'enregistrement du feedback dans la base de données:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});











const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
