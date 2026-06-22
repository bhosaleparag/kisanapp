import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions, Share } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import Button from '../../components/Button';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

export default function CdcbDataSheetScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { bull } = route.params || {};

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const strings = STRINGS.bullInfo;

  // Helper to format numeric values with + or - signs
  const formatVal = (val, unit = '') => {
    if (val === undefined || val === null || val === '') return `0${unit}`;
    const num = parseFloat(val);
    if (isNaN(num)) return `${val}${unit}`;
    if (num > 0) return `+${num}${unit}`;
    return `${num}${unit}`;
  };

  if (!bull) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{STRINGS.common.noData}</Text>
        <Button title={STRINGS.common.back} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Get image array or fallback
  const images = bull.photoUrls && bull.photoUrls.length > 0 ? bull.photoUrls : [bull.photoUrl];

  // Helper to share CDCB datasheet
  const handleShare = async () => {
    try {
      const shareMsg = `*वळू माहिती आणि CDCB डेटा पत्रक*\n\nवळू: ${bull.naabCode} ${bull.bullName}\nनोंदणी क्रमांक: ${bull.registrationNumber}\nBreed: ${bull.breed}\nTPI: +${bull.tpi || 'N/A'}\n\n*पैदावर आणि वंशावळ सुधारण्यासाठी लिनीअर शेती ॲप वापरा!*`;
      await Share.share({
        message: shareMsg,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Safe destructuring of nested objects
  const pedigree = bull.pedigree || {};
  const cdcbChart = bull.cdcbChart || {};
  const production = cdcbChart.production || {};
  const health = cdcbChart.health || {};
  const conformation = cdcbChart.conformation || {};

  return (
    <View style={styles.container}>
      {/* Custom Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
        <IconButton
          icon="arrow-left"
          iconColor="#FFFFFF"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Text style={styles.headerTitle}>{strings.cdcbSheetTitle}</Text>
        <IconButton
          icon="share-variant"
          iconColor="#FFFFFF"
          size={24}
          onPress={handleShare}
          style={styles.shareBtn}
        />
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
            {bull.naabCode} {bull.bullName}
          </Text>
          <Text style={styles.bullRegNumber}>
            Reg: {bull.registrationNumber}
          </Text>
          <Divider style={styles.divider} />

          {/* Highlights Row */}
          <View style={styles.highlightsRow}>
            <View style={styles.highlightBadge}>
              <Text style={styles.badgeLabel}>{strings.breedLabelForm}</Text>
              <Text style={styles.badgeVal}>{bull.breed}</Text>
            </View>
            
            {bull.tpi && (
              <View style={[styles.highlightBadge, styles.tpiBadge]}>
                <Text style={[styles.badgeLabel, styles.tpiLabelText]}>TPI</Text>
                <Text style={[styles.badgeVal, styles.tpiValText]}>+{bull.tpi}</Text>
              </View>
            )}

            {health.betaCasein && (
              <View style={styles.highlightBadge}>
                <Text style={styles.badgeLabel}>Beta Casein</Text>
                <Text style={styles.badgeVal}>{health.betaCasein}</Text>
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
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.productiveLifeLabel} (PL)</Text>
              <Text style={styles.tableCol}>{formatVal(health.productiveLife)}</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.scsLabel} (SCS)</Text>
              <Text style={styles.tableCol}>{health.somaticCellScore || 0}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dprLabel} (DPR)</Text>
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

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.betaCaseinLabel}</Text>
              <Text style={styles.tableCol}>{health.betaCasein || 'N/A'}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.sceLabel}</Text>
              <Text style={styles.tableCol}>{health.sireCalvingEase || 0}%</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dceLabel}</Text>
              <Text style={styles.tableCol}>{health.daughterCalvingEase || 0}%</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.ssbLabel}</Text>
              <Text style={styles.tableCol}>{health.sireStillbirth || 0}%</Text>
            </View>

            <View style={[styles.tableRow, styles.altRow]}>
              <Text style={[styles.tableCol, { flex: 2 }]}>{strings.dsbLabel}</Text>
              <Text style={styles.tableCol}>{health.daughterStillbirth || 0}%</Text>
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
      </ScrollView>
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
  backBtn: {
    margin: 0,
  },
  shareBtn: {
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
});
