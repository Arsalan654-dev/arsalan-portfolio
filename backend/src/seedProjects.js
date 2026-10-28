require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
};

const Category = mongoose.model('categories', new mongoose.Schema({
  category_title: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  icon: { type: String, default: '📁' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const Technology = mongoose.model('technologies', new mongoose.Schema({
  technology_title: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  icon: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const Skill = mongoose.model('skills', new mongoose.Schema({
  skill_title: { type: String, required: true },
  skill_option: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
  slug: { type: String, unique: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const Slug = mongoose.model('slugs', new mongoose.Schema({
  slug_title: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const Project = mongoose.model('projects', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  longDescription: { type: String, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  technologies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'technologies' }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills' }],
  projectSlugs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slugs' }],
  pictures: [{ type: String }],
  videos: [{ type: String }],
  livePreviewUrl: { type: String, default: null },
  price: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const Service = mongoose.model('services', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  longDescription: { type: String, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  technologies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'technologies' }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills' }],
  serviceSlugs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slugs' }],
  pictures: [{ type: String }],
  videos: [{ type: String }],
  livePreviewUrl: { type: String, default: null },
  price: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));

const seedProjectsAndServices = async () => {
  try {
    await connectDB();

    const categories = await Category.find({ isDeleted: false });
    const technologies = await Technology.find({ isDeleted: false });
    const skills = await Skill.find({ isDeleted: false });
    const slugs = await Slug.find({ isDeleted: false });

    const getCatId = (title) => categories.find(c => c.category_title === title)?._id;
    const getTechIds = (titles) => titles.map(t => technologies.find(tech => tech.technology_title === t)?._id).filter(Boolean);
    const getSkillIds = (titles) => titles.map(t => skills.find(s => s.skill_title === t)?._id).filter(Boolean);
    const getSlugIds = (titles) => titles.map(t => slugs.find(s => s.slug_title === t)?._id).filter(Boolean);

    const placeholderImages = [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop'
    ];

    const vehicleImages = [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop'
    ];

    const marineImages = [
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=500&fit=crop'
    ];

    const boatImages = [
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1567138540208-43e629a7e189?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800&h=500&fit=crop'
    ];

    await Project.deleteMany({ isDeleted: false });
    console.log('Cleared existing projects.');

    const projects = [
      {
        title: 'Vingo - Food Delivery Platform',
        slug: generateSlug('Vingo Food Delivery Platform'),
        description: 'A comprehensive full-stack food delivery and e-commerce platform with real-time order tracking, restaurant management, and AI-powered chatbot support. Built with React, Node.js, and MongoDB for seamless performance.',
        longDescription: 'Vingo is a modern food delivery application that connects customers with local restaurants. Features include real-time order tracking via WebSocket, Stripe payment processing, Google OAuth authentication, delivery zone management, and an OpenAI-powered chatbot for customer support. The platform supports multiple user roles (admin, customer, delivery) with dedicated dashboards for each. Admin analytics powered by Chart.js provide insights into orders, revenue, and customer trends.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Stripe', 'OpenAI/GPT', 'Firebase']),
        skills: getSkillIds(['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST API Design']),
        projectSlugs: getSlugIds(['full-stack', 'real-time', 'mern-stack', 'payment-integration', 'chat-application']),
        pictures: placeholderImages,
        livePreviewUrl: 'https://github.com/Arsalan-Akhtar/ArS_Ecom_Advance_App',
        price: 2999,
        averageRating: 4.8,
        totalReviews: 24
      },
      {
        title: 'AutosCheckPro - Vehicle History Reports',
        slug: generateSlug('AutosCheckPro Vehicle History Reports'),
        description: 'A multi-website vehicle history and VIN check report platform serving multiple countries with 8+ payment gateway integrations. Built with Laravel and MySQL for enterprise-grade reliability.',
        longDescription: 'AutosCheckPro is a comprehensive vehicle history report platform that provides detailed VIN check reports across multiple countries. The platform supports 8+ payment gateways including Stripe, PayPal, Square, Paddle, WorldPay, GoCardless, Deposyt, and NMI. Features include multi-country support with country-specific pricing, merchant management with API key configuration, admin dashboard with order analytics, and email notification system. The platform is designed for scalability with role-based access control and multi-brand support.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['PHP', 'Laravel', 'MySQL', 'Stripe', 'REST API']),
        skills: getSkillIds(['PHP', 'Laravel', 'MySQL', 'REST API Design']),
        projectSlugs: getSlugIds(['full-stack', 'saas', 'payment-integration', 'seo-optimized']),
        pictures: vehicleImages,
        livePreviewUrl: 'https://www.autoscheckpro.com/',
        price: 3499,
        averageRating: 4.9,
        totalReviews: 31
      },
      {
        title: 'CarCheckZone - Vehicle VIN Check Reports',
        slug: generateSlug('CarCheckZone Vehicle VIN Check Reports'),
        description: 'A modern vehicle history check platform with 9+ payment gateways, multi-country support, and a powerful admin dashboard. Features real-time order management and chatbot integration.',
        longDescription: 'CarCheckZone is a next-generation vehicle history check platform that provides instant VIN check reports. The platform integrates 9+ payment gateways including Authorize.net, with real-time order tracking and management. Built with Laravel 13, it features a comprehensive admin dashboard with order analytics, chatbot settings, email configuration, and payment gateway management. The platform supports multiple countries with localized pricing and currency exchange rates.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['PHP', 'Laravel', 'MySQL', 'Stripe', 'REST API']),
        skills: getSkillIds(['PHP', 'Laravel', 'MySQL']),
        projectSlugs: getSlugIds(['full-stack', 'saas', 'payment-integration', 'seo-optimized']),
        pictures: vehicleImages,
        livePreviewUrl: 'https://carcheckzone.com/',
        price: 3499,
        averageRating: 4.7,
        totalReviews: 28
      },
      {
        title: 'SeaHistoryChecks - Marine Vessel Reports',
        slug: generateSlug('SeaHistoryChecks Marine Vessel Reports'),
        description: 'A specialized marine vessel and boat history check platform with comprehensive report generation, multi-gateway payments, and country-specific maritime data integration.',
        longDescription: 'SeaHistoryChecks is a marine-focused platform that provides detailed vessel and boat history reports. The platform covers maritime history, vessel documentation, ownership records, and incident reports across multiple countries. Built with Laravel 13, it features 9+ payment gateway integrations, a marine-themed responsive design, admin dashboard with order and visitor analytics, and email notification system. The platform is designed for boat dealers, marine surveyors, and vessel buyers who need comprehensive maritime history data.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['PHP', 'Laravel', 'MySQL', 'Stripe', 'REST API']),
        skills: getSkillIds(['PHP', 'Laravel', 'MySQL']),
        projectSlugs: getSlugIds(['full-stack', 'saas', 'payment-integration', 'seo-optimized']),
        pictures: marineImages,
        livePreviewUrl: 'https://seahistorychecks.com/',
        price: 3999,
        averageRating: 4.6,
        totalReviews: 19
      },
      {
        title: 'US Boat Registry - Vessel Documentation',
        slug: generateSlug('US Boat Registry Vessel Documentation'),
        description: 'A comprehensive US-focused boat registry and vessel documentation platform with charter listings, sale listings, and multiple front-end templates for different maritime services.',
        longDescription: 'US Boat Registry is a multi-faceted maritime platform that combines boat registry services with vessel history reports. The platform features multiple front-end templates including BoatTemplate, marinehistorytemplate, quickvinscheck, and sea charter listing themes. Built with Laravel 13, it supports 9+ payment gateways, affiliate program integration, blog/post system, and comprehensive admin panel with order and visitor management. The platform caters to boat owners, charter services, and maritime enthusiasts across the United States.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['PHP', 'Laravel', 'MySQL', 'Stripe', 'REST API']),
        skills: getSkillIds(['PHP', 'Laravel', 'MySQL']),
        projectSlugs: getSlugIds(['full-stack', 'saas', 'payment-integration', 'seo-optimized', 'multi-language']),
        pictures: boatImages,
        livePreviewUrl: 'https://usboatregistry.com/',
        price: 4499,
        averageRating: 4.8,
        totalReviews: 22
      }
    ];

    const savedProjects = await Project.insertMany(projects);
    console.log(`${savedProjects.length} projects created.`);

    const serviceImages = [];
    const servicesDir = path.join(__dirname, '../../services');
    if (fs.existsSync(servicesDir)) {
      const files = fs.readdirSync(servicesDir);
      files.forEach(f => serviceImages.push(`/services-images/${f}`));
    }

    await Service.deleteMany({ isDeleted: false });
    console.log('Cleared existing services.');

    const services = [
      {
        title: 'Full-Stack Web Development',
        slug: generateSlug('Full-Stack Web Development'),
        description: 'End-to-end web application development using modern frameworks and technologies. From concept to deployment, we build scalable, performant, and secure web applications tailored to your business needs.',
        longDescription: 'Our Full-Stack Web Development service covers everything from initial concept and UI/UX design to backend architecture, database design, API development, and deployment. We specialize in MERN stack (MongoDB, Express.js, React.js, Node.js), Next.js for server-side rendering, and modern JavaScript frameworks. Our services include: Custom web application development, E-commerce platforms, SaaS applications, Real-time applications with WebSocket, RESTful and GraphQL API development, Database design and optimization, Cloud deployment (AWS, Vercel, Netlify), Performance optimization, SEO implementation, and ongoing maintenance and support.',
        category: getCatId('Web Development'),
        technologies: getTechIds(['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Docker', 'AWS']),
        skills: getSkillIds(['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'REST API Design', 'Git & GitHub']),
        serviceSlugs: getSlugIds(['full-stack', 'frontend', 'backend', 'responsive-design', 'mern-stack', 'server-side-rendering']),
        pictures: [serviceImages[0], serviceImages[4]].filter(Boolean),
        livePreviewUrl: null,
        price: 4999,
        averageRating: 4.9,
        totalReviews: 45
      },
      {
        title: 'Mobile App Development',
        slug: generateSlug('Mobile App Development'),
        description: 'Cross-platform and native mobile application development for iOS and Android. We create stunning, high-performance mobile apps using React Native and Flutter with seamless user experiences.',
        longDescription: 'Our Mobile App Development service delivers high-quality mobile applications for both iOS and Android platforms. We specialize in cross-platform development using React Native and Flutter, which allows us to build once and deploy to both platforms with native-like performance. Our services include: Cross-platform app development (iOS & Android), Native iOS (Swift) and Android (Kotlin) development, UI/UX design for mobile, Push notification integration, Real-time data synchronization, Payment gateway integration, App Store and Play Store deployment, Backend API development, Analytics integration, and App maintenance and updates.',
        category: getCatId('Mobile App Development'),
        technologies: getTechIds(['React Native', 'Flutter', 'Firebase', 'Node.js', 'Stripe', 'REST API']),
        skills: getSkillIds(['React Native', 'Flutter', 'JavaScript', 'Node.js', 'REST API Design']),
        serviceSlugs: getSlugIds(['full-stack', 'responsive-design', 'progressive-web-app', 'real-time']),
        pictures: [serviceImages[2]].filter(Boolean),
        livePreviewUrl: null,
        price: 5999,
        averageRating: 4.8,
        totalReviews: 38
      },
      {
        title: 'AI & Machine Learning Solutions',
        slug: generateSlug('AI Machine Learning Solutions'),
        description: 'Custom AI and machine learning solutions including natural language processing, computer vision, predictive analytics, and intelligent automation systems powered by cutting-edge algorithms.',
        longDescription: 'Our AI & Machine Learning Solutions service brings the power of artificial intelligence to your business. We develop custom AI models, neural networks, and intelligent systems that automate processes, extract insights from data, and enable smart decision-making. Our services include: Custom AI model development, Natural Language Processing (NLP) and text analysis, Computer vision and image recognition, Predictive analytics and forecasting, Recommendation systems, Chatbots and virtual assistants using OpenAI/GPT, Sentiment analysis, Anomaly detection, AI-powered automation workflows, Model training, testing, and deployment, Integration with existing business systems.',
        category: getCatId('AI & Machine Learning'),
        technologies: getTechIds(['Python', 'TensorFlow', 'OpenAI/GPT', 'Node.js']),
        skills: getSkillIds(['Python', 'Machine Learning']),
        serviceSlugs: getSlugIds(['full-stack', 'rest-api', 'serverless']),
        pictures: [serviceImages[0]].filter(Boolean),
        livePreviewUrl: null,
        price: 7999,
        averageRating: 4.7,
        totalReviews: 21
      },
      {
        title: 'Data Science & Analytics',
        slug: generateSlug('Data Science Analytics'),
        description: 'Transform raw data into actionable business insights through advanced analytics, data visualization, statistical modeling, and comprehensive reporting dashboards.',
        longDescription: 'Our Data Science & Analytics service helps businesses make data-driven decisions by extracting meaningful insights from complex datasets. We provide end-to-end data solutions from data collection and cleaning to advanced analytics and visualization. Our services include: Data collection and preprocessing, Exploratory Data Analysis (EDA), Statistical modeling and hypothesis testing, Data visualization and dashboard creation (Chart.js, D3.js), Business intelligence reporting, Predictive and prescriptive analytics, Customer segmentation and behavior analysis, A/B testing and experimental design, ETL pipeline development, Data warehousing solutions, Real-time analytics systems, and Custom reporting tools.',
        category: getCatId('AI & Machine Learning'),
        technologies: getTechIds(['Python', 'PostgreSQL', 'MongoDB']),
        skills: getSkillIds(['Python', 'PostgreSQL', 'Machine Learning']),
        serviceSlugs: getSlugIds(['full-stack', 'rest-api', 'serverless']),
        pictures: [serviceImages[1]].filter(Boolean),
        livePreviewUrl: null,
        price: 6999,
        averageRating: 4.8,
        totalReviews: 32
      },
      {
        title: 'Data Analysis & Business Intelligence',
        slug: generateSlug('Data Analysis Business Intelligence'),
        description: 'Professional data analysis services including data cleaning, transformation, visualization, and actionable business intelligence reporting to drive strategic decision-making.',
        longDescription: 'Our Data Analysis & Business Intelligence service transforms raw data into clear, actionable insights that drive business growth. We specialize in creating comprehensive dashboards, automated reports, and data pipelines that give you a competitive edge. Our services include: Data cleaning and transformation, Interactive dashboard development, Automated report generation, KPI tracking and monitoring, Sales and marketing analytics, Financial data analysis, Customer analytics and segmentation, Market research analysis, Competitive analysis, Data governance and quality assurance, Excel/Google Sheets automation, and Business intelligence tool implementation.',
        category: getCatId('AI & Machine Learning'),
        technologies: getTechIds(['Python', 'PostgreSQL']),
        skills: getSkillIds(['Python', 'PostgreSQL']),
        serviceSlugs: getSlugIds(['full-stack', 'rest-api']),
        pictures: [serviceImages[5]].filter(Boolean),
        livePreviewUrl: null,
        price: 4999,
        averageRating: 4.9,
        totalReviews: 41
      },
      {
        title: 'n8n Workflow Automation & AI Bots',
        slug: generateSlug('n8n Workflow Automation AI Bots'),
        description: 'Intelligent workflow automation using n8n, custom AI chatbots, and integration bots that connect your tools and automate repetitive tasks to boost productivity.',
        longDescription: 'Our n8n Workflow Automation & AI Bots service helps businesses automate repetitive tasks and streamline workflows using n8n, a powerful open-source workflow automation tool. We build custom integrations, AI-powered chatbots, and intelligent automation systems. Our services include: Custom n8n workflow development, API integrations between tools and services, AI chatbot development (OpenAI, Gemini), Email automation and marketing workflows, Data synchronization across platforms, Social media automation, Customer support bots, Lead generation automation, Invoice and payment processing workflows, CRM integration automation, Custom webhook development, and Monitoring and alerting systems.',
        category: getCatId('Cloud & DevOps'),
        technologies: getTechIds(['Node.js', 'REST API', 'OpenAI/GPT', 'Firebase']),
        skills: getSkillIds(['Node.js', 'REST API Design', 'Git & GitHub']),
        serviceSlugs: getSlugIds(['full-stack', 'rest-api', 'serverless', 'ci-cd']),
        pictures: [serviceImages[3]].filter(Boolean),
        livePreviewUrl: null,
        price: 3999,
        averageRating: 4.7,
        totalReviews: 29
      }
    ];

    const savedServices = await Service.insertMany(services);
    console.log(`${savedServices.length} services created.`);

    console.log('\n--- SUMMARY ---');
    console.log(`Projects: ${savedProjects.length}`);
    console.log(`Services: ${savedServices.length}`);
    console.log('All data seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedProjectsAndServices();
