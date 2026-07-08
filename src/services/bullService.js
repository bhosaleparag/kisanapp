import { Platform } from 'react-native';
import { ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';
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
        combinedFatProtein: 120,
        reliability: 98
      },
      health: {
        productiveLife: 4.8,
        daughterPregnancyRate: 0.2,
        sireConceptionRate: 1.5,
        heiferConceptionRate: 1.5,
        cowConceptionRate: 0.8,
        betaCasein: 'A2A2',
        transitionRight: 3,
        somaticCellScore: 2.70,
        sireCalvingEase: 1.9,
        daughterCalvingEase: 2.1,
        sireStillbirth: 5.5,
        daughterStillbirth: 6.2,
        mast: 3.0,
        metr: 1.8,
        keto: 2.1,
        repl: 0.8,
        dsab: 1.2,
        mfev: 0.5
      },
      conformation: {
        ptat: 1.35,
        udderComposite: 1.62,
        feetLegsComposite: 0.85,
        bodyWeightComposite: 0.45,
        stature: 1.20,
        strength: 0.80,
        bodyDepth: 0.90,
        dairyForm: 1.10,
        rumpAngle: -0.40,
        thurlWidth: 0.50,
        rearLegsSideView: -0.20,
        rearLegsRearView: 0.90,
        footAngle: 0.60,
        feetLegsScore: 0.85,
        foreUdderAttachment: 1.70,
        rearUdderHeight: 1.90,
        rearUdderWidth: 1.80,
        udderCleft: 1.20,
        udderDepth: 1.50,
        frontTeatPlacement: 1.10,
        rearTeatPlacement: 0.90,
        teatLength: -0.30
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
        combinedFatProtein: 107,
        reliability: 95
      },
      health: {
        productiveLife: 4.2,
        daughterPregnancyRate: 0.5,
        sireConceptionRate: 2.0,
        heiferConceptionRate: 2.0,
        cowConceptionRate: 1.2,
        betaCasein: 'A1A2',
        transitionRight: 4,
        somaticCellScore: 2.80,
        sireCalvingEase: 2.1,
        daughterCalvingEase: 1.9,
        sireStillbirth: 5.8,
        daughterStillbirth: 6.0,
        mast: 2.5,
        metr: 1.2,
        keto: 1.5,
        repl: 0.5,
        dsab: 0.8,
        mfev: 0.2
      },
      conformation: {
        ptat: 1.20,
        udderComposite: 1.45,
        feetLegsComposite: 0.70,
        bodyWeightComposite: 0.35,
        stature: 1.00,
        strength: 0.70,
        bodyDepth: 0.80,
        dairyForm: 0.90,
        rumpAngle: -0.20,
        thurlWidth: 0.40,
        rearLegsSideView: -0.10,
        rearLegsRearView: 0.75,
        footAngle: 0.50,
        feetLegsScore: 0.70,
        foreUdderAttachment: 1.50,
        rearUdderHeight: 1.70,
        rearUdderWidth: 1.60,
        udderCleft: 1.00,
        udderDepth: 1.30,
        frontTeatPlacement: 0.95,
        rearTeatPlacement: 0.80,
        teatLength: -0.15
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
        combinedFatProtein: 93,
        reliability: 93
      },
      health: {
        productiveLife: 5.0,
        daughterPregnancyRate: 1.0,
        sireConceptionRate: 1.0,
        heiferConceptionRate: 1.8,
        cowConceptionRate: 1.0,
        betaCasein: 'A2A2',
        transitionRight: 5,
        somaticCellScore: 2.65,
        sireCalvingEase: 1.8,
        daughterCalvingEase: 2.0,
        sireStillbirth: 5.2,
        daughterStillbirth: 5.9,
        mast: 1.8,
        metr: 0.9,
        keto: 1.1,
        repl: 0.3,
        dsab: 0.5,
        mfev: 0.1
      },
      conformation: {
        ptat: 1.10,
        udderComposite: 1.30,
        feetLegsComposite: 0.60,
        bodyWeightComposite: 0.20,
        stature: 0.80,
        strength: 0.50,
        bodyDepth: 0.60,
        dairyForm: 0.70,
        rumpAngle: -0.10,
        thurlWidth: 0.30,
        rearLegsSideView: 0.00,
        rearLegsRearView: 0.60,
        footAngle: 0.40,
        feetLegsScore: 0.60,
        foreUdderAttachment: 1.30,
        rearUdderHeight: 1.50,
        rearUdderWidth: 1.40,
        udderCleft: 0.80,
        udderDepth: 1.10,
        frontTeatPlacement: 0.80,
        rearTeatPlacement: 0.70,
        teatLength: -0.05
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
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) return localUri;
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
        combinedFatProtein: parseFloat(bullData.combinedFatProtein) || 0,
        reliability: parseInt(bullData.reliability) || 0
      },
      health: {
        productiveLife: parseFloat(bullData.productiveLife) || 0,
        daughterPregnancyRate: parseFloat(bullData.daughterPregnancyRate) || 0,
        sireConceptionRate: parseFloat(bullData.sireConceptionRate) || 0,
        heiferConceptionRate: parseFloat(bullData.heiferConceptionRate) || 0,
        cowConceptionRate: parseFloat(bullData.cowConceptionRate) || 0,
        betaCasein: bullData.betaCasein || 'A2A2',
        transitionRight: parseInt(bullData.transitionRight) || 0,
        somaticCellScore: parseFloat(bullData.somaticCellScore) || 0,
        sireCalvingEase: parseFloat(bullData.sireCalvingEase) || 0,
        daughterCalvingEase: parseFloat(bullData.daughterCalvingEase) || 0,
        sireStillbirth: parseFloat(bullData.sireStillbirth) || 0,
        daughterStillbirth: parseFloat(bullData.daughterStillbirth) || 0,
        mast: parseFloat(bullData.mast) || 0,
        metr: parseFloat(bullData.metr) || 0,
        keto: parseFloat(bullData.keto) || 0,
        repl: parseFloat(bullData.repl) || 0,
        dsab: parseFloat(bullData.dsab) || 0,
        mfev: parseFloat(bullData.mfev) || 0
      },
      conformation: {
        ptat: parseFloat(bullData.ptat) || 0,
        udderComposite: parseFloat(bullData.udderComposite) || 0,
        feetLegsComposite: parseFloat(bullData.feetLegsComposite) || 0,
        bodyWeightComposite: parseFloat(bullData.bodyWeightComposite) || 0,
        stature: parseFloat(bullData.stature) || 0,
        strength: parseFloat(bullData.strength) || 0,
        bodyDepth: parseFloat(bullData.bodyDepth) || 0,
        dairyForm: parseFloat(bullData.dairyForm) || 0,
        rumpAngle: parseFloat(bullData.rumpAngle) || 0,
        thurlWidth: parseFloat(bullData.thurlWidth) || 0,
        rearLegsSideView: parseFloat(bullData.rearLegsSideView) || 0,
        rearLegsRearView: parseFloat(bullData.rearLegsRearView) || 0,
        footAngle: parseFloat(bullData.footAngle) || 0,
        feetLegsScore: parseFloat(bullData.feetLegsScore) || 0,
        foreUdderAttachment: parseFloat(bullData.foreUdderAttachment) || 0,
        rearUdderHeight: parseFloat(bullData.rearUdderHeight) || 0,
        rearUdderWidth: parseFloat(bullData.rearUdderWidth) || 0,
        udderCleft: parseFloat(bullData.udderCleft) || 0,
        udderDepth: parseFloat(bullData.udderDepth) || 0,
        frontTeatPlacement: parseFloat(bullData.frontTeatPlacement) || 0,
        rearTeatPlacement: parseFloat(bullData.rearTeatPlacement) || 0,
        teatLength: parseFloat(bullData.teatLength) || 0
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

/**
 * Update an existing bull record document under /bull_records/{bullId}
 */
export const updateBullRecord = async (bullId, bullData, userId) => {
  // Upload select images to Firebase Storage (handling mixed local/remote URIs)
  const photoUrls = [];
  if (bullData.localImageUris && bullData.localImageUris.length > 0) {
    for (let i = 0; i < bullData.localImageUris.length; i++) {
      const uri = bullData.localImageUris[i];
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        photoUrls.push(uri);
      } else {
        const url = await uploadBullImage(bullId, i, uri);
        if (url) {
          photoUrls.push(url);
        }
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
        combinedFatProtein: parseFloat(bullData.combinedFatProtein) || 0,
        reliability: parseInt(bullData.reliability) || 0
      },
      health: {
        productiveLife: parseFloat(bullData.productiveLife) || 0,
        daughterPregnancyRate: parseFloat(bullData.daughterPregnancyRate) || 0,
        sireConceptionRate: parseFloat(bullData.sireConceptionRate) || 0,
        heiferConceptionRate: parseFloat(bullData.heiferConceptionRate) || 0,
        cowConceptionRate: parseFloat(bullData.cowConceptionRate) || 0,
        betaCasein: bullData.betaCasein || 'A2A2',
        transitionRight: parseInt(bullData.transitionRight) || 0,
        somaticCellScore: parseFloat(bullData.somaticCellScore) || 0,
        sireCalvingEase: parseFloat(bullData.sireCalvingEase) || 0,
        daughterCalvingEase: parseFloat(bullData.daughterCalvingEase) || 0,
        sireStillbirth: parseFloat(bullData.sireStillbirth) || 0,
        daughterStillbirth: parseFloat(bullData.daughterStillbirth) || 0,
        mast: parseFloat(bullData.mast) || 0,
        metr: parseFloat(bullData.metr) || 0,
        keto: parseFloat(bullData.keto) || 0,
        repl: parseFloat(bullData.repl) || 0,
        dsab: parseFloat(bullData.dsab) || 0,
        mfev: parseFloat(bullData.mfev) || 0
      },
      conformation: {
        ptat: parseFloat(bullData.ptat) || 0,
        udderComposite: parseFloat(bullData.udderComposite) || 0,
        feetLegsComposite: parseFloat(bullData.feetLegsComposite) || 0,
        bodyWeightComposite: parseFloat(bullData.bodyWeightComposite) || 0,
        stature: parseFloat(bullData.stature) || 0,
        strength: parseFloat(bullData.strength) || 0,
        bodyDepth: parseFloat(bullData.bodyDepth) || 0,
        dairyForm: parseFloat(bullData.dairyForm) || 0,
        rumpAngle: parseFloat(bullData.rumpAngle) || 0,
        thurlWidth: parseFloat(bullData.thurlWidth) || 0,
        rearLegsSideView: parseFloat(bullData.rearLegsSideView) || 0,
        rearLegsRearView: parseFloat(bullData.rearLegsRearView) || 0,
        footAngle: parseFloat(bullData.footAngle) || 0,
        feetLegsScore: parseFloat(bullData.feetLegsScore) || 0,
        foreUdderAttachment: parseFloat(bullData.foreUdderAttachment) || 0,
        rearUdderHeight: parseFloat(bullData.rearUdderHeight) || 0,
        rearUdderWidth: parseFloat(bullData.rearUdderWidth) || 0,
        udderCleft: parseFloat(bullData.udderCleft) || 0,
        udderDepth: parseFloat(bullData.udderDepth) || 0,
        frontTeatPlacement: parseFloat(bullData.frontTeatPlacement) || 0,
        rearTeatPlacement: parseFloat(bullData.rearTeatPlacement) || 0,
        teatLength: parseFloat(bullData.teatLength) || 0
      }
    },
    updatedAt: new Date().toISOString()
  };

  if (isMock) {
    console.log('[BullService] Mock mode: updating local bull record');
    const idx = mockBulls.findIndex((b) => b.bullId === bullId);
    if (idx !== -1) {
      mockBulls[idx] = {
        ...mockBulls[idx],
        ...completedBull,
        pedigree: { ...mockBulls[idx].pedigree, ...completedBull.pedigree },
        cdcbChart: {
          ...mockBulls[idx].cdcbChart,
          ...completedBull.cdcbChart,
          production: { ...mockBulls[idx].cdcbChart?.production, ...completedBull.cdcbChart.production },
          health: { ...mockBulls[idx].cdcbChart?.health, ...completedBull.cdcbChart.health },
          conformation: { ...mockBulls[idx].cdcbChart?.conformation, ...completedBull.cdcbChart.conformation }
        }
      };
      return mockBulls[idx];
    }
    throw new Error('Bull not found in mock database');
  }

  try {
    const docRef = doc(db, 'bull_records', bullId);
    await setDoc(docRef, {
      ...completedBull,
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true });
    return completedBull;
  } catch (error) {
    console.error('[BullService] Error in updateBullRecord:', error);
    throw error;
  }
};

/**
 * Bulk update Milk Lbs values for multiple bulls.
 * Handles both mock database updates and Firestore batch updates.
 * @param {Array} updates - Array of objects containing { bullId, milkLbs }
 */
export const bulkUpdateMilkLbs = async (updates) => {
  if (!updates || updates.length === 0) return true;

  if (isMock) {
    console.log('[BullService] Mock mode: performing bulk update of Milk Lbs');
    updates.forEach(({ bullId, milkLbs }) => {
      const idx = mockBulls.findIndex((b) => b.bullId === bullId);
      if (idx !== -1) {
        // Ensure cdcbChart.production exists before writing
        if (!mockBulls[idx].cdcbChart) {
          mockBulls[idx].cdcbChart = { production: {} };
        } else if (!mockBulls[idx].cdcbChart.production) {
          mockBulls[idx].cdcbChart.production = {};
        }

        mockBulls[idx].cdcbChart.production.milkLbs = parseFloat(milkLbs) || 0;
        mockBulls[idx].updatedAt = new Date().toISOString();
      }
    });
    return true;
  }

  try {
    const batch = writeBatch(db);
    updates.forEach(({ bullId, milkLbs }) => {
      const docRef = doc(db, 'bull_records', bullId);
      batch.update(docRef, {
        'cdcbChart.production.milkLbs': parseFloat(milkLbs) || 0,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return true;
  } catch (error) {
    console.error('[BullService] Error performing bulk update:', error);
    throw error;
  }
};

