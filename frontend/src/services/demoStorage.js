const DEMO_ATTEMPTS_KEY = 'scaleforge-demo-attempts';

export const getDemoAttempts = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_ATTEMPTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addDemoAttempt = ({ question, userAnswer, feedback }) => {
  const attempt = {
    _id: `demo-${Date.now()}`,
    question,
    userAnswer,
    feedback,
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
  const attempts = [attempt, ...getDemoAttempts()];
  sessionStorage.setItem(DEMO_ATTEMPTS_KEY, JSON.stringify(attempts));
  return attempt;
};

export const clearDemoAttempts = () => {
  sessionStorage.removeItem(DEMO_ATTEMPTS_KEY);
};
