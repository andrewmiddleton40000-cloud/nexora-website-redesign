// Nexora Digital Academy — public copy and the seed curriculum.
// Course records (prices, status, prerequisites) live in the database and are editable in /academy/admin.
// This file only seeds them the first time. Never add institutional/school financial terms here:
// this module is bundled into public pages.

export const academy = {
  name: 'Nexora Digital Academy',
  shortName: 'Nexora Academy',
  parent: 'Nexora Technologies',
  tagline: 'Learn. Build. Innovate.',
  description:
    'Nexora Digital Academy teaches practical artificial intelligence, coding and digital innovation skills to beginners, secondary-school students and adults through live online classes, recorded lessons and real projects.',
}

export const academyNav = [
  { label: 'Academy', to: '/academy' },
  { label: 'Courses', to: '/academy/courses' },
  { label: 'For Schools', to: '/academy/schools' },
  { label: 'Contact', to: '/academy/contact' },
] as const

export const reasons = [
  {
    title: 'Built for complete beginners',
    body: 'No technical background is needed for Level 1. Every idea is explained in plain language, with examples drawn from school, work and everyday life.',
  },
  {
    title: 'Live teaching, not just videos',
    body: 'Each course runs as scheduled live online classes with an instructor. Recordings are available afterwards so no learner is left behind.',
  },
  {
    title: 'Practical from week one',
    body: 'Learners practise on real tasks — research, writing, planning and presenting — and finish every course with a project they built themselves.',
  },
  {
    title: 'A clear path to progress',
    body: 'Five progressive levels take learners from first prompts to building digital solutions. Each level is earned by completing the one before it.',
  },
  {
    title: 'Responsible use at the centre',
    body: 'We teach how AI tools fail as well as how they help: checking facts, protecting personal information and using AI honestly in schoolwork.',
  },
  {
    title: 'Safe for younger learners',
    body: 'Guardian consent for under-18s, school-coordinated classes, minimal personal data and no private messaging between learners.',
  },
]

export const approach = [
  { title: 'Learn', body: 'Short, focused live sessions introduce one idea at a time, supported by readings and recorded lessons.' },
  { title: 'Practise', body: 'Guided exercises after every session turn each idea into a skill learners can repeat on their own.' },
  { title: 'Build', body: 'Assignments and a final project apply what was learned to a real problem the learner cares about.' },
  { title: 'Reflect', body: 'Instructor feedback, assessments and a project presentation show what was mastered and what to improve.' },
]

export const howItWorks = [
  { number: '01', title: 'Create an account', body: 'Register with your details. Learners under 18 add a parent or guardian, who must give consent.' },
  { number: '02', title: 'Choose and pay for your course', body: 'Pay securely online or by bank transfer. Access opens only after the payment is verified.' },
  { number: '03', title: 'Join your cohort', body: 'You are placed in a class group with scheduled live sessions and a named instructor.' },
  { number: '04', title: 'Learn, practise and submit', body: 'Attend classes or watch recordings, complete lessons, assignments, quizzes and your final project.' },
  { number: '05', title: 'Complete and progress', body: 'Once your completion is verified you receive a certificate and become eligible for the next level.' },
]

export const completionRequirements = [
  'Complete all required lessons in the course.',
  'Meet the attendance requirement — attend live sessions or complete the recorded lessons for any you miss.',
  'Achieve at least 60% overall across the course assessments.',
  'Submit the required final project.',
  'Receive completion verification from an authorised Nexora administrator.',
]

export const academyFaqs = [
  {
    q: 'Who are the courses for?',
    a: 'Level 1 is designed for complete beginners — secondary-school students, university students, professionals and anyone curious about AI. Later levels build on the skills from earlier ones.',
  },
  {
    q: 'Do I need my own laptop?',
    a: 'A laptop or desktop computer with a stable internet connection gives the best experience. Many activities can also be followed on a smartphone, and partner schools may provide access to computer labs.',
  },
  {
    q: 'How are classes delivered?',
    a: 'Classes are live and online, led by an instructor at scheduled times. Sessions are recorded so you can catch up on anything you miss or revisit a topic later.',
  },
  {
    q: 'How do I pay?',
    a: 'After registering you can pay online by card, bank transfer or USSD through our payment provider where available, or by direct bank transfer. Course access opens only once a payment has been verified — we never grant access based on screenshots.',
  },
  {
    q: 'Can I go straight to a higher level?',
    a: 'No. Each level builds on the one before it, so you become eligible for the next course only after your completion of the previous level is verified. Each course is enrolled and paid for separately.',
  },
  {
    q: 'What do I receive when I finish?',
    a: 'Learners who meet every completion requirement receive a Nexora Digital Academy certificate with a unique number that anyone can verify online. It is an academy certificate of completion, not a government or university qualification.',
  },
  {
    q: 'Will this course get me a job or an income?',
    a: 'No course can guarantee employment or income. Our courses build practical, transferable skills and a portfolio of work that you can use in school, in your career and in your own projects.',
  },
  {
    q: 'How do you protect younger learners?',
    a: 'Learners under 18 need parent or guardian consent. We collect only the information needed to run the course, classes are coordinated with partner schools, and there is no private messaging between learners. Read our safeguarding and privacy information for details.',
  },
]

export const schoolModel = {
  nexora: ['Curriculum and lesson plans', 'Qualified instructors', 'Learning resources and recordings', 'Live online classes', 'Assessments, feedback and certificates'],
  school: [
    'Coordinate student participation',
    'Share programme information with parents and guardians',
    'Organise class times and, where possible, a computer lab',
    'Nominate a staff coordinator',
  ],
}

export const schoolTypes = ['Private secondary school', 'Public secondary school', 'International school', 'Mission / faith school', 'Other']
export const yearGroups = ['JSS 1–3', 'SS 1', 'SS 2', 'SS 3', 'Whole school (eligible students)', 'Not sure yet']
export const populations = ['Under 100', '100 – 300', '300 – 600', '600 – 1,000', 'Over 1,000']

export const safeguarding = [
  {
    title: 'Parent and guardian consent',
    body: 'Learners under 18 must provide a parent or guardian’s name and phone number, and confirm that the guardian has agreed to their participation. Nexora verifies consent before a minor’s enrolment is activated.',
  },
  {
    title: 'School-approved enrolment',
    body: 'Where a learner joins through a partner school, the school confirms that the learner belongs to the school before they are attributed to it.',
  },
  {
    title: 'Minimal data collection',
    body: 'We ask only for what we need to run the course: name, contact details, country, school and — for minors — guardian contact. We do not ask for dates of birth, home addresses or identity documents.',
  },
  {
    title: 'Restricted access to personal data',
    body: 'Learner contact details are visible only to authorised Nexora staff. Partner schools see the names and progress of their own students only. Instructors see learners in their own classes.',
  },
  {
    title: 'Safe communication',
    body: 'There is no private messaging between learners. Communication happens in supervised live classes and through instructor feedback on submitted work.',
  },
  {
    title: 'Content moderation',
    body: 'Submissions are visible only to the learner and Nexora staff. Instructors review all submitted work, and inappropriate content is returned and recorded.',
  },
  {
    title: 'Never share passwords or personal information',
    body: 'Learners are taught never to enter passwords, personal identity details, or other people’s private information into AI tools, and never to share their account with anyone.',
  },
]

export type SeedLesson = {
  title: string
  kind: 'live' | 'recorded' | 'reading'
  summary: string
  content: string
  secondaryNote?: string
  durationMinutes?: number
  isLiveSession?: boolean
}
export type SeedModule = { week: number; title: string; summary: string; topics: string[]; lessons: SeedLesson[] }
export type SeedQuiz = { title: string; description: string; weight: number; questions: Array<{ q: string; options: string[]; answer: number }> }
export type SeedCourse = {
  slug: string
  level: number
  title: string
  levelLabel: 'Beginner' | 'Intermediate' | 'Advanced'
  summary: string
  description: string
  outcomes: string[]
  durationLabel: string | null
  delivery: string | null
  audience: string | null
  prerequisitesText: string
  priceKobo: number | null
  status: 'available' | 'locked'
  image: string
  modules?: SeedModule[]
  quizzes?: SeedQuiz[]
  instructorAssessments?: Array<{ title: string; description: string; weight: number }>
  assignments?: Array<{ title: string; instructions: string; kind: 'assignment' | 'final_project'; week: number }>
}

export const seedCourses: SeedCourse[] = [
  {
    slug: 'ai-prompt-engineering',
    level: 1,
    title: 'AI & Prompt Engineering',
    levelLabel: 'Beginner',
    summary: 'Understand how AI tools work and learn to write clear, effective prompts that produce useful, checked results.',
    description:
      'A four-week foundation course for complete beginners. Learners discover what artificial intelligence is, how tools like ChatGPT, Gemini and Copilot generate answers, and where they go wrong. They then learn a structured method for writing prompts, apply AI to research, writing, presentations and everyday productivity, and finish by building and presenting a responsible AI-assisted project.',
    outcomes: [
      'Explain in plain language what AI is and how AI chat tools produce answers',
      'Write structured prompts using role, task, context, constraints and format',
      'Refine and chain prompts to improve results step by step',
      'Use AI responsibly for research, writing, presentations and planning',
      'Fact-check AI output and recognise errors, bias and made-up information',
      'Plan, build and present a practical AI-assisted project',
    ],
    durationLabel: '4 weeks',
    delivery: 'Live online classes supported by recorded lessons',
    audience: 'Complete beginners, including secondary-school students',
    prerequisitesText: 'None. Basic reading, typing and internet skills are enough.',
    priceKobo: 2_000_000,
    status: 'available',
    image: 'academy/online-class.jpg',
    modules: [
      {
        week: 1,
        title: 'Understanding Artificial Intelligence',
        summary: 'What AI is, how AI tools work, the main tools learners will meet, and the limits every user must understand.',
        topics: ['What AI is', 'How AI tools work', 'Introduction to ChatGPT, Gemini and Copilot', 'AI limitations and responsible use'],
        lessons: [
          {
            title: 'Live session 1 — What AI is and how AI tools work',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'A friendly introduction to artificial intelligence and the idea of a computer that learns from examples.',
            content: `Artificial intelligence (AI) describes computer systems that perform tasks we usually associate with human thinking — recognising images, understanding language, making predictions or generating text.

Most AI tools you will use in this course are built on "large language models". A language model is trained on a very large collection of text. From that text it learns patterns: which words tend to follow which, how questions are usually answered, how an essay is structured.

When you type a message, the model does not look up a stored answer. It predicts a likely response one small piece at a time, based on the patterns it learned. That is why the same question can produce slightly different answers, and why an answer can sound confident while being wrong.

Key ideas from this session:
- AI tools are pattern-predictors, not search engines or encyclopaedias.
- They can be extremely useful for drafting, explaining and organising ideas.
- They do not "know" whether something is true. You remain responsible for checking.

Before the next session, write down three tasks in your own life — school, work or home — where you think an AI tool could help, and one task where you think it should not be used.`,
            secondaryNote:
              'For secondary-school learners: think of a language model like a very well-read classmate who has read millions of books but sometimes mixes things up. Helpful for explaining and brainstorming — but you still check their homework.',
          },
          {
            title: 'Live session 2 — Meet ChatGPT, Gemini and Copilot',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'A guided tour of three widely used AI assistants and what each is good at.',
            content: `In this session we compare three popular AI assistants side by side using the same simple tasks.

ChatGPT (from OpenAI) is a general-purpose conversational assistant. It is strong at explaining, drafting and reorganising text.

Gemini (from Google) is closely connected to Google's services. It can be convenient for summarising and for tasks that relate to Google tools.

Microsoft Copilot is built into Microsoft products such as Edge, Word and PowerPoint, and can show web sources for some answers.

All three change frequently, and features differ between free and paid versions. The skills in this course work across all of them, so you can use whichever tool your school, workplace or family has access to.

Safe account habits:
- Use your own account and never share your password with anyone, including classmates.
- Check the minimum age in each tool's terms. If you are under the minimum age, use tools only through your school or with a parent or guardian.
- Never type passwords, bank details, home addresses or other people's private information into an AI tool.

Practice: ask two different tools to "Explain photosynthesis to a 12-year-old in five sentences." Compare the answers. Which is clearer? Did either include something you think is wrong?`,
            secondaryNote:
              'If your school provides a specific tool, use that one. You do not need accounts on all three tools to complete the course.',
          },
          {
            title: 'Reading — AI limitations and responsible use',
            kind: 'reading',
            durationMinutes: 20,
            summary: 'Hallucinations, bias, out-of-date information, privacy and honesty in schoolwork.',
            content: `Every AI tool has limits. Knowing them is what makes you a skilled user rather than a careless one.

Hallucinations: AI tools sometimes invent facts, quotes, statistics or references that look real but are not. Always verify important claims using reliable sources.

Bias: models learn from human-written text, which includes stereotypes and unfair assumptions. Watch for answers that treat groups of people unfairly or ignore African and Nigerian context.

Out-of-date information: many models are trained on information up to a certain date and may not know about recent events.

Privacy: anything you type may be stored by the provider. Do not share passwords, identity numbers, health information, or personal details about yourself or others.

Academic honesty: using AI to understand a topic, brainstorm or check your writing can be helpful. Submitting AI-written work as your own, when your teacher has not allowed it, is dishonest. When in doubt, ask your teacher and be open about how you used AI.

A responsible user asks three questions every time:
- Is this true? How can I check it?
- Is this fair to everyone involved?
- Is it safe and honest for me to use this here?`,
            secondaryNote:
              'Ask your teacher what your school allows. Many schools permit AI for research and revision but not for writing graded essays.',
          },
        ],
      },
      {
        week: 2,
        title: 'Prompt Engineering',
        summary: 'A structured method for writing instructions that AI tools understand — and how to improve them.',
        topics: [
          'Prompt fundamentals',
          'Writing effective instructions',
          'Role, task, context, constraints, format and quality checking',
          'Prompt refinement',
          'Prompt chaining',
          'Practical exercises',
        ],
        lessons: [
          {
            title: 'Live session 3 — Prompt fundamentals and the RTCCFQ method',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'Learn the six building blocks of a strong prompt.',
            content: `A prompt is the instruction you give an AI tool. Vague prompts produce vague answers. Clear prompts produce useful answers.

In this course we use six building blocks — Role, Task, Context, Constraints, Format and Quality check (RTCCFQ):

- Role: who should the AI act as? "You are a patient maths tutor."
- Task: what exactly should it do? "Explain how to solve simultaneous equations."
- Context: what background does it need? "I am in SS 1 and I understand basic algebra."
- Constraints: what limits apply? "Use no more than 200 words and avoid jargon."
- Format: how should the answer look? "Give three numbered steps and one worked example."
- Quality check: how should it check itself? "At the end, list any assumptions you made."

Compare these two prompts:

Weak: "Tell me about simultaneous equations."

Strong: "You are a patient maths tutor. Explain how to solve simultaneous equations by substitution for an SS 1 student who understands basic algebra. Use under 200 words, give three numbered steps and one worked example, then list any assumptions you made."

You do not need every block every time — but the more of them you include, the more control you have.`,
            secondaryNote: 'Practise with subjects you are studying right now. Using AI to explain a topic is a great revision aid.',
          },
          {
            title: 'Live session 4 — Refinement and prompt chaining',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'Improve results through follow-up prompts and break big tasks into steps.',
            content: `Your first prompt is rarely your best. Prompt refinement means reading the answer critically and then giving targeted follow-up instructions:

- "Make it simpler — my reader is 13 years old."
- "Give me two examples from Nigeria."
- "That third point is wrong. Remove it and explain why it was wrong."
- "Shorten this to 100 words without losing the main idea."

Prompt chaining means breaking a large task into a sequence of smaller prompts, using each answer as the input to the next. For example, to plan a school presentation:

1. "List five possible angles for a presentation on clean water access in Lagos."
2. "For angle 3, create an outline with an introduction, three main points and a conclusion."
3. "For main point 2, suggest two questions I should research and the kinds of sources that would answer them."
4. "Turn my notes below into speaker notes of about 60 seconds per slide."

Chaining keeps you in control. You make the decisions at each step, and you can check accuracy before moving on.`,
          },
          {
            title: 'Practical exercises — Prompt workshop',
            kind: 'reading',
            durationMinutes: 40,
            summary: 'Five short exercises to practise every building block.',
            content: `Complete these exercises in any AI tool. Keep a note of your prompts and what changed when you improved them.

- Exercise 1: Ask for a study timetable with no details. Then rewrite the prompt using all six RTCCFQ blocks. Compare the results.
- Exercise 2: Ask the AI to explain a topic you already know well. Find at least one weakness or error in its answer.
- Exercise 3: Ask for a short story, then refine it three times — change the audience, the length and the setting.
- Exercise 4: Use a three-step chain to plan a small event (a class debate, a family celebration or a club meeting).
- Exercise 5: Write a prompt that asks the AI to check its own answer and list anything it is unsure about.

Reflection: which building block made the biggest difference to your results?`,
            secondaryNote: 'Do not include real names, phone numbers or personal details of classmates or family members in your prompts.',
          },
        ],
      },
      {
        week: 3,
        title: 'Practical AI Applications',
        summary: 'Apply prompting skills to research, writing, presentations, productivity and creativity — and check everything.',
        topics: ['Research', 'Writing and content creation', 'Presentations', 'Productivity', 'Digital creativity', 'Fact-checking'],
        lessons: [
          {
            title: 'Live session 5 — AI for research and fact-checking',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'Use AI to explore a topic, then verify what it tells you.',
            content: `AI tools are useful research assistants for getting an overview, generating questions and summarising material you provide. They are not reliable sources on their own.

A safe research workflow:
1. Ask the AI for an overview and a list of key questions about the topic.
2. Find trustworthy sources — textbooks, government and university websites, reputable news organisations.
3. Paste short extracts from those sources and ask the AI to summarise or compare them.
4. Check every important fact, number and quotation against the original source.
5. Cite the original sources, not the AI tool.

Fact-checking checklist:
- Does the claim appear in at least two independent reliable sources?
- Is the date of the information recent enough?
- Did the AI give a reference? Does that reference actually exist and say what was claimed?
- Does the claim seem surprising or too perfect? Check twice.`,
          },
          {
            title: 'Live session 6 — Writing, presentations and productivity',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'Draft, edit and present more effectively — while keeping your own voice.',
            content: `Writing: use AI to brainstorm, outline, explain grammar and give feedback on drafts you wrote. Ask "What are the three weakest parts of my paragraph and why?" rather than "Write my essay."

Presentations: ask AI to suggest a structure, simplify complex ideas into slide-sized points, and draft speaker notes from your own research. Keep slides short and use your own words when presenting.

Productivity: AI can turn a messy list into a plan, draft a polite email, build a revision timetable or summarise meeting notes.

Digital creativity: AI can suggest ideas for posters, stories, songs and designs. Treat its suggestions as a starting point — your choices make the work original.

Golden rule: you are the author. AI is an assistant. Be transparent about how you used it.`,
            secondaryNote: 'Always follow your school’s rules about AI in homework and coursework.',
          },
          {
            title: 'Recorded lesson — Fact-checking walkthrough',
            kind: 'recorded',
            durationMinutes: 25,
            summary: 'A step-by-step demonstration of checking an AI-generated answer against real sources.',
            content: `In this recorded walkthrough the instructor asks an AI tool a factual question about Nigeria, then checks each claim in the answer one by one using reliable sources, marking which claims were correct, which were outdated and which were invented.

Watch the recording, then repeat the process with a question of your own and note what you found.`,
          },
        ],
      },
      {
        week: 4,
        title: 'Projects and Assessments',
        summary: 'Build, present and reflect on a practical, responsible AI-assisted project.',
        topics: ['Building a practical AI-assisted project', 'Responsible AI applications', 'Project presentation', 'Final assessment'],
        lessons: [
          {
            title: 'Live session 7 — Planning your AI-assisted project',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 60,
            summary: 'Choose a real problem, plan your project and decide how AI will help responsibly.',
            content: `Your final project applies everything from the course to a real, useful outcome. Choose something you care about. Example project ideas:

- A revision guide for a school subject, with AI-generated practice questions that you have checked.
- A short information leaflet for your community on a health, environmental or safety topic, with verified facts.
- A presentation on a career or technology, researched with AI and checked against real sources.
- A planning toolkit for a small business, club or event.

Your project must include:
- A short description of the problem and who the project helps.
- At least five of the prompts you used, showing how you refined them.
- The final output (document, slides, leaflet or similar).
- A responsible-use statement: how you checked facts, protected personal information and avoided bias.

Responsible AI applications: think about who could be harmed if your output were wrong, and how you prevented that.`,
          },
          {
            title: 'Live session 8 — Project presentations and course review',
            kind: 'live',
            isLiveSession: true,
            durationMinutes: 75,
            summary: 'Present your project, give and receive feedback, and review the course.',
            content: `In the final live session learners present their projects in short three-minute presentations, followed by questions from the instructor.

Presentation structure:
1. The problem and who it helps.
2. How you used AI — your best prompt and how you improved it.
3. The result.
4. How you checked accuracy and used AI responsibly.

The instructor records a project presentation score. Learners who cannot attend live will be offered an alternative way to present, agreed with the instructor.

After presentations, complete the final assessment quiz.`,
            secondaryNote: 'Presenting can feel nervous — that is normal. Practise once with a friend or family member beforehand.',
          },
        ],
      },
    ],
    quizzes: [
      {
        title: 'Week 1 quiz — Understanding AI',
        description: 'Five questions on what AI is, how it works and its limitations.',
        weight: 1,
        questions: [
          { q: 'How does an AI chat tool usually produce an answer?', options: ['It looks up a stored answer in a database', 'It predicts a likely response based on patterns learned from text', 'A person types the answer in real time', 'It copies the first search result'], answer: 1 },
          { q: 'What is an AI "hallucination"?', options: ['A picture generated by AI', 'An answer that sounds real but contains invented information', 'When the AI refuses to answer', 'A slow response'], answer: 1 },
          { q: 'Which of these should you never type into an AI tool?', options: ['A question about history', 'A request to explain a maths topic', 'Your password or bank details', 'A draft paragraph you wrote'], answer: 2 },
          { q: 'Why might an AI tool give outdated information?', options: ['It is trained on information up to a certain date', 'It is always connected to live news', 'It deletes old information', 'It only reads textbooks'], answer: 0 },
          { q: 'What is the honest way to use AI in schoolwork?', options: ['Submit AI-written essays as your own', 'Follow your school’s rules and be open about how you used AI', 'Never tell your teacher', 'Copy answers from classmates’ AI chats'], answer: 1 },
        ],
      },
      {
        title: 'Week 2 quiz — Prompt engineering',
        description: 'Five questions on the RTCCFQ method, refinement and chaining.',
        weight: 1,
        questions: [
          { q: 'In RTCCFQ, what does "Context" mean?', options: ['The background information the AI needs', 'The colour of the text', 'The number of words', 'The AI tool you choose'], answer: 0 },
          { q: 'Which is an example of a constraint?', options: ['"You are a tutor"', '"Use no more than 150 words"', '"Explain photosynthesis"', '"I am in SS 2"'], answer: 1 },
          { q: 'What is prompt chaining?', options: ['Sending the same prompt many times', 'Breaking a big task into a sequence of smaller prompts', 'Sharing prompts with classmates', 'Using two AI tools at once'], answer: 1 },
          { q: 'What is the best response to an AI answer that is too complicated?', options: ['Give up', 'Refine: ask it to simplify for a specific audience', 'Copy it anyway', 'Start a new account'], answer: 1 },
          { q: 'Why add a "quality check" instruction?', options: ['To make the answer longer', 'To ask the AI to review itself and flag assumptions or uncertainty', 'To change the language', 'It has no purpose'], answer: 1 },
        ],
      },
      {
        title: 'Week 3 quiz — Practical applications',
        description: 'Five questions on research, writing and fact-checking.',
        weight: 1,
        questions: [
          { q: 'What should you cite in a research project?', options: ['The AI tool', 'The original reliable sources you checked', 'Nothing', 'A classmate'], answer: 1 },
          { q: 'Which is a good fact-checking habit?', options: ['Trusting confident-sounding answers', 'Confirming claims in at least two independent reliable sources', 'Checking only numbers', 'Asking the same AI again'], answer: 1 },
          { q: 'Which writing prompt keeps you as the author?', options: ['"Write my whole essay"', '"What are the weakest parts of my paragraph and why?"', '"Copy an essay from the internet"', '"Write it so my teacher cannot tell"'], answer: 1 },
          { q: 'An AI gives a reference you cannot find anywhere. What should you do?', options: ['Use it anyway', 'Treat the claim as unverified and find a real source', 'Invent a page number', 'Ignore all references'], answer: 1 },
          { q: 'What is the role of AI in digital creativity?', options: ['It replaces your ideas', 'It provides starting points that you shape with your own choices', 'It owns the final work', 'It cannot help with creative work'], answer: 1 },
        ],
      },
      {
        title: 'Final assessment',
        description: 'Ten questions covering the whole course.',
        weight: 2,
        questions: [
          { q: 'Which statement about AI language models is true?', options: ['They always tell the truth', 'They predict text based on learned patterns', 'They understand feelings exactly like people', 'They cannot make mistakes'], answer: 1 },
          { q: 'Which prompt is strongest?', options: ['"Tell me about climate change"', '"Explain climate change"', '"You are a science teacher. Explain three causes of climate change to an SS 1 student in under 150 words, as a numbered list, with one Nigerian example."', '"Climate?"'], answer: 2 },
          { q: 'What is the safest way to handle personal information with AI tools?', options: ['Share only your friends’ details', 'Never enter passwords or private personal details', 'Share everything for better answers', 'Use someone else’s account'], answer: 1 },
          { q: 'What does "Format" control in a prompt?', options: ['How the answer is structured', 'Which tool is used', 'The internet speed', 'The reader’s age'], answer: 0 },
          { q: 'Bias in AI output means…', options: ['The answer is too short', 'The answer may treat some people or places unfairly', 'The tool is offline', 'The answer is in a different language'], answer: 1 },
          { q: 'Why use prompt chaining for a big project?', options: ['To keep control and check each step', 'To avoid thinking', 'To make the AI slower', 'Because single prompts are banned'], answer: 0 },
          { q: 'Your AI-written summary includes a statistic. What next?', options: ['Publish it', 'Verify it in a reliable source before using it', 'Round it up', 'Delete the whole summary'], answer: 1 },
          { q: 'Which is a responsible AI project?', options: ['Fake news to go viral', 'A checked revision guide that states how AI was used', 'Copying a classmate’s project', 'Impersonating a teacher'], answer: 1 },
          { q: 'If you miss a live session, you should…', options: ['Skip that topic', 'Watch the recording and complete the lesson', 'Ask a classmate for their password', 'Wait for the next course'], answer: 1 },
          { q: 'What does completing this course guarantee?', options: ['A job', 'An income', 'Practical skills and a certificate of completion — not a job or income', 'University admission'], answer: 2 },
        ],
      },
    ],
    instructorAssessments: [
      { title: 'Final project presentation', description: 'Instructor-scored presentation and project review.', weight: 3 },
    ],
    assignments: [
      {
        week: 1,
        kind: 'assignment',
        title: 'Week 1 — AI in my life',
        instructions:
          'Describe three tasks in your school, work or home life where an AI tool could help, and one task where it should not be used. For each, explain why in two or three sentences. (150–300 words.) Do not include anyone’s private personal information.',
      },
      {
        week: 2,
        kind: 'assignment',
        title: 'Week 2 — Prompt makeover',
        instructions:
          'Choose a weak prompt and rewrite it using all six RTCCFQ building blocks. Show the original prompt, your improved prompt, and two follow-up refinement prompts. Explain what improved each time.',
      },
      {
        week: 3,
        kind: 'assignment',
        title: 'Week 3 — Fact-check challenge',
        instructions:
          'Ask an AI tool a factual question. List every factual claim in its answer and mark each as verified, incorrect or could not verify, with the source you used. Share links to the sources you used.',
      },
      {
        week: 4,
        kind: 'final_project',
        title: 'Final project — AI-assisted project',
        instructions:
          'Submit your final project: (1) the problem and who it helps; (2) at least five prompts you used and how you refined them; (3) your final output, or a link to it; (4) a responsible-use statement explaining how you checked facts, protected personal information and avoided bias. Links must be viewable without signing in.',
      },
    ],
  },
  {
    slug: 'ai-productivity-digital-creativity',
    level: 2,
    title: 'AI Productivity & Digital Creativity',
    levelLabel: 'Intermediate',
    summary: 'Use AI tools to organise work, manage information and create digital content with confidence.',
    description:
      'Builds on Level 1 to apply AI across everyday productivity and creative work: organising research and notes, planning projects, working with documents and spreadsheets, and producing visual and written digital content responsibly.',
    outcomes: [
      'Organise notes, research and tasks using AI-assisted workflows',
      'Use AI features in documents, spreadsheets and presentations',
      'Create visual and written digital content and credit AI use honestly',
      'Evaluate when AI saves time and when it adds risk',
    ],
    durationLabel: null,
    delivery: 'Live online classes supported by recorded lessons',
    audience: 'Learners who have completed Level 1',
    prerequisitesText: 'Verified completion of Level 1 — AI & Prompt Engineering.',
    priceKobo: null,
    status: 'locked',
    image: 'academy/study.jpg',
  },
  {
    slug: 'coding-web-development',
    level: 3,
    title: 'Coding & Web Development',
    levelLabel: 'Intermediate',
    summary: 'Learn the fundamentals of programming and build your first web pages.',
    description:
      'An introduction to how the web works and to writing code: HTML for structure, CSS for design and the basics of JavaScript for interactivity — with AI used as a coding tutor, not a shortcut.',
    outcomes: [
      'Explain how websites are built and delivered',
      'Write structured HTML and style it with CSS',
      'Understand core programming ideas with beginner JavaScript',
      'Build and publish a simple personal or project website',
    ],
    durationLabel: null,
    delivery: 'Live online classes supported by recorded lessons',
    audience: 'Learners who have completed Level 2',
    prerequisitesText: 'Verified completion of Level 2 — AI Productivity & Digital Creativity.',
    priceKobo: null,
    status: 'locked',
    image: 'academy/classroom.jpg',
  },
  {
    slug: 'ai-automation-digital-solutions',
    level: 4,
    title: 'AI Automation & Digital Solutions',
    levelLabel: 'Advanced',
    summary: 'Design simple automations and AI-powered tools that solve real problems.',
    description:
      'Learners map real processes, identify repetitive steps and design automations and AI-assisted tools to improve them, with attention to reliability, privacy and the people who use them.',
    outcomes: [
      'Map a process and identify opportunities for automation',
      'Build simple no-code and low-code automations',
      'Design AI-assisted tools with clear limits and human checks',
      'Assess privacy, reliability and fairness risks in digital solutions',
    ],
    durationLabel: null,
    delivery: 'Live online classes supported by recorded lessons',
    audience: 'Learners who have completed Level 3',
    prerequisitesText: 'Verified completion of Level 3 — Coding & Web Development.',
    priceKobo: null,
    status: 'locked',
    image: 'academy/instructor.jpg',
  },
  {
    slug: 'digital-innovation-project-development',
    level: 5,
    title: 'Digital Innovation & Project Development',
    levelLabel: 'Advanced',
    summary: 'Take a digital idea from problem to working prototype and present it.',
    description:
      'A capstone level in which learners research a real problem, design a digital solution, build a prototype using the skills from earlier levels and present it with a clear plan for testing and improvement.',
    outcomes: [
      'Research and define a real problem worth solving',
      'Plan a digital project with clear scope and milestones',
      'Build and test a working prototype',
      'Present a project professionally and respond to feedback',
    ],
    durationLabel: null,
    delivery: 'Live online classes supported by recorded lessons',
    audience: 'Learners who have completed Level 4',
    prerequisitesText: 'Verified completion of Level 4 — AI Automation & Digital Solutions.',
    priceKobo: null,
    status: 'locked',
    image: 'academy/project.jpg',
  },
]

export function formatNaira(kobo: number | null | undefined) {
  if (kobo == null) return null
  return `₦${(kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
}

export const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Other']
