/*
 * EcoTrack Real-World Photographic Images
 *
 * IMPORTANT:
 * - No generated SVG illustrations
 * - No emoji/icon artwork
 * - Every major category has its own real scenario photograph
 * - Articles use article-topic photographs first
 * - Uploaded article images always take priority in the page component
 */

const CATEGORY_IMAGES = {
  transportation:
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1800&q=90',

  energy:
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1800&q=90',

  agriculture:
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=90',

  commercial:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90',

  construction:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=90',

  industrial:
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=90',

  waste:
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1800&q=90',

  water:
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1800&q=90',

  food:
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=90',

  shopping:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=90',

  buildings:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=90',

  sustainability:
    'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1800&q=90',
};


/*
 * Article-specific photographic images.
 *
 * These are selected from the actual article topic rather than
 * simply using the database ID.
 */
const ARTICLE_IMAGES = {
  carbonFootprint:
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1800&q=90',

  emissionFactor:
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=90',

  homeEnergy:
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=90',

  agriculture:
    'https://images.unsplash.com/photo-1499529112087-3cb3b73c69e0?auto=format&fit=crop&w=1800&q=90',

  transportation:
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1800&q=90',

  cycling:
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1800&q=90',

  electricity:
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1800&q=90',

  renewable:
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1800&q=90',

  waste:
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1800&q=90',

  food:
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=90',

  shopping:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=90',

  water:
    'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1800&q=90',

  buildings:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=90',

  default:
    'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1800&q=90',
};


const normalise = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');


const CATEGORY_ALIASES = {
  transportation: [
    'transport',
    'transportation',
    'mobility',
    'travel',
    'trn',
    'car',
    'bus',
    'bike',
    'flight',
  ],

  energy: [
    'energy',
    'electricity',
    'electric',
    'power',
    'grid',
    'eng',
    'elec',
    'solar',
  ],

  agriculture: [
    'agriculture',
    'agri',
    'farming',
    'farm',
    'tractor',
    'livestock',
  ],

  commercial: [
    'commercial',
    'business',
    'office',
    'retail',
    'com',
  ],

  construction: [
    'construction',
    'buildingconstruction',
    'con',
  ],

  industrial: [
    'industrial',
    'industry',
    'factory',
    'manufacturing',
    'ind',
  ],

  waste: [
    'waste',
    'wastemanagement',
    'recycling',
    'recycle',
    'compost',
    'wst',
  ],

  water: [
    'water',
    'watermanagement',
    'waterconservation',
    'wtr',
  ],

  food: [
    'food',
    'meal',
    'diet',
    'foodwaste',
    'nutrition',
  ],

  shopping: [
    'shopping',
    'shop',
    'consumer',
    'product',
    'clothes',
    'electronics',
  ],

  buildings: [
    'building',
    'buildings',
    'heating',
    'home',
    'housing',
    'lighting',
    'cooling',
  ],
};


export const getCategoryImage = (
  category = {}
) => {
  const name = normalise(
    category?.categoryName
  );

  const code = normalise(
    category?.categoryCode
  );

  for (
    const [key, aliases]
    of Object.entries(
      CATEGORY_ALIASES
    )
  ) {
    if (
      aliases.some(
        (alias) =>
          name.includes(alias) ||
          code.includes(alias)
      )
    ) {
      return (
        CATEGORY_IMAGES[key] ||
        CATEGORY_IMAGES.sustainability
      );
    }
  }

  return (
    category?.imageUrl ||
    CATEGORY_IMAGES.sustainability
  );
};


export const getArticleImage = (
  article = {}
) => {
  /*
   * If an uploaded cover exists, the article page
   * should normally use it before this fallback.
   */
  if (
    article?.coverImage &&
    String(article.coverImage)
      .trim()
  ) {
    return article.coverImage;
  }

  const text = normalise(
    [
      article?.title,
      article?.category,
      article?.shortDescription,
      article?.content,
    ]
      .filter(Boolean)
      .join(' ')
  );


  /*
   * Most specific article-topic matches first.
   */

  if (
    text.includes('emissionfactor') ||
    text.includes('emissionfactor') ||
    text.includes('factor')
  ) {
    return ARTICLE_IMAGES.emissionFactor;
  }

  if (
    text.includes('carbonfootprint') ||
    text.includes('reducecarbon') ||
    text.includes('smallchanges')
  ) {
    return ARTICLE_IMAGES.carbonFootprint;
  }

  if (
    text.includes('comfort') ||
    text.includes('homeenergy') ||
    text.includes('home') ||
    text.includes('heating') ||
    text.includes('cooling')
  ) {
    return ARTICLE_IMAGES.homeEnergy;
  }

  if (
    text.includes('smartagriculture') ||
    text.includes('smarteragriculture') ||
    text.includes('agriculture') ||
    text.includes('farming') ||
    text.includes('tractor')
  ) {
    return ARTICLE_IMAGES.agriculture;
  }

  if (
    text.includes('cycling') ||
    text.includes('bicycle')
  ) {
    return ARTICLE_IMAGES.cycling;
  }

  if (
    text.includes('transport') ||
    text.includes('mobility') ||
    text.includes('car') ||
    text.includes('bus') ||
    text.includes('flight')
  ) {
    return ARTICLE_IMAGES.transportation;
  }

  if (
    text.includes('electricity') ||
    text.includes('energy') ||
    text.includes('power') ||
    text.includes('solar') ||
    text.includes('renewable')
  ) {
    return ARTICLE_IMAGES.electricity;
  }

  if (
    text.includes('waste') ||
    text.includes('recycling') ||
    text.includes('recycle') ||
    text.includes('compost')
  ) {
    return ARTICLE_IMAGES.waste;
  }

  if (
    text.includes('food') ||
    text.includes('meal') ||
    text.includes('diet')
  ) {
    return ARTICLE_IMAGES.food;
  }

  if (
    text.includes('shopping') ||
    text.includes('consumer') ||
    text.includes('product')
  ) {
    return ARTICLE_IMAGES.shopping;
  }

  if (
    text.includes('water') ||
    text.includes('conservation')
  ) {
    return ARTICLE_IMAGES.water;
  }

  if (
    text.includes('building') ||
    text.includes('heating') ||
    text.includes('lighting')
  ) {
    return ARTICLE_IMAGES.buildings;
  }


  /*
   * Category fallback.
   */
  const categoryImage =
    getCategoryImage({
      categoryName:
        article?.category || '',
      categoryCode:
        article?.category || '',
    });

  if (categoryImage) {
    return categoryImage;
  }

  return ARTICLE_IMAGES.default;
};


export default CATEGORY_IMAGES;