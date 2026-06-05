# लिनीअर शेती (KisanApp) 🌾🐄

**लिनीअर शेती (KisanApp)** is a state-of-the-art, high-contrast, farmer-friendly mobile application built using **React Native & Expo**. Specially designed for farmers in **Solapur, Maharashtra (India)**, the app is localized entirely in **Marathi (मराठी)** to ensure maximum usability, accessibility, and comfort for local agricultural communities.

---

## 🌟 Key Features

The app is divided into five core modules accessible via a primary bottom navigation bar:

1. **🏠 मुख्यपृष्ठ (Home)**
   - Welcome banner displaying farmer details, notifications, and quick action banners (e.g., incomplete profile warning banner).
   - Showcases overall farm stats like daily milk yield and total livestock count at a glance.

2. **🐄 माझा गोठा (Cowshed - Livestock Management)**
   - Register livestock (cows, buffaloes) with tag/name, breed (e.g., Gir, Khillar, Deoni), age, daily milk yield (liters), and health status.
   - Comprehensive milk & weight tracking.
   - Fully validated form entry ensuring accurate data input.

3. **🛍️ बाजारपेठ (Marketplace)**
   - Community-driven buy-and-sell marketplace.
   - Browse listings for Fodder (चारा व पेंड), Fertilizers & Pesticides (खते व औषधे), and Livestock (पशु).
   - Post listings with detailed descriptions, pricing, seller details, contact numbers, and photo uploads.

4. **🚜 शेतकरी सेवा (Agricultural Services)**
   - On-demand booking for localized services including tractor rental (ट्रॅक्टर भाड्याने), drone spraying (ड्रोन फवारणी), and farm labor (शेतमजूर).
   - Book services easily with rates configured per hour.

5. **🎥 मार्गदर्शन व्हिडिओ (Guidance Videos)**
   - Curated video library categorised into Organic Farming (सेंद्रिय शेती), Crop Disease Management (पीक रोग व्यवस्थापन), and Modern Technology (आधुनिक तंत्रज्ञान).
   - Responsive video player with title, category filters, duration, and search functionality.

6. **👤 माझी प्रोफाईल (User Profile)**
   - Detailed user configuration with village, taluka, district (Solapur region dropdown lists), pincode, total land area, cultivated land area, and main crops.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [Expo v54.0.2](https://docs.expo.dev/versions/v54.0.0/) / React Native (0.81.5)
- **UI & Components**: [React Native Paper (v5.15.2)](https://callstack.github.io/react-native-paper/) for Material Design 3 guidelines.
- **State Management**: [Zustand (v5.0.13)](https://github.com/pmndrs/zustand) for lightweight, high-performance global user sessions.
- **Data Querying & Caching**: [TanStack React Query (v5.100.13)](https://tanstack.com/query/latest) configured to save data, provide seamless offline support, and minimize Firebase Firestore read charges.
- **Backend & Database**: Firebase (v12.13.0) for Auth, Firestore Database, and Cloud Storage.
- **Validation**: [Zod (v4.4.3)](https://zod.dev/) & [React Hook Form (v7.76.1)](https://react-hook-form.com/) for Marathi-localized validation messaging.

---

## 🎨 Design System & UX Standards

The app prioritizes visual excellence and accessibility under challenging field/farming environments:

- **Harmonious Color Palette**:
  - **Primary**: Deep Forest Green (`#1B5E20`) — representing growth, safety, and agriculture.
  - **Secondary**: Earthy Clay Brown (`#8D6E63`) — representing earth, warmth, and stability.
  - **Accent**: Contrast Gold (`#FFB300`) — used for alerts, ratings, and important notifications.
  - **Neutral**: Slate slate-slate colors (charcoal `#1E293B` and `#64748B`) on soft slate backgrounds (`#F8FAFC`) to prevent eye strain.
- **Typography**: Optimized Marathi sizes and line heights (`fontSizeMd: 18`, `lineHeightMd: 26`) to accommodate non-Latin characters comfortably.
- **Accessibility & Touch Targets**: Minimum touch targets are set to **48dp** (standard) and **60dp** (large/interactive) to ensure easy operability on-the-go or in-field.

---

## 📁 Project Structure

```bash
KisanApp/
├── assets/                  # App logo, icons, and static assets
├── src/
│   ├── components/          # Reusable UI elements (Button, Card, Input, Selector, Loader, etc.)
│   ├── constants/
│   │   ├── theme.js         # Color palette, spacing, and typographic tokens
│   │   ├── strings.js       # Centralized Marathi text dictionary
│   │   └── solapurData.js   # Solapur Talukas and village databases
│   ├── navigation/
│   │   ├── AppNavigator.js  # Main Authentication and profile flow switch
│   │   └── TabNavigator.js  # Bottom-tab bar controller and global header
│   ├── screens/
│   │   ├── auth/            # Phone verification / OTP Login screens
│   │   ├── cowshed/         # Livestock logging screens
│   │   ├── marketplace/     # Feed & agricultural marketplace listing screens
│   │   ├── services/        # Tractor, Drone, and Labor reservation screens
│   │   ├── shared/          # Home and Profile management screens
│   │   └── videos/          # Crop guidance videos and search search engine
│   ├── services/
│   │   ├── firebase.js      # Firebase app, auth, db, storage core config
│   │   └── profileService.js# Profile read/write storage integrations
│   ├── store/
│   │   └── useAppStore.js   # Global user state (Zustand)
│   └── utils/
│       └── schemas.js       # Zod schemas with localized Marathi validation errors
├── App.js                   # Application bootstrap and theme/query configurations
├── app.json                 # Expo configuration
├── package.json             # App dependencies and run scripts
└── README.md                # This developer documentation
```

---

## ⚡ Performance & Cost Optimizations

To protect farmers from high mobile data costs and reduce Firebase usage fees, the app integrates TanStack Query with specific optimization settings:
- **`staleTime` (5 Minutes)**: Data is considered fresh for 5 minutes. Tab switching or navigation does not trigger redundant Firestore database queries.
- **`gcTime` (10 Minutes)**: Retains query results in memory before garbage collection.
- **`refetchOnWindowFocus: false`**: Completely avoids background re-fetch operations when the user leaves and re-enters the application.
- **Offline Fallback**: In the absence of a Firebase connection or during mock tests, the Firebase service falls back gracefully without crashing, allowing developers and farmers to view local data.

---

## 🚀 Getting Started

### 📋 Prerequisites
- Install **Node.js** (v18 or higher recommended)
- Install **git** (optional)
- Install the **Expo Go** app on your physical mobile device (Android/iOS) to run and preview the app immediately.

### 🔧 Installation
1. Clone the repository or open the project folder.
2. Install npm dependencies:
   ```bash
   npm install
   ```

### ⚙️ Firebase Setup
Create a `.env.local` file in the root directory and configure the environment variables as follows:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*Note: If no Firebase configuration is present, the app will warn and run in **Mock Mode** using local assets.*

### 🏃 Running the Application
To run the Expo development bundler:
```bash
npm run start
```
After running the command, you will see a QR code in the terminal.
- **Android**: Scan the QR code using the **Expo Go** app.
- **iOS**: Scan the QR code using your iPhone's **Camera** app (which will redirect you to Expo Go).

For running specifically on platform simulators/emulators:
- **Android Emulator**: `npm run android`
- **iOS Simulator**: `npm run ios`
- **Web Browser**: `npm run web`

---

## 📝 License
This project is private and proprietary. See [LICENSE](file:///d:/KisanApp/LICENSE) for more details.
