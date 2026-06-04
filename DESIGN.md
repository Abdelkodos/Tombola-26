# Abrar Design System

> Visual identity guide for the Abrar product family.
> Extracted from the Tombola application — use as the canonical reference for all Abrar-branded projects.

---

## 1. Design Principles

| Principle | Description |
|---|---|
| **Luxury restraint** | Premium feel through whitespace, typography contrast, and muted metallics — never loud or flashy. |
| **Warm neutrals** | Cream-based palette with gold accents evokes trust and craftsmanship. |
| **Serif / Sans-serif pairing** | A decorative serif for display text paired with a geometric sans-serif for body creates a clear visual hierarchy. |
| **Subtle depth** | Soft shadows, noise textures, and translucent overlays add depth without visual clutter. |
| **Motion with purpose** | Animations are short (< 0.5 s), eased, and used only to reinforce state changes — never decorative loops. |

---

## 2. Color Palette

### 2.1 Core Colors

| Token | Hex | Role |
|---|---|---|
| `--cream` | `#F5F0E8` | Page background |
| `--cream-dark` | `#EDE7D9` | Hover/pressed background on cream surfaces |
| `--cream-mid` | `#E4DAC8` | Borders, dividers, subtle separators |
| `--white` | `#FDFBF7` | Card / elevated surface background |
| `--gold` | `#B8892A` | Primary accent — buttons, active indicators, highlights |
| `--gold-light` | `#D4A94A` | Hover state for gold elements |
| `--gold-muted` | `#C9A55A` | Secondary gold — icons, decorative accents, focus rings |
| `--charcoal` | `#2C2C2C` | Primary text, dark surface backgrounds (hero cards) |
| `--charcoal-mid` | `#4A4A4A` | Secondary text |
| `--charcoal-lt` | `#7A7068` | Tertiary text, labels, placeholders |

### 2.2 Semantic Colors

| Token | Hex | Background | Use |
|---|---|---|---|
| `--danger` | `#8B2A2A` | `--danger-bg` `#F5ECEC` | Destructive actions, error states |
| `--success` | `#2A5A3A` | `--success-bg` `#ECF3EE` | Positive counts, confirmation states |

### 2.3 Accent Surfaces

| Surface | Background | Border |
|---|---|---|
| Gold highlight | `#FBF4E5` | `rgba(184,137,42,0.25)` |
| Gold hover | `#FBF7F0` | `var(--gold-muted)` |

### 2.4 Usage Rules

- **Never use pure white** (`#FFFFFF`). Use `--white` (`#FDFBF7`) for surfaces and `--cream` for backgrounds.
- **Never use pure black** (`#000000`). Darkest value is `--charcoal` (`#2C2C2C`).
- Gold is reserved for **primary actions and emphasis only** — do not use gold for informational or neutral elements.
- Dark surfaces (`--charcoal` background) are reserved for **hero/spotlight areas** (e.g., winner reveal cards). Text on dark surfaces uses `--cream` and `--cream-mid`.

---

## 3. Typography

### 3.1 Font Families

| Token | Family | Fallback Stack | Role |
|---|---|---|---|
| `--font-display` | **Cormorant Garamond** | `Georgia, serif` | Headings, hero text, card titles, decorative labels |
| `--font-body` | **Jost** | `'Helvetica Neue', sans-serif` | Body text, buttons, inputs, UI labels |

**Google Fonts import:**
```
Cormorant Garamond: 300, 400, 600 (roman + italic)
Jost: 300, 400, 500, 600
```

### 3.2 Type Scale

| Element | Family | Size | Weight | Style | Letter-spacing | Extras |
|---|---|---|---|---|---|---|
| Page heading (`h1`) | Display | `3rem` | 300 | Roman | `-0.01em` | Line-height `1.05` |
| Page heading emphasis (`h1 em`) | Display | inherit | inherit | Italic | inherit | Color: `--gold` |
| Card title | Display | `1.3rem` | 400 | Roman | `0.01em` | Gold bar `::before` (3px wide, 18px tall) |
| Section subtitle | Body | `0.85rem` | 300 | Roman | `0.06em` | Uppercase, color: `--charcoal-lt` |
| Body text | Body | `0.88rem` | 300 | Roman | `0.01em` | — |
| Button label | Body | `0.82rem` | 500 | Roman | `0.07em` | Uppercase |
| Ghost button | Body | `0.75rem` | 500 | Roman | `0.07em` | Uppercase |
| Hero button | Display | `1.4rem` | 400 | Italic | `0.04em` | — |
| Badge / Count | Body | `0.75rem` | 500 | Roman | `0.08em` | Uppercase |
| Table header | Body | `0.72rem` | 500 | Roman | `0.12em` | Uppercase, color: `--charcoal-lt` |
| Table cell | Body | `0.88rem` | 300 | Roman | — | Color: `--charcoal-mid` |
| Small label / eyebrow | Body | `0.72rem` | 500 | Roman | `0.2em` | Uppercase |
| Logo label | Display | `1.05rem` | 400 | Italic | `0.12em` | Uppercase |

### 3.3 Typography Rules

- **Emphasis pattern:** In headings, wrap the key word in `<em>` — styled as gold italic via the display font.
- **No bold body text.** Maximum weight for body font is `600` and is reserved for names/primary data in tables.
- **Uppercase sparingly.** Only for: buttons, badges, eyebrow labels, table headers, navigation links, and subtitles.
- Base `font-weight` on `body` is `300` (light) — this keeps the luxury feel; heavier weights are used for contrast.

---

## 4. Spacing & Layout

### 4.1 Page Structure

| Property | Value |
|---|---|
| Max content width | `860px` |
| Horizontal padding | `1.5rem` (desktop), `1rem` (mobile) |
| Bottom padding | `4rem` (desktop), `3rem` (mobile) |
| Centering | `margin: 0 auto` |

### 4.2 Spacing Scale

| Context | Value |
|---|---|
| Header bottom margin | `3rem` |
| Page title bottom margin | `2.5rem` |
| Card bottom margin | `1.5rem` |
| Card internal padding | `2rem` |
| Section divider margin | `2rem` top/bottom |
| Gap between inline elements (buttons, tags) | `6px–8px` |
| Gap between stacked cards | `1rem–1.5rem` |

---

## 5. Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `4px` | Buttons, inputs, small elements |
| `--radius-md` | `8px` | Tables, draw button, medium containers |
| `--radius-lg` | `14px` | Cards, modal-like surfaces |
| `--radius-xl` | `22px` | Reserved for large decorative elements |
| `99px` (pill) | `99px` | Badges, tags, pills, toggle chips |

---

## 6. Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 2px 24px rgba(44,44,44,0.08), 0 1px 4px rgba(44,44,44,0.06)` | Cards, elevated surfaces |
| `--shadow-btn` | `0 4px 16px rgba(184,137,42,0.25)` | Primary button hover state |
| Hero button resting | `0 4px 20px rgba(44,44,44,0.18)` | Draw/launch button |
| Hover card | `0 8px 32px rgba(184,137,42,0.15)` | Tombola selection cards on hover |

---

## 7. Components

### 7.1 Card

```
Background:   var(--white)
Border:       1px solid var(--cream-mid)
Radius:       var(--radius-lg)  — 14px
Shadow:       var(--shadow-card)
Padding:      2rem
```

- **Card title** uses `--font-display` at `1.3rem` with a `3px × 18px` gold bar (`::before`) as a left accent.

### 7.2 Buttons

**Standard button base:**
```
Padding:        10px 18px
Radius:         var(--radius-sm)
Font:           var(--font-body), 0.82rem, weight 500
Letter-spacing: 0.07em
Text-transform: uppercase
Transition:     all 0.22s cubic-bezier(0.4, 0, 0.2, 1)
```

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| **Gold** (primary) | `--gold` | `--white` | `--gold` | bg → `--gold-light` |
| **Outline** | transparent | `--charcoal-mid` | `--cream-mid` | bg → `--cream-dark` |
| **Danger** | `--danger-bg` | `--danger` | `rgba(139,42,42,0.2)` | bg → `#EFDEDE` |
| **Ghost** | transparent | `--charcoal-lt` | transparent | bg → `--cream-dark`, text → `--charcoal` |

**Disabled state:** `opacity: 0.38; pointer-events: none;`

**Hero / Draw button:**
```
Width:      100%
Padding:    1.1rem 2rem
Background: var(--charcoal)
Text:       var(--cream), font-display, 1.4rem, italic
Radius:     var(--radius-md)
Hover:      bg → var(--gold), shadow → var(--shadow-btn), translateY(-1px)
```

### 7.3 Inputs

```
Padding:     10px 14px  (standard)  |  9px 12px (compact/condition)
Border:      1px solid var(--cream-mid)
Radius:      var(--radius-sm)
Background:  var(--cream)
Font:        var(--font-body), 0.88rem (standard) | 0.84rem (compact)
Focus:       border-color → var(--gold-muted), background → var(--white)
Placeholder: color var(--charcoal-lt)
```

**Number input (winner count):**
```
Width:       72px
Font-size:   1rem
Font-weight: 600
Color:       var(--gold)
Text-align:  center
Focus:       + box-shadow 0 0 0 3px rgba(184,137,42,0.1)
```

### 7.4 Tags / Pills

```
Font-size:   0.76rem
Padding:     4px 12px
Radius:      99px (pill)
Background:  var(--white)
Border:      1px solid var(--cream-mid)
Color:       var(--charcoal-mid)
```

| State | Background | Border | Color |
|---|---|---|---|
| Default | `--white` | `--cream-mid` | `--charcoal-mid` |
| Hover (removable) | `--danger-bg` | `rgba(139,42,42,0.4)` | `--danger` |
| Highlighted / active | `#FBF4E5` | `--gold-muted` | `--gold`, weight 600 |
| Action (clickable "more") | `#FBF4E5` | `--gold-muted` | `--gold` |
| Action hover | `--gold` | — | `--white` |

### 7.5 Badges

```
Font-size:      0.75rem
Font-weight:    500
Letter-spacing: 0.08em
Text-transform: uppercase
Padding:        3px 12px
Radius:         99px
```

| Variant | Background | Color | Border |
|---|---|---|---|
| Success (count) | `--success-bg` | `--success` | `rgba(42,90,58,0.15)` |
| Gold (drawn) | `#FBF4E5` | `--gold` | `rgba(184,137,42,0.2)` |

### 7.6 Tables

```
Width:           100%
Border-collapse: collapse
Header:          0.72rem, uppercase, letter-spacing 0.12em, color --charcoal-lt
                 border-bottom: 1px solid var(--cream-mid)
Cell:            padding 0.9rem 1rem, font-size 0.88rem, color --charcoal-mid
                 border-bottom: 1px solid var(--cream-dark)
Row hover:       background var(--cream)
Last row:        no bottom border
```

**Special cells:**
- **Rank:** `--font-display`, `1.05rem`, italic, color `--charcoal-lt`, width `50px`
- **Name:** weight `500`, color `--charcoal`, `0.95rem`
- **Date/secondary:** `0.78rem`, color `--charcoal-lt`

**Searchable table wrapper:**
```
Border:  1px solid var(--cream-mid)
Radius:  var(--radius-md)
Search:  full-width input, no side borders, bottom border only
         background var(--cream), focus → var(--white)
Scroll:  max-height 300px, overflow-y auto
         sticky thead (background var(--white), z-index 1)
```

### 7.7 Navigation

```
Link:   0.78rem, weight 500, uppercase, letter-spacing 0.1em
        color --charcoal-lt, padding 7px 16px, radius var(--radius-sm)
Hover:  color --charcoal, background --cream-dark
Active: color --gold, border 1px solid --cream-mid, background --white
```

### 7.8 Selection Cards (Grid)

```
Layout:     CSS Grid, repeat(auto-fit, minmax(240px, 1fr)), gap 1.2rem
Card:       same as standard card + text-align center + padding 2.5rem 2rem
Top accent: 3px gradient bar (gold → gold-light), opacity 0, shown on hover
Hover:      translateY(-3px), elevated shadow, border-color --gold-muted
Icon:       2.4rem, color --gold
Title:      font-display, 1.6rem, weight 400
Subtitle:   0.78rem, uppercase, --charcoal-lt
```

### 7.9 Dark Hero Card (Winner / Spotlight)

```
Background:  var(--charcoal)
Radius:      var(--radius-lg)
Padding:     2.5rem 2rem
Text-align:  center
Animation:   popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)
Decoration:  radial-gradient gold glow (top-right corner, 160px circle)
```

**Content hierarchy on dark surface:**
- Eyebrow: `0.72rem`, uppercase, `letter-spacing 0.2em`, color `--gold-muted`
- Name: `--font-display`, `3rem`, weight 300, color `--cream`
- Detail pills: `0.78rem`, `rgba(255,255,255,0.08)` bg, `rgba(255,255,255,0.12)` border, color `--cream-mid`
- Detail label (em): color `--gold-muted`

**Buttons on dark surface:**
```
Background:  rgba(255,255,255,0.08)
Border:      rgba(255,255,255,0.15)
Color:       var(--cream)
Hover:       background rgba(255,255,255,0.16)
```

### 7.10 Toggle Switch

```
Track:   44px × 24px, radius 12px, bg --gold (on) / --charcoal-lt (off)
Thumb:   18px circle, bg --white, shadow 0 1px 4px rgba(0,0,0,0.15)
         positioned left 23px (on) / left 3px (off)
Label:   0.78rem, weight 500, uppercase, --charcoal-mid, min-width 62px
Transition: 0.25s ease
```

### 7.11 Empty States

```
Text-align:  center
Padding:     3rem 1rem
Color:       var(--charcoal-lt)
Font-size:   0.88rem
Icon:        2rem, color --cream-mid, margin-bottom 0.8rem
```

---

## 8. Texture & Decoration

### 8.1 Noise Overlay

A fixed SVG noise pattern covers the entire viewport at low opacity to add tactile warmth:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* fractalNoise filter */
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
}
```

### 8.2 Gold Divider

```css
height: 1px;
background: linear-gradient(to right, transparent, var(--gold-muted), transparent);
margin: 2rem 0;
opacity: 0.4;
```

### 8.3 Card Title Accent Bar

Every `.card-title` has a `::before` pseudo-element:
```
Width:   3px
Height:  18px
Color:   var(--gold)
Radius:  2px
```

---

## 9. Motion

### 9.1 Global Transition

```css
--transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
```

Applied to all interactive elements (buttons, inputs, cards, links).

### 9.2 Keyframe Animations

| Name | Duration | Easing | Use |
|---|---|---|---|
| `popIn` | `0.45s` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hero card entrance (scale 0.88 → 1, translateY 8px → 0) |
| `slideIn` | `0.35s` | `ease` | List item entrance (translateX -12px → 0, opacity 0 → 1) |
| `confettiFall` | `1.6s` | `ease-in` | Confetti particles (translateY -20px → 105vh, rotate 720deg) |
| `blink` | `0.5s` | `steps(1)` | Rolling/loading text pulse |
| `toastIn` | `0.3s` | `ease` | Toast notification entrance (translateY 10px → 0, opacity 0 → 1) |

### 9.3 Hover Transforms

- **Selection cards:** `translateY(-3px)` on hover
- **Hero button:** `translateY(-1px)` on hover, `translateY(0)` on active

---

## 10. Iconography

- **Library:** [Tabler Icons](https://tabler.io/icons) via webfont (`@tabler/icons-webfont`)
- **Version:** `2.44.0`
- **Usage:** `<i class="ti ti-{icon-name}"></i>` inline with text
- Icon size inherits from parent `font-size` — do not set explicit icon sizes unless in a dedicated icon container.

---

## 11. Responsive Behavior

**Breakpoint:** `600px` (single breakpoint, mobile-first adjustment)

| Element | Desktop | Mobile (≤ 600px) |
|---|---|---|
| Page wrapper padding | `0 1.5rem 4rem` | `0 1rem 3rem` |
| Header | Row, space-between | Column, flex-start, gap 1rem |
| Page title h1 | `3rem` | `2.2rem` |
| Winner name | `3rem` | `2rem` |
| Selection grid | `repeat(auto-fit, minmax(240px, 1fr))` | `1fr` (single column) |
| Company setup header | Row | Column |
| Table columns | All visible | Hide 3rd column |

---

## 12. Scrollbar Styling

```css
scrollbar-width: thin;
scrollbar-color: var(--cream-mid) transparent;
```

Webkit:
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--cream-mid); border-radius: 2px; }
```

---

## 13. Header / Logo Area

```
Layout:    flex, space-between, align-items center
Padding:   2rem 0 1.6rem
Border:    bottom 1px solid var(--cream-mid)
```

**Logo block:** Image + vertical divider (1px × 30px, `--cream-mid`) + label.
Logo label uses `--font-display`, italic, uppercase, `0.12em` spacing.

---

## 14. Toast Notifications

```
Position:      fixed, bottom 2rem, right 2rem
Background:    var(--charcoal)
Color:         var(--cream)
Font:          var(--font-body), 0.82rem, letter-spacing 0.04em
Radius:        var(--radius-sm)
Border-left:   3px solid var(--gold) (success) or var(--danger) (error)
Shadow:        0 8px 32px rgba(44,44,44,0.2)
Duration:      3.4s auto-dismiss
Animation:     toastIn 0.3s ease
Z-index:       9999
```

---

## 15. Confetti System

- **Count:** 48 particles
- **Colors:** `#B8892A`, `#D4A94A`, `#C9A55A`, `#2C2C2C`, `#F5F0E8`, `#8B6520` (palette-derived)
- **Size:** 6–12px, random circle or square (`border-radius: 50%` or `2px`)
- **Animation:** `confettiFall` 1.2–2.0s, random delay 0–0.6s, 720deg rotation
- **Duration:** Container cleared after `2.8s`
- **Container:** Fixed, full viewport, `pointer-events: none`, `z-index: 999`

---

## 16. Quick Reference — CSS Custom Properties

```css
:root {
  /* Colors */
  --cream:        #F5F0E8;
  --cream-dark:   #EDE7D9;
  --cream-mid:    #E4DAC8;
  --gold:         #B8892A;
  --gold-light:   #D4A94A;
  --gold-muted:   #C9A55A;
  --charcoal:     #2C2C2C;
  --charcoal-mid: #4A4A4A;
  --charcoal-lt:  #7A7068;
  --white:        #FDFBF7;
  --danger:       #8B2A2A;
  --danger-bg:    #F5ECEC;
  --success:      #2A5A3A;
  --success-bg:   #ECF3EE;

  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Jost', 'Helvetica Neue', sans-serif;

  /* Radii */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  14px;
  --radius-xl:  22px;

  /* Shadows */
  --shadow-card: 0 2px 24px rgba(44,44,44,0.08), 0 1px 4px rgba(44,44,44,0.06);
  --shadow-btn:  0 4px 16px rgba(184,137,42,0.25);

  /* Motion */
  --transition:  all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
```
