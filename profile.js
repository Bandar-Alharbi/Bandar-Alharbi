/* ================================================================
   EDIT YOUR DETAILS HERE
   Every section of the page (Home, About, Experience, Projects,
   Skills & Certifications, Contact) reads its content from this one object.
   Leave a list empty ([]) to hide it.
   ================================================================ */
window.PROFILE = {
  name: 'Bandar Alharbi',
  role: 'Business Administration graduate',
  location: 'Saudi Arabia',
  status: 'Open to opportunities',
  headline: 'Business Administration graduate interested in business, projects, and problem solving.',
  headlineHighlight: 'business, projects, and problem solving', // shown in the accent color on the first screen
  summary: 'Graduate of Taif University with cooperative training at King Faisal Hospital.', // first screen: keep it to one sentence
  interestsText: 'My interests are in business analysis, project coordination, process improvement, operations, and how technology changes the way everyday business work gets done.', // shown in About
  degreeShort: 'BBA, Taif University',

  languages: [
    { name: 'Arabic', level: 'Native' },
    { name: 'English', level: 'Professional Working' },
  ],

  highlights: [
    { value: '50+', label: 'Records verified daily' },
    { value: '100+', label: 'Documents reviewed weekly' },
    { value: '3+', label: 'Departments coordinated with' },
    { value: '5', label: 'Professional certifications' },
  ],

  // areas named in the portfolio's own summary ("My interests are in …")
  interests: ['Business analysis', 'Project coordination', 'Process improvement', 'Operations', 'Technology in everyday business work'],

  about: {
    title: 'Accuracy in documentation, from day one.',
    paragraphs: [
      "I'm a Business Administration graduate from Taif University, based in Saudi Arabia. My cooperative training at King Faisal Hospital took place in the Administrative & Records Department, where accuracy in documentation was part of daily work.",
      "During the training I handled official records, followed up on missing information, and coordinated with several departments. I use Microsoft Office and Excel, and I'm comfortable turning unorganized information into something structured.",
      "I'm currently looking for entry-level opportunities where I can keep learning — in business analysis, project coordination, process improvement, or operations.",
    ],
  },

  experience: {
    title: 'Where the work happened.',
    intro: 'A first look at how records, information, and departments fit together in a working organization.',
    items: [
      {
        role: 'Cooperative Training Trainee',
        dates: 'Jul 2026 – Aug 2026',
        org: 'King Faisal Hospital / King Faisal Medical Complex',
        location: 'Saudi Arabia',
        team: 'Medical Records & Administration',
        type: '45-day cooperative training',
        groups: [
          { label: 'Records handled', points: [
            'Handled 100+ official records weekly.',
            'Processed and verified 50+ records on busy days.',
            'Worked to ensure accuracy and compliance in record handling.',
          ] },
          { label: 'Coordination & follow-up', points: [
            'Coordinated with 3+ departments.',
            'Followed up on missing information.',
            'Communicated with patients regarding pending information.',
          ] },
        ],
      },
    ],
  },

  projects: {
    title: 'Selected projects.',
    intro: "Project work I'm currently putting together. This section will be updated as pieces are completed.",
    // When a project is ready, fill in title, description and (optionally) link.
    items: [
      { label: 'Project 01', title: '', description: 'Coming soon.', link: '' },
      { label: 'Project 02', title: '', description: 'Coming soon.', link: '' },
      { label: 'Project 03', title: '', description: 'Coming soon.', link: '' },
      { label: 'Project 04', title: '', description: 'Coming soon.', link: '' },
    ],
  },

  skills: {
    title: 'What I bring to a team.',
    groups: [
      { group: 'Business & Analytical', items: ['Business Analysis', 'Process Improvement', 'Data Analysis'] },
      { group: 'Projects & Operations', items: ['Project Coordination', 'Operations', 'Documentation', 'Process Coordination'] },
      { group: 'Professional', items: ['Communication', 'Organization', 'Problem Solving', 'Attention to Detail'] },
      { group: 'Tools', items: ['Microsoft Excel', 'Microsoft Office'] },
    ],
  },

  education: {
    title: 'Degree and certifications.',
    intro: 'Academic background plus continued learning in business, project, and data skills.',
    degree: { name: 'Bachelor of Business Administration', school: 'Taif University, Saudi Arabia', note: 'Graduated 2026' },
    // Paste each certificate's verification URL into `link` to show a "View credential" link on its card.
    certifications: [
      { name: 'Strategic Planning for Organizations', issuer: 'Doroob', year: '2026', link: '' },
      { name: 'Project Management', issuer: 'HP LIFE', year: '2026', link: '' },
      { name: 'Business Communications', issuer: 'HP LIFE', year: '2026', link: '' },
      { name: 'Data Analytics Essentials', issuer: 'Cisco', year: '2026', link: '' },
      { name: 'Digital Skills in the Workplace', issuer: 'Misk', year: '2026', link: '' },
    ],
  },

  contact: {
    title: "Let's talk about the role you're hiring for.",
    text: "I'm open to entry-level roles in business analysis, project coordination, process improvement, and operations. Email is the fastest way to reach me.",
  },

  links: {
    email: 'bandar.worksa@gmail.com',
    linkedin: 'https://www.linkedin.com/in/bandar-alharbi-sa',
    cv: 'cv.pdf',
  },

  copyright: '© 2026 Bandar Alharbi. All rights reserved.',

  /* Page sections, in scroll order. `label` is the menu text, `title` (optional) the section's full name. */
  sections: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills', title: 'Skills & Certifications' },
    { id: 'contact', label: 'Contact' },
  ],
};
