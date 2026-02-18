# AI Mastery Guide - StashSnap Vault

This guide documents the "Intelligence" layer of StashSnap Vault, specifically focusing on the AI Semantic Search and planned chatbot features.

---

## 🧠 AI Semantic Search (Restored)

The core AI feature is **Meaning-Based Retrieval**, allowing users to find items without knowing the exact title or location.

### Implementation Details:
- **Model:** `supa-embeddings-v2` (provided by Supabase).
- **Service:** `src/services/semanticSearch.ts`.
- **Logic:**
    - Generates a vector embedding for user queries.
    - Performs cosine similarity matching against the `items` table.
    - Supports "Item", "Location", and "Category" discovery modes.
- **Thresholds:** 0.65 for Items, 0.50 for Locations/Categories.

### Admin Tools:
- **Global Re-index:** Located in the Admin Dashboard. Allows admins to force-regenerate embeddings for the entire vault system if the search model is updated.

---

## 🔮 Future Intelligence: The Vault Oracle

The next phase of AI development (Phase 08) focuses on natural language interaction.

### Planned Features:
- **Natural Language Analytics:** "How much is my jewelry worth in total?"
- **Historical Recaps:** "When did I last see the car title?"
- **Smart Placement Advice:** "Where is the best place to store my new passport?"

### Technology Stack:
- **Edge Functions:** Supabase Deno runtime.
- **LLM:** Integration with Anthropic/OpenAI via managed VPC.
- **Context:** RAG (Retrieval-Augmented Generation) using the existing item embeddings.

---
*Status: AI Search Verified ✅ | Vitest Framework Active ✅ | Trash & Recovery Live ✅ | Auth Professionalized ✅ | Chatbot Pending 🚧*
