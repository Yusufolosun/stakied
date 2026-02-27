# Stakied Frontend Guide

This guide documents the design system, component architecture, and integration patterns used in the Stakied premium web interface.

## 🎨 Design System: Glassmorphism

Stakied uses a custom-built **Glassmorphism** design system that prioritizes multi-layered depth, vibrant neon accents, and smooth interactive micro-animations.

### Core Visual Tokens
- **Background**: `Deep Space` (#030712) - A near-black foundation for maximum contrast.
- **Accents**: 
    - `Electric Violet` (#8B5CF6) - Primary brand color.
    - `Cyan Glow` (#06B6D4) - Secondary interactive accents.
- **Surface**: `Glass Panel` - Semi-transparent white/blue with `backdrop-filter: blur(12px)`.

### Typography
- **Headings**: `Outfit` - A high-tech sans-serif for a premium feel.
- **Body**: `Inter` - Standard for clarity and readability in complex data views.

---

## 🏗️ Component Library

All components are located in `src/components/common/`.

### 1. `Button.tsx`
The primary interaction element with weighted variants.
- **Props**: `variant` ("primary", "secondary", "glass"), `size`, `isLoading`.
- **Feature**: Integrated shadow glows and hover-lift animations.

### 2. `Card.tsx`
The fundamental container for protocol modules.
- **Props**: `title`, `variant` ("glass", "solid"), `interactive`.
- **Feature**: Animated entrance (`stagger-1..4`) and depth-simulating borders.

### 3. `GradientText.tsx`
Brand-reinforcement utility for headings and key metrics.
- **Feature**: Uses `bg-clip-text` for smooth Electric-to-Cyan transitions.

---

## ⚡ Blockchain Integration

### Wallet Authentication
Managed via the `WalletContext.tsx` using `@stacks/connect`.
- **Pattern**: Provide state (`address`, `userSession`) and actions (`signIn`, `signOut`) globally.
- **Support**: Xverse, Hiro, and Leather wallets are supported out-of-the-box.

### Interaction Hooks
To ensure clean separation of concerns, all contract calls are abstracted into specialized hooks:
- `useSYToken`: Logic for SY wrapping/unwrapping.
- `usePTYT`: Minting and redemption engine.
- `useSwap`: AMM trading interface.
- `usePool`: Staking and rewards management.
- `useTransaction`: A unified wrapper for Stacks contract calls with loading/error states.

---

## 🛠️ Development Standards

### Styling
- **Utility-First**: Powered by Tailwind CSS for rapid layouting.
- **Theming**: Core variables are centralized in `src/styles/theme.css`.
- **Animations**: Custom keyframes (reveal, slide-in) are defined in `src/styles/animations.css`.

### Contribution Flow
1. **Components**: All new UI elements must be atomic and reusable.
2. **Icons**: Use Emoji or Lucide-React for consistent iconography.
3. **Responsive**: Every view must be verified for mobile-resilience (`max-w-xl` to `max-w-7xl` containers).

---

**Last Updated**: February 27, 2026
