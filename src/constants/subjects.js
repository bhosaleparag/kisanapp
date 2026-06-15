import { COLORS } from './theme';
import { STRINGS } from './strings';

/**
 * Centrally managed subjects list for video categories.
 * Contains localized titles, descriptions, display icons, and color themes.
 */
export const getSubjectsList = () => [
  {
    id: 'semen_info',
    title: STRINGS.videos.semenInfo,
    description: STRINGS.videos.semenInfoDesc,
    icon: 'dna',
    color: COLORS.info,
  },
  {
    id: 'wws_semen',
    title: STRINGS.videos.wwsSemen,
    description: STRINGS.videos.wwsSemenDesc,
    icon: 'cow',
    color: COLORS.warning,
  },
  {
    id: 'abs_semen',
    title: STRINGS.videos.absSemen,
    description: STRINGS.videos.absSemenDesc,
    icon: 'medal',
    color: COLORS.primary,
  },
  {
    id: 'denmark_semen',
    title: STRINGS.videos.denmarkSemen,
    description: STRINGS.videos.denmarkSemenDesc,
    icon: 'earth',
    color: COLORS.secondary,
  },
];
