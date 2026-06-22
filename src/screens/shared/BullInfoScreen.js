import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Alert, Linking, Image, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, IconButton, Searchbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAppStore } from '../../store/useAppStore';

export default function BullInfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [selectedBull, setSelectedBull] = useState(null);
  
  // Inquiry Form local state
  const [qty, setQty] = useState('10');
  const [farmerName, setFarmerName] = useState(user?.name || '');
  const [farmerPhone, setFarmerPhone] = useState(user?.phone || '');

  // Extract translation strings
  const strings = STRINGS.bullInfo;

  // Filter bulls data based on selected brand & search query
  const filteredBulls = useMemo(() => {
    let list = strings.bulls || [];
    
    if (selectedBrand !== 'all') {
      list = list.filter((b) => b.brand === selectedBrand);
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.breed.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [selectedBrand, searchQuery, strings.bulls]);

  // Open Inquiry modal for a specific bull
  const handleOpenInquiry = (bull) => {
    setSelectedBull(bull);
    setQty('10'); // Default order count
    setFarmerName(user?.name || '');
    setFarmerPhone(user?.phone || '');
    setInquiryModalVisible(true);
  };

  // Submit Inquiry form (mock or via WhatsApp redirect)
  const handleSendInquiry = (method) => {
    if (!farmerName.trim() || !farmerPhone.trim()) {
      Alert.alert(STRINGS.common.errorTitle, 'कृपया नाव आणि मोबाईल नंबर अचूक भरा.');
      return;
    }

    const messageText = `*KisanApp - सीमेन डोस चौकशी*\n\n` +
      `*वळू नाव:* ${selectedBull?.name} (${selectedBull?.code})\n` +
      `*जात:* ${selectedBull?.breed}\n` +
      `*ब्रँड:* ${selectedBull?.brand?.toUpperCase()}\n` +
      `*आवश्यक डोस:* ${qty}\n` +
      `*शेतकरी नाव:* ${farmerName}\n` +
      `*मोबाईल नंबर:* ${farmerPhone}\n` +
      `*पत्ता:* ${user?.village || ''}, ${user?.taluka || ''}, ${user?.district || ''}`;

    if (method === 'whatsapp') {
      const url = `whatsapp://send?phone=+919876543210&text=${encodeURIComponent(messageText)}`;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // If WhatsApp is not installed, show regular success alert
            Alert.alert(strings.bookSuccessTitle, strings.inquirySuccess);
          }
        })
        .catch(() => {
          Alert.alert(strings.bookSuccessTitle, strings.inquirySuccess);
        });
    } else {
      // Direct call fallback
      Linking.openURL('tel:+919876543210').catch(() => {
        Alert.alert(strings.bookSuccessTitle, strings.inquirySuccess);
      });
    }

    setInquiryModalVisible(false);
  };

  // Navigate to Videos tab and pass breed/brand query parameter
  const handleWatchVideo = (bull) => {
    navigation.navigate('Videos', { category: bull.videoCategory });
  };

  // Render top brand description dynamically based on selected tab
  const renderBrandDescription = () => {
    switch (selectedBrand) {
      case 'wws':
        return <Text style={styles.brandDescText}>{strings.wwsDesc}</Text>;
      case 'abs':
        return <Text style={styles.brandDescText}>{strings.absDesc}</Text>;
      case 'denmark':
        return <Text style={styles.brandDescText}>{strings.denmarkDesc}</Text>;
      default:
        return null;
    }
  };

  const renderBullItem = ({ item }) => {
    return (
      <Card
        title={item.name}
        subtitle={`${strings.breedLabel} ${item.breed}`}
        coverImage={item.image}
        style={styles.bullCard}
        actions={
          <View style={styles.cardActionsRow}>
            <Button
              title={strings.detailsBtn}
              mode="outlined"
              onPress={() => handleWatchVideo(item)}
              style={styles.cardBtn}
              labelStyle={styles.cardBtnLabel}
              icon="play-circle-outline"
            />
            <Button
              title={strings.inquiryBtn}
              mode="contained"
              onPress={() => handleOpenInquiry(item)}
              style={[styles.cardBtn, styles.bookBtn]}
              labelStyle={styles.cardBtnLabel}
              icon="cart-outline"
            />
          </View>
        }
      >
        <Text style={styles.codeText}>वळू कोड: {item.code}</Text>
        <Text style={styles.descText}>{item.description}</Text>
        
        {/* Specs Table */}
        <View style={styles.specGrid}>
          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{strings.damMilkLabel}</Text>
              <Text style={styles.specValue}>{item.damMilk}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{strings.fatLabel}</Text>
              <Text style={styles.specValue}>{item.fat}</Text>
            </View>
          </View>
          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{strings.conceptionLabel}</Text>
              <Text style={styles.specValue}>{item.conception}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{strings.priceLabel}</Text>
              <Text style={[styles.specValue, styles.priceValue]}>{item.price}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.title}>{strings.title}</Text>
        <Text style={styles.subtitle}>{strings.subtitle}</Text>
      </View>

      {/* Brand Selection Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabButton, selectedBrand === 'all' && styles.activeTabButton]}
            onPress={() => setSelectedBrand('all')}
          >
            <Text style={[styles.tabLabel, selectedBrand === 'all' && styles.activeTabLabel]}>
              {strings.brandAll}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedBrand === 'wws' && styles.activeTabButton]}
            onPress={() => setSelectedBrand('wws')}
          >
            <Text style={[styles.tabLabel, selectedBrand === 'wws' && styles.activeTabLabel]}>
              {strings.brandWws}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedBrand === 'abs' && styles.activeTabButton]}
            onPress={() => setSelectedBrand('abs')}
          >
            <Text style={[styles.tabLabel, selectedBrand === 'abs' && styles.activeTabLabel]}>
              {strings.brandAbs}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedBrand === 'denmark' && styles.activeTabButton]}
            onPress={() => setSelectedBrand('denmark')}
          >
            <Text style={[styles.tabLabel, selectedBrand === 'denmark' && styles.activeTabLabel]}>
              {strings.brandDenmark}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Brand Info Banner */}
      {selectedBrand !== 'all' && (
        <View style={styles.brandInfoBanner}>
          {renderBrandDescription()}
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={strings.searchPlaceholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          placeholderTextColor={COLORS.textSecondary}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Bulls Feed */}
      <FlatList
        data={filteredBulls}
        keyExtractor={(item) => item.id}
        renderItem={renderBullItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{strings.noBulls}</Text>
          </View>
        }
      />

      {/* Inquiry Modal */}
      <Portal>
        <Modal
          visible={inquiryModalVisible}
          onDismiss={() => setInquiryModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.contactTitle}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setInquiryModalVisible(false)}
              />
            </View>

            {selectedBull && (
              <View style={styles.selectedBullInfo}>
                <Text style={styles.modalBullName}>{selectedBull.name}</Text>
                <Text style={styles.modalBullDetails}>
                  जात: {selectedBull.breed} | वळू कोड: {selectedBull.code}
                </Text>
              </View>
            )}

            <Text style={styles.infoBoxText}>{strings.contactInfo}</Text>

            <Input
              label="शेतकऱ्याचे नाव"
              value={farmerName}
              onChangeText={setFarmerName}
              placeholder="तुमचे नाव प्रविष्ट करा"
            />

            <Input
              label="मोबाईल नंबर"
              value={farmerPhone}
              onChangeText={setFarmerPhone}
              keyboardType="phone-pad"
              placeholder="तुमचा मोबाईल नंबर प्रविष्ट करा"
            />

            <Input
              label="आवश्यक डोस संख्या"
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder="उदा. 10, 20"
            />

            <View style={styles.inquiryActions}>
              <Button
                title="व्हॉट्सॲप मेसेज करा"
                mode="contained"
                color="#25D366"
                icon="whatsapp"
                onPress={() => handleSendInquiry('whatsapp')}
                style={styles.modalBtn}
              />
              <Button
                title="थेट कॉल करा"
                mode="contained"
                icon="phone"
                onPress={() => handleSendInquiry('call')}
                style={[styles.modalBtn, styles.callBtn]}
              />
            </View>
          </ScrollView>
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    lineHeight: TYPOGRAPHY.lineHeightLg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  tabButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    marginHorizontal: SPACING.xs,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  brandInfoBanner: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandDescText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  bullCard: {
    marginVertical: SPACING.xs,
  },
  codeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginVertical: SPACING.xs,
  },
  specGrid: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: SPACING.md,
  },
  specLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  priceValue: {
    color: COLORS.primary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: SPACING.xs,
  },
  cardBtn: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    minHeight: 44,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
  },
  cardBtnLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: SIZES.radiusLg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalScroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  selectedBullInfo: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBullName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalBullDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoBoxText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
  },
  inquiryActions: {
    marginTop: SPACING.md,
  },
  modalBtn: {
    marginVertical: SPACING.xs,
  },
  callBtn: {
    backgroundColor: COLORS.secondary,
  },
});
