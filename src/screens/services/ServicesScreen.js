import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Text, Portal, Modal, IconButton } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

//Core farming service offerings
const services = [
  {
    id: '1',
    title: STRINGS.services.tractor,
    rate: 500,
    icon: 'tractor',
    description: 'नांगरणी, कोळपणी आणि इतर शेतीच्या कामांसाठी आधुनिक ट्रॅक्टर भाड्याने मिळेल. (मशागतीसह)',
    imageUri: 'https://images.unsplash.com/photo-1594142393278-df058bf6605b?q=80&w=800',
  },
  {
    id: '2',
    title: STRINGS.services.drone,
    rate: 800,
    icon: 'drone',
    description: 'पिकांवर कीटकनाशके आणि औषध फवारणीसाठी अत्याधुनिक ड्रोन तंत्रज्ञान. कमी वेळात जास्त फवारणी.',
    imageUri: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800',
  },
  {
    id: '3',
    title: STRINGS.services.labor,
    rate: 300,
    icon: 'account-group',
    description: 'कापणी, कोळपणी आणि मळणीच्या कामांसाठी कुशल शेतमजूर गट उपलब्ध.',
    imageUri: 'https://images.unsplash.com/photo-1589923188900-85dae4409f7c?q=80&w=800',
  },
];

export default function ServicesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [hours, setHours] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  //Open Scheduler Modal
  const handleOpenBooking = (service) => {
    setSelectedService(service);
    setHours('');
    setBookingSuccess(false);
    setModalVisible(true);
  };

  //Calculate dynamic live cost as the farmer enters hours
  const calculateTotalCost = () => {
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours <= 0) return 0;
    return numHours * selectedService.rate;
  };

  //Submit Booking Request
  const handleConfirmBooking = () => {
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours <= 0) {
      Alert.alert(STRINGS.common.appName, 'कृपया वैध तास प्रविष्ट करा.');
      return;
    }

    //Trigger success state
    setBookingSuccess(true);
  };

  //Render individual service cards
  const renderServiceItem = ({ item }) => {
    const actionsRow = (
      <Button
        title={STRINGS.services.bookNow}
        onPress={() => handleOpenBooking(item)}
        style={styles.bookButton}
      />
    );

    return (
      <Card
        title={item.title}
        subtitle={`${STRINGS.services.pricePerHour}: ₹${item.rate}`}
        coverImage={item.imageUri}
        actions={actionsRow}
        style={styles.serviceCard}
      >
        <Text style={styles.descriptionText}>{item.description}</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          भाडे तत्वावर शेती अवजारे आणि ड्रोन फवारणी सेवा बुक करा
        </Text>
      </View>

      {/* Services List Grid */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Booking Form Modal Portal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedService && (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedService.title} - बुकिंग</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              {!bookingSuccess ? (
                // Booking Inputs view
                <View>
                  <Text style={styles.rateBadge}>
                    दर: ₹{selectedService.rate} प्रति तास
                  </Text>

                  {/* Input: Booking Hours */}
                  <Input
                    label="किती तासांसाठी हवे आहे? (तास संख्या)"
                    placeholder="उदा. ४, ८, १२"
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={setHours}
                  />

                  {/* Dynamic Cost Estimator Box */}
                  {calculateTotalCost() > 0 && (
                    <View style={styles.costBox}>
                      <Text style={styles.costLabel}>अंदाजे एकूण खर्च:</Text>
                      <Text style={styles.costValue}>₹{calculateTotalCost()}</Text>
                    </View>
                  )}

                  {/* Submit Trigger */}
                  <Button
                    title="बुकिंग निश्चित करा"
                    onPress={handleConfirmBooking}
                    style={styles.confirmButton}
                  />
                </View>
              ) : (
                // Success Confirmation view
                <View style={styles.successContainer}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successTitle}>बुकिंगची विनंती यशस्वी झाली!</Text>
                  <Text style={styles.successText}>
                    आम्ही तुमच्या बुकिंगची मशागत/नियोजन करण्यासाठी लवकरच तुमच्याशी संपर्क करू.
                  </Text>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>सेवा: {selectedService.title}</Text>
                    <Text style={styles.summaryText}>कालावधी: {hours} तास</Text>
                    <Text style={styles.summaryText}>एकूण देय रक्कम: ₹{calculateTotalCost()}</Text>
                  </View>
                  <Button
                    title="ठीक आहे"
                    onPress={() => setModalVisible(false)}
                    style={styles.doneButton}
                  />
                </View>
              )}
            </ScrollView>
          )}
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
  listContent: {
    padding: SPACING.lg,
  },
  serviceCard: {
    marginVertical: SPACING.xs,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bookButton: {
    flex: 1,
    marginTop: 4,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: SIZES.radiusLg,
    maxHeight: '95%',
    overflow: 'hidden',
  },
  modalScroll: {
    padding: SPACING.lg,
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
  rateBadge: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  costBox: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  costValue: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  confirmButton: {
    marginTop: SPACING.xs,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  successIcon: {
    fontSize: 48,
    color: COLORS.success,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  doneButton: {
    width: '100%',
  },
});
