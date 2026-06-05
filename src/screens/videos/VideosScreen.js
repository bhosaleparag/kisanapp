import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import VideoSearchPage from './VideoSearchPage';
import VideoPlayerPage from './VideoPlayerPage';

const videos = [
  {
    id: '1',
    title: 'सेंद्रिय खत निर्मिती सविस्तर मार्गदर्शिका',
    category: 'organic',
    categoryLabel: STRINGS.videos.organicFarming,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600',
    duration: '०५:२०',
    author: 'डॉ. हरीश माने',
    subject: 'सेंद्रिय खत',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'या व्हिडिओमध्ये घरच्या घरी सेंद्रिय कंपोस्ट खत बनवण्याची अत्यंत सोपी आणि पारंपरिक कृती समजावून सांगितली आहे. रासायनिक खतांशिवाय शाश्वत व निरोगी शेती कशी करायची, याचे तज्ञांकडून कृषी मार्गदर्शन मिळवा.',
  },
  {
    id: '2',
    title: 'जीवामृत आणि मटका खत घरच्या घरी तयार करणे',
    category: 'organic',
    categoryLabel: STRINGS.videos.organicFarming,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUri: null,
    duration: '०८:१५',
    author: 'कृषी तज्ञ कदम',
    subject: 'जीवामृत',
    company: 'सह्याद्री फार्म',
    description: 'मटका खत आणि जीवामृत अगदी कमी खर्चात कसे तयार करायचे, योग्य घटक कोणती व किती प्रमाणात वापरायची आणि पिकांना दिल्याने पिकांची वाढ कशी दुप्पट होते, याचे सविस्तर प्रात्यक्षिक मार्गदर्शन.',
  },
  {
    id: '3',
    title: 'कपाशीवरील लाल बोंडअळीचे नैसर्गिक नियंत्रण',
    category: 'disease',
    categoryLabel: STRINGS.videos.cropDisease,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUri: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600',
    duration: '०६:४५',
    author: 'डॉ. हरीश माने',
    subject: 'रोग नियंत्रण',
    company: 'महाराष्ट्र कृषी संस्था',
    description: 'कपाशीच्या पिकावरील घातक गुलाबी व लाल बोंडअळीचा प्रादुर्भाव कसा ओळखावा आणि सेंद्रिय निमार्क फवारणीच्या साहाय्याने नैसर्गिक व सुरक्षितरीत्या त्याचे प्रभावी नियंत्रण कसे करावे, याबद्दल तज्ञांचा सल्ला.',
  },
  {
    id: '4',
    title: 'पीक औषध फवारणीसाठी अत्याधुनिक ड्रोन तंत्रज्ञान',
    category: 'technology',
    categoryLabel: STRINGS.videos.modernTech,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUri: null,
    duration: '०७:१०',
    author: 'कृषी तज्ञ कदम',
    subject: 'ड्रोन तंत्रज्ञान',
    company: 'सह्याद्री फार्म',
    description: 'आधुनिक शेतीमध्ये औषध व कीटकनाशक फवारणीसाठी स्वयंचलित ड्रोन कसे चालवायचे, त्यामुळे वेळ आणि फवारणी खर्चाची बचत कशी होते, त्याचे सविस्तर फायदे व ड्रोन चालवण्याचे तांत्रिक नियम पहा.',
  },
];

export default function VideosScreen() {
  const [activePage, setActivePage] = useState('search');
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setActivePage('player');
  };

  return (
    <View style={styles.container}>
      {activePage === 'search' ? (
        <VideoSearchPage
          videos={videos}
          onSelectVideo={handleSelectVideo}
        />
      ) : (
        <VideoPlayerPage
          selectedVideo={selectedVideo}
          onBack={() => setActivePage('search')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
