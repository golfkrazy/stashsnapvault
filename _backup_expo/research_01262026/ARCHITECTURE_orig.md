# StashSnap Architecture Diagram

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Mobile Application Layer"
        Root["Root Layout<br/>(Theme Provider)"]
        Nav["Expo Router Navigation<br/>(File-based routing)"]

        subgraph "Tab Navigation"
            Home["Home Screen<br/>(Item Management)"]
            Explore["Explore Screen<br/>(Add Items)"]
        end
    end

    subgraph "UI Components Layer"
        Theme["Theme System<br/>(Dark/Light Mode)"]
        Hooks["Custom Hooks<br/>(useColorScheme, useThemeColor)"]
        Components["Reusable Components<br/>(ThemedText, ThemedView, etc.)"]
        Icons["Icon System<br/>(IconSymbol)"]
    end

    subgraph "Feature Modules"
        ItemMgmt["Item Management<br/>(CRUD Operations)"]
        CatMgmt["Category Management<br/>(Create/Delete/Filter)"]
        PhotoMgmt["Photo Management<br/>(Camera/Library/Storage)"]
        Stats["Statistics Engine<br/>(Total items/value)"]
    end

    subgraph "Data Persistence Layer"
        AsyncStorage["AsyncStorage<br/>(Metadata)"]
        FileSystem["File System<br/>(Photos)"]
        LocalDB["Local Data Store<br/>(JSON Serialized)"]
    end

    subgraph "Native APIs & Services"
        ImagePicker["expo-image-picker<br/>(Camera/Gallery)"]
        Haptics["expo-haptics<br/>(iOS Feedback)"]
        NavAPI["React Navigation<br/>(Navigation Logic)"]
        VectorIcons["@expo/vector-icons<br/>(Icon Sets)"]
    end

    Root --> Nav
    Nav --> Home
    Nav --> Explore

    Home --> Theme
    Explore --> Theme

    Theme --> Hooks
    Hooks --> Components
    Components --> Icons

    Home --> ItemMgmt
    Home --> CatMgmt
    Home --> Stats

    Explore --> PhotoMgmt
    Explore --> CatMgmt
    Explore --> ItemMgmt

    ItemMgmt --> AsyncStorage
    CatMgmt --> AsyncStorage
    PhotoMgmt --> FileSystem

    AsyncStorage --> LocalDB
    FileSystem --> LocalDB

    PhotoMgmt --> ImagePicker
    Home --> Haptics
    Nav --> NavAPI
    Components --> VectorIcons
```

---

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        HomeUI["Home Screen UI<br/>590 lines"]
        ExploreUI["Explore Screen UI<br/>404 lines"]
        ModalUI["Modal Overlay"]
    end

    subgraph "Business Logic Layer"
        ItemLogic["Item Logic<br/>(add, edit, delete)"]
        CatLogic["Category Logic<br/>(create, filter)"]
        PhotoLogic["Photo Logic<br/>(capture, store, preview)"]
    end

    subgraph "State Management"
        UseState["useState Hooks<br/>(items[], categories[])"]
        AsyncStorage["AsyncStorage<br/>(Persistence)"]
    end

    subgraph "Data Models"
        Item["Item Interface<br/>{title, category, location, value, photo, date}"]
        Category["Category Interface<br/>{id, name, emoji, color}"]
    end

    HomeUI --> ItemLogic
    HomeUI --> CatLogic
    ExploreUI --> PhotoLogic
    ExploreUI --> ItemLogic
    ExploreUI --> CatLogic

    ItemLogic --> UseState
    CatLogic --> UseState
    PhotoLogic --> UseState

    UseState --> AsyncStorage

    ItemLogic --> Item
    CatLogic --> Category
```

---

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant State as React State
    participant AsyncStorage
    participant FileSystem

    User->>UI: Add Item with Photo
    UI->>FileSystem: Save Photo
    FileSystem-->>UI: Photo URI
    UI->>State: Update useState
    State->>AsyncStorage: Persist Items & Categories
    AsyncStorage-->>State: Data Saved
    State->>UI: Render Updated List

    User->>UI: Edit Item
    UI->>State: Update useState
    State->>AsyncStorage: Persist Changes
    AsyncStorage-->>State: Data Updated
    State->>UI: Render Updated Item

    User->>UI: Delete Item
    UI->>State: Remove from useState
    State->>AsyncStorage: Persist Deletion
    AsyncStorage-->>State: Data Removed
    State->>UI: Render Updated List
```

---

## Technology Stack & Dependencies

```mermaid
graph TB
    RN["React Native 0.81.5"]
    Expo["Expo 54.0.20"]
    TS["TypeScript 5.9.2"]

    RN --> Router["Expo Router 6.0.13"]
    RN --> Nav["React Navigation"]
    RN --> AsyncStor["@react-native-async-storage"]

    Expo --> ImagePicker["expo-image-picker"]
    Expo --> FileSystem["expo-file-system"]
    Expo --> Haptics["expo-haptics"]
    Expo --> VectorIcons["@expo/vector-icons"]

    TS --> All["All TypeScript Components"]

    Router --> Home["Home Screen"]
    Router --> Explore["Explore Screen"]
```

---

## Key Features & Modules

```mermaid
graph TB
    StashSnap["StashSnap App"]

    StashSnap --> Feature1["Item Management"]
    Feature1 --> F1A["Create Items"]
    Feature1 --> F1B["Edit Items"]
    Feature1 --> F1C["Delete Items"]
    Feature1 --> F1D["View Items"]

    StashSnap --> Feature2["Category System"]
    Feature2 --> F2A["Create Categories"]
    Feature2 --> F2B["Delete Categories"]
    Feature2 --> F2C["Filter by Category"]
    Feature2 --> F2D["Category Stats"]

    StashSnap --> Feature3["Photo Management"]
    Feature3 --> F3A["Camera Capture"]
    Feature3 --> F3B["Gallery Selection"]
    Feature3 --> F3C["Photo Preview"]
    Feature3 --> F3D["Photo Persistence"]

    StashSnap --> Feature4["Data Persistence"]
    Feature4 --> F4A["AsyncStorage"]
    Feature4 --> F4B["File System"]
    Feature4 --> F4C["JSON Serialization"]

    StashSnap --> Feature5["Theme & UI"]
    Feature5 --> F5A["Dark Mode"]
    Feature5 --> F5B["Light Mode"]
    Feature5 --> F5C["Auto Theme Detection"]
    Feature5 --> F5D["Platform Optimization"]
```

---

## Architecture Summary

**Type:** React Native Mobile Application
**Pattern:** Component-Based Architecture with File-Based Routing
**State Management:** React Hooks + AsyncStorage
**Data Persistence:** Local-First (No Backend)
**UI Framework:** Expo with Themed Components
**Platform Support:** iOS & Android (via Expo)

**Core Characteristics:**
- ✅ Modular component structure
- ✅ Clear separation of concerns
- ✅ Platform-specific optimizations
- ✅ Dark/Light theme support
- ✅ Photo storage capability
- ✅ Category-based organization
- ✅ Offline-first functionality
