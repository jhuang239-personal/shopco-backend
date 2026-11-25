// Initial catalog for the seed. Edit names, descriptions and prices here.
// Image keys are derived from the category and product slugs:
//   seed/<category-slug>/<product-slug>-<1|2|3>.jpg
// Upload the generated images to the OCI bucket under exactly these keys.

export const brands = [
  "Northline",
  "Atelier Nord",
  "Kestrel Outdoor",
  "Oakmere",
  "Verdant & Co.",
];

export const styles = ["Casual", "Formal", "Party", "Gym", "Street"];

type ProductSeed = {
  name: string;
  brand: string;
  styles: string[];
  price: number;
  stock: number;
  description: string;
};

export type CategorySeed = {
  name: string;
  products: ProductSeed[];
};

export const categories: CategorySeed[] = [
  {
    name: "T-Shirts",
    products: [
      {
        name: "Classic Crew Tee",
        brand: "Northline",
        styles: ["Casual", "Street"],
        price: 24.9,
        stock: 120,
        description:
          "A soft, midweight crew-neck tee cut for an easy everyday fit. Pre-shrunk cotton jersey with a ribbed collar that holds its shape wash after wash.",
      },
      {
        name: "Oversized Graphic Tee",
        brand: "Northline",
        styles: ["Street"],
        price: 32.5,
        stock: 80,
        description:
          "Dropped shoulders and a boxy body make this relaxed tee a streetwear staple. Screen-printed back graphic on heavyweight cotton.",
      },
      {
        name: "Striped Linen Tee",
        brand: "Verdant & Co.",
        styles: ["Casual"],
        price: 29.0,
        stock: 60,
        description:
          "Breathable linen-cotton blend in a classic navy stripe. A lightweight tee for warm days that softens with every wear.",
      },
      {
        name: "Performance V-Neck Tee",
        brand: "Kestrel Outdoor",
        styles: ["Gym"],
        price: 27.0,
        stock: 95,
        description:
          "Moisture-wicking polyester knit with flatlock seams to reduce chafing. A slim V-neck built for training and long walks.",
      },
    ],
  },
  {
    name: "Shirts",
    products: [
      {
        name: "Oxford Button-Down Shirt",
        brand: "Oakmere",
        styles: ["Formal", "Casual"],
        price: 58.0,
        stock: 45,
        description:
          "Classic oxford cloth with a soft roll collar and button-down collar points. Tailored through the body for a clean, polished look.",
      },
      {
        name: "Slim Fit Dress Shirt",
        brand: "Atelier Nord",
        styles: ["Formal"],
        price: 74.0,
        stock: 40,
        description:
          "Wrinkle-resistant cotton poplin in a slim cut. Finished with mother-of-pearl buttons and a hidden placket for a sharp silhouette.",
      },
      {
        name: "Western Denim Shirt",
        brand: "Northline",
        styles: ["Casual"],
        price: 49.5,
        stock: 55,
        description:
          "Mid-wash denim with pearl snap buttons and yoke detailing. Layers easily over tees or under a jacket.",
      },
      {
        name: "Flannel Check Shirt",
        brand: "Verdant & Co.",
        styles: ["Casual", "Street"],
        price: 46.0,
        stock: 70,
        description:
          "Brushed cotton flannel in a warm red-and-charcoal check. Relaxed fit with chest pockets and a comfortable, weekend-ready feel.",
      },
    ],
  },
  {
    name: "Jeans",
    products: [
      {
        name: "Straight Leg Indigo Jeans",
        brand: "Northline",
        styles: ["Casual"],
        price: 68.0,
        stock: 90,
        description:
          "Rigid indigo denim that softens over time. A straight leg with a mid rise and classic five-pocket styling.",
      },
      {
        name: "Slim Taper Stretch Jeans",
        brand: "Oakmere",
        styles: ["Casual", "Street"],
        price: 72.0,
        stock: 85,
        description:
          "Stretch denim with a slim taper and a comfortable mid rise. Keeps its shape through a full day of wear.",
      },
      {
        name: "Relaxed Baggy Jeans",
        brand: "Northline",
        styles: ["Street"],
        price: 64.0,
        stock: 60,
        description:
          "Wide-leg denim with a relaxed seat and a generous leg opening. Inspired by 90s skate silhouettes.",
      },
      {
        name: "Black Skinny Jeans",
        brand: "Atelier Nord",
        styles: ["Party"],
        price: 66.0,
        stock: 50,
        description:
          "Washed black stretch denim with a skinny fit from hip to ankle. Pairs well with boots for evening wear.",
      },
    ],
  },
  {
    name: "Hoodies",
    products: [
      {
        name: "Pullover Fleece Hoodie",
        brand: "Kestrel Outdoor",
        styles: ["Casual", "Gym"],
        price: 54.0,
        stock: 100,
        description:
          "Brushed fleece interior for warmth without the bulk. A kangaroo pocket and drawstring hood for easy layering.",
      },
      {
        name: "Zip-Up Hoodie",
        brand: "Northline",
        styles: ["Street"],
        price: 58.0,
        stock: 75,
        description:
          "Full-length zip with metal hardware and a double-layer hood. Built on a heavyweight cotton-blend French terry.",
      },
      {
        name: "Cropped Oversized Hoodie",
        brand: "Verdant & Co.",
        styles: ["Street", "Party"],
        price: 52.0,
        stock: 40,
        description:
          "A cropped, oversized fit with dropped shoulders. Made from organic cotton with a soft brushed back.",
      },
      {
        name: "Tech Training Hoodie",
        brand: "Kestrel Outdoor",
        styles: ["Gym"],
        price: 62.0,
        stock: 65,
        description:
          "Lightweight stretch knit with thumbholes and a reflective logo. Breathes well during high-intensity sessions.",
      },
    ],
  },
  {
    name: "Jackets",
    products: [
      {
        name: "Waxed Cotton Field Jacket",
        brand: "Kestrel Outdoor",
        styles: ["Casual"],
        price: 139.0,
        stock: 30,
        description:
          "Water-resistant waxed cotton with a corduroy collar and multiple pockets. Develops a worn-in patina over time.",
      },
      {
        name: "Denim Trucker Jacket",
        brand: "Northline",
        styles: ["Casual", "Street"],
        price: 98.0,
        stock: 45,
        description:
          "Classic trucker cut in washed denim with flap chest pockets. A versatile layer for transitional weather.",
      },
      {
        name: "Wool Blend Overcoat",
        brand: "Atelier Nord",
        styles: ["Formal"],
        price: 245.0,
        stock: 20,
        description:
          "A tailored single-breasted overcoat in a wool-cashmere blend. Finished with a notched lapel and a full satin lining.",
      },
      {
        name: "Lightweight Bomber Jacket",
        brand: "Oakmere",
        styles: ["Street"],
        price: 112.0,
        stock: 35,
        description:
          "Nylon shell with ribbed cuffs and hem. A short, structured bomber that layers easily over tees.",
      },
    ],
  },
  {
    name: "Dresses",
    products: [
      {
        name: "Wrap Midi Dress",
        brand: "Verdant & Co.",
        styles: ["Party", "Casual"],
        price: 96.0,
        stock: 40,
        description:
          "A flowing wrap silhouette in a viscose blend with a tie waist. Moves easily from a day at the office to dinner.",
      },
      {
        name: "Satin Slip Dress",
        brand: "Atelier Nord",
        styles: ["Party"],
        price: 118.0,
        stock: 25,
        description:
          "Bias-cut satin with thin adjustable straps and a subtle sheen. Designed for evening events.",
      },
      {
        name: "Linen Shirt Dress",
        brand: "Oakmere",
        styles: ["Casual"],
        price: 84.0,
        stock: 50,
        description:
          "Breathable linen with a button-front shirt silhouette and a self-belt. A relaxed dress for warm-weather days.",
      },
      {
        name: "Ribbed Bodycon Dress",
        brand: "Northline",
        styles: ["Party", "Street"],
        price: 58.0,
        stock: 60,
        description:
          "Stretch rib-knit that hugs the body with a square neckline. Easy to style with jackets or on its own.",
      },
    ],
  },
  {
    name: "Shorts",
    products: [
      {
        name: "Chino Shorts",
        brand: "Oakmere",
        styles: ["Casual"],
        price: 42.0,
        stock: 80,
        description:
          "Garment-dyed cotton twill with a mid-thigh inseam. A smart-casual short that works for weekends and travel.",
      },
      {
        name: "Denim Cut-Off Shorts",
        brand: "Northline",
        styles: ["Casual", "Street"],
        price: 39.0,
        stock: 70,
        description:
          "Mid-wash denim shorts with a frayed hem and five-pocket styling. A summer staple.",
      },
      {
        name: "Training Shorts with Liner",
        brand: "Kestrel Outdoor",
        styles: ["Gym"],
        price: 34.0,
        stock: 110,
        description:
          "Lightweight woven shell with an inner brief liner and zip pocket. Built for running and gym sessions.",
      },
      {
        name: "Linen Drawstring Shorts",
        brand: "Verdant & Co.",
        styles: ["Casual"],
        price: 36.0,
        stock: 55,
        description:
          "Natural linen with an elasticated drawstring waist. Breathable and relaxed for resort-style days.",
      },
    ],
  },
  {
    name: "Sweaters",
    products: [
      {
        name: "Merino Crew Knit",
        brand: "Atelier Nord",
        styles: ["Casual", "Formal"],
        price: 89.0,
        stock: 45,
        description:
          "Fine-gauge merino wool with a classic crew neck. Lightweight warmth that layers neatly under a coat.",
      },
      {
        name: "Cable Knit Sweater",
        brand: "Oakmere",
        styles: ["Casual"],
        price: 76.0,
        stock: 50,
        description:
          "Chunky cable pattern in a soft acrylic-wool blend. A cozy sweater for cooler weather.",
      },
      {
        name: "Half-Zip Pullover",
        brand: "Kestrel Outdoor",
        styles: ["Casual", "Gym"],
        price: 68.0,
        stock: 60,
        description:
          "Midweight knit with a half-zip collar and moisture-wicking finish. Works on trails and in town.",
      },
      {
        name: "Oversized Mock-Neck Knit",
        brand: "Verdant & Co.",
        styles: ["Street"],
        price: 72.0,
        stock: 35,
        description:
          "Relaxed mock-neck in recycled cotton-blend yarn. Dropped shoulders and a soft, slouchy drape.",
      },
    ],
  },
  {
    name: "Activewear",
    products: [
      {
        name: "High-Rise Leggings",
        brand: "Kestrel Outdoor",
        styles: ["Gym"],
        price: 58.0,
        stock: 100,
        description:
          "Four-way stretch fabric with a high waistband and a hidden pocket. Compressive enough for training.",
      },
      {
        name: "Seamless Sports Bra",
        brand: "Kestrel Outdoor",
        styles: ["Gym"],
        price: 36.0,
        stock: 90,
        description:
          "A women's seamless sports bra with medium support. Wide elastic under-bust band, shoulder straps and removable cups. Breathable knit for high-impact workouts.",
      },
      {
        name: "Quarter-Zip Training Top",
        brand: "Northline",
        styles: ["Gym"],
        price: 48.0,
        stock: 70,
        description:
          "Lightweight quick-dry top with a quarter-zip and thumbholes. Designed to stay put during intense sessions.",
      },
      {
        name: "Jogger Track Pants",
        brand: "Northline",
        styles: ["Gym", "Street"],
        price: 52.0,
        stock: 85,
        description:
          "Tapered joggers in brushed interlock with an elastic waist and ankle cuffs. Comfortable for training or lounging.",
      },
    ],
  },
  {
    name: "Skirts",
    products: [
      {
        name: "Pleated Midi Skirt",
        brand: "Atelier Nord",
        styles: ["Formal", "Party"],
        price: 79.0,
        stock: 35,
        description:
          "Knife-pleated midi in a lightweight crepe with a high elastic waist. Elegant for office or occasion wear.",
      },
      {
        name: "Denim Mini Skirt",
        brand: "Northline",
        styles: ["Street"],
        price: 46.0,
        stock: 50,
        description:
          "Button-front mini in washed denim with a raw hem. A casual skirt that pairs with tees and sneakers.",
      },
      {
        name: "A-Line Satin Skirt",
        brand: "Oakmere",
        styles: ["Party"],
        price: 62.0,
        stock: 30,
        description:
          "Satin A-line midi with a soft sheen and a concealed side zip. Dressed up with heels or down with a knit.",
      },
      {
        name: "Linen Wrap Skirt",
        brand: "Verdant & Co.",
        styles: ["Casual"],
        price: 54.0,
        stock: 40,
        description:
          "Linen blend wrap skirt with a self-tie waist. A breezy option for warm days.",
      },
    ],
  },
];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Review text pools. Each product gets 2 positive, 2 neutral and 2 negative reviews.
export const reviewPools = {
  positive: [
    "Fits exactly as described and the quality is better than I expected.",
    "Really happy with this. I've already worn it several times.",
    "Great fabric and a comfortable fit. Would buy again.",
    "Looks even better in person. Easy to style with what I already own.",
    "Solid stitching and a nice finish. Worth the price.",
    "Exactly what I was looking for. Shipping was fast too.",
  ],
  neutral: [
    "It's fine. Does what it says, nothing particularly special.",
    "Decent quality for the price. Sizing runs a little differently than I expected.",
    "Okay overall. The fit is good but the colour is a bit different from the photos.",
    "Average. I'd say it's good for everyday use but not a standout piece.",
    "Met my expectations. Not sure yet how it holds up after several washes.",
    "Reasonable for the money. Took a couple of wears to feel comfortable in it.",
  ],
  negative: [
    "Disappointed with the stitching. A seam came loose after the first wash.",
    "The fabric feels thinner than the description suggested and it pills quickly.",
    "Sizing is off. The fit was much tighter than the size chart indicated.",
    "Not what I hoped for. The colour faded noticeably after a few washes.",
    "Uncomfortable to wear for long periods. The seams rub against the skin.",
    "Arrived with a small mark on the fabric. Returning it for a replacement.",
  ],
};
