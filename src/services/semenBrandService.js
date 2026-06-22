import { db, isMock } from './firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

// Initial local fallback/mock brands array
let mockBrands = [
  {
    brandId: 'brand_abs',
    brandName: 'ABS Semen',
    logoUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=200', // Gir cattle
    isActive: true
  },
  {
    brandId: 'brand_wws',
    brandName: 'WWS (Worldwide Sires)',
    logoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=200', // Holstein
    isActive: true
  },
  {
    brandId: 'brand_denmark',
    brandName: 'Denmark Semen (VikingGenetics)',
    logoUrl: 'https://images.unsplash.com/photo-1484557985045-edd9d294d5d4?q=80&w=200', // Red/Jersey
    isActive: true
  },
  {
    brandId: 'brand_stgenetics',
    brandName: 'STgenetics',
    logoUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=200', // Farm pasture
    isActive: true
  },
  {
    brandId: 'brand_stg_india',
    brandName: 'STG India',
    logoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bac5e8?q=80&w=200', // Cattle/Bull
    isActive: true
  }
];

/**
 * Fetch all semen brand documents from Firestore '/semen_brands'.
 * Falls back to local list on failure or in Mock configuration.
 */
export const getSemenBrands = async () => {
  if (isMock) {
    console.log('[SemenBrandService] Mock Firebase active: returning in-memory semen brands');
    return mockBrands.filter(b => b.isActive);
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'semen_brands'));
    const brandsList = [];

    querySnapshot.forEach((doc) => {
      brandsList.push({ id: doc.id, ...doc.data() });
    });

    // If Firestore collection is empty, return mock data to prevent empty page on initial boot
    return brandsList.length > 0 ? brandsList.filter(b => b.isActive) : mockBrands.filter(b => b.isActive);
  } catch (error) {
    console.error('[SemenBrandService] Error fetching semen brands:', error);
    return mockBrands.filter(b => b.isActive);
  }
};

/**
 * Add a new semen brand record to Firestore at path '/semen_brands/{brandId}'.
 * Automatically derives brandId from the name.
 */
export const addSemenBrand = async (brandData) => {
  // Normalize brandName to create a clean brandId key, e.g. "ABS Semen" -> "brand_abs_semen"
  const formattedName = brandData.brandName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/(^_|_$)/g, '');
  const brandId = `brand_${formattedName}`;

  const completedBrand = {
    brandId,
    brandName: brandData.brandName,
    logoUrl: brandData.logoUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=200', // Default cow silhouette fallback
    isActive: brandData.isActive !== undefined ? brandData.isActive : true,
    createdAt: new Date().toISOString()
  };

  if (isMock) {
    console.log('[SemenBrandService] Mock Firebase: prepending brand to local list');
    mockBrands = [completedBrand, ...mockBrands];
    return completedBrand;
  }

  try {
    const docRef = doc(db, 'semen_brands', brandId);
    await setDoc(docRef, {
      ...completedBrand,
      serverCreatedAt: serverTimestamp(),
    });
    return completedBrand;
  } catch (error) {
    console.error('[SemenBrandService] Error in addSemenBrand:', error);
    throw error;
  }
};
