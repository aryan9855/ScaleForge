import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { BrainCircuit, Send, Loader2, Award, CheckCircle2, AlertCircle, Sparkles, Volume2, Mic, MicOff, Square } from 'lucide-react';

const Interview = () => {
  const location = useLocation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Stop any "ghost voices" from previous sessions on load/unmount
    window.speechSynthesis.cancel();
    
    if (location.state?.retryQuestion) {
      setQuestion(location.state.retryQuestion);
      window.history.replaceState({}, document.title);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [location.state]);

  // --- Speech Output (TTS) ---
  const handleSpeak = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // --- Speech Input (STT) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("Speech Recognition: Started");
      setIsListening(true);
    };
    recognition.onend = () => {
      console.log("Speech Recognition: Ended");
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      let errorMsg = "Speech recognition failed.";
      if (event.error === 'network') {
        errorMsg = "Speech error: Please check your internet connection (Chrome uses cloud-based recognition).";
      } else if (event.error === 'not-allowed') {
        errorMsg = "Speech error: Microphone permission denied. Please allow it in browser settings.";
      }
      setError(errorMsg);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        console.log("Speech Recognition: Final transcript detected:", finalTranscript);
        setAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.start();
    window._recognition = recognition;
  };

  const stopListening = () => {
    if (window._recognition) {
      window._recognition.stop();
    }
    setIsListening(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setFeedback(null);
    setAnswer('');
    try {
      const { data } = await api.get('/interview/generate');
      setQuestion(data.question);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isListening) stopListening();
    setEvaluating(true);
    try {
      const { data } = await api.post('/interview/evaluate', { question, answer });
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {!question ? (
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-indigo-100 border border-indigo-50 p-4">
            <img src="/favicon.png" alt="ScaleForge" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome to ScaleForge</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Test your high-level architecture skills with professional AI scenarios.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 max-w-md mx-auto">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center gap-2 mx-auto transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            Generate Question
          </button>
        </div>
      ) : !feedback ? (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white relative group">
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Question</h2>
            <p className="text-2xl font-semibold leading-relaxed pr-12">{question}</p>
            <button 
              onClick={() => handleSpeak(question)}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
              title="Read Aloud"
            >
              {isSpeaking ? <Square className="w-6 h-6 fill-white" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Your Solution</label>
                <div className="flex items-center gap-2">
                  {isListening && <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1"><Mic className="w-3 h-3" /> LISTENING...</span>}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isListening ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {isListening ? <><MicOff className="w-4 h-4" /> Stop Voice</> : <><Mic className="w-4 h-4" /> Use Voice Input</>}
                  </button>
                </div>
              </div>
              <textarea
                required
                rows="12"
                className={`w-full p-6 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 leading-relaxed font-mono text-sm ${isListening ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}
                placeholder="Describe your design (Data models, API, Scalability, Caching, DB choice)..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => setQuestion('')}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={evaluating}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    Submit Solution <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Feedback & Score</h2>
                <p className="text-slate-500">How you performed in this scenario</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleSpeak(`Score: ${feedback.score}. Strengths: ${feedback.strengths.join(', ')}. Improving points: ${feedback.improvements.join(', ')}. Ideal answer snippet: ${feedback.idealAnswer}`)}
                  className="p-4 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
                  title="Speak Feedback Summary"
                >
                  {isSpeaking ? <Square className="w-6 h-6 fill-slate-600" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex flex-col items-center shadow-lg shadow-indigo-100">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80">Score</span>
                  <span className="text-4xl font-black">{feedback.score}/10</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-4">
                  <CheckCircle2 className="w-5 h-5" /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-emerald-700 text-sm flex gap-2">
                      <span className="font-bold text-emerald-300">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <h3 className="flex items-center gap-2 text-amber-800 font-bold mb-4">
                  <AlertCircle className="w-5 h-5" /> Missing Points
                </h3>
                <ul className="space-y-2">
                  {feedback.missingPoints.map((m, i) => (
                    <li key={i} className="text-amber-700 text-sm flex gap-2">
                      <span className="font-bold text-amber-200">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Areas for Improvement</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.improvements.map((imp, i) => (
                  <span key={i} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-xs font-semibold">
                    {imp}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Ideal Solution Recommendation</h3>
              <p className="text-slate-600 text-sm leading-relaxed p-6 bg-white border border-slate-100 rounded-2xl italic">
                "{feedback.idealAnswer}"
              </p>
            </div>

            <button
              onClick={() => {
                setQuestion('');
                setFeedback(null);
                setAnswer('');
              }}
              className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Try Another Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
