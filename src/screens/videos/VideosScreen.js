import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { FAB, Portal, Modal, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { videoSchema } from '../../utils/schemas';
import { getVideos, addVideo } from '../../services/videoService';
import { useAppStore } from '../../store/useAppStore';
import VideosDashboard from './VideosDashboard';
import CategoryListScreen from './CategoryListScreen';
import VideoListScreen from './VideoListScreen';
import VideoPlayerPage from './VideoPlayerPage';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';

export default function VideosScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([{ page: 'dashboard', params: {} }]);
  const [modalVisible, setModalVisible] = useState(false);

  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const currentScreen = history[history.length - 1];

  // Load videos on mount
  const fetchVideosList = async () => {
    setLoading(true);
    const data = await getVideos();
    setVideos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideosList();
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      videoUrl: '',
      thumbnailUri: '',
      author: '',
      subject: '',
      company: '',
      description: '',
      duration: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await addVideo(data);
      setModalVisible(false);
      reset();
      // Reload list
      const updated = await getVideos();
      setVideos(updated);
      setLoading(false);
      Alert.alert(STRINGS.common.success, STRINGS.videos.saveSuccess);
    } catch (error) {
      setLoading(false);
      Alert.alert(STRINGS.common.errorTitle, STRINGS.videos.saveError);
    }
  };

  const navigateTo = (page, params = {}) => {
    setHistory((prev) => [...prev, { page, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const subjectOptions = [
    { value: 'breed_management', label: STRINGS.videos.breedManagement },
    { value: 'feed_management', label: STRINGS.videos.feedManagement },
    { value: 'manage_animal', label: STRINGS.videos.animalManagement },
    { value: 'organic', label: STRINGS.videos.organicFarming },
    { value: 'disease', label: STRINGS.videos.cropDisease },
    { value: 'technology', label: STRINGS.videos.modernTech },
  ];

  const renderScreen = () => {
    switch (currentScreen.page) {
      case 'dashboard':
        return (
          <VideosDashboard
            onSelectCategory={(categoryType) =>
              navigateTo('category_list', { type: categoryType })
            }
          />
        );
      case 'category_list':
        return (
          <CategoryListScreen
            type={currentScreen.params.type}
            videos={videos}
            onBack={goBack}
            onSelectItem={(item) =>
              navigateTo('video_list', {
                type: currentScreen.params.type,
                value: item.id,
                title: item.title,
              })
            }
          />
        );
      case 'video_list':
        return (
          <VideoListScreen
            filter={{
              type: currentScreen.params.type,
              value: currentScreen.params.value,
              title: currentScreen.params.title,
            }}
            videos={videos}
            onBack={goBack}
            onSelectVideo={(video) => navigateTo('player', { video })}
          />
        );
      case 'player':
        return (
          <VideoPlayerPage
            selectedVideo={currentScreen.params.video}
            onBack={goBack}
          />
        );
      default:
        return (
          <VideosDashboard
            onSelectCategory={(categoryType) =>
              navigateTo('category_list', { type: categoryType })
            }
          />
        );
    }
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const showFab = isAdmin && currentScreen.page !== 'player';

  return (
    <View style={styles.container}>
      {renderScreen()}

      {showFab && (
        <FAB
          icon="plus"
          label={STRINGS.videos.addVideo}
          color="#FFFFFF"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />
      )}

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            reset();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{STRINGS.videos.addVideo}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => {
                    setModalVisible(false);
                    reset();
                  }}
                />
              </View>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formTitleLabel}
                    placeholder={STRINGS.videos.formTitlePlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="videoUrl"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formVideoUrlLabel}
                    placeholder={STRINGS.videos.formVideoUrlPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.videoUrl}
                    errorMessage={errors.videoUrl?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="subject"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label={STRINGS.videos.formSubjectLabel}
                    placeholder={STRINGS.videos.formSubjectPlaceholder}
                    selectedValue={value}
                    onValueChange={onChange}
                    options={subjectOptions}
                    error={!!errors.subject}
                    errorMessage={errors.subject?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="author"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formAuthorLabel}
                    placeholder={STRINGS.videos.formAuthorPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.author}
                    errorMessage={errors.author?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="company"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formCompanyLabel}
                    placeholder={STRINGS.videos.formCompanyPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.company}
                    errorMessage={errors.company?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="duration"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formDurationLabel}
                    placeholder={STRINGS.videos.formDurationPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.duration}
                    errorMessage={errors.duration?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.videos.formDescriptionLabel}
                    placeholder={STRINGS.videos.formDescriptionPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.description}
                    errorMessage={errors.description?.message}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />

              <Button
                title={STRINGS.common.save}
                onPress={handleSubmit(onSubmit)}
                style={styles.saveButton}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.xl,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: SIZES.radiusLg,
    height: '85%',
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalScroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});
