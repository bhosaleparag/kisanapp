import { Platform } from 'react-native';
import { ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { collection, getDocs, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { db, storage, isMock } from './firebase';

/**
 * Service Layer for Fodder Buying-Selling Marketplace (चारा खरेदी-विक्री)
 * Encapsulates Firestore database logic & local mock storage fallback.
 */

let mockFodderListings = [
  {
    id: 'fodder-1',
    farmerName: 'सुभाष शिंगाडे',
    callingNumber: '9822123456',
    whatsAppNumber: '9822123456',
    district: 'अहमदनगर',
    taluka: 'संगमनेर',
    village: 'घुलेवाडी',
    category: 'green',
    subType: 'मका',
    area: '१ एकर',
    weight: '१० टन अंदाज',
    price: 18000,
    unit: 'प्रति एकर',
    remarks: 'उंची ८ फूट. कापणीसाठी पूर्ण तयार आहे. जागेवर कापून दिले जाईल.',
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fodder-2',
    farmerName: 'ज्ञानेश्वर कदम',
    callingNumber: '9423987654',
    whatsAppNumber: '9423987654',
    district: 'पुणे',
    taluka: 'शिरूर',
    village: 'तळेगाव',
    category: 'dry',
    subType: 'गहू भुसकट',
    area: '',
    weight: '५ टन',
    price: 6500,
    unit: 'प्रति टन',
    remarks: 'पावसाने भिजलेला नाही. उच्च दर्जाचा कोरडा पिवळा भुसा उपलब्ध आहे.',
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fodder-3',
    farmerName: 'रमेश चव्हाण',
    callingNumber: '9123456789',
    whatsAppNumber: '9123456789',
    district: 'सोलापूर',
    taluka: 'पंढरपूर',
    village: 'वाखरी',
    category: 'silage',
    subType: 'मका मुरघास',
    area: '',
    weight: '५० किलो बॅग',
    price: 320,
    unit: 'प्रति ५० किलो बॅग',
    packingType: '५० किलो बॅग (50 kg Bag)',
    remarks: 'स्वीट कॉर्न मका मुरघास. दाण्याचे प्रमाण उत्तम आहे. मोफत होम डिलिव्हरी उपलब्ध.',
    photos: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
    ],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Fetch all fodder listings from Firestore (or fallback mock array)
 */
export async function getFodderListings() {
  if (isMock) {
    return mockFodderListings;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'fodderListings'));
    const listings = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
    return listings.length > 0 ? listings : mockFodderListings;
  } catch (error) {
    console.error('Error fetching fodder listings from Firestore:', error);
    return mockFodderListings;
  }
}

/**
 * Upload photos array to Firebase Storage under 'fodder_listings/'
 */
export async function uploadFodderPhotos(listingId, photosArray = []) {
  if (!photosArray || photosArray.length === 0) return [];

  const uploadPromises = photosArray.map(async (uri, index) => {
    if (!uri) return null;
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

    if (isMock) {
      console.log(`[FodderService] Mock Firebase: Retaining photo URI at index ${index}`);
      return uri;
    }

    try {
      const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      const storageRef = ref(storage, `fodder_listings/${listingId}_photo_${index}_${Date.now()}.jpg`);
      await putFile(storageRef, fileUri);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error(`[FodderService] Storage upload failed for photo ${uri}:`, error);
      return uri;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean);
}

/**
 * Add a new Fodder Listing to Firestore (or prepend to mock array)
 */
export async function addFodderListing(listingData) {
  const listingId = 'fodder-' + Date.now();

  // Upload photos to Firebase Storage if local URIs provided
  let uploadedPhotos = [];
  if (listingData.photos && listingData.photos.length > 0) {
    uploadedPhotos = await uploadFodderPhotos(listingId, listingData.photos);
  }

  if (uploadedPhotos.length === 0) {
    uploadedPhotos = ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800'];
  }

  const newListing = {
    farmerName: listingData.farmerName,
    callingNumber: listingData.callingNumber,
    whatsAppNumber: listingData.whatsAppNumber,
    district: listingData.district,
    taluka: listingData.taluka,
    village: listingData.village,
    category: listingData.category,
    subType: listingData.subType,
    area: listingData.area || '',
    weight: listingData.weight || '',
    price: parseFloat(listingData.price),
    unit: listingData.unit,
    packingType: listingData.packingType || '',
    remarks: listingData.remarks || '',
    photos: uploadedPhotos,
  };

  if (isMock) {
    const mockItem = {
      id: listingId,
      ...newListing,
      createdAt: new Date().toISOString(),
    };
    mockFodderListings = [mockItem, ...mockFodderListings];
    return mockItem;
  }

  try {
    const docRef = await addDoc(collection(db, 'fodderListings'), {
      ...newListing,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...newListing };
  } catch (error) {
    console.error('Error saving fodder listing to Firestore:', error);
    throw error;
  }
}
