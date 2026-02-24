// Mock data for academic programs
// This is fake data that simulates a database

export const programsData = [
  {
    id: 1,
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    type: 'Bachelor',
    description: 'A comprehensive program designed to develop IT professionals with expertise in software development, networking, and system administration.',
    duration: '4 years',
    totalUnits: 132,
    status: 'active',
    yearLevels: [
      {
        year: '1st Year',
        subjects: ['IT101', 'IT102', 'IT103', 'IT104']
      },
      {
        year: '2nd Year',
        subjects: ['IT201', 'IT202', 'IT203', 'IT204']
      },
      {
        year: '3rd Year',
        subjects: ['IT301', 'IT302', 'IT303', 'IT304']
      },
      {
        year: '4th Year',
        subjects: ['IT401', 'IT402', 'IT403', 'IT404']
      }
    ]
  },
  {
    id: 2,
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    type: 'Bachelor',
    description: 'Advanced program focused on computer science theory, algorithms, artificial intelligence, and software engineering.',
    duration: '4 years',
    totalUnits: 130,
    status: 'active',
    yearLevels: [
      {
        year: '1st Year',
        subjects: ['CS101', 'CS102', 'CS103', 'CS104']
      },
      {
        year: '2nd Year',
        subjects: ['CS201', 'CS202', 'CS203', 'CS204']
      },
      {
        year: '3rd Year',
        subjects: ['CS301', 'CS302', 'CS303', 'CS304']
      },
      {
        year: '4th Year',
        subjects: ['CS401', 'CS402', 'CS403', 'CS404']
      }
    ]
  },
  {
    id: 3,
    code: 'BSIS',
    name: 'Bachelor of Science in Information Systems',
    type: 'Bachelor',
    description: 'Program designed to train professionals in managing business IT infrastructure and digital solutions.',
    duration: '4 years',
    totalUnits: 128,
    status: 'active',
    yearLevels: [
      {
        year: '1st Year',
        subjects: ['IS101', 'IS102', 'IS103', 'IS104']
      },
      {
        year: '2nd Year',
        subjects: ['IS201', 'IS202', 'IS203', 'IS204']
      },
      {
        year: '3rd Year',
        subjects: ['IS301', 'IS302', 'IS303', 'IS304']
      },
      {
        year: '4th Year',
        subjects: ['IS401', 'IS402', 'IS403', 'IS404']
      }
    ]
  },
  {
    id: 4,
    code: 'DICTE',
    name: 'Diploma in Information Communication and Technology',
    type: 'Diploma',
    description: 'Short-term program for students seeking practical ICT skills and technical certifications.',
    duration: '2 years',
    totalUnits: 72,
    status: 'active',
    yearLevels: [
      {
        year: '1st Year',
        subjects: ['TC101', 'TC102', 'TC103']
      },
      {
        year: '2nd Year',
        subjects: ['TC201', 'TC202', 'TC203']
      }
    ]
  },
  {
    id: 5,
    code: 'BSENG',
    name: 'Bachelor of Science in Engineering',
    type: 'Bachelor',
    description: 'Program focused on engineering principles and applications in various engineering disciplines.',
    duration: '4 years',
    totalUnits: 145,
    status: 'under review',
    yearLevels: [
      {
        year: '1st Year',
        subjects: ['ENG101', 'ENG102', 'ENG103']
      },
      {
        year: '2nd Year',
        subjects: ['ENG201', 'ENG202', 'ENG203']
      },
      {
        year: '3rd Year',
        subjects: ['ENG301', 'ENG302', 'ENG303']
      },
      {
        year: '4th Year',
        subjects: ['ENG401', 'ENG402', 'ENG403']
      }
    ]
  }
];
