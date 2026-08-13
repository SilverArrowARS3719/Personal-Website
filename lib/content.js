// Everything on the site is written here. Edit this file to change the words.

export const profile = {
  name: "VA Ramaswami",
  age: 14,
  location: "Singapore",
  school: "School of Science and Technology, Singapore",
  headline: "I build things. Robots, systems, and stories.",
  intro:
    "I am 14, a secondary student at the School of Science and Technology, Singapore. I compete in robotics, run STEM research, and ship projects on my own. What pulls me most is structure: how a building, a machine or a story is made to hold itself up.",
  email: "varamaswami3719@gmail.com",
  linkedin: "https://www.linkedin.com/in/va-ramaswami-5ba0a63a5",
  archive: "https://sites.google.com/view/ram-dsa-portfolio/home",
};

export const stats = [
  { value: "2", label: "National awards" },
  { value: "6", label: "Competitions entered" },
  { value: "3", label: "Years leading a CCA" },
  { value: "14", label: "Years old" },
];

export const highlights = [
  {
    award: "Engineering Award",
    event: "IDE Maker Competition",
    detail: "Top 5 nationally for the smart canal waste-collection system.",
    year: "2024",
  },
  {
    award: "Certificate of Distinction",
    event: "National Design Project",
    detail:
      "Awarded by Temasek Polytechnic and the DesignSingapore Council. Presented to Education Minister Mr Chan Chun Sing.",
    year: "2023",
  },
  {
    award: "Interviewed by CNA",
    event: "CNA Tech Challenge",
    detail: "Competed at national level and was interviewed on camera.",
    year: "2026",
  },
  {
    award: "Best in Higher Tamil",
    event: "Westwood Primary School",
    detail:
      "Awarded twice, alongside Best in Tamil three times, most recently at SST.",
    year: "2023, 2024",
  },
];

export const about = {
  paragraphs: [
    "I started building in primary school. Cardboard prototypes, CCA competitions, a lot of ideas that did not work before one did. I led my Design and Innovation CCA for three years and took teams to national competitions.",
    "Now at the School of Science and Technology I compete in robotics with Robotics @ APEX, serve as an Environmental Ambassador, and keep building on the side. I vibe code a lot too, shipping small apps with Claude Code and base44.",
    "Outside engineering I write, study Tamil literature, play badminton several times a week, and follow Arsenal and Mercedes-AMG Petronas far too closely. Architecture is where I want to end up. Aerospace and film are close behind.",
  ],
  disciplines: [
    "Architecture",
    "Aerospace engineering",
    "Robotics",
    "Product design",
    "Vibe coding",
    "Writing and directing",
    "Criminal law",
    "Sustainability",
  ],
};

// Each project is written as a case study: the problem, what we built, what happened.
// The `meta` rows are the facts a reader scans first. Add a "Role" or "Team" row if
// you want, just keep every value true.
export const projects = [
  {
    title: "Smart Canal Waste-Collection System",
    subtitle:
      "A mesh and pulley rig that traps estate rubbish before it reaches the sea.",
    year: "2024",
    meta: [
      { label: "Competition", value: "IDE Maker 2024" },
      { label: "Result", value: "Top 5 nationally" },
      { label: "Award", value: "Engineering Award" },
      { label: "Focus", value: "Mechanical design and sensing" },
    ],
    tags: ["Sustainability", "Sensors", "Mechanical design"],
    // Drop your photo at: public/images/canal-project.jpg
    image: "/images/canal-project.jpg",
    imageNote: "The prototype at IDE Maker 2024.",
    problem:
      "Marine animals mistake plastic for food and choke on it. A major route for that plastic is the drainage canals running through housing estates, which carry litter straight out to sea with the rain.",
    approach:
      "We fixed a mesh under a canal bridge with gaps wide enough for water and too narrow for rubbish. A moisture sensor beside the mesh detects when the canal has drained and signals the nearby collector. Pulling a lever drives a pulley that sweeps the trapped waste into a side chute and lifts it out.",
    outcome:
      "Top 5 nationally and the Engineering Award. The judges questioned us on the spot about how the mesh would handle flood flow, and we reasoned through the answer live.",
  },
  {
    title: "The Incredible Vending Solution",
    subtitle:
      "A pre-order and locker system that gives a 30-minute recess back to the students.",
    year: "2023",
    meta: [
      { label: "Competition", value: "National Design Project 2023" },
      { label: "Award", value: "Certificate of Distinction" },
      { label: "Awarded by", value: "Temasek Polytechnic and DesignSingapore" },
      { label: "Method", value: "SCAMPER" },
    ],
    tags: ["Systems design", "SCAMPER", "User research"],
    // Drop your photo at: public/images/vending-project.jpg
    image: "/images/vending-project.jpg",
    imageNote: "Presenting to Education Minister Mr Chan Chun Sing.",
    problem:
      "Two levels of my school shared one 30-minute recess, so the queues ate the entire break. On late-dismissal days there was barely time left to eat.",
    approach:
      "Students pre-order on a tablet in class and pay by EZ-link. The order reaches the stall, the food goes into a locker, and the student collects it from a vending unit in front of the stalls using an order number. We took the idea from hawker-centre vending machines and rebuilt it for a canteen using the SCAMPER model.",
    outcome:
      "Certificate of Distinction from Temasek Polytechnic School of Design and the DesignSingapore Council. I led the team and presented the prototype to Education Minister Mr Chan Chun Sing.",
  },
];

// Things you build. Add a new entry here every time you ship something and it
// appears on /projects and in the command palette automatically.
// `status` is free text: "Live", "In progress", "Shelved", whatever is true.
// Leave `href` empty if there is nothing to link to yet.
export const software = [
  {
    name: "Decision Log",
    // placeholder blurb written from looking at the live app, swap it for your
    // own words whenever you like
    blurb:
      "Log a decision with the reasoning behind it, how confident you are out of ten, and what you expect to happen. Come back later and score whether you were right, so you can see which kinds of calls you actually judge well.",
    tech: ["Base44"],
    href: "https://accurate-smart-choice-track.base44.app",
    status: "Live",
  },
  {
    name: "This site",
    blurb:
      "My portfolio, built from scratch rather than from a template. Blueprint backdrop that lights up under the cursor, a command palette, and a drawn hero instead of a stock photo.",
    tech: ["Next.js", "React", "Tailwind", "Claude Code"],
    href: "",
    status: "Live",
  },
];

// Eight slots waiting for photos. Drop files at public/images/photo-1.jpg and so
// on; until then each slot shows its own placeholder rather than a broken image.
export const photos = [
  { src: "/images/photo-1.jpg", alt: "Performing at Bhaskar's Arts Academy", caption: "Bhaskar's Arts Academy" },
  { src: "/images/photo-2.jpg", alt: "Competition day", caption: "Competition day" },
  { src: "/images/photo-3.jpg", alt: "Prototype in progress", caption: "Prototype in progress" },
  { src: "/images/photo-4.jpg", alt: "Design and Innovation CCA session", caption: "Design and Innovation CCA" },
  { src: "/images/photo-5.jpg", alt: "Presenting a project to judges", caption: "Presenting" },
  { src: "/images/photo-6.jpg", alt: "Tamil literature competition", caption: "Tamil competition" },
  { src: "/images/photo-7.jpg", alt: "Playing badminton", caption: "Badminton" },
  // spare slot: point this at whichever of badminton or the arts you have more
  // of, and change the caption to match
  { src: "/images/photo-8.jpg", alt: "Practice session", caption: "Practice" },
];

export const competitions = [
  {
    name: "National Robotics Competition",
    detail: "Competed with Robotics @ APEX.",
    year: "2025",
  },
  {
    name: "CNA Tech Challenge",
    detail: "Competed at national level and was interviewed by CNA.",
    year: "2026",
  },
  {
    name: "SST Student Congress",
    detail: "Won the school-wide research and innovation showcase.",
    year: "2025",
  },
  {
    name: "National Thinker Challenge",
    detail: "Top 20 nationally.",
    year: "2023",
  },
  {
    name: "Destination Imagination",
    detail: "4th place. Creative problem-solving under time pressure.",
    year: "2022",
  },
  {
    name: "Budding STEM Challenge",
    detail: "National-level innovation competition.",
    year: "2023",
  },
];

export const language = {
  intro:
    "Tamil is the other half of how I think. I read it, write it, compete in it, and I have trained in Indian classical arts at Bhaskar's Arts Academy since 2020.",
  items: [
    {
      name: "37th Tamil Literature Competition",
      detail: "Raffles Institution",
      year: "2026",
    },
    {
      name: "Best in Higher Tamil",
      detail: "Awarded twice at Westwood Primary School",
      year: "2023, 2024",
    },
    {
      name: "Best in Tamil",
      detail:
        "Awarded twice at Westwood Primary School and once at School of Science and Technology",
      year: "2022, 2023, 2025",
    },
    {
      name: "Tamilodu Vilaiyaadu",
      detail: "National Tamil competition, semi-finalist",
      year: "2023",
    },
    {
      name: "Bhaskar's Arts Academy",
      detail: "Indian classical arts, six years and counting",
      year: "2020",
    },
  ],
};

export const leadership = [
  {
    role: "Environmental Ambassador",
    org: "School of Science and Technology, Singapore",
    year: "2025, 2026",
  },
  {
    role: "CCA Leader, Design and Innovation",
    org: "Westwood Primary School. Junior leader in 2022. Also led Infocomm and Innovation.",
    year: "2022-2024",
  },
  {
    role: "Eagles Award for Achievement",
    org: "Westwood Primary School, for CCA achievement and leading by example.",
    year: "2023",
  },
  {
    role: "Emcee and host",
    org: "Hosted international delegates from Indonesia. Emceed school events.",
    year: "2022-2025",
  },
  {
    role: "Organiser",
    org: "Rubik's Cube competitions, interclass football, Melaka trip fundraiser.",
    year: "2022-2024",
  },
];

export const timeline = [
  {
    year: "2019",
    title: "Westwood Primary School",
    detail:
      "Started primary school. Cardboard prototypes and a lot of ideas that did not work.",
  },
  {
    year: "2020",
    title: "Bhaskar's Arts Academy",
    detail: "Began training in Indian classical arts.",
  },
  {
    year: "2022",
    title: "First national stage",
    detail:
      "Joined the Design and Innovation CCA as junior leader. Destination Imagination, 4th place. Best in Tamil.",
  },
  {
    year: "2023",
    title: "Certificate of Distinction",
    detail:
      "National Design Project, presented to Education Minister Mr Chan Chun Sing. National Thinker Challenge Top 20. Eagles Award. Best in Higher Tamil.",
  },
  {
    year: "2024",
    title: "Engineering Award",
    detail:
      "IDE Maker, Top 5 and the Engineering Award for the smart canal waste-collection system. Best in Higher Tamil, again.",
  },
  {
    year: "2025",
    title: "School of Science and Technology",
    detail:
      "Joined Robotics @ APEX. Competed at NRC 2025. Won SST Student Congress. Environmental Ambassador. Best in Tamil.",
  },
  {
    year: "2026",
    title: "Still building",
    detail:
      "Competed in the CNA Tech Challenge at national level and was interviewed by CNA. 37th Tamil Literature Competition at Raffles Institution.",
  },
];

export const beyond = [
  {
    title: "Architecture",
    detail:
      "The end goal. Buildings that solve something, not just stand there. It is the reason I care about how anything is put together.",
  },
  {
    title: "Robotics",
    detail:
      "Robotics @ APEX at SST. Competed at the National Robotics Competition.",
  },
  {
    title: "3D modelling",
    detail: "CAD and rendering, turning what is in my head into something I can rotate.",
  },
  {
    title: "Directing and writing",
    detail: "I write. Original stories, mostly in Tamil cinema's language.",
  },
  {
    title: "Aerospace",
    detail: "Flight, propulsion, and the engineering that makes both survivable.",
  },
  {
    title: "Badminton",
    detail: "Apollo Badminton Sports Craft. Several sessions a week.",
  },
  {
    title: "Arsenal",
    detail: "Football when I can play it, Arsenal when I can't.",
  },
  {
    title: "Mercedes-AMG Petronas",
    detail: "Formula One, for the engineering as much as the racing.",
  },
];
