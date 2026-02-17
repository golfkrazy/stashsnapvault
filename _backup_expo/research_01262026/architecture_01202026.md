# StashSnap - Comprehensive Architecture Document

## 1. System Architecture Overview

```mermaid
graph TB
    App["📱 App Root<br/>(_layout.tsx)"]
    Theme["🎨 Theme Provider<br/>(Light/Dark Mode)"]
    Nav["🗺️ Stack Navigator<br/>(Expo Router)"]

    App --> Theme
    App --> Nav

    Nav --> TabLayout["📑 Tab Layout<br/>((tabs)/_layout.tsx)"]
    Nav --> Modal["🪟 Modal Template<br/>(modal.tsx)"]

    TabLayout --> HomeScreen["🏠 Home Screen<br/>(index.tsx)"]
    TabLayout --> ExploreScreen["📸 Explore/Add Screen<br/>(explore.tsx)"]

    HomeScreen --> AsyncStorage1["💾 AsyncStorage<br/>(stashsnap_items)"]
    ExploreScreen --> AsyncStorage2["💾 AsyncStorage<br/>(stashsnap_items)"]

    HomeScreen --> AsyncStorage3["💾 AsyncStorage<br/>(stashsnap_categories)"]
    ExploreScreen --> FileSystem["📂 File System<br/>(Photo Storage)"]

    FileSystem --> AsyncStorage2

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class Theme primary
    class Nav primary
    class HomeScreen action
    class ExploreScreen action
    class AsyncStorage1 secondary
    class AsyncStorage2 secondary
    class AsyncStorage3 secondary
    class FileSystem secondary
```

## 2. Component Hierarchy & Relationships

```mermaid
graph TD
    Root["App Root<br/>_layout.tsx"]

    Root --> ThemeProvider["ThemeProvider"]
    Root --> StatusBar["StatusBar"]
    Root --> ColorScheme["useColorScheme Hook"]

    ThemeProvider --> StackNav["Stack Navigator<br/>Expo Router"]

    StackNav --> TabNav["TabsNavigator<br/>((tabs)/_layout.tsx)"]
    StackNav --> ModalScreen["Modal Screen<br/>modal.tsx"]

    TabNav --> HomeScreen["🏠 Home Screen<br/>index.tsx"]
    TabNav --> ExploreScreen["📸 Explore Screen<br/>explore.tsx"]

    HomeScreen --> HSComponents["Components:<br/>HapticTab, IconSymbol<br/>SafeAreaView, Header<br/>StatsCard, CategoriesSection<br/>ItemsList, Modal, FAB"]

    ExploreScreen --> ESComponents["Components:<br/>PhotoSection, CameraControl<br/>GalleryControl, FormInputs<br/>ActionButtons, FileSystem"]

    HSComponents --> StateHS["State:<br/>items[], selectedCategory<br/>categories[], selectedItem<br/>isEditMode, showLanding<br/>editTitle, editLocation<br/>editCategory, editValue"]

    ESComponents --> StateES["State:<br/>photo (URI)<br/>title, category<br/>location, value<br/>loading, error"]

    StateHS --> AsyncStorageH["AsyncStorage Operations:<br/>getItem: items, categories<br/>setItem: items, categories<br/>removeItem: item_id"]

    StateES --> FileSystemOps["File System Operations:<br/>copyAsync: save photo<br/>documentDirectory<br/>stashsnap_photos/"]

    FileSystemOps --> AsyncStorageE["AsyncStorage Operations:<br/>setItem: new item<br/>reference photo URI"]

    AsyncStorageH --> DataModel["Data Model:<br/>Item, Category<br/>interfaces"]
    AsyncStorageE --> DataModel

    ColorScheme --> Theme["Theme System:<br/>Light/Dark<br/>Constants/theme.ts"]

    theme primary
    class Root primary
    class StackNav primary
    class TabNav primary
    class HomeScreen action
    class ExploreScreen action
    class HSComponents secondary
    class ESComponents secondary
    class AsyncStorageH secondary
    class AsyncStorageE secondary
```

## 3. Data Flow Architecture

```mermaid
graph LR
    User["👤 User Action"]

    User -->|Take Photo| Camera["📷 expo-camera<br/>ImagePicker"]
    User -->|Pick Image| Gallery["🖼️ Gallery<br/>ImagePicker"]
    User -->|View Items| LoadData["📥 Load Items<br/>AsyncStorage.getItem"]
    User -->|Edit Item| UpdateData["✏️ Update Item<br/>AsyncStorage.setItem"]
    User -->|Delete Item| DeleteData["🗑️ Delete Item<br/>AsyncStorage.removeItem"]
    User -->|Filter| FilterUI["🔍 Filter UI<br/>Select Category"]

    Camera -->|Photo URI| FileOps["💾 expo-file-system<br/>copyAsync"]
    Gallery -->|Photo URI| FileOps

    FileOps -->|Saved Path| FormInput["📝 Form Inputs<br/>Title, Category, Location, Value"]

    FormInput -->|Save| SaveItem["💿 Save to<br/>AsyncStorage"]

    SaveItem -->|Serialize JSON| AsyncDB["📊 AsyncStorage DB<br/>stashsnap_items<br/>stashsnap_categories"]

    LoadData -->|Deserialize JSON| ItemsArray["📋 Items Array<br/>State: items[]"]

    ItemsArray -->|Filter| FilteredItems["🔎 Filtered Items<br/>Selected Category"]

    FilteredItems -->|Render| UIComponent["🎨 Home Screen UI<br/>ItemsList, StatsCard<br/>CategoriesSection"]

    UpdateData --> AsyncDB
    DeleteData --> AsyncDB
    FilterUI --> FilteredItems

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class Camera primary
    class Gallery primary
    class FileOps secondary
    class SaveItem primary
    class AsyncDB secondary
    class LoadData primary
    class UpdateData primary
    class DeleteItem primary
    class UIComponent action
```

## 4. State Management & Storage

```mermaid
graph TB
    subgraph StateManagement["🧠 State Management Layer"]
        CompState["React Component State<br/>useState() hooks:<br/>- items<br/>- selectedCategory<br/>- categories<br/>- selectedItem<br/>- isEditMode"]

        EffectState["Effect Hooks<br/>useEffect() / useFocusEffect():<br/>- Load data on mount<br/>- Save on changes<br/>- Focus screen reload"]

        ContextTheme["Theme Context<br/>useColorScheme()<br/>useThemeColor()"]

        RouterState["Router State<br/>Expo Router:<br/>- Current route<br/>- Navigation stack"]
    end

    subgraph Storage["💾 Persistent Storage Layer"]
        AsyncStorage["AsyncStorage<br/>Key-Value Store<br/>Device Local"]

        ItemsStore["Items Store<br/>Key: stashsnap_items<br/>Value: JSON array"]

        CategoriesStore["Categories Store<br/>Key: stashsnap_categories<br/>Value: JSON array"]

        FileSystem["File System<br/>expo-file-system<br/>Path: DocumentDirectory<br/>Photos: stashsnap_photos/"]
    end

    subgraph DataModel["📐 Data Model"]
        ItemType["Item Interface<br/>- id: string<br/>- title: string<br/>- category: string<br/>- location: string<br/>- photoUri?: string<br/>- value?: number<br/>- createdAt: number"]

        CategoryType["Category Interface<br/>- name: string<br/>- icon: string (emoji)<br/>- color: string (hex)"]
    end

    CompState -->|triggers| EffectState
    EffectState -->|reads/writes| AsyncStorage
    EffectState -->|saves/loads| FileSystem

    AsyncStorage --> ItemsStore
    AsyncStorage --> CategoriesStore

    ItemsStore -->|deserializes to| ItemType
    CategoriesStore -->|deserializes to| CategoryType

    ContextTheme -->|provides| ContextTheme
    RouterState -->|manages| CompState

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class StateManagement primary
    class Storage secondary
    class DataModel action
```

## 5. Screen & Navigation Flow

```mermaid
graph TD
    Launch["🚀 App Launch"]

    Launch --> RootLayout["Root Layout<br/>(_layout.tsx)"]

    RootLayout --> ThemeCheck{"Device Theme<br/>Setting"}

    ThemeCheck -->|Light| LightTheme["Light Mode<br/>Theme Applied"]
    ThemeCheck -->|Dark| DarkTheme["Dark Mode<br/>Theme Applied"]

    LightTheme --> TabsLayout["Tab Navigation Layout"]
    DarkTheme --> TabsLayout

    TabsLayout --> DefaultTab["Default: Home Screen<br/>(tabs/index.tsx)"]
    TabsLayout --> TabBar["Bottom Tab Bar<br/>Home | Explore"]

    DefaultTab --> HomeUI["Home Screen UI"]

    HomeUI --> LandingCheck{"First Visit?"}

    LandingCheck -->|Yes| Landing["Landing Page<br/>- Hero Section<br/>- Features<br/>- CTA Buttons"]
    LandingCheck -->|No| ItemsList["Items Display<br/>- Category Filter<br/>- Item Cards<br/>- Stats Card"]

    Landing -->|'Try App'| ItemsList
    Landing -->|'Skip'| ItemsList

    ItemsList --> Actions["User Actions:<br/>- View Item<br/>- Edit Item<br/>- Delete Item<br/>- Create Category<br/>- Delete Category"]

    TabBar -->|Tap Explore| ExploreScreen["Explore/Add Screen<br/>(tabs/explore.tsx)"]

    ExploreScreen --> AddUI["Add Item UI"]

    AddUI --> PhotoStep["Step 1: Photo<br/>- Camera<br/>- Gallery<br/>- Save to FS"]

    PhotoStep --> FormStep["Step 2: Details<br/>- Title input<br/>- Category select<br/>- Location input<br/>- Value input"]

    FormStep --> SaveStep["Step 3: Save<br/>- Validate input<br/>- Add to AsyncStorage<br/>- Navigate home"]

    SaveStep --> HomeUI

    Actions -->|Edit/Delete| UpdateUI["Update/Delete UI<br/>- Modal popup<br/>- Confirm action<br/>- Update AsyncStorage"]

    UpdateUI --> ItemsList

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class Launch primary
    class RootLayout primary
    class TabsLayout primary
    class HomeUI action
    class ExploreScreen action
    class SaveStep action
    class ItemsList action
```

## 6. Component Architecture Map

```mermaid
graph TB
    subgraph UI["🎨 UI Components (components/ui/)"]
        IconSymbol["icon-symbol.tsx<br/>SF Symbols → Material Icons<br/>Platform abstraction"]

        IconSymbolIOS["icon-symbol.ios.tsx<br/>iOS specific SF Symbols<br/>implementation"]

        Collapsible["collapsible.tsx<br/>Expandable/collapse<br/>component wrapper"]
    end

    subgraph Functional["⚙️ Functional Components (components/)"]
        HapticTab["haptic-tab.tsx<br/>Tab button with<br/>haptic feedback"]

        ThemedText["themed-text.tsx<br/>Theme-aware text<br/>Light/Dark support"]

        ThemedView["themed-view.tsx<br/>Theme-aware view<br/>Light/Dark support"]

        ExternalLink["external-link.tsx<br/>Open external links<br/>In-app or default browser"]

        ParallaxScroll["parallax-scroll-view.tsx<br/>Animated parallax effect<br/>Using Reanimated"]

        HelloWave["hello-wave.tsx<br/>Greeting animation<br/>Wave gesture"]
    end

    subgraph Hooks["🪝 Custom Hooks (hooks/)"]
        ColorScheme["use-color-scheme.ts<br/>Device light/dark<br/>detection"]

        ColorSchemeWeb["use-color-scheme.web.ts<br/>Web-specific<br/>implementation"]

        ThemeColor["use-theme-color.ts<br/>Resolve colors<br/>based on theme"]
    end

    subgraph Constants["📋 Constants (constants/)"]
        Theme["theme.ts<br/>Color palettes<br/>Font definitions<br/>Design tokens"]
    end

    subgraph Pages["📄 Pages (app/)"]
        HomeScreen["Home Screen<br/>(tabs/index.tsx)<br/>Main UI:<br/>- Items list<br/>- Categories<br/>- Stats<br/>- Edit modal"]

        ExploreScreen["Explore Screen<br/>(tabs/explore.tsx)<br/>Add item UI:<br/>- Photo picker<br/>- Form inputs<br/>- Save button"]

        TabsLayout["Tabs Layout<br/>(tabs/_layout.tsx)<br/>Bottom tab nav<br/>configuration"]

        RootLayout["Root Layout<br/>(_layout.tsx)<br/>Theme provider<br/>Stack navigator"]

        ModalTemplate["Modal Template<br/>(modal.tsx)<br/>Unused template"]
    end

    UI --> Functional
    Hooks --> Pages
    Constants --> Hooks
    Functional --> Pages

    HomeScreen -->|uses| HapticTab
    HomeScreen -->|uses| ThemedText
    HomeScreen -->|uses| ThemedView
    HomeScreen -->|uses| IconSymbol
    HomeScreen -->|uses| ParallaxScroll

    ExploreScreen -->|uses| ThemedText
    ExploreScreen -->|uses| ThemedView
    ExploreScreen -->|uses| ExternalLink

    TabsLayout -->|uses| HapticTab
    TabsLayout -->|uses| IconSymbol

    RootLayout -->|uses| ColorScheme
    RootLayout -->|uses| ThemeColor
    RootLayout -->|uses| Theme

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class UI secondary
    class Functional secondary
    class Hooks primary
    class Pages action
```

## 7. Technology Stack & Dependencies

```mermaid
graph LR
    subgraph Core["🔧 Core Framework"]
        Expo["Expo 54.0.20"]
        React["React 19.1.0"]
        ReactNative["React Native 0.81.5"]
        ReactNativeWeb["React Native Web 0.21.0"]
    end

    subgraph Navigation["🗺️ Navigation"]
        ExpoRouter["Expo Router 6.0.13"]
        ReactNav["React Navigation 7.1.8"]
        BottomTabs["Bottom Tabs 7.4.0"]
        NavElements["Navigation Elements 2.6.3"]
    end

    subgraph UI["🎨 UI & Styling"]
        VectorIcons["Vector Icons 15.0.3"]
        Reanimated["Reanimated 4.1.1"]
        GestureHandler["Gesture Handler 2.28.0"]
        SafeArea["Safe Area Context 5.6.0"]
        Screens["Screens 4.16.0"]
    end

    subgraph Media["📸 Media & Storage"]
        ImagePicker["Image Picker 17.0.8"]
        Camera["Camera 17.0.8"]
        FileSystem["File System 19.0.17"]
        ImageComponent["Image Component 3.0.10"]
        AsyncStorage["Async Storage 2.2.0"]
    end

    subgraph Device["📱 Device Features"]
        Haptics["Haptics 15.0.7"]
        StatusBar["Status Bar 3.0.8"]
        Constants["Constants 18.0.10"]
        Font["Font 14.0.9"]
        WebBrowser["Web Browser 15.0.8"]
        Linking["Linking 8.0.8"]
    end

    subgraph Dev["🛠️ Development"]
        TypeScript["TypeScript 5.9.2"]
        ReactTypes["React Types 19.1.0"]
        ESLint["ESLint 9.25.0"]
        ExpoESLint["Expo ESLint Config 10.0.0"]
    end

    Core --> Navigation
    Core --> UI
    Core --> Media
    Core --> Device
    Core --> Dev

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;

    class Core primary
    class Navigation primary
    class UI secondary
    class Media secondary
    class Device secondary
```

## 8. File Structure Hierarchy

```
stashsnap/
├── 📱 app/                    [Expo Router Pages & Routes]
│   ├── _layout.tsx            Root layout with theme & navigation
│   ├── modal.tsx              Modal template (unused)
│   └── (tabs)/                Tab-based navigation group
│       ├── _layout.tsx        Tab navigator configuration
│       ├── index.tsx          Home screen
│       └── explore.tsx        Add item screen
│
├── 🎨 components/             [Reusable UI Components]
│   ├── ui/
│   │   ├── icon-symbol.tsx    Icon abstraction layer
│   │   ├── icon-symbol.ios.tsx iOS icon implementation
│   │   └── collapsible.tsx    Collapsible component
│   ├── haptic-tab.tsx         Tab button with haptics
│   ├── themed-text.tsx        Theme-aware text
│   ├── themed-view.tsx        Theme-aware view
│   ├── external-link.tsx      External link handler
│   ├── parallax-scroll-view.tsx Animated scroll
│   └── hello-wave.tsx         Greeting animation
│
├── 🪝 hooks/                   [Custom React Hooks]
│   ├── use-color-scheme.ts    Color scheme detection
│   ├── use-color-scheme.web.ts Web color scheme
│   └── use-theme-color.ts     Theme color resolver
│
├── 📋 constants/               [App Constants]
│   └── theme.ts               Colors, fonts, design tokens
│
├── 🖼️ assets/                   [Static Assets]
│   ├── images/                App icons, splash screens
│   ├── icon.png               App icon
│   └── favicon.png            Web favicon
│
├── 🔧 scripts/                 [Build Scripts]
│   └── reset-project.js       Reset to template
│
├── 📄 Configuration Files
│   ├── package.json           Dependencies, scripts
│   ├── tsconfig.json          TypeScript configuration
│   ├── app.json               Expo app configuration
│   ├── expo-env.d.ts          Expo type definitions
│   ├── eslint.config.js       ESLint rules
│   └── .gitignore             Git ignore rules
│
├── 🔌 Expo Configuration
│   └── .expo/                 Expo build & cache
│
├── 📚 research/               [Documentation]
│   └── architecture.md        This file
│
├── 💻 IDE Configuration
│   ├── .vscode/               VS Code settings
│   └── .claude/               Claude AI settings
│
└── 📊 Version Control
    └── .git/                  Git repository
```

## 9. Data Models

```mermaid
graph TB
    subgraph ItemModel["📦 Item Model"]
        ItemInterface["interface Item {<br/>  id: string<br/>  title: string<br/>  category: string<br/>  location: string<br/>  photoUri?: string<br/>  value?: number<br/>  createdAt: number<br/>}"]

        ItemDescription["Description:<br/>- id: Timestamp-based unique identifier<br/>- title: Item name/description<br/>- category: Reference to category name<br/>- location: Where item is stored<br/>- photoUri: File path to saved photo<br/>- value: Estimated monetary value<br/>- createdAt: Creation timestamp (ms)"]
    end

    subgraph CategoryModel["🏷️ Category Model"]
        CategoryInterface["interface Category {<br/>  name: string<br/>  icon: string<br/>  color: string<br/>}"]

        CategoryDescription["Description:<br/>- name: Category identifier<br/>- icon: Emoji icon (e.g., '📚')<br/>- color: Hex color code (#RRGGBB)<br/><br/>Predefined Categories:<br/>- Electronics (⚡)<br/>- Documents (📄)<br/>- Clothing (👔)<br/>- Sports (⚽)<br/>- Tools (🔧)<br/>- Books (📚)<br/>- Food (🍕)<br/>- Toys (🧩)<br/>- Home (🏠)<br/>- Other (📦)"]
    end

    subgraph Storage["💾 Storage Structure"]
        ItemsKey["AsyncStorage Key:<br/>stashsnap_items<br/><br/>Value: JSON Array<br/>JSON.stringify(Item[])"]

        CategoriesKey["AsyncStorage Key:<br/>stashsnap_categories<br/><br/>Value: JSON Array<br/>JSON.stringify(Category[])"]

        PhotoStorage["File System Storage:<br/>Location:<br/>DocumentDirectory/<br/>stashsnap_photos/<br/>{timestamp}.jpg"]
    end

    ItemInterface -->|implements| ItemDescription
    CategoryInterface -->|implements| CategoryDescription

    ItemDescription -->|serialized to| ItemsKey
    CategoryDescription -->|serialized to| CategoriesKey

    ItemDescription -->|references| PhotoStorage

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class ItemModel primary
    class CategoryModel primary
    class Storage secondary
```

## 10. API & Storage Operations

```mermaid
graph TB
    subgraph LocalOps["💾 AsyncStorage Operations"]
        GetItems["GET Items<br/>AsyncStorage.getItem<br/>('stashsnap_items')<br/>Returns: Item[]"]

        SetItems["POST/PUT Items<br/>AsyncStorage.setItem<br/>('stashsnap_items',<br/>JSON.stringify(items))<br/>Returns: void"]

        RemoveItems["DELETE Item<br/>AsyncStorage.removeItem<br/>('stashsnap_items')<br/>Returns: void"]

        GetCategories["GET Categories<br/>AsyncStorage.getItem<br/>('stashsnap_categories')<br/>Returns: Category[]"]

        SetCategories["POST/PUT Categories<br/>AsyncStorage.setItem<br/>('stashsnap_categories',<br/>JSON.stringify(categories))<br/>Returns: void"]

        ClearAll["DELETE All<br/>AsyncStorage.clear()<br/>Clears all app data<br/>Returns: void"]
    end

    subgraph FileOps["📂 File System Operations"]
        CopyPhoto["SAVE Photo<br/>FileSystem.copyAsync({<br/>  from: source,<br/>  to: dest<br/>})<br/>Returns: void"]

        ReadDir["LIST Directory<br/>FileSystem.readDirectoryAsync<br/>('stashsnap_photos/')<br/>Returns: File[]"]

        DeletePhoto["DELETE Photo<br/>FileSystem.deleteAsync<br/>(photoPath)<br/>Returns: void"]
    end

    subgraph ImageOps["📸 Image Picker Operations"]
        LaunchCamera["CAPTURE Photo<br/>ImagePicker.launchCameraAsync({<br/>  mediaTypes: Images,<br/>  allowsEditing: true<br/>})<br/>Returns: ImagePickerResult"]

        LaunchGallery["SELECT Photo<br/>ImagePicker.launchImageLibraryAsync({<br/>  mediaTypes: Images<br/>})<br/>Returns: ImagePickerResult"]
    end

    GetItems -->|read| HomeScreen["Home Screen"]
    SetItems -->|write| HomeScreen
    RemoveItems -->|delete| HomeScreen

    GetCategories -->|read| HomeScreen
    SetCategories -->|write| HomeScreen

    ClearAll -->|nuclear option| HomeScreen

    LaunchCamera -->|capture| CopyPhoto
    LaunchGallery -->|select| CopyPhoto

    CopyPhoto -->|save to| ReadDir
    DeletePhoto -->|remove from| ReadDir

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class LocalOps secondary
    class FileOps secondary
    class ImageOps action
```

## 11. Theme System

```mermaid
graph TB
    subgraph ThemeDetection["🎨 Theme Detection"]
        OSTheme["OS Theme Setting<br/>Device Light/Dark<br/>Preference"]

        UseColorScheme["useColorScheme() Hook<br/>React Native native<br/>implementation"]

        ThemeValue["Theme Value:<br/>'light' | 'dark'<br/>| null"]
    end

    subgraph ThemeResolution["🎨 Theme Resolution"]
        ThemeConstants["theme.ts Constants<br/>Light & Dark color<br/>definitions"]

        UseThemeColor["useThemeColor() Hook<br/>Resolves colors<br/>based on theme"]

        ResolvedColors["Resolved Colors:<br/>text, background,<br/>tint, icon, tabBar,<br/>etc."]
    end

    subgraph ComponentUsage["🎨 Component Usage"]
        ThemedText["ThemedText Component<br/>Uses resolved colors<br/>color={useThemeColor()}"]

        ThemedView["ThemedView Component<br/>Uses resolved colors<br/>backgroundColor={useThemeColor()}"]

        OtherComponents["Other Components<br/>use StyleSheet with<br/>theme-aware colors"]
    end

    OSTheme --> UseColorScheme
    UseColorScheme --> ThemeValue

    ThemeValue --> ThemeResolution
    ThemeConstants --> UseThemeColor
    UseThemeColor --> ResolvedColors

    ResolvedColors --> ComponentUsage
    ResolvedColors --> ThemedText
    ResolvedColors --> ThemedView
    ResolvedColors --> OtherComponents

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;

    class ThemeDetection primary
    class ThemeResolution primary
    class ComponentUsage action
```

## 12. Build & Deployment Architecture

```mermaid
graph LR
    subgraph Source["📝 Source Code"]
        TSCode["TypeScript Code<br/>app/, components/,<br/>hooks/, constants/"]

        Config["Configuration<br/>package.json<br/>tsconfig.json<br/>app.json<br/>eslint.config.js"]
    end

    subgraph Build["🔨 Build Process"]
        ESLint["ESLint Linting<br/>Code quality check"]

        TSCompile["TypeScript Compile<br/>Type checking<br/>JS transpilation"]

        Metro["Metro Bundler<br/>Bundle JS code<br/>Transform modules"]

        Optimization["Optimization<br/>Code minification<br/>Tree shaking<br/>Asset optimization"]
    end

    subgraph Platforms["📱 Platform Builds"]
        iOS["iOS Build<br/>expo-cli build:ios<br/>Using Xcode<br/>Produces .ipa"]

        Android["Android Build<br/>expo-cli build:android<br/>Using Gradle<br/>Produces .apk/.aab"]

        Web["Web Build<br/>expo-cli build:web<br/>Static HTML/CSS/JS<br/>Produces dist/"]
    end

    subgraph Deploy["🚀 Deployment"]
        AppStore["Apple App Store<br/>Upload .ipa<br/>App Store Connect"]

        PlayStore["Google Play Store<br/>Upload .aab<br/>Google Play Console"]

        WebHost["Web Hosting<br/>Upload dist/"]
    end

    TSCode --> ESLint
    Config --> TSCompile
    ESLint --> TSCompile

    TSCompile --> Metro
    Metro --> Optimization

    Optimization -->|native| iOS
    Optimization -->|native| Android
    Optimization -->|web| Web

    iOS --> AppStore
    Android --> PlayStore
    Web --> WebHost

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class Source primary
    class Build secondary
    class Platforms action
    class Deploy action
```

## 13. Key Features Flow

```mermaid
graph TB
    subgraph ViewItems["👁️ View Items Feature"]
        VLoad["Load items from<br/>AsyncStorage"]
        VFilter["Filter by selected<br/>category"]
        VDisplay["Display in list<br/>with images"]
        VModal["Tap to view<br/>details/edit"]
    end

    subgraph AddItems["➕ Add Items Feature"]
        APhoto["Capture or select<br/>photo"]
        AForm["Fill in details:<br/>title, category,<br/>location, value"]
        AValidate["Validate input"]
        ASave["Save to AsyncStorage<br/>+ File System"]
    end

    subgraph EditDelete["✏️ Edit/Delete Items"]
        EOpen["Open item modal"]
        EEdit["Modify fields"]
        EDelete["Or delete item"]
        ESave["Save or delete<br/>from storage"]
    end

    subgraph Categories["🏷️ Category Management"]
        CView["View available<br/>categories"]
        CCreate["Add custom<br/>category"]
        CDelete["Delete custom<br/>category"]
    end

    subgraph Stats["📊 Statistics"]
        SCount["Total items count"]
        SValue["Total value<br/>estimate"]
        SCategory["Items by<br/>category"]
    end

    subgraph Landing["🎯 Landing Page"]
        LHero["Hero section<br/>with CTA"]
        LProblems["Problem showcase<br/>3 cards"]
        LFeatures["Features<br/>showcase"]
        LCalls["Call-to-action<br/>buttons"]
    end

    VLoad --> VFilter --> VDisplay --> VModal
    APhoto --> AForm --> AValidate --> ASave
    EOpen --> EEdit --> ESave
    EOpen --> EDelete --> ESave
    CView --> CCreate
    CView --> CDelete

    VDisplay --> Stats
    APhoto --> Stats
    EEdit --> Stats

    VLoad --> Landing
    Landing --> LHero --> LProblems --> LFeatures --> LCalls

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class ViewItems action
    class AddItems action
    class EditDelete action
    class Categories action
    class Stats action
    class Landing secondary
```

## 14. Development Workflow

```mermaid
graph TB
    subgraph DevSetup["⚙️ Development Setup"]
        Install["npm install<br/>Install dependencies"]
        TSConfig["TypeScript<br/>Configuration ready"]
        PathAlias["Path aliases<br/>@/* configured"]
    end

    subgraph DevEnv["🔧 Development Environment"]
        ExpoStart["npm start<br/>Start Expo dev server"]
        MetroWatcher["Metro bundler<br/>watches files"]
        HotReload["Hot reload<br/>on save"]
    end

    subgraph Testing["🧪 Testing Devices"]
        PhysicaliOS["Physical iOS<br/>device via Expo Go"]
        PhysicalAndroid["Physical Android<br/>device via Expo Go"]
        WebBrowser["Web browser<br/>localhost:19006"]
        Simulator["iOS/Android<br/>simulator/emulator"]
    end

    subgraph CodeQuality["✅ Code Quality"]
        Lint["npm run lint<br/>ESLint check"]
        TypeCheck["TypeScript<br/>type checking"]
        Format["Code formatting<br/>consistency"]
    end

    subgraph Build["🏗️ Building"]
        LocalBuild["Local build<br/>for testing"]
        ProductionBuild["Production build<br/>for deployment"]
        EASBuild["EAS cloud build<br/>recommended"]
    end

    subgraph Debug["🐛 Debugging"]
        Logs["Console logs<br/>Metro output"]
        Inspector["React DevTools<br/>Component inspection"]
        Network["Network requests<br/>inspection"]
    end

    Install --> DevSetup
    TSConfig --> DevSetup
    PathAlias --> DevSetup

    DevSetup --> ExpoStart
    ExpoStart --> MetroWatcher
    MetroWatcher --> HotReload

    HotReload --> Testing

    Testing --> PhysicaliOS
    Testing --> PhysicalAndroid
    Testing --> WebBrowser
    Testing --> Simulator

    Testing --> Lint
    Lint --> TypeCheck
    TypeCheck --> CodeQuality

    CodeQuality --> LocalBuild
    LocalBuild --> ProductionBuild

    ProductionBuild --> EASBuild

    Testing --> Debug

    classDef default fill:#FFF8E1,stroke:#333,stroke-width:2px,color:#333;
    classDef primary fill:#00BFA5,stroke:#00897B,stroke-width:2px,color:#fff;
    classDef secondary fill:#FF7043,stroke:#E64A19,stroke-width:2px,color:#fff;
    classDef action fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#333;

    class DevSetup primary
    class DevEnv primary
    class Testing action
    class CodeQuality action
    class Build action
    class Debug secondary
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Project Type** | Cross-platform mobile app (iOS/Android/Web) |
| **Framework Stack** | Expo + React Native + React |
| **Language** | TypeScript |
| **State Management** | React Hooks + AsyncStorage |
| **Navigation** | Expo Router (file-based routing) |
| **Backend** | None (fully client-side) |
| **Database** | AsyncStorage (local device storage) |
| **Authentication** | None |
| **Styling** | React Native StyleSheet + Theme system |
| **Animation** | React Native Reanimated + Gesture Animations |
| **Media** | Expo Image Picker + Camera + File System |
| **Testing** | Not configured |
| **Build System** | Expo EAS (cloud) or local Expo CLI |
| **Main Features** | Item catalog, photo capture, categorization, local storage, statistics |
| **Key Dependencies** | 30+ Expo & React Native modules |
| **Code Quality** | TypeScript strict mode + ESLint |
| **Entry Points** | iOS: Xcode, Android: Android Studio, Web: Browser |

---

## Key Architectural Principles

1. **Client-First Architecture**: All data stored locally on device
2. **Expo-First Approach**: Leverages Expo ecosystem for rapid development
3. **Theme-Aware Design**: Responsive to OS light/dark mode preferences
4. **File-Based Routing**: Expo Router for intuitive navigation structure
5. **Minimal Dependencies**: Focus on core Expo and React Native modules
6. **Cross-Platform Support**: Single codebase runs on iOS, Android, and Web
7. **Type Safety**: Full TypeScript implementation with strict mode
8. **Responsive UI**: Flexbox layouts that adapt to different screen sizes

---

**Generated:** 2026-01-20
**Document Version:** 1.0
**Architecture Analysis Tool:** Comprehensive Codebase Explorer
