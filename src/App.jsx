import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

// --- Configuration ---
// La clé API est gérée via les variables d'environnement de Vite.
// Cette syntaxe est la bonne, elle fonctionnera avec la configuration du guide.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


// --- Composant Principal de l'App ---
export default function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    // Vérification de la clé API
    if (!GEMINI_API_KEY) {
        setError("La clé API Gemini n'est pas configurée. Veuillez vérifier votre fichier .env.");
        setIsLoading(false);
        return;
    }

    try {
      const requestBody = {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      };

      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error.message || `Erreur API: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        const generatedText = data.candidates[0].content.parts[0].text;
        setResponse(generatedText);
      } else {
        throw new Error("La réponse de l'API est dans un format inattendu.");
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-4">
      <div className="w-full max-w-3xl bg-gray-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col" style={{height: '90vh'}}>
        
        {/* En-tête */}
        <header className="p-6 border-b border-gray-700 bg-gray-800/50">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            Mon Interface Gemini
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Posez une question, écrivez une instruction et laissez l'IA vous répondre.
          </p>
        </header>
        
        {/* Zone d'affichage de la réponse */}
        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {response && <ResponseDisplay text={response} />}
          {!isLoading && !error && !response && <WelcomeMessage />}
        </main>
        
        {/* Champ de saisie */}
        <footer className="p-4 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <Sparkles className="text-indigo-400 h-6 w-6 flex-shrink-0" />
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Ex: Rédige un poème sur le cosmos..."
              className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-500 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow duration-300"
              rows="2"
              disabled={isLoading}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                  }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transform hover:scale-110 active:scale-100"
            >
              <Send className={`h-6 w-6 ${isLoading ? 'animate-pulse' : ''}`} />
            </button>
          </form>
        </footer>
      </div>
      <p className="text-gray-600 text-sm mt-4">Développé avec React, Firebase & Gemini.</p>
    </div>
  );
}

// --- Sous-composants pour l'affichage ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    <p className="mt-4 text-lg">Génération en cours...</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
    <h3 className="font-bold mb-2">Une erreur est survenue</h3>
    <p>{message}</p>
  </div>
);

const ResponseDisplay = ({ text }) => (
  <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
    {text}
  </div>
);

const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
        <Sparkles className="w-16 h-16 mb-4 text-gray-600"/>
        <h2 className="text-2xl font-bold text-gray-400">Bienvenue</h2>
        <p className="mt-2">Le résultat de votre prompt s'affichera ici.</p>
    </div>
);
