export const skillCategories = [
  {
    name: 'Programming Languages',
    description: 'Assess proficiency in various programming languages',
    icon: 'code-icon',
  },
  {
    name: 'Web Development',
    description: 'Frontend and backend web development skills',
    icon: 'web-icon',
  },
  {
    name: 'Data Science',
    description: 'Data analysis, machine learning, and statistics',
    icon: 'data-icon',
  },
  {
    name: 'Digital Marketing',
    description: 'SEO, SEM, social media, and content marketing',
    icon: 'marketing-icon',
  },
  {
    name: 'Design',
    description: 'UI/UX design, graphic design, and visual communication',
    icon: 'design-icon',
  },
  {
    name: 'Business Analysis',
    description: 'Business process analysis and project management',
    icon: 'business-icon',
  },
  {
    name: 'Communication',
    description: 'Written and verbal communication skills',
    icon: 'communication-icon',
  },
  {
    name: 'Leadership',
    description: 'Management and leadership capabilities',
    icon: 'leadership-icon',
  },
];

export const sampleAssessments = [
  {
    categoryName: 'Programming Languages',
    assessment: {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics, ES6+, and common patterns',
      passingScore: 75,
      timeLimit: 30,
      questions: [
        {
          question: 'What is the output of: console.log(typeof null)?',
          optionA: 'null',
          optionB: 'object',
          optionC: 'undefined',
          optionD: 'string',
          correctAnswer: 'B',
          explanation: 'typeof null returns "object" due to a historical bug in JavaScript that has been kept for backward compatibility.',
        },
        {
          question: 'Which of the following is NOT a way to create an object in JavaScript?',
          optionA: 'let obj = {}',
          optionB: 'let obj = new Object()',
          optionC: 'let obj = Object.create(null)',
          optionD: 'let obj = new Array()',
          correctAnswer: 'D',
          explanation: 'new Array() creates an array, not an object. All other options create objects.',
        },
      ],
    },
  },
  {
    categoryName: 'Web Development',
    assessment: {
      title: 'React Fundamentals',
      description: 'Test your knowledge of React components, hooks, and state management',
      passingScore: 70,
      timeLimit: 25,
      questions: [
        {
          question: 'Which hook is used to manage state in functional components?',
          optionA: 'useEffect',
          optionB: 'useState',
          optionC: 'useContext',
          optionD: 'useReducer',
          correctAnswer: 'B',
          explanation: 'useState is the primary hook for managing local state in functional components.',
        },
        {
          question: 'What is the purpose of useEffect hook?',
          optionA: 'To manage state',
          optionB: 'To handle side effects',
          optionC: 'To create context',
          optionD: 'To optimize performance',
          correctAnswer: 'B',
          explanation: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.',
        },
      ],
    },
  },
];