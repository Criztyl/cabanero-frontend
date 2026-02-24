// Mock data for academic subjects
// This is fake data that simulates a database

export const subjectsData = [
  // IT Program Subjects (1st Year)
  {
    id: 'IT101',
    code: 'IT101',
    title: 'Introduction to Information Technology',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Foundational course introducing IT concepts and career paths.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IT102',
    code: 'IT102',
    title: 'Fundamentals of Programming',
    units: 4,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Introduction to programming concepts using modern languages.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IT103',
    code: 'IT103',
    title: 'Digital Logic and Computer Organization',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Understanding computer hardware and digital systems.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IT104',
    code: 'IT104',
    title: 'Database Fundamentals',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Introduction to database design and SQL.',
    prerequisites: ['IT102'],
    corequisites: [],
    yearLevel: '1st Year'
  },

  // IT Program Subjects (2nd Year)
  {
    id: 'IT201',
    code: 'IT201',
    title: 'Web Development I',
    units: 4,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Frontend web development with HTML, CSS, and JavaScript.',
    prerequisites: ['IT102'],
    corequisites: [],
    yearLevel: '2nd Year'
  },
  {
    id: 'IT202',
    code: 'IT202',
    title: 'Object-Oriented Programming',
    units: 4,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Advanced programming concepts using Java or C++.',
    prerequisites: ['IT102'],
    corequisites: [],
    yearLevel: '2nd Year'
  },
  {
    id: 'IT203',
    code: 'IT203',
    title: 'Computer Networks I',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Networking basics, TCP/IP, and protocols.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '2nd Year'
  },
  {
    id: 'IT204',
    code: 'IT204',
    title: 'Web Development II',
    units: 4,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIT',
    description: 'Backend web development and frameworks.',
    prerequisites: ['IT201'],
    corequisites: [],
    yearLevel: '2nd Year'
  },

  // CS Program Subjects (1st Year)
  {
    id: 'CS101',
    code: 'CS101',
    title: 'Computer Science Fundamentals',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSCS',
    description: 'Core concepts in computer science.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'CS102',
    code: 'CS102',
    title: 'Programming with Python',
    units: 4,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSCS',
    description: 'Python programming language for CS applications.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'CS103',
    code: 'CS103',
    title: 'Discrete Mathematics',
    units: 4,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSCS',
    description: 'Mathematics essential for computer science.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'CS104',
    code: 'CS104',
    title: 'Data Structures',
    units: 4,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSCS',
    description: 'Arrays, linked lists, stacks, queues, and trees.',
    prerequisites: ['CS102'],
    corequisites: [],
    yearLevel: '1st Year'
  },

  // IS Program Subjects (1st Year)
  {
    id: 'IS101',
    code: 'IS101',
    title: 'Management Information Systems',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIS',
    description: 'Role of IS in modern businesses.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IS102',
    code: 'IS102',
    title: 'Business Process Analysis',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'BSIS',
    description: 'Understanding and analyzing business processes.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IS103',
    code: 'IS103',
    title: 'IT Project Management',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIS',
    description: 'Managing IT projects and resources.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'IS104',
    code: 'IS104',
    title: 'Information Security Basics',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'BSIS',
    description: 'Introduction to cybersecurity and data protection.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },

  // Diploma Subjects
  {
    id: 'TC101',
    code: 'TC101',
    title: 'Basic Computer Skills',
    units: 2,
    semester: 'First Semester',
    term: 'Semester',
    program: 'DICTE',
    description: 'Operating systems and basic software.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'TC102',
    code: 'TC102',
    title: 'Web Design Basics',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'DICTE',
    description: 'Creating simple websites.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'TC103',
    code: 'TC103',
    title: 'Network Administration Basics',
    units: 3,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'DICTE',
    description: 'Introduction to network setup and administration.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '1st Year'
  },
  {
    id: 'TC201',
    code: 'TC201',
    title: 'Advanced Web Development',
    units: 3,
    semester: 'First Semester',
    term: 'Semester',
    program: 'DICTE',
    description: 'Building responsive and interactive websites.',
    prerequisites: ['TC102'],
    corequisites: [],
    yearLevel: '2nd Year'
  },
  {
    id: 'TC202',
    code: 'TC202',
    title: 'IT Support and Maintenance',
    units: 2,
    semester: 'Second Semester',
    term: 'Semester',
    program: 'DICTE',
    description: 'Troubleshooting and system maintenance.',
    prerequisites: [],
    corequisites: [],
    yearLevel: '2nd Year'
  }
];
