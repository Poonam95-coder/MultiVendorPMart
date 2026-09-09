const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const DeliveryPartner = require('./models/DeliveryPartner');

const categories = [
  { slug: 'fruits-vegetables', name: 'Fruits & Vegetables', image: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/kdbfytxisrjymgy0ubhk.png' },
  { slug: 'personal-care', name: 'Personal Care', image: '' },
  { slug: 'pantry-staples', name: 'Pantry Staples', image: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cxrrgnf12xuhkr4dyhi2.png' },
  { slug: 'bakery', name: 'Bakery', image: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/zvoeqbvrbrt7atqj0dbu.png' },
  { slug: 'beverages', name: 'Beverages', image: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/daiglpvgna1dlhjplbve.png' },
  { slug: 'meat-seafood', name: 'Meat & Seafood', image: '' },
  { slug: 'snacks', name: 'Snacks', image: '' },
  { slug: 'frozen-foods', name: 'Frozen Foods', image: '' },
  { slug: 'baby-care', name: 'Baby Care', image: '' },
  { slug: 'dairy-eggs', name: 'Dairy & Eggs', image: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cnjrpbcnqesqxy1wr30g.png' },
];

const dummyProducts = [
  {
    name: "Butter Croissant 100g",
    description: "Flaky and buttery, fresh from the bakery",
    price: 45,
    originalPrice: 50,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/zvoeqbvrbrt7atqj0dbu.png",
    category: "bakery",
    unit: "100g",
    stock: 100,
    isOrganic: false,
    rating: 4.8,
    reviewCount: 24,
    discount: 10,
  },
  {
    name: "Organic Quinoa 500g",
    description: "High protein, Gluten-free whole grains from certified farms",
    price: 420,
    originalPrice: 450,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cxrrgnf12xuhkr4dyhi2.png",
    category: "pantry-staples",
    unit: "500g",
    stock: 100,
    isOrganic: true,
    rating: 4.9,
    reviewCount: 38,
    discount: 7,
  },
  {
    name: "Brown Bread 400g",
    description: "Soft and healthy, Ideal for nutritious breakfast",
    price: 35,
    originalPrice: 40,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vy1xa7zovcu22smzapzv.png",
    category: "bakery",
    unit: "400g",
    stock: 100,
    isOrganic: false,
    rating: 4.6,
    reviewCount: 19,
    discount: 13,
  },
  {
    name: "Barley 1kg",
    description: "Rich in dietary fiber, supports healthy digestion",
    price: 140,
    originalPrice: 150,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/spb5sgy8g24rned9nwog.png",
    category: "pantry-staples",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 12,
    discount: 7,
  },
  {
    name: "Knorr Cup Soup 70g",
    description: "Convenient and tasty instant soup",
    price: 30,
    originalPrice: 35,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vnzb2qbwtpab5gnqvx0f.png",
    category: "pantry-staples",
    unit: "70g",
    stock: 100,
    isOrganic: false,
    rating: 4.3,
    reviewCount: 15,
    discount: 14,
  },
  {
    name: "Maggi Noodles 280g",
    description: "Instant and easy to cook delicious snack",
    price: 50,
    originalPrice: 55,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dsep7owmwvfrukzbslqo.png",
    category: "pantry-staples",
    unit: "280g",
    stock: 100,
    isOrganic: false,
    rating: 4.7,
    reviewCount: 50,
    discount: 9,
  },
  {
    name: "Sprite 1.5L",
    description: "Chilled and refreshing, Perfect for celebrations",
    price: 60,
    originalPrice: 75,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/daiglpvgna1dlhjplbve.png",
    category: "beverages",
    unit: "1.5L",
    stock: 100,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 22,
    discount: 20,
  },
  {
    name: "Carrot 500g",
    description: "Sweet and crunchy, Good for eyesight, Ideal for juices and salads",
    price: 44,
    originalPrice: 50,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ceqgisupuizyste9aifg.png",
    category: "fruits-vegetables",
    unit: "500g",
    stock: 100,
    isOrganic: true,
    rating: 4.8,
    reviewCount: 31,
    discount: 12,
  },
  {
    name: "Coca-Cola 1.5L",
    description: "Perfect for parties and gatherings, Best served chilled",
    price: 75,
    originalPrice: 80,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/eljxcdud6fduwfim5rdx.png",
    category: "beverages",
    unit: "1.5L",
    stock: 100,
    isOrganic: false,
    rating: 4.7,
    reviewCount: 42,
    discount: 6,
  },
  {
    name: "Brown Rice 1kg",
    description: "Whole grain and nutritious staple",
    price: 110,
    originalPrice: 120,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dboutcrkdjhoxcvbbqne.png",
    category: "pantry-staples",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.4,
    reviewCount: 16,
    discount: 8,
  },
  {
    name: "Eggs 12 pcs",
    description: "Farm fresh, Rich in protein, Ideal for breakfast and baking",
    price: 85,
    originalPrice: 90,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cnjrpbcnqesqxy1wr30g.png",
    category: "dairy-eggs",
    unit: "12pcs",
    stock: 100,
    isOrganic: false,
    rating: 4.8,
    reviewCount: 28,
    discount: 6,
  },
  {
    name: "Banana 1 kg",
    description: "Sweet and ripe, High in potassium, Great for smoothies and snacking",
    price: 45,
    originalPrice: 50,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dsnmko6gqtyw31okby80.png",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.6,
    reviewCount: 35,
    discount: 10,
  },
  {
    name: "Basmati Rice 5kg",
    description: "Long grain and aromatic, Perfect for biryani",
    price: 520,
    originalPrice: 550,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/evuovl2nlwdjukosfz23.png",
    category: "pantry-staples",
    unit: "5kg",
    stock: 100,
    isOrganic: false,
    rating: 4.9,
    reviewCount: 60,
    discount: 5,
  },
  {
    name: "Onion 500g",
    description: "Fresh and pungent, Perfect for cooking, A kitchen staple",
    price: 45,
    originalPrice: 50,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/wnvtwlm2tphqburhsmyc.png",
    category: "fruits-vegetables",
    unit: "500g",
    stock: 100,
    isOrganic: false,
    rating: 4.3,
    reviewCount: 18,
    discount: 10,
  },
  {
    name: "7 Up 1.5L",
    description: "Refreshing lemon-lime fizzy flavor",
    price: 70,
    originalPrice: 76,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/qt1ypzsoqni12ghf2ryp.png",
    category: "beverages",
    unit: "1.5L",
    stock: 100,
    isOrganic: false,
    rating: 4.4,
    reviewCount: 14,
    discount: 8,
  },
  {
    name: "Spinach 500g",
    description: "Rich in iron, High in vitamins, Perfect for soups and salads",
    price: 15,
    originalPrice: 18,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/bhrtl76sscvmeiq4kchm.png",
    category: "fruits-vegetables",
    unit: "500g",
    stock: 100,
    isOrganic: true,
    rating: 4.7,
    reviewCount: 21,
    discount: 17,
  },
  {
    name: "Orange 1 kg",
    description: "Juicy and sweet, Rich in Vitamin C, Perfect for juices and salads",
    price: 75,
    originalPrice: 80,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/r1wxfortw5h12g7egx7k.png",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.6,
    reviewCount: 25,
    discount: 6,
  },
  {
    name: "Wheat Flour 5kg",
    description: "Soft and fluffy rotis, Rich in nutrients",
    price: 230,
    originalPrice: 250,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ooitbkcjcky0gkjmkatb.png",
    category: "pantry-staples",
    unit: "5kg",
    stock: 100,
    isOrganic: false,
    rating: 4.8,
    reviewCount: 45,
    discount: 8,
  },
  {
    name: "Grapes 500g",
    description: "Fresh and juicy, Rich in antioxidants, Perfect for snacking",
    price: 65,
    originalPrice: 70,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/jsmb7caaokhnyci2coga.png",
    category: "fruits-vegetables",
    unit: "500g",
    stock: 100,
    isOrganic: false,
    rating: 4.7,
    reviewCount: 30,
    discount: 7,
  },
  {
    name: "Fanta 1.5L",
    description: "Sweet and fizzy citrus beverage",
    price: 65,
    originalPrice: 70,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/nexecd3mgyzrpeun1bee.png",
    category: "beverages",
    unit: "1.5L",
    stock: 100,
    isOrganic: false,
    rating: 4.5,
    reviewCount: 20,
    discount: 7,
  },
  {
    name: "Paneer 200g",
    description: "Soft and fresh, Rich in protein, Ideal for curries and snacks",
    price: 85,
    originalPrice: 90,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vihqr6wquv57byurvz46.png",
    category: "dairy-eggs",
    unit: "200g",
    stock: 100,
    isOrganic: false,
    rating: 4.8,
    reviewCount: 36,
    discount: 6,
  },
  {
    name: "Mango 1 kg",
    description: "Sweet and flavorful, Perfect for smoothies and desserts",
    price: 140,
    originalPrice: 150,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/nb1mpxuo4fdcik6ey5yj.png",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.9,
    reviewCount: 52,
    discount: 7,
  },
  {
    name: "Tomato 1 kg",
    description: "Juicy and ripe, Rich in Vitamin C, Perfect for salads and sauces",
    price: 28,
    originalPrice: 30,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/kdbfytxisrjymgy0ubhk.png",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 100,
    isOrganic: true,
    rating: 4.6,
    reviewCount: 29,
    discount: 7,
  },
  {
    name: "Potato 500g",
    description: "Fresh and organic, Rich in carbohydrates, Ideal for curries and fries",
    price: 35,
    originalPrice: 40,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/tzibj2ntsnbn4e0u5kwv.png",
    category: "fruits-vegetables",
    unit: "500g",
    stock: 100,
    isOrganic: true,
    rating: 4.5,
    reviewCount: 18,
    discount: 13,
  },
  {
    name: "Cheese 200g",
    description: "Creamy and delicious, Perfect for pizzas and sandwiches",
    price: 130,
    originalPrice: 140,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/gek3mmiig3lixlkpxks8.png",
    category: "dairy-eggs",
    unit: "200g",
    stock: 100,
    isOrganic: false,
    rating: 4.7,
    reviewCount: 33,
    discount: 7,
  },
  {
    name: "Amul Milk 1L",
    description: "Fresh pasteurized whole milk, Rich in calcium",
    price: 55,
    originalPrice: 60,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ooamzy497lhsj2gjuwby.png",
    category: "dairy-eggs",
    unit: "1L",
    stock: 100,
    isOrganic: false,
    rating: 4.9,
    reviewCount: 65,
    discount: 8,
  },
  {
    name: "Apple 1 kg",
    description: "Fresh crispy apples, Boosts immunity, Rich in dietary fiber",
    price: 90,
    originalPrice: 100,
    image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/pjt1y6xdo46tluemhf0o.png",
    category: "fruits-vegetables",
    unit: "1kg",
    stock: 100,
    isOrganic: false,
    rating: 4.8,
    reviewCount: 40,
    discount: 10,
  }
];

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB for seeding...');

    // 1. Seed Categories
    for (const cat of categories) {
      await Category.updateOne(
        { slug: cat.slug },
        { slug: cat.slug, name: cat.name, image: cat.image },
        { upsert: true }
      );
    }
    console.log(`Seeded ${categories.length} categories.`);

    // 2. Seed Products
    for (const prod of dummyProducts) {
      await Product.updateOne(
        { name: prod.name },
        prod,
        { upsert: true }
      );
    }
    console.log(`Seeded ${dummyProducts.length} products.`);

    // 3. Seed Admin User
    let admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    if (!admin) {
      admin = new User({
        name: 'PMart Admin',
        email: 'admin@example.com',
        password: 'password123',
        isAdmin: true,
        phone: '9876543210',
      });
      await admin.save();
      console.log('Created Admin user: admin@example.com / password123');
    } else {
      admin.isAdmin = true;
      admin.password = 'password123';
      await admin.save();
      console.log('Updated Admin user: admin@example.com / password123');
    }

    // 4. Seed Delivery Partners
    const partners = [
      { name: 'Rahul Sharma', email: 'rahul@pmart.com', password: 'password123', phone: '9876543210', vehicleType: 'bike', isActive: true },
      { name: 'John Doe', email: 'john@pmart.com', password: 'password123', phone: '9876543211', vehicleType: 'scooter', isActive: true }
    ];

    for (const pData of partners) {
      let p = await DeliveryPartner.findOne({ email: pData.email }).select('+password');
      if (!p) {
        p = new DeliveryPartner(pData);
        await p.save();
        console.log(`Created Delivery Partner: ${pData.email} / password123`);
      } else {
        p.name = pData.name;
        p.phone = pData.phone;
        p.vehicleType = pData.vehicleType;
        p.isActive = true;
        p.password = 'password123';
        await p.save();
        console.log(`Updated Delivery Partner: ${pData.email} / password123`);
      }
    }

    console.log('Database seeding successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seed script error:', err);
    process.exit(1);
  }
})();

