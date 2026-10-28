require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const categorySchema = new mongoose.Schema({
  category_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  icon: { type: String, default: '📁' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const technologySchema = new mongoose.Schema({
  technology_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  icon: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const slugSchema = new mongoose.Schema({
  slug_title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
  skill_title: { type: String, required: true, trim: true },
  skill_option: { type: String, enum: ['beginner', 'intermediate', 'expert'], required: true },
  slug: { type: String, unique: true, lowercase: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Category = mongoose.model('categories', categorySchema);
const Technology = mongoose.model('technologies', technologySchema);
const Slug = mongoose.model('slugs', slugSchema);
const Skill = mongoose.model('skills', skillSchema);

const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
};

const categories = [
  { category_title: 'Web Development', icon: '🌐' },
  { category_title: 'Mobile App Development', icon: '📱' },
  { category_title: 'Desktop Application', icon: '🖥️' },
  { category_title: 'E-Commerce Solutions', icon: '🛒' },
  { category_title: 'API Development', icon: '🔌' },
  { category_title: 'Database Design', icon: '🗄️' },
  { category_title: 'Cloud & DevOps', icon: '☁️' },
  { category_title: 'UI/UX Design', icon: '🎨' },
  { category_title: 'AI & Machine Learning', icon: '🤖' },
  { category_title: 'Cybersecurity', icon: '🛡️' },
  { category_title: 'Blockchain Development', icon: '⛓️' },
  { category_title: 'Game Development', icon: '🎮' },
];

const technologies = [
  { technology_title: 'React.js', icon: '⚛️' },
  { technology_title: 'Next.js', icon: '▲' },
  { technology_title: 'Vue.js', icon: '💚' },
  { technology_title: 'Angular', icon: '🅰️' },
  { technology_title: 'Node.js', icon: '🟢' },
  { technology_title: 'Express.js', icon: '🚂' },
  { technology_title: 'NestJS', icon: '🐈' },
  { technology_title: 'Python', icon: '🐍' },
  { technology_title: 'Django', icon: '🎸' },
  { technology_title: 'Flask', icon: '🧪' },
  { technology_title: 'Java', icon: '☕' },
  { technology_title: 'Spring Boot', icon: '🍃' },
  { technology_title: 'C#', icon: '🟣' },
  { technology_title: '.NET', icon: '💜' },
  { technology_title: 'PHP', icon: '🐘' },
  { technology_title: 'Laravel', icon: '🔺' },
  { technology_title: 'Ruby on Rails', icon: '💎' },
  { technology_title: 'Swift', icon: '🍎' },
  { technology_title: 'Kotlin', icon: '🇰' },
  { technology_title: 'Flutter', icon: '🦋' },
  { technology_title: 'React Native', icon: '⚛️' },
  { technology_title: 'TypeScript', icon: '📘' },
  { technology_title: 'JavaScript', icon: '📒' },
  { technology_title: 'HTML5', icon: '📄' },
  { technology_title: 'CSS3', icon: '🎭' },
  { technology_title: 'Tailwind CSS', icon: '💨' },
  { technology_title: 'Bootstrap', icon: '👢' },
  { technology_title: 'SASS/SCSS', icon: '💅' },
  { technology_title: 'MongoDB', icon: '🍃' },
  { technology_title: 'PostgreSQL', icon: '🐘' },
  { technology_title: 'MySQL', icon: '🐬' },
  { technology_title: 'Redis', icon: '🔴' },
  { technology_title: 'Firebase', icon: '🔥' },
  { technology_title: 'AWS', icon: '☁️' },
  { technology_title: 'Docker', icon: '🐳' },
  { technology_title: 'Kubernetes', icon: '☸️' },
  { technology_title: 'Git', icon: '📦' },
  { technology_title: 'GraphQL', icon: '◼️' },
  { technology_title: 'REST API', icon: '🔗' },
  { technology_title: 'Socket.io', icon: '🔌' },
  { technology_title: 'TensorFlow', icon: '🧠' },
  { technology_title: 'OpenAI/GPT', icon: '🤖' },
  { technology_title: 'Stripe', icon: '💳' },
  { technology_title: 'Cloudinary', icon: '☁️' },
  { technology_title: 'Twilio', icon: '📱' },
  { technology_title: 'Nginx', icon: '🔄' },
  { technology_title: 'Linux', icon: '🐧' },
  { technology_title: 'Vercel', icon: '▲' },
  { technology_title: 'Netlify', icon: '兜' },
  { technology_title: 'Figma', icon: '🎯' },
];

const slugs = [
  { slug_title: 'full-stack' },
  { slug_title: 'frontend' },
  { slug_title: 'backend' },
  { slug_title: 'responsive-design' },
  { slug_title: 'single-page-app' },
  { slug_title: 'server-side-rendering' },
  { slug_title: 'static-site' },
  { slug_title: 'progressive-web-app' },
  { slug_title: 'real-time' },
  { slug_title: 'microservices' },
  { slug_title: 'rest-api' },
  { slug_title: 'graphql' },
  { slug_title: 'ci-cd' },
  { slug_title: 'serverless' },
  { slug_title: 'jams-stack' },
  { slug_title: 'mern-stack' },
  { slug_title: 'mean-stack' },
  { slug_title: 'lamp-stack' },
  { slug_title: 'erp-system' },
  { slug_title: 'crm-system' },
  { slug_title: 'saas' },
  { slug_title: 'marketplace' },
  { slug_title: 'chat-application' },
  { slug_title: 'notification-system' },
  { slug_title: 'payment-integration' },
  { slug_title: 'seo-optimized' },
  { slug_title: 'multi-language' },
  { slug_title: 'dark-mode' },
  { slug_title: 'accessibility' },
  { slug_title: 'performance-optimized' },
];

const skills = [
  { skill_title: 'React.js', skill_option: 'expert' },
  { skill_title: 'Next.js', skill_option: 'expert' },
  { skill_title: 'Node.js', skill_option: 'expert' },
  { skill_title: 'Express.js', skill_option: 'expert' },
  { skill_title: 'JavaScript', skill_option: 'expert' },
  { skill_title: 'TypeScript', skill_option: 'expert' },
  { skill_title: 'HTML5 & CSS3', skill_option: 'expert' },
  { skill_title: 'Tailwind CSS', skill_option: 'expert' },
  { skill_title: 'MongoDB', skill_option: 'expert' },
  { skill_title: 'Redux Toolkit', skill_option: 'expert' },
  { skill_title: 'REST API Design', skill_option: 'expert' },
  { skill_title: 'Git & GitHub', skill_option: 'expert' },
  { skill_title: 'Python', skill_option: 'intermediate' },
  { skill_title: 'PostgreSQL', skill_option: 'intermediate' },
  { skill_title: 'Docker', skill_option: 'intermediate' },
  { skill_title: 'AWS (EC2, S3, Lambda)', skill_option: 'intermediate' },
  { skill_title: 'Redis', skill_option: 'intermediate' },
  { skill_title: 'GraphQL', skill_option: 'intermediate' },
  { skill_title: 'Flutter', skill_option: 'intermediate' },
  { skill_title: 'React Native', skill_option: 'intermediate' },
  { skill_title: 'CI/CD Pipelines', skill_option: 'intermediate' },
  { skill_title: 'Kubernetes', skill_option: 'beginner' },
  { skill_title: 'Machine Learning', skill_option: 'beginner' },
  { skill_title: 'Blockchain (Solidity)', skill_option: 'beginner' },
  { skill_title: 'WebAssembly', skill_option: 'beginner' },
];

const seed = async () => {
  try {
    await connectDB();

    await Category.deleteMany({});
    await Technology.deleteMany({});
    await Slug.deleteMany({});
    await Skill.deleteMany({});
    console.log('Cleared old data.');

    const catDocs = await Category.insertMany(
      categories.map(c => ({ ...c, slug: generateSlug(c.category_title) }))
    );
    console.log(`${catDocs.length} categories created.`);

    const techDocs = await Technology.insertMany(
      technologies.map(t => ({ ...t, slug: generateSlug(t.technology_title) }))
    );
    console.log(`${techDocs.length} technologies created.`);

    const slugDocs = await Slug.insertMany(
      slugs.map(s => ({ ...s, slug: generateSlug(s.slug_title) }))
    );
    console.log(`${slugDocs.length} slugs created.`);

    const skillDocs = await Skill.insertMany(
      skills.map(s => ({ ...s, slug: generateSlug(s.skill_title + '-' + s.skill_option) }))
    );
    console.log(`${skillDocs.length} skills created.`);

    console.log('\n--- SUMMARY ---');
    console.log(`Categories: ${catDocs.length}`);
    console.log(`Technologies: ${techDocs.length}`);
    console.log(`Slugs: ${slugDocs.length}`);
    console.log(`Skills: ${skillDocs.length}`);
    console.log('All data seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
