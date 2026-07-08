import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions, Share } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import Button from '../../components/Button';
import Card from '../../components/Card';
import BullFormModal from '../../components/BullFormModal';

const { width } = Dimensions.get('window');

// Helper to extract the short/common name from full pedigree names (e.g. STANTONS MAIN EVENT-ET -> MAINEVENT)
const cleanPedigreeName = (name) => {
  if (!name) return '';

  // Convert to uppercase and strip common trailing suffixes (e.g. -ET, ET, -ET-ET, etc.)
  let cleaned = name.toUpperCase()
    .replace(/-ET\b/g, '')
    .replace(/\bET\b/g, '')
    .trim();

  // Split by spaces, dashes, or slashes to get individual word tokens
  const words = cleaned.split(/[\s\-_/]+/);

  // List of known prefixes, breed suffixes, genetic codes, and labels to filter out
  const blacklist = new Set([
    'STANTONS', 'APINA', 'ROYLANE', 'SOCRA', 'DE-SU', 'VAL-BISSON', 'MOUNTFIELD',
    'SEAGULL-BAY', 'COYNE-FARMS', 'FLEVO', 'COMPASS-TRT', 'AMRC', 'AE', 'SSI', 'S-S-I',
    'MR', 'MRS', 'MS', 'COYNE', 'FARMS', 'BACON', 'PINE-TREE', 'SANDY-VALLEY', 'EDG',
    'UCD', 'MAPLE-DOWNS-I', 'LOOKOUT', 'PESCE', 'FUSTEAD', 'JELLY', 'COOKIECUTTER',
    'CLEAR-ECHO', 'BOMAZ', 'CO-OP', 'WESSWOOD', 'ENSENADA', 'T-SPRUCE', 'R-E-W',
    'LADYS-MANOR', 'RI-VAL-RE', 'MOGUL', 'SUPER', 'SUPERSIRE', 'ET', 'CRI', 'MGS', 'MGD',
    'MGGS', 'PGS', 'PGD', 'SIRE', 'DAM'
  ]);

  const filteredWords = words
    .map(w => w.trim())
    .filter(w => {
      if (!w) return false;
      // Filter out pure numbers or alphanumeric strings that contain numbers (e.g. J925, 13050)
      if (/\d/.test(w)) return false;
      // Filter out blacklisted prefixes
      if (blacklist.has(w)) return false;
      // Filter out small words that look like genetic/country codes unless it is the only word
      if (w.length <= 2 && words.length > 1) return false;
      return true;
    })
    .map(w => {
      // Strip 'ALTA' prefix from words starting with it (e.g. ALTAEMBASSY -> EMBASSY)
      if (w.startsWith('ALTA') && w.length > 4) {
        return w.substring(4);
      }
      return w;
    });

  // If we filtered everything, fallback to the original first word (excluding suffixes)
  if (filteredWords.length === 0) {
    const fallbackWords = words.filter(w => !/^-?ET\b/i.test(w) && w.length > 0);
    return fallbackWords[fallbackWords.length - 1] || name;
  }

  // Join the remaining words together with no spaces as shown in the requested example (MAINEVENT)
  return filteredWords.join('');
};

const renderStars = (rating) => {
  const stars = [];
  const activeColor = '#FF6B8B'; // Rose/Pink color matching the screenshot
  const inactiveColor = '#E0E0E0'; // Light grey/slate
  const numRating = parseInt(rating) || 0;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ fontSize: 20, color: i <= numRating ? activeColor : inactiveColor, marginRight: 2 }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

export default function CdcbDataSheetScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { bull } = route.params || {};
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBull, setCurrentBull] = useState(bull);
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const strings = STRINGS.bullInfo;

  // Helper to format numeric values with + or - signs
  const formatVal = (val, unit = '') => {
    if (val === undefined || val === null || val === '') return `0${unit}`;
    const num = parseFloat(val);
    if (isNaN(num)) return `${val}${unit}`;
    if (num > 0) return `+${num}${unit}`;
    return `${num}${unit}`;
  };

  if (!currentBull) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{STRINGS.common.noData}</Text>
        <Button title={STRINGS.common.back} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Get image array or fallback
  const images = currentBull.photoUrls && currentBull.photoUrls.length > 0 ? currentBull.photoUrls : [currentBull.photoUrl];

  // Helper to share CDCB datasheet
  const handleShare = async () => {
    try {
      const shareMsg = `*वळू माहिती आणि CDCB डेटा पत्रक*\n\nवळू: ${currentBull.naabCode} ${currentBull.bullName}\nनोंदणी क्रमांक: ${currentBull.registrationNumber}\nBreed: ${currentBull.breed}\nTPI: +${currentBull.tpi || 'N/A'}\n\n*पैदावर आणि वंशावळ सुधारण्यासाठी लिनीअर शेती ॲप वापरा!*`;
      await Share.share({
        message: shareMsg,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Safe destructuring of nested objects
  const pedigree = currentBull.pedigree || {};
  const cdcbChart = currentBull.cdcbChart || {};
  const production = cdcbChart.production || {};
  const health = cdcbChart.health || {};
  const conformation = cdcbChart.conformation || {};

  const statureTraits = [
    { key: 'stature', label: strings.statureLabel, val: conformation.stature || 0 },
    { key: 'strength', label: strings.strengthLabel, val: conformation.strength || 0 },
    { key: 'bodyDepth', label: strings.bodyDepthLabel, val: conformation.bodyDepth || 0 },
    { key: 'dairyForm', label: strings.dairyFormLabel, val: conformation.dairyForm || 0 },
    { key: 'rumpAngle', label: strings.rumpAngleLabel, val: conformation.rumpAngle || 0 },
    { key: 'thurlWidth', label: strings.thurlWidthLabel, val: conformation.thurlWidth || 0 }
  ];

  const feetLegsTraits = [
    { key: 'rearLegsSideView', label: strings.rearLegsSideViewLabel, val: conformation.rearLegsSideView || 0 },
    { key: 'rearLegsRearView', label: strings.rearLegsRearViewLabel, val: conformation.rearLegsRearView || 0 },
    { key: 'footAngle', label: strings.footAngleLabel, val: conformation.footAngle || 0 },
    { key: 'feetLegsScore', label: strings.feetLegsScoreLabel, val: conformation.feetLegsScore || 0 }
  ];

  const udderTraits = [
    { key: 'foreUdderAttachment', label: strings.foreUdderAttachmentLabel, val: conformation.foreUdderAttachment || 0 },
    { key: 'rearUdderHeight', label: strings.rearUdderHeightLabel, val: conformation.rearUdderHeight || 0 },
    { key: 'rearUdderWidth', label: strings.rearUdderWidthLabel, val: conformation.rearUdderWidth || 0 },
    { key: 'udderCleft', label: strings.udderCleftLabel, val: conformation.udderCleft || 0 },
    { key: 'udderDepth', label: strings.udderDepthLabel, val: conformation.udderDepth || 0 }
  ];

  const teatTraits = [
    { key: 'frontTeatPlacement', label: strings.frontTeatPlacementLabel, val: conformation.frontTeatPlacement || 0 },
    { key: 'rearTeatPlacement', label: strings.rearTeatPlacementLabel, val: conformation.rearTeatPlacement || 0 },
    { key: 'teatLength', label: strings.teatLengthLabel, val: conformation.teatLength || 0 }
  ];

  const renderCdcbSubGraph = (title, traits) => {
    return (
      <Card title={title} style={styles.sectionCard}>
        <View style={styles.graphContainer}>
          {/* Graph Header Scale */}
          <View style={styles.graphHeaderRow}>
            <View style={styles.subGraphLabelColHeader} />
            <View style={styles.graphChartColHeader}>
              <View style={styles.scaleMarkWrap0}><Text style={styles.scaleMarkText}>-2</Text></View>
              <View style={styles.scaleMarkWrap25}><Text style={styles.scaleMarkText}>-1</Text></View>
              <View style={styles.scaleMarkWrap50}><Text style={styles.scaleMarkText}>0</Text></View>
              <View style={styles.scaleMarkWrap75}><Text style={styles.scaleMarkText}>1</Text></View>
              <View style={styles.scaleMarkWrap100}><Text style={styles.scaleMarkText}>2</Text></View>
            </View>
            <View style={styles.graphValueColHeader} />
          </View>

          {traits.map((trait) => {
            const numVal = parseFloat(trait.val) || 0;
            const maxScale = 2.0;
            const percentage = Math.min((Math.abs(numVal) / maxScale) * 50, 50);
            const isPositive = numVal >= 0;

            return (
              <View key={trait.key} style={styles.graphRow}>
                {/* Left Abbreviation Column */}
                <View style={styles.subGraphLabelCol}>
                  <Text style={styles.subGraphLabelText} numberOfLines={2}>{trait.label}</Text>
                </View>

                {/* Center Chart area with grid lines and horizontal bar */}
                <View style={styles.graphChartCol}>
                  {/* Vertical Grid Lines */}
                  <View style={[styles.gridLine, { left: '0%' }]} />
                  <View style={[styles.gridLine, { left: '25%' }]} />
                  <View style={[styles.gridLine, styles.gridLineCenter]} />
                  <View style={[styles.gridLine, { left: '75%' }]} />
                  <View style={[styles.gridLine, { left: '100%' }]} />

                  {/* Bar */}
                  {numVal !== 0 && (
                    <View
                      style={[
                        styles.graphBar,
                        isPositive ? { left: '50%' } : { right: '50%' },
                        { width: `${percentage}%` }
                      ]}
                    />
                  )}
                </View>

                {/* Right Value Column */}
                <View style={styles.graphValueCol}>
                  <Text style={styles.graphValueText}>
                    {numVal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
        </View>

        <Text style={styles.headerTitle}>{strings.cdcbSheetTitle}</Text>

        <View style={styles.headerRight}>
          {isAdmin && (
            <IconButton
              icon="pencil"
              iconColor="#FFFFFF"
              size={24}
              onPress={() => setModalVisible(true)}
              style={styles.editBtn}
            />
          )}
          <IconButton
            icon="share-variant"
            iconColor="#FFFFFF"
            size={24}
            onPress={handleShare}
            style={styles.shareBtn}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Multi-Image Slider/Banner */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slide = Math.round(event.nativeEvent.contentOffset.x / width);
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUrl, idx) => (
              <Image key={idx} source={{ uri: imgUrl }} style={styles.sliderImage} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeImageIndex === idx ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Primary Identification Header */}
        <View style={styles.idCard}>
          {/* Display exact requested format: 250HO13553 SPIKE / Reg: HO84... */}
          <Text style={styles.bullIdentityTitle}>
            {currentBull.naabCode} {currentBull.bullName}
          </Text>
          <Text style={styles.bullRegNumber}>
            Reg: {currentBull.registrationNumber}
          </Text>
          <Divider style={styles.divider} />

          {/* Highlights Row */}
          <View style={styles.highlightsRow}>
            <View style={styles.highlightBadge}>
              <Text style={styles.badgeLabel}>{strings.breedLabelForm}</Text>
              <Text style={styles.badgeVal}>{currentBull.breed}</Text>
            </View>

            {currentBull.tpi && (
              <View style={[styles.highlightBadge, styles.tpiBadge]}>
                <Text style={[styles.badgeLabel, styles.tpiLabelText]}>TPI</Text>
                <Text style={[styles.badgeVal, styles.tpiValText]}>+{currentBull.tpi}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Evaluation Date */}
        <View style={styles.dateBanner}>
          <Text style={styles.dateBannerText}>
            ⏱️ CDCB Evaluation: {cdcbChart.evaluationDate || 'N/A'}
          </Text>
        </View>

        {/* 1. Pedigree Section */}
        <Card title="वंशावळ (Pedigree)" style={styles.sectionCard}>
          <View style={styles.pedigreeGrid}>
            {/* Ancestry Lineage Header (Sire x MGS x MGGS format, e.g. MAINEVENT x EMBASSY x ROBUST) */}
            {(pedigree.sire || pedigree.mgs || pedigree.mggs) ? (
              <View style={styles.lineageHeader}>
                <Text style={styles.lineageText}>
                  {[pedigree.sire, pedigree.mgs, pedigree.mggs]
                    .filter(Boolean)
                    .map(cleanPedigreeName)
                    .filter(Boolean)
                    .join(' x ') || 'N/A'}
                </Text>
              </View>
            ) : null}

            <View style={styles.pedigreeRow}>
              <Text style={styles.pedigreeLabel}>{strings.sireLabel}:</Text>
              <Text style={styles.pedigreeValue}>{pedigree.sire || 'N/A'}</Text>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={styles.pedigreeLabel}>{strings.damSireLabel}:</Text>
              <Text style={styles.pedigreeValue}>{pedigree.damSire || 'N/A'}</Text>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={styles.pedigreeLabel}>{strings.mgsLabel}:</Text>
              <Text style={styles.pedigreeValue}>{pedigree.mgs || 'N/A'}</Text>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={styles.pedigreeLabel}>{strings.mgdLabel}:</Text>
              <Text style={styles.pedigreeValue}>{pedigree.mgd || 'N/A'}</Text>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={styles.pedigreeLabel}>{strings.mggsLabel}:</Text>
              <Text style={styles.pedigreeValue}>{pedigree.mggs || 'N/A'}</Text>
            </View>
          </View>
        </Card>

        {/* Real World Data Section */}
        <Card title='वास्तववादी डेटा (Real World Data)' style={styles.sectionCard}>
          <View style={styles.pedigreeGrid}>
            <View style={styles.pedigreeRow}>
              <Text style={[styles.pedigreeLabel, { flex: 3, fontWeight: '500', color: COLORS.textPrimary }]}>{strings.transitionRightLabel}</Text>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                {renderStars(health.transitionRight || 0)}
              </View>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={[styles.pedigreeLabel, { flex: 3, fontWeight: '500', color: COLORS.textPrimary }]}>{strings.betaCaseinLabel}</Text>
              <Text style={[styles.pedigreeValue, { flex: 2, textAlign: 'left', fontWeight: '500', color: COLORS.textSecondary }]}>
                {health.betaCasein || 'N/A'}
              </Text>
            </View>

            <View style={styles.pedigreeRow}>
              <Text style={[styles.pedigreeLabel, { flex: 3, fontWeight: '500', color: COLORS.textPrimary }]}>{strings.cdcbLabel}</Text>
              <Text style={[styles.pedigreeValue, { flex: 2, textAlign: 'left', fontWeight: '500', color: COLORS.textSecondary }]}>
                {cdcbChart.evaluationDate || 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. CDCB Production Metrics Table */}
        <Card title={strings.productionTitle} style={styles.sectionCard}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCol, styles.tableHeaderCol, { flex: 2 }]}>घटक (Trait)</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCol]}>मूल्य (Value)</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCol]}>Reliability</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.milkLbsLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(production.milkLbs, ' Lbs')}</Text>
              <Text style={styles.tableCol}>{production.reliability || 0}%</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.fatLbsLabel} / %</Text>
              <Text style={styles.tableCol}>{formatVal(production.fatLbs, ' Lbs')} / {formatVal(production.fatPercent, '%')}</Text>
              <Text style={styles.tableCol}>{production.reliability || 0}%</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.proteinLbsLabel} / %</Text>
              <Text style={styles.tableCol}>{formatVal(production.proteinLbs, ' Lbs')} / {formatVal(production.proteinPercent, '%')}</Text>
              <Text style={styles.tableCol}>{production.reliability || 0}%</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.combinedFatProteinLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(production.combinedFatProtein, ' Lbs')}</Text>
              <Text style={styles.tableCol}>{production.reliability || 0}%</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.productiveLifeLabel} (PL)</Text>
              <Text style={styles.tableCol}>{formatVal(health.productiveLife)}</Text>
              <Text style={styles.tableCol}>{production.reliability || 0}%</Text>
            </View>
          </View>
        </Card>

        {/* 2b. CDCB Fertility Metrics Table */}
        <Card title={strings.fertilityTitle} style={styles.sectionCard}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCol, styles.tableHeaderCol, { flex: 2 }]}>प्रजनन घटक (Trait)</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCol]}>मूल्य (Value)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dprLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.daughterPregnancyRate)}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.hcrLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.heiferConceptionRate)}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.ccrLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.cowConceptionRate)}</Text>
            </View>
          </View>
        </Card>

        {/* 2c. CDCB Calving Traits Table */}
        <Card title={strings.calvingTitle} style={styles.sectionCard}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCol, styles.tableHeaderCol, { flex: 2 }]}>{strings.calvingTraitHeader}</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCol]}>{strings.valueHeader}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.sceLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.sireCalvingEase, '%')}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dceLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.daughterCalvingEase, '%')}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.ssbLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.sireStillbirth, '%')}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dsbLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.daughterStillbirth, '%')}</Text>
            </View>
          </View>
        </Card>

        {/* 3. CDCB Health Metrics Table */}
        <Card title={strings.healthTitle} style={styles.sectionCard}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCol, styles.tableHeaderCol, { flex: 2 }]}>आरोग्य घटक (Trait)</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCol]}>मूल्य (Value)</Text>
            </View>


            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.scsLabel}</Text>
              <Text style={styles.tableCol}>{health.somaticCellScore || 0}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.mastLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.mast, '%')}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.metrLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.metr, '%')}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.ketoLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.keto, '%')}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.replLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.repl, '%')}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dsabLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.dsab, '%')}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.mfevLabel}</Text>
              <Text style={styles.tableCol}>{formatVal(health.mfev, '%')}</Text>
            </View>
          </View>
        </Card>

        {/* 4. CDCB Conformation Graph */}
        <Card title={strings.conformationTitle} style={styles.sectionCard}>
          <View style={styles.graphContainer}>
            {/* Graph Header Scale */}
            <View style={styles.graphHeaderRow}>
              <View style={styles.graphLabelColHeader} />
              <View style={styles.graphChartColHeader}>
                <View style={styles.scaleMarkWrap0}><Text style={styles.scaleMarkText}>-2</Text></View>
                <View style={styles.scaleMarkWrap25}><Text style={styles.scaleMarkText}>-1</Text></View>
                <View style={styles.scaleMarkWrap50}><Text style={styles.scaleMarkText}>0</Text></View>
                <View style={styles.scaleMarkWrap75}><Text style={styles.scaleMarkText}>1</Text></View>
                <View style={styles.scaleMarkWrap100}><Text style={styles.scaleMarkText}>2</Text></View>
              </View>
              <View style={styles.graphValueColHeader} />
            </View>

            {[
              { key: 'ptat', label: 'PTAT', val: conformation.ptat || 0 },
              { key: 'udc', label: 'UDC', val: conformation.udderComposite || 0 },
              { key: 'flc', label: 'FLC', val: conformation.feetLegsComposite || 0 },
              { key: 'bwc', label: 'BWC', val: conformation.bodyWeightComposite || 0 }
            ].map((trait, idx) => {
              const numVal = parseFloat(trait.val) || 0;
              const maxScale = 2.0;
              const percentage = Math.min((Math.abs(numVal) / maxScale) * 50, 50);
              const isPositive = numVal >= 0;

              return (
                <View key={trait.key} style={styles.graphRow}>
                  {/* Left Abbreviation Column */}
                  <View style={styles.graphLabelCol}>
                    <Text style={styles.graphLabelText}>{trait.label}</Text>
                  </View>

                  {/* Center Chart area with grid lines and horizontal bar */}
                  <View style={styles.graphChartCol}>
                    {/* Vertical Grid Lines */}
                    <View style={[styles.gridLine, { left: '0%' }]} />
                    <View style={[styles.gridLine, { left: '25%' }]} />
                    <View style={[styles.gridLine, styles.gridLineCenter]} />
                    <View style={[styles.gridLine, { left: '75%' }]} />
                    <View style={[styles.gridLine, { left: '100%' }]} />

                    {/* Bar */}
                    {numVal !== 0 && (
                      <View
                        style={[
                          styles.graphBar,
                          isPositive ? { left: '50%' } : { right: '50%' },
                          { width: `${percentage}%` }
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Value Column */}
                  <View style={styles.graphValueCol}>
                    <Text style={styles.graphValueText}>
                      {numVal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {renderCdcbSubGraph(strings.statureTitle, statureTraits)}
        {renderCdcbSubGraph(strings.feetLegsTitle, feetLegsTraits)}
        {renderCdcbSubGraph(strings.udderTitle, udderTraits)}
        {renderCdcbSubGraph(strings.teatPlacementTitle, teatTraits)}
      </ScrollView>

      {/* Edit Bull Modal Form */}
      <BullFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        bull={currentBull}
        onSuccess={(updated) => {
          setCurrentBull(updated);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeft: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerRight: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backBtn: {
    margin: 0,
  },
  shareBtn: {
    margin: 0,
  },
  editBtn: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSliderContainer: {
    width: width,
    height: 240,
    position: 'relative',
    backgroundColor: '#000000',
  },
  sliderImage: {
    width: width,
    height: 240,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  idCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    borderBottomLeftRadius: SIZES.radiusLg,
    borderBottomRightRadius: SIZES.radiusLg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: SPACING.md,
  },
  bullIdentityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  bullRegNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  highlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xs,
  },
  highlightBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 90,
  },
  tpiBadge: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  badgeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tpiLabelText: {
    color: COLORS.primary,
  },
  badgeVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  tpiValText: {
    color: COLORS.primaryDark,
  },
  dateBanner: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  dateBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  pedigreeGrid: {
    paddingVertical: SPACING.xs,
  },
  pedigreeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pedigreeLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    flex: 1,
  },
  pedigreeValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  altRow: {
    backgroundColor: COLORS.background,
  },
  tableHeaderRow: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0,
  },
  tableCol: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableHeaderCol: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Graph-specific styles
  graphContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  graphHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary,
    height: 32,
  },
  graphLabelColHeader: {
    width: 65,
  },
  graphChartColHeader: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  graphValueColHeader: {
    width: 60,
  },
  scaleMarkWrap0: {
    position: 'absolute',
    left: '0%',
    marginLeft: -10,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scaleMarkWrap25: {
    position: 'absolute',
    left: '25%',
    marginLeft: -10,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scaleMarkWrap50: {
    position: 'absolute',
    left: '50%',
    marginLeft: -10,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scaleMarkWrap75: {
    position: 'absolute',
    left: '75%',
    marginLeft: -10,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scaleMarkWrap100: {
    position: 'absolute',
    left: '100%',
    marginLeft: -10,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scaleMarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  graphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primaryLight,
  },
  graphLabelCol: {
    width: 65,
    paddingLeft: SPACING.sm,
    justifyContent: 'center',
  },
  graphLabelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subGraphLabelColHeader: {
    width: 130,
  },
  subGraphLabelCol: {
    width: 130,
    paddingLeft: SPACING.xs,
    justifyContent: 'center',
  },
  subGraphLabelText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  graphChartCol: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.border,
  },
  gridLineCenter: {
    left: '50%',
    width: 1.5,
    backgroundColor: COLORS.textSecondary,
  },
  graphBar: {
    position: 'absolute',
    height: 14,
    backgroundColor: COLORS.info,
    borderRadius: SIZES.radiusSm / 2,
  },
  graphValueCol: {
    width: 60,
    paddingRight: SPACING.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  graphValueText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  lineageHeader: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderRadius: SIZES.radiusMd,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  explanationBullet: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginVertical: 2,
  },
  bulletHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
