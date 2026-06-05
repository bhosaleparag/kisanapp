# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# KisanApp Development & Architectural Rules

To maintain codebase health, consistency, and scalability, all development must adhere to the following rules. These rules are derived from our project design system and architecture.

## 1. Localization & Strings Policy (No Hardcoded Marathi)
* **Rule**: Never use Marathi (मराठी) text strings directly in component views, screen files, page layouts, components, utils, or alert dialogs.
* **Implementation**:
  * All user-facing Marathi text, including buttons, headings, text descriptors, form input placeholders, screen titles, voice search titles, helper messages, and static options, must be defined in [strings.js](file:///d:/freelancing%20project/kisanapp/src/constants/strings.js) inside the `STRINGS` object.
  * Use the imported strings like:
    ```javascript
    import { STRINGS } from '../../constants/strings';
    
    // Usage:
    <Text>{STRINGS.videos.title}</Text>
    Alert.alert(STRINGS.common.success, STRINGS.videos.saveSuccess);
    ```
  * Note: Centralizing Marathi strings makes it straightforward to add localized translation keys or modify farmer-facing copy in a single place. Zod validation error messages reside directly within [schemas.js](file:///d:/freelancing%20project/kisanapp/src/utils/schemas.js).

## 2. Design System & Theme Policy (No Hardcoded Colors)
* **Rule**: Always import design theme variables (colors, spacings, sizes, and typographies). Do not hardcode raw Hex codes, RGB colors, or magic numbers for sizes and spacing.
* **Implementation**:
  * Import design tokens from [theme.js](file:///d:/freelancing%20project/kisanapp/src/constants/theme.js):
    ```javascript
    import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
    ```
  * Styles must utilize the theme objects:
    ```javascript
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
      },
      title: {
        fontSize: TYPOGRAPHY.fontSizeMd,
        color: COLORS.textPrimary,
      },
    });
    ```
  * Ensure touch target boundaries follow agricultural environment standards defined in `SIZES.minTouchTarget` (48px) and `SIZES.largeTouchTarget` (60px) for easier physical interaction.

## 3. Service Layer Architecture (Firebase Operations)
* **Rule**: Never invoke Firebase APIs (Firestore operations like `getDocs`, `addDoc`, `setDoc`, `updateDoc`, or Storage operations like `uploadBytes`, `getDownloadURL`) directly inside UI components or screens. All network calls, datastore operations, and external services must be encapsulated inside specialized files in the services layer.
* **Implementation**:
  * Define operations as exported async helper functions in the service layer inside `src/services/` (e.g. [videoService.js](file:///d:/freelancing%20project/kisanapp/src/services/videoService.js) or [profileService.js](file:///d:/freelancing%20project/kisanapp/src/services/profileService.js)).
  * Service helper functions should handle both production calls to Firebase and the local mock environment (using the `isMock` boolean exported from [firebase.js](file:///d:/freelancing%20project/kisanapp/src/services/firebase.js)) to support offline and quick-preview usage without throwing errors when credentials are placeholders.
  * In screens or components, call the service methods:
    ```javascript
    import { getVideos, addVideo } from '../../services/videoService';
    ```

## 4. State Management and Hooks
* **Global State**: Global user states, authentication sessions, and user settings must reside inside the Zustand store: [useAppStore.js](file:///d:/freelancing%20project/kisanapp/src/store/useAppStore.js).
* **Form Handling**: Use `react-hook-form` along with Zod validation schemas defined in [schemas.js](file:///d:/freelancing%20project/kisanapp/src/utils/schemas.js) for input handling. Avoid using custom validation logic in components.

## 5. UI and Reusable Components
* Utilize high-quality reusable custom controls from `src/components` (e.g., [Button.jsx](file:///d:/freelancing%20project/kisanapp/src/components/Button.jsx), [Input.jsx](file:///d:/freelancing%20project/kisanapp/src/components/Input.jsx), [Select.jsx](file:///d:/freelancing%20project/kisanapp/src/components/Select.jsx), [Card.jsx](file:///d:/freelancing%20project/kisanapp/src/components/Card.jsx), [ImagePicker.jsx](file:///d:/freelancing%20project/kisanapp/src/components/ImagePicker.jsx)) instead of writing vanilla raw inputs/buttons from react-native or react-native-paper, ensuring a consistent design aesthetic.
