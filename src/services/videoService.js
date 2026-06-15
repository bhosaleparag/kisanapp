import { db, isMock } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { STRINGS } from '../constants/strings';

// Static subject mapping helper to populate category titles automatically
const SUBJECT_LABELS = {
  semen_info: STRINGS.videos.semenInfo,
  wws_semen: STRINGS.videos.wwsSemen,
  abs_semen: STRINGS.videos.absSemen,
  denmark_semen: STRINGS.videos.denmarkSemen,
};

// Initial local fallback/mock videos array
let mockVideos = [
  {
    id: '1',
    title: 'कृत्रिम रेतन आणि उत्तम सीमेन निवड कशी करावी?',
    category: 'semen_info',
    categoryLabel: STRINGS.videos.semenInfo,
    videoUrl: 'https://www.youtube.com/watch?v=semen1',
    thumbnailUri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600',
    duration: '०६:४०',
    author: 'डॉ. हरीश माने',
    subject: 'semen_info',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'गाई-म्हशींमध्ये कृत्रिम रेतन करताना घ्यावयाची काळजी, योग्य वेळ आणि सर्वात महत्त्वाचे म्हणजे दर्जेदार सीमेन निवड कशी करावी, याचे संपूर्ण मार्गदर्शन.',
  },
  {
    id: '2',
    title: 'WWS सीमेन द्वारे कालवडींचे जन्मोत्तर व्यवस्थापन व पैदावर सुधार',
    category: 'wws_semen',
    categoryLabel: STRINGS.videos.wwsSemen,
    videoUrl: 'https://www.youtube.com/watch?v=semen2',
    thumbnailUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600',
    duration: '०७:५०',
    author: 'कृषी तज्ञ कदम',
    subject: 'wws_semen',
    company: 'सह्याद्री फार्म',
    description: 'World Wide Sires (WWS) सीमेन वापरून जन्मलेल्या कालवडींची वाढ कशी झपाट्याने होते आणि वंशावळ सुधारण्यात WWS तंत्रज्ञानाची भूमिका यावर विशेष चर्चा.',
  },
  {
    id: '3',
    title: 'ABS सीमेन तंत्रज्ञान - दुधाळ जनावरांची पैदावर वाढवण्याचा हमखास मार्ग',
    category: 'abs_semen',
    categoryLabel: STRINGS.videos.absSemen,
    videoUrl: 'https://www.youtube.com/watch?v=semen3',
    thumbnailUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600',
    duration: '०८:२०',
    author: 'डॉ. हरीश माने',
    subject: 'abs_semen',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'ABS सीमेन वापरण्याचे मुख्य फायदे, दुधातील फॅट आणि प्रमाण वाढवण्यासाठी कोणती काळजी घ्यावी, आणि कृत्रिम रेतन करण्याचे अचूक तंत्रज्ञान.',
  },
  {
    id: '4',
    title: 'डेन्मार्क सीमेनचे उपयोग आणि उच्च दर्जाची दुग्ध शेती',
    category: 'denmark_semen',
    categoryLabel: STRINGS.videos.denmarkSemen,
    videoUrl: 'https://www.youtube.com/watch?v=semen4',
    thumbnailUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600',
    duration: '१०:१५',
    author: 'कृषी तज्ञ कदम',
    subject: 'denmark_semen',
    company: 'सह्याद्री फार्म',
    description: 'डेन्मार्कच्या जगप्रसिद्ध आणि उच्च जनुक क्षमता असलेल्या सीमेनचे महत्त्व, महाराष्ट्रातील गोठ्यांमध्ये त्याचे योग्य नियोजन आणि होणारे नफे.',
  },
];

// Regex to extract YouTube ID for auto-generating standard static thumbnails
const getYoutubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Fetch all video metadata documents from Firestore.
 * Falls back to local list on failure or in Mock configuration.
 */
export const getVideos = async () => {
  if (isMock) {
    console.log('[VideoService] Mock Firebase active: returning in-memory database');
    return mockVideos;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'videos'));
    const videosList = [];

    querySnapshot.forEach((doc) => {
      videosList.push({ id: doc.id, ...doc.data() });
    });

    // If Firestore collection is brand new and empty, return mock data to prevent empty pages
    return videosList.length > 0 ? videosList : mockVideos;
  } catch (error) {
    console.error('[VideoService] Error fetching videos:', error);
    return mockVideos;
  }
};

/**
 * Add a new video record to Firestore.
 * Automatically resolves category label maps and pulls default YouTube thumbnails if absent.
 */
export const addVideo = async (videoData) => {
  const resolvedCategory = videoData.subject;
  const resolvedCategoryLabel = SUBJECT_LABELS[videoData.subject] || STRINGS.videos.selectDefault;

  // Parse Video ID and inject a static YouTube HQ thumbnail if thumbnailUri is missing
  let thumbnail = videoData.thumbnailUri || '';
  if (!thumbnail) {
    const youtubeId = getYoutubeVideoId(videoData.videoUrl);
    if (youtubeId) {
      thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    } else {
      thumbnail = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600'; // Default backup image
    }
  }

  const completedVideo = {
    ...videoData,
    category: resolvedCategory,
    categoryLabel: resolvedCategoryLabel,
    thumbnailUri: thumbnail,
    createdAt: new Date().toISOString(),
  };

  if (isMock) {
    console.log('[VideoService] Mock Firebase: prepending to local storage list');
    const mockRecord = {
      id: Date.now().toString(),
      ...completedVideo,
    };
    mockVideos = [mockRecord, ...mockVideos];
    return mockRecord;
  }

  try {
    const docRef = await addDoc(collection(db, 'videos'), {
      ...completedVideo,
      serverCreatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...completedVideo };
  } catch (error) {
    console.error('[VideoService] Error in addVideo:', error);
    throw error;
  }
};
