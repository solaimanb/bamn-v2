export const RESEARCH_AREAS = [
    // 🌱 Natural Sciences
    "Mathematics",
    "Statistics",
    "Physics",
    "Chemistry",
    "Biology",
    "Earth Sciences",
    "Environmental Science",
    "Astronomy",
    "Oceanography",
    "Geology",
    "Ecology",
    "Meteorology",
  
    // 🧬 Life & Health Sciences
    "Medicine",
    "Public Health",
    "Pharmacy",
    "Nursing",
    "Dentistry",
    "Biomedical Science",
    "Genetics",
    "Neuroscience",
    "Veterinary Science",
    "Nutrition",
    "Health Informatics",
  
    // ⚙️ Engineering & Technology
    "Computer Science",
    "Software Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Data Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Industrial Engineering",
    "Materials Science",
    "Robotics",
    "Nanotechnology",
    "Telecommunications",
    "Renewable Energy",
    "Mechatronics",
    "Bioengineering",
  
    // 📊 Business & Economics
    "Economics",
    "Business Administration",
    "Finance",
    "Accounting",
    "Marketing",
    "Management",
    "Entrepreneurship",
    "International Business",
    "Human Resource Management",
    "Operations Management",
    "Business Analytics",
  
    // 🏛 Social Sciences
    "Psychology",
    "Sociology",
    "Anthropology",
    "Political Science",
    "International Relations",
    "Education",
    "Linguistics",
    "Geography",
    "Criminology",
    "Communication Studies",
    "Social Work",
    "Cognitive Science",
    "Behavioral Science",
  
    // ⚖️ Law & Policy
    "Law",
    "International Law",
    "Human Rights",
    "Environmental Law",
    "Public Policy",
    "Political Philosophy",
    "Legal Studies",
  
    // 🧠 Philosophy & Humanities
    "Philosophy",
    "History",
    "Literature",
    "Classics",
    "Religious Studies",
    "Ethics",
    "Cultural Studies",
  
    // 🎭 Arts & Design
    "Visual Arts",
    "Performing Arts",
    "Music",
    "Design",
    "Architecture",
    "Film Studies",
    "Creative Writing",
    "Art History",
    "Media Studies",
  
    // ✍️ Language & Area Studies
    "Modern Languages",
    "Translation Studies",
    "Regional Studies",
    "Asian Studies",
    "European Studies",
    "African Studies",
    "Middle Eastern Studies",
    "Latin American Studies",
  
    // 🔬 Interdisciplinary & Emerging Fields
    "Cognitive Neuroscience",
    "Digital Humanities",
    "Science and Technology Studies",
    "Environmental Policy",
    "Gender Studies",
    "Sustainability Studies",
    "Urban Studies",
    "Human-Computer Interaction",
    "Ethics of Technology",
    "Innovation Studies",
    "Health Economics",
    "Computational Social Science",
    "Educational Technology"
  ] as const;
  

export type ResearchArea = typeof RESEARCH_AREAS[number];

export const LOCATIONS = {
    continents: [
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Africa",
      "Australia",
      "Antarctica",
    ] as const,
  
    countries: {
      "Asia": [
        "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
        "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia",
        "Iran", "Iraq", "Japan", "Jordan", "Kazakhstan", "Kuwait",
        "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
        "Myanmar (Burma)", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine",
        "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka",
        "Syria", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan",
        "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
      ],
      "Europe": [
        "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium",
        "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
        "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary",
        "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein",
        "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro",
        "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania",
        "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
        "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican City"
      ],
      "North America": [
        "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica",
        "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala",
        "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama",
        "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Trinidad and Tobago", "United States"
      ],
      "South America": [
        "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana",
        "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
      ],
      "Africa": [
        "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
        "Cameroon", "Central African Republic", "Chad", "Comoros", "Democratic Republic of the Congo",
        "Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea",
        "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau",
        "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi",
        "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
        "Nigeria", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone",
        "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia",
        "Uganda", "Zambia", "Zimbabwe"
      ],
      "Australia": [
        "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru",
        "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands",
        "Tonga", "Tuvalu", "Vanuatu"
      ],
      "Antarctica": [
        "Research Stations"
      ],
    } as const
  };
  

export type Continent = typeof LOCATIONS.continents[number];
export type Country = typeof LOCATIONS.countries[Continent][number];

export interface LocationFilter {
  continent?: Continent;
  country?: Country;
  city?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  group?: string;
}

export const getLocationOptions = (continent?: Continent): FilterOption[] => {
  if (continent && continent in LOCATIONS.countries) {
    return LOCATIONS.countries[continent].map(country => ({
      id: country,
      label: country,
      value: country,
      group: continent
    }));
  }

  return LOCATIONS.continents.map(continent => ({
    id: continent,
    label: continent,
    value: continent
  }));
};

export const getResearchAreaOptions = (): FilterOption[] => {
  return RESEARCH_AREAS.map(area => ({
    id: area,
    label: area,
    value: area
  }));
}; 