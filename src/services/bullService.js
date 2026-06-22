import { Platform } from 'react-native';
import { ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp } from '@react-native-firebase/firestore';
import { db, storage, isMock } from './firebase';

// Initial pre-seeded mock bull records array
let mockBulls = [
  {
    bullId: 'bull_29ho18817',
    brandId: 'brand_abs',
    brandName: 'ABS Semen',
    bullName: 'ABS Jeronimo',
    naabCode: '29HO18817',
    registrationNumber: 'HO840003131003289',
    tpi: '2750',
    breed: 'HF',
    photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=300',
    photoUrls: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=300'],
    pedigree: {
      sire: 'De-Su 13050 Spectre',
      damSire: 'Mr Mogul Delta 1427',
      mgs: 'Val-Bisson Doorman',
      mgd: 'De-Su Delta 1427-ET',
      mggs: 'Mountfield SSI Dcy Mogul'
    },
    cdcbChart: {
      evaluationDate: 'June 2026',
      production: {
        milkLbs: 1250,
        fatLbs: 72,
        fatPercent: 0.08,
        proteinLbs: 48,
        proteinPercent: 0.03,
        reliability: 98
      },
      health: {
        productiveLife: 4.8,
        daughterPregnancyRate: 0.2,
        heiferConceptionRate: 1.5,
        cowConceptionRate: 0.8,
        betaCasein: 'A2A2',
        somaticCellScore: 2.70,
        sireCalvingEase: 1.9,
        daughterCalvingEase: 2.1,
        sireStillbirth: 5.5,
        daughterStillbirth: 6.2
      },
      conformation: {
        ptat: 1.35,
        udderComposite: 1.62,
        feetLegsComposite: 0.85,
        bodyWeightComposite: 0.45
      }
    },
    createdByUid: 'system',
    createdAt: new Date().toISOString()
  },
  {
    bullId: 'bull_29ho19100',
    brandId: 'brand_abs',
    brandName: 'ABS Semen',
    bullName: 'ABS Outback',
    naabCode: '29HO19100',
    registrationNumber: 'HO840003141001122',
    tpi: '2820',
    breed: 'HF',
    photoUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=300',
    photoUrls: ['https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=300'],
    pedigree: {
      sire: 'Outback Dad',
      damSire: 'Outback Mom Dad',
      mgs: 'Mav Sire',
      mgd: 'Outback Grandma',
      mggs: 'Mav Grand Sire'
    },
    cdcbChart: {
      evaluationDate: 'June 2026',
      production: {
        milkLbs: 1100,
        fatLbs: 65,
        fatPercent: 0.06,
        proteinLbs: 42,
        proteinPercent: 0.02,
        reliability: 95
      },
      health: {
        productiveLife: 4.2,
        daughterPregnancyRate: 0.5,
        heiferConceptionRate: 2.0,
        cowConceptionRate: 1.2,
        betaCasein: 'A1A2',
        somaticCellScore: 2.80,
        sireCalvingEase: 2.1,
        daughterCalvingEase: 1.9,
        sireStillbirth: 5.8,
        daughterStillbirth: 6.0
      },
      conformation: {
        ptat: 1.20,
        udderComposite: 1.45,
        feetLegsComposite: 0.70,
        bodyWeightComposite: 0.35
      }
    },
    createdByUid: 'system',
    createdAt: new Date().toISOString()
  },
  {
    bullId: 'bull_29ho17944',
    brandId: 'brand_abs',
    brandName: 'ABS Semen',
    bullName: 'ABS Meteor',
    naabCode: '29HO17944',
    registrationNumber: 'HO840003121008899',
    tpi: '2690',
    breed: 'Jersey',
    photoUrl: 'https://images.unsplash.com/photo-1484557985045-edd9d294d5d4?q=80&w=300',
    photoUrls: ['https://images.unsplash.com/photo-1484557985045-edd9d294d5d4?q=80&w=300'],
    pedigree: {
      sire: 'Meteor Dad',
      damSire: 'Meteor Mom Dad',
      mgs: 'Oman Sire',
      mgd: 'Meteor Grandma',
      mggs: 'Oman Grand Sire'
    },
    cdcbChart: {
      evaluationDate: 'June 2026',
      production: {
        milkLbs: 850,
        fatLbs: 58,
        fatPercent: 0.12,
        proteinLbs: 35,
        proteinPercent: 0.05,
        reliability: 93
      },
      health: {
        productiveLife: 5.0,
        daughterPregnancyRate: 1.0,
        heiferConceptionRate: 1.8,
        cowConceptionRate: 1.0,
        betaCasein: 'A2A2',
        somaticCellScore: 2.65,
        sireCalvingEase: 1.8,
        daughterCalvingEase: 2.0,
        sireStillbirth: 5.2,
        daughterStillbirth: 5.9
      },
      conformation: {
        ptat: 1.10,
        udderComposite: 1.30,
        feetLegsComposite: 0.60,
        bodyWeightComposite: 0.20
      }
    },
    createdByUid: 'system',
    createdAt: new Date().toISOString()
  }
];

/**
 * Fetch all bull records from Firestore where brandId matches.
 * Falls back to mock array when in Mock mode or query fails.
 */
export const getBullsByBrand = async (brandId) => {
  if (isMock) {
    console.log(`[BullService] Mock mode: filtering local list for ${brandId}`);
    return mockBulls.filter((b) => b.brandId === brandId);
  }

  try {
    const q = query(collection(db, 'bull_records'), where('brandId', '==', brandId));
    const querySnapshot = await getDocs(q);
    const bullsList = [];

    querySnapshot.forEach((doc) => {
      bullsList.push({ id: doc.id, ...doc.data() });
    });

    // Fall back to pre-seeded mock list if empty to show values immediately
    return bullsList.length > 0 ? bullsList : mockBulls.filter((b) => b.brandId === brandId);
  } catch (error) {
    console.error(`[BullService] Error fetching bulls for brand ${brandId}:`, error);
    return mockBulls.filter((b) => b.brandId === brandId);
  }
};

/**
 * Upload single bull image to Firebase Storage
 */
export const uploadBullImage = async (bullId, index, localUri) => {
  if (!localUri) return '';
  if (isMock) {
    console.log(`[BullService] Mock Firebase: Using local image URI for bull image ${index}`);
    return localUri;
  }
  try {
    const fileUri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;
    const storageRef = ref(storage, `bulls/${bullId}_${index}.jpg`);
    await putFile(storageRef, fileUri);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error(`[BullService] Storage upload failed for ${localUri}:`, error);
    return localUri;
  }
};

/**
 * Add a new bull record document under /bull_records/{bullId}
 */
export const addBullRecord = async (bullData, userId) => {
  const normalizedCode = bullData.naabCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const bullId = `bull_${normalizedCode}`;

  // Upload select images to Firebase Storage
  const photoUrls = [];
  if (bullData.localImageUris && bullData.localImageUris.length > 0) {
    for (let i = 0; i < bullData.localImageUris.length; i++) {
      const url = await uploadBullImage(bullId, i, bullData.localImageUris[i]);
      if (url) {
        photoUrls.push(url);
      }
    }
  }

  const completedBull = {
    bullId,
    brandId: bullData.brandId,
    brandName: bullData.brandName,
    bullName: bullData.bullName,
    naabCode: bullData.naabCode,
    registrationNumber: bullData.registrationNumber || '',
    tpi: bullData.tpi || '',
    breed: bullData.breed,
    photoUrl: photoUrls.length > 0 ? photoUrls[0] : (bullData.photoUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=300'),
    photoUrls: photoUrls.length > 0 ? photoUrls : (bullData.photoUrl ? [bullData.photoUrl] : ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=300']),
    pedigree: {
      sire: bullData.sire || '',
      damSire: bullData.damSire || '',
      mgs: bullData.mgs || '',
      mgd: bullData.mgd || '',
      mggs: bullData.mggs || ''
    },
    cdcbChart: {
      evaluationDate: bullData.evaluationDate || 'June 2026',
      production: {
        milkLbs: parseFloat(bullData.milkLbs) || 0,
        fatLbs: parseFloat(bullData.fatLbs) || 0,
        fatPercent: parseFloat(bullData.fatPercent) || 0,
        proteinLbs: parseFloat(bullData.proteinLbs) || 0,
        proteinPercent: parseFloat(bullData.proteinPercent) || 0,
        reliability: parseInt(bullData.reliability) || 0
      },
      health: {
        productiveLife: parseFloat(bullData.productiveLife) || 0,
        daughterPregnancyRate: parseFloat(bullData.daughterPregnancyRate) || 0,
        heiferConceptionRate: parseFloat(bullData.heiferConceptionRate) || 0,
        cowConceptionRate: parseFloat(bullData.cowConceptionRate) || 0,
        betaCasein: bullData.betaCasein || 'A2A2',
        somaticCellScore: parseFloat(bullData.somaticCellScore) || 0,
        sireCalvingEase: parseFloat(bullData.sireCalvingEase) || 0,
        daughterCalvingEase: parseFloat(bullData.daughterCalvingEase) || 0,
        sireStillbirth: parseFloat(bullData.sireStillbirth) || 0,
        daughterStillbirth: parseFloat(bullData.daughterStillbirth) || 0
      },
      conformation: {
        ptat: parseFloat(bullData.ptat) || 0,
        udderComposite: parseFloat(bullData.udderComposite) || 0,
        feetLegsComposite: parseFloat(bullData.feetLegsComposite) || 0,
        bodyWeightComposite: parseFloat(bullData.bodyWeightComposite) || 0
      }
    },
    createdByUid: userId || 'anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isMock) {
    console.log('[BullService] Mock mode: prepending bull record');
    mockBulls = [completedBull, ...mockBulls];
    return completedBull;
  }

  try {
    const docRef = doc(db, 'bull_records', bullId);
    await setDoc(docRef, {
      ...completedBull,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });
    return completedBull;
  } catch (error) {
    console.error('[BullService] Error in addBullRecord:', error);
    throw error;
  }
};
