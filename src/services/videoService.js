import { db, isMock } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { STRINGS } from '../constants/strings';

// Static subject mapping helper to populate category titles automatically
const SUBJECT_LABELS = {
  breed_management: STRINGS.videos.breedManagement,
  feed_management: STRINGS.videos.feedManagement,
  manage_animal: STRINGS.videos.animalManagement,
  organic: STRINGS.videos.organicFarming,
  disease: STRINGS.videos.cropDisease,
  technology: STRINGS.videos.modernTech,
};

// Initial local fallback/mock videos array
let mockVideos = [
  {
    id: '1',
    title: 'सेंद्रिय खत निर्मिती सविस्तर मार्गदर्शिका',
    category: 'organic',
    categoryLabel: STRINGS.videos.organicFarming,
    videoUrl: 'https://www.youtube.com/watch?v=movie1',
    thumbnailUri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600',
    duration: '०५:२०',
    author: 'डॉ. हरीश माने',
    subject: 'organic',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'या व्हिडिओमध्ये घरच्या घरी सेंद्रिय कंपोस्ट खत बनवण्याची अत्यंत सोपी आणि पारंपरिक कृती समजावून सांगितली आहे. रासायनिक खतांशिवाय शाश्वत व निरोगी शेती कशी करायची, याचे तज्ञांकडून कृषी मार्गदर्शन मिळवा.',
  },
  {
    id: '2',
    title: 'जीवामृत आणि मटका खत घरच्या घरी तयार करणे',
    category: 'organic',
    categoryLabel: STRINGS.videos.organicFarming,
    videoUrl: 'https://www.youtube.com/watch?v=movie2',
    thumbnailUri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600',
    duration: '०८:१५',
    author: 'कृषी तज्ञ कदम',
    subject: 'organic',
    company: 'सह्याद्री फार्म',
    description: 'मटका खत आणि जीवामृत अगदी कमी खर्चात कसे तयार करायचे, योग्य घटक कोणती व किती प्रमाणात वापरायची आणि पिकांना दिल्याने पिकांची वाढ कशी दुप्पट होते, याचे सविस्तर प्रात्यक्षिक मार्गदर्शन.',
  },
  {
    id: '3',
    title: 'कपाशीवरील लाल बोंडअळीचे नैसर्गिक नियंत्रण',
    category: 'disease',
    categoryLabel: STRINGS.videos.cropDisease,
    videoUrl: 'https://www.youtube.com/watch?v=movie3',
    thumbnailUri: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600',
    duration: '०६:४५',
    author: 'डॉ. हरीश माने',
    subject: 'disease',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'कपाशीच्या पिकावरील घातक गुलाबी व लाल बोंडअळीचा प्रादुर्भाव कसा ओळखावा आणि सेंद्रिय निमार्क फवारणीच्या साहाय्याने नैसर्गिक व सुरक्षितरीत्या त्याचे प्रभावी नियंत्रण कसे करावे, याबद्दल तज्ञांचा सल्ला.',
  },
  {
    id: '4',
    title: 'पीक औषध फवारणीसाठी अत्याधुनिक ड्रोन तंत्रज्ञान',
    category: 'technology',
    categoryLabel: STRINGS.videos.modernTech,
    videoUrl: 'https://www.youtube.com/watch?v=movie4',
    thumbnailUri: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600',
    duration: '०७:१०',
    author: 'कृषी तज्ञ कदम',
    subject: 'technology',
    company: 'सह्याद्री फार्म',
    description: 'आधुनिक शेतीमध्ये औषध व कीटकनाशक फवारणीसाठी स्वयंचलित ड्रोन कसे चालवायचे, त्यामुळे वेळ आणि फवारणी खर्चाची बचत कशी होते, त्याचे सविस्तर फायदे व ड्रोन चालवण्याचे तांत्रिक नियम पहा.',
  },
  {
    id: '5',
    title: 'अधिक दुधासाठी गीर गाय पैदावर आणि पैदावर तंत्रज्ञान',
    category: 'breed_management',
    categoryLabel: STRINGS.videos.breedManagement,
    videoUrl: 'https://www.youtube.com/watch?v=sOXtfESMROw',
    thumbnailUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600',
    duration: '०६:२०',
    author: 'डॉ. हरीश माने',
    subject: 'breed_management',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'दूध उत्पादन वाढवण्यासाठी उत्कृष्ट जातीच्या गीर गायींची निवड कशी करावी आणि शास्त्रोक्त पद्धतीने योग्य संकरित पैदावर तंत्रज्ञान कसे वापरावे, याविषयी सविस्तर माहिती.',
  },
  {
    id: '6',
    title: 'एचएफ आणि जर्सी गायींचे संवर्धन व वंशावळ सुधारणा',
    category: 'breed_management',
    categoryLabel: STRINGS.videos.breedManagement,
    videoUrl: 'https://www.youtube.com/watch?v=movie6',
    thumbnailUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600',
    duration: '०७:४५',
    author: 'कृषी तज्ञ कदम',
    subject: 'breed_management',
    company: 'सह्याद्री फार्म',
    description: 'होलस्टीन फ्रीजियन (HF) आणि जर्सी गायींचे उष्ण हवामानातील संगोपन कसे करावे, त्यांची वंशावळ नोंद कशी ठेवावी आणि वंशावळ सुधारणेचे कृत्रिम रेतन तंत्रज्ञान.',
  },
  {
    id: '7',
    title: 'हायड्रोपोनिक्स पद्धतीने कमी खर्चात हिरवा चारा कसा बनवायचा?',
    category: 'feed_management',
    categoryLabel: STRINGS.videos.feedManagement,
    videoUrl: 'https://www.youtube.com/watch?v=movie7',
    thumbnailUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=600',
    duration: '०६:१०',
    author: 'डॉ. हरीश माने',
    subject: 'feed_management',
    company: 'सह्याद्री फार्म',
    description: 'कमी पाण्यात आणि अवघ्या ८ ते १० दिवसांत मका व इतर धान्यांपासून अत्यंत सकस आणि दर्जेदार हिरवा चारा हायड्रोपोनिक्स पद्धतीने घरी कसा तयार करायचा, याचे सविस्तर प्रात्यक्षिक.',
  },
  {
    id: '8',
    title: 'दूध उत्पादन वाढीसाठी सायलेज (मुरघास) बनवण्याची सोपी पद्धत',
    category: 'feed_management',
    categoryLabel: STRINGS.videos.feedManagement,
    videoUrl: 'https://www.youtube.com/watch?v=movie8',
    thumbnailUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=600',
    duration: '०८:३०',
    author: 'कृषी तज्ञ कदम',
    subject: 'feed_management',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'उन्हाळ्यात जनावरांसाठी चारा टंचाईवर मात करण्यासाठी मका पिकापासून चांगल्या प्रतीचा मुरघास (सायलेज) बॅग किंवा खड्ड्यात कसा बनवावा, जेणेकरून दुधातील फॅट आणि प्रमाण टिकून राहील.',
  },
  {
    id: '9',
    title: 'आदर्श गोठा स्वच्छता व आधुनिक जनावरांचे व्यवस्थापन कसे करावे?',
    category: 'manage_animal',
    categoryLabel: STRINGS.videos.animalManagement,
    videoUrl: 'https://www.youtube.com/watch?v=movie9',
    thumbnailUri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600',
    duration: '०५:५०',
    author: 'डॉ. हरीश माने',
    subject: 'manage_animal',
    company: 'सह्याद्री फार्म',
    description: 'गोठ्यातील जनावरांचे आरोग्य निरोगी ठेवण्यासाठी पाणी, हवा आणि प्रकाशाचे योग्य नियोजन. गोठा स्वच्छ ठेवण्यासाठी मूत्र व शेण व्यवस्थापन आणि आधुनिक पद्धतींची माहिती.',
  },
  {
    id: '10',
    title: 'जनावरांमधील मस्टायटीस (दगडी रोग) प्रतिबंध व घरगुती उपचार',
    category: 'manage_animal',
    categoryLabel: STRINGS.videos.animalManagement,
    videoUrl: 'https://www.youtube.com/watch?v=movie10',
    thumbnailUri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600',
    duration: '०९:१५',
    author: 'कृषी तज्ञ कदम',
    subject: 'manage_animal',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'दुभत्या जनावरांमध्ये होणाऱ्या दगडी रोगाची (मस्टायटीस) लक्षणे कशी ओळखावीत, वेळेवर घरगुती व जैविक उपाय करून होणारे मोठे आर्थिक नुकसान कसे टाळावे.',
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
