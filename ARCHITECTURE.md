# React Supabase Auth Template - Architecture Visualization

## High-Level Architecture

```mermaid
graph TB
    subgraph External["External Services"]
        Supabase["Supabase Backend<br/>(Authentication & DB)"]
    end

    subgraph App["React Application"]
        subgraph Entry["Entry Point"]
            HTML["index.html"]
            Main["main.tsx<br/>(React DOM Mount)"]
        end

        subgraph Router["Routing Layer"]
            BrowserRouter["React Router<br/>(createBrowserRouter)"]
            Routes["Route Config<br/>index.tsx"]
        end

        subgraph Providers["Provider Layer"]
            ProvidersComp["Providers.tsx<br/>(Layout Wrapper)"]
            SessionProv["SessionProvider<br/>(Auth Context)"]
        end

        subgraph Context["State Management"]
            SessionCtx["SessionContext.tsx<br/>- session state<br/>- useSession hook<br/>- auth listener"]
        end

        subgraph Config["Configuration"]
            SupabaseClient["supabase/index.ts<br/>(Singleton Client)"]
            AppConfig["config.ts<br/>(Env Validation)"]
        end

        subgraph RouteLayer["Route Protection Layer"]
            AuthProtRoute["AuthProtectedRoute.tsx<br/>(Route Guard)<br/>- Checks session<br/>- Guards /protected"]
        end

        subgraph Pages["Page Components"]
            Home["HomePage<br/>- useSession()<br/>- sign in/out"]
            SignIn["SignInPage<br/>- login form<br/>- useSession()"]
            SignUp["SignUpPage<br/>- register form<br/>- useSession()"]
            Protected["ProtectedPage<br/>- guarded route<br/>- show user email"]
            NotFound["NotFoundPage<br/>- 404 fallback"]
            Loading["LoadingPage<br/>- auth check"]
        end
    end

    HTML --> Main
    Main --> BrowserRouter
    BrowserRouter --> Routes
    Routes --> ProvidersComp
    ProvidersComp --> SessionProv
    SessionProv --> SessionCtx

    SessionCtx --> SupabaseClient
    SupabaseClient --> Supabase

    AppConfig --> SupabaseClient

    SessionCtx -.->|provides session| Home
    SessionCtx -.->|provides session| SignIn
    SessionCtx -.->|provides session| SignUp
    SessionCtx -.->|provides session| AuthProtRoute
    SessionCtx -.->|provides session| Protected

    AuthProtRoute --> Protected
    Routes --> Home
    Routes --> SignIn
    Routes --> SignUp
    Routes --> NotFound
    SessionProv -.->|loading state| Loading

    style External fill:#4f46e5
    style App fill:#e0e7ff
    style Pages fill:#fef3c7
```

---

## Component Hierarchy & Tree Structure

```mermaid
graph TD
    App["App<br/>(Router)"]

    subgraph Layout["Root Layout"]
        Providers["Providers"]
        SessionProvider["SessionProvider<br/>{session, loading}"]
    end

    subgraph Routes["Route Outlet"]
        Route1["/ - HomePage"]
        Route2["/auth/sign-in - SignInPage"]
        Route3["/auth/sign-up - SignUpPage"]
        Route4["AuthProtectedRoute"]
        Route5["* - NotFoundPage"]
    end

    subgraph Protected["Protected Routes"]
        Route6["/protected - ProtectedPage"]
    end

    subgraph Loading["Conditional"]
        LoadingPage["LoadingPage<br/>(during auth check)"]
    end

    App --> Providers
    Providers --> SessionProvider
    SessionProvider --> Route1
    SessionProvider --> Route2
    SessionProvider --> Route3
    SessionProvider --> Route4
    SessionProvider --> Route5
    SessionProvider --> LoadingPage
    Route4 --> Route6

    style App fill:#3b82f6
    style Layout fill:#8b5cf6
    style Routes fill:#06b6d4
    style Protected fill:#ef4444
    style Loading fill:#f59e0b
```

---

## Authentication Data Flow

```mermaid
graph LR
    subgraph User["User Interaction"]
        A["User visits app"]
        B["User logs in/signs up"]
        C["User accesses /protected"]
        D["User logs out"]
    end

    subgraph SupaAuth["Supabase Auth"]
        S1["onAuthStateChange<br/>listener active"]
        S2["signInWithPassword"]
        S3["signUp"]
        S4["signOut"]
    end

    subgraph Context["SessionContext"]
        C1["Loading state = true"]
        C2["session updated<br/>session = Session obj"]
        C3["session = null"]
    end

    subgraph Components["Components"]
        Comp1["SessionProvider<br/>checks auth"]
        Comp2["HomePage/SignIn/SignUp<br/>display UI"]
        Comp3["AuthProtectedRoute<br/>checks session"]
        Comp4["ProtectedPage<br/>renders if session"]
        Comp5["NotFoundPage<br/>renders if !session"]
    end

    A --> C1
    C1 --> Comp1
    Comp1 --> Comp2

    B --> S2 & S3
    S2 --> S1
    S3 --> S1
    S1 --> C2

    C2 --> Comp2
    C2 --> C --> Comp3
    Comp3 --> Comp4 | Comp5

    D --> S4
    S4 --> S1
    S1 --> C3
    C3 --> Comp2

    style SupaAuth fill:#3ecf8e
    style Context fill:#8b5cf6
    style Components fill:#f59e0b
```

---

## Routing Architecture with Auth Integration

```mermaid
graph TB
    Router["React Router<br/>(createBrowserRouter)"]

    subgraph RootRoute["Root Route: /"]
        Providers["Providers Layout"]
        SessionCtx["SessionContext<br/>- checks auth<br/>- provides session<br/>- handles loading"]
    end

    subgraph PublicRoutes["Public Routes"]
        Home["GET /"]
        SignIn["GET /auth/sign-in"]
        SignUp["GET /auth/sign-up"]
        NotFound["GET *"]
    end

    subgraph ProtectedRoutes["Protected Routes"]
        ProtRoute["AuthProtectedRoute<br/>- checks useSession<br/>- returns Outlet"]
        Protected["GET /protected"]
    end

    Router --> RootRoute
    RootRoute --> Providers
    Providers --> SessionCtx
    SessionCtx --> PublicRoutes
    SessionCtx --> ProtectedRoutes
    ProtRoute --> Protected

    subgraph RouteLogic["Route Logic"]
        L1["No session?<br/>show LoadingPage"]
        L2["Session exists?<br/>render page"]
        L3["Accessing /protected<br/>without session?<br/>show NotFoundPage"]
    end

    PublicRoutes --> L2
    ProtectedRoutes --> L1 & L3

    style Router fill:#3b82f6
    style RootRoute fill:#8b5cf6
    style PublicRoutes fill:#06b6d4
    style ProtectedRoutes fill:#ef4444
    style RouteLogic fill:#f59e0b
```

---

## Auth Integration Flow with Routing

```mermaid
sequenceDiagram
    participant User
    participant App as App Entry
    participant Router as React Router
    participant Provider as SessionProvider
    participant Context as SessionContext
    participant Supabase as Supabase
    participant Component as Route Component

    User->>App: 1. Load app
    App->>Router: 2. Initialize router
    Router->>Provider: 3. Mount Providers
    Provider->>Context: 4. Create SessionContext
    Context->>Supabase: 5. Listen: onAuthStateChange()

    alt Session exists
        Supabase->>Context: 6a. Emit current session
        Context->>Component: 7a. Provide useSession hook
        Component->>Component: 8a. Render with auth state
    else No session
        Supabase->>Context: 6b. Emit null session
        Context->>Component: 7b. Provide useSession hook
        Component->>Component: 8b. Render without auth state
    end

    User->>Component: 9. User logs in
    Component->>Supabase: 10. signInWithPassword()
    Supabase->>Supabase: 11. Validate credentials
    Supabase->>Context: 12. Trigger onAuthStateChange
    Context->>Context: 13. Update session state
    Context->>Component: 14. Re-render with new session

    User->>Component: 15. Access /protected
    Component->>Context: 16. useSession() in AuthProtectedRoute
    Context->>Component: 17. Has session? Render ProtectedPage
    Context->>Component: 18. No session? Render NotFoundPage

    User->>Component: 19. Click Sign Out
    Component->>Supabase: 20. signOut()
    Supabase->>Context: 21. Trigger onAuthStateChange
    Context->>Context: 22. Clear session (null)
    Context->>Component: 23. Re-render as logged out
```

---

## State Management Architecture

```mermaid
graph TB
    subgraph GlobalState["Global State (Context)"]
        SessionState["SessionContext<br/>├─ session: Session | null<br/>├─ loading: boolean<br/>└─ useSession hook"]
    end

    subgraph LocalState["Local State (Components)"]
        SignInState["SignInPage<br/>├─ formValues<br/>├─ status<br/>└─ error"]
        SignUpState["SignUpPage<br/>├─ formValues<br/>├─ status<br/>└─ error"]
        HomeState["HomePage<br/>└─ no local state"]
    end

    subgraph DataFlow["Data Flow"]
        D1["User input → setState"]
        D2["Form submit → Supabase API"]
        D3["API response → trigger onAuthStateChange"]
        D4["onAuthStateChange → SessionContext update"]
        D5["SessionContext update → Component re-render"]
    end

    SessionState -.->|provide session| SignInState
    SessionState -.->|provide session| SignUpState
    SessionState -.->|provide session| HomeState

    SignInState --> D1
    SignUpState --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> D5

    style GlobalState fill:#8b5cf6
    style LocalState fill:#06b6d4
    style DataFlow fill:#f59e0b
```

---

## Configuration & Initialization

```mermaid
graph LR
    Env[".env.example<br/>VITE_SUPABASE_URL<br/>VITE_SUPABASE_ANON_KEY"]

    ConfigFile["config.ts<br/>- Read VITE_* vars<br/>- Validate presence<br/>- Export constants"]

    SupabaseInit["supabase/index.ts<br/>- createClient()<br/>- Singleton instance<br/>- Export for app"]

    Usage["Components<br/>- import supabase<br/>- Call auth methods"]

    Env -->|import.meta.env| ConfigFile
    ConfigFile -->|SUPABASE_URL<br/>SUPABASE_ANON_KEY| SupabaseInit
    SupabaseInit --> Usage

    style Env fill:#f59e0b
    style ConfigFile fill:#8b5cf6
    style SupabaseInit fill:#3ecf8e
    style Usage fill:#06b6d4
```

---

## File Structure & Responsibilities

```mermaid
graph TB
    Root["E2E Project Root"]

    subgraph SrcDir["src/"]
        Main["main.tsx<br/>(Entry point)"]
        Providers["Providers.tsx<br/>(Layout wrapper)"]

        Router["router/<br/>├─ index.tsx (routes)<br/>└─ AuthProtectedRoute.tsx"]

        Context["context/<br/>└─ SessionContext.tsx<br/>(auth state & hook)"]

        Supabase["supabase/<br/>└─ index.ts<br/>(client singleton)"]

        Config["config.ts<br/>(env validation)"]

        Pages["pages/<br/>├─ HomePage.tsx<br/>├─ auth/<br/>│  ├─ SignInPage.tsx<br/>│  └─ SignUpPage.tsx<br/>├─ ProtectedPage.tsx<br/>├─ LoadingPage.tsx<br/>└─ 404Page.tsx"]

        Styles["index.css<br/>(global styles)"]
    end

    Config["tsconfig.json<br/>eslintrc.cjs<br/>vite.config.ts"]

    Root --> SrcDir
    Root --> Config
    SrcDir --> Main
    SrcDir --> Providers
    SrcDir --> Router
    SrcDir --> Context
    SrcDir --> Supabase
    SrcDir --> Config
    SrcDir --> Pages
    SrcDir --> Styles

    style SrcDir fill:#e0e7ff
    style Router fill:#3b82f6
    style Context fill:#8b5cf6
    style Supabase fill:#3ecf8e
    style Pages fill:#f59e0b
```

---

## Summary

This React Supabase Auth Template demonstrates a **clean, modern architecture** with:

- **Layered Architecture**: Separation of routing, state management, UI
- **Authentication-First Design**: Session context drives app behavior
- **Type-Safe**: Full TypeScript implementation
- **Protected Routes**: Auth-aware routing with AuthProtectedRoute
- **Context-Based State**: Minimal, effective state management
- **Modular Organization**: Clear file structure and responsibilities
- **Supabase Integration**: Backend-agnostic auth through SDK

The key innovation is how authentication seamlessly integrates with React Router through the SessionContext provider pattern, enabling declarative route protection and automatic auth-based UI rendering.
