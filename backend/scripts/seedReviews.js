const mongoose = require('mongoose');
const User = require('../models/User/User.model');
const Product = require('../models/Product/Product.model');
const Review = require('../models/Review/Review.model');
const { analyzeSentimentWithGroq } = require('../controllers/review/reviewController');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mhv_furniture';

const rawReviews = [
  {
    rating: 5,
    comment: "This Luxury Modern Sofa is incredibly soft and comfortable! The linen fabric feels very premium and looks great in my living room."
  },
  {
    rating: 4,
    comment: "Solid and sturdy office chair. Lumbar support is decent, although it took almost a week to arrive. Overall, very satisfied."
  },
  {
    rating: 2,
    comment: "The center table looks okay, but the glass came with small scratches. Assembly instructions were also very confusing."
  },
  {
    rating: 5,
    comment: "Absolutely gorgeous dining table! The teak wood finish is beautiful and fits all 6 chairs perfectly."
  },
  {
    rating: 1,
    comment: "Horrible customer service! The wardrobe arrived broken, parts were missing, and the wood feels cheap. Avoid buying this!"
  },
  {
    rating: 3,
    comment: "Average quality. The bookshelf holds books fine, but it wobbles slightly when loaded. It's fine for the price I guess."
  },
  {
    rating: 5,
    comment: "Stunning accent chair! The color matches the picture perfectly and it adds a great pop of color to the bedroom."
  },
  {
    rating: 2,
    comment: "Extremely difficult to assemble. It took three of us over 4 hours because the pre-drilled holes did not align at all."
  }
];

const seedReviews = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Fetching products...');
    const products = await Product.find({}).limit(10);
    if (products.length === 0) {
      console.warn('Warning: No products found in the database. Please seed products first.');
      await mongoose.disconnect();
      return;
    }

    console.log('Fetching users...');
    const users = await User.find({ role: 'customer' }).limit(10);
    if (users.length === 0) {
      console.warn('Warning: No customer users found. Please seed users first.');
      await mongoose.disconnect();
      return;
    }

    console.log('Cleaning up existing reviews...');
    await Review.deleteMany({});

    console.log('Generating AI-analyzed reviews...');
    const seededReviews = [];

    for (let i = 0; i < rawReviews.length; i++) {
      const raw = rawReviews[i];
      const product = products[i % products.length];
      const user = users[i % users.length];

      console.log(`Analyzing review ${i + 1}/${rawReviews.length} via Groq...`);
      const aiResult = await analyzeSentimentWithGroq(raw.comment, raw.rating);

      seededReviews.push({
        product: product._id,
        user: user._id,
        rating: raw.rating,
        comment: raw.comment,
        status: 'Approved',
        aiSentiment: aiResult.sentiment,
        aiReasoning: aiResult.reasoning,
        aiReply: aiResult.reply
      });
    }

    console.log('Inserting seeded reviews...');
    await Review.insertMany(seededReviews);
    console.log(`Successfully seeded ${seededReviews.length} reviews!`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Seeding reviews failed:', error);
    process.exit(1);
  }
};

seedReviews();
