import { COLORS } from './theme';
import { STRINGS } from './strings';

/**
 * Centrally managed subjects list for video categories.
 * Contains localized titles, descriptions, display icons, and color themes.
 */
export const getSubjectsList = () => [
  {
    id: 'breed_management',
    title: STRINGS.videos.breedManagement,
    description: STRINGS.videos.breedManagementDesc,
    icon: 'cow',
    color: COLORS.primary,
  },
  {
    id: 'feed_management',
    title: STRINGS.videos.feedManagement,
    description: STRINGS.videos.feedManagementDesc,
    icon: 'sprout',
    color: COLORS.success,
  },
  {
    id: 'manage_animal',
    title: STRINGS.videos.animalManagement,
    description: STRINGS.videos.animalManagementDesc,
    icon: 'home-heart',
    color: COLORS.secondary,
  },
  {
    id: 'organic',
    title: STRINGS.videos.organicFarming,
    description: STRINGS.videos.organicFarmingDesc,
    icon: 'leaf',
    color: COLORS.primary,
  },
  {
    id: 'disease',
    title: STRINGS.videos.cropDisease,
    description: STRINGS.videos.cropDiseaseDesc,
    icon: 'bug',
    color: COLORS.error,
  },
  {
    id: 'technology',
    title: STRINGS.videos.modernTech,
    description: STRINGS.videos.modernTechDesc,
    icon: 'drone',
    color: COLORS.info,
  },
];
