> 출처: getdesign.md의 한 사이트 분석본 (https://getdesign.md/apple/design-md, 원본 파일 github.com/VoltAgent/awesome-design-md `design-md/apple/DESIGN.md`) · MIT License, Copyright (c) 2026 VoltAgent · 이 프로젝트에 맞게 고침 (서비스 이름·고유 문구 제거, 글꼴 Pretendard, 한글 글자 크기, **[추가함]** 표시한 상태·부품, 1440 데스크톱 기준)

## 이 문서를 읽는 법 **[추가함]**

- 이 문서는 **모양**(색, 글꼴·글자 크기, 간격, 둥글기, 그림자, 부품 상태)의 원본이다. 화면에 무엇이 어떤 순서로 있고 어떻게 동작하는지는 Figma `03 화면정의서`를 따른다. 둘이 부딪히면 동작은 화면정의서, 모양은 이 문서를 따르고, 부딪히는 곳은 짚어서 정한다.
- 코드 값은 `client/src/index.css`의 `:root` 한 곳에 옮긴다. 화면의 `.module.css`는 `var(--...)`만 쓴다.
- **[추가함]**: 원본에 없던 규칙을 원본 규칙에 맞춰 채운 곳. **[MVP 범위 밖]**: 지금 만들지 않는 곳.
- 원본은 사진이 많은 마케팅 사이트 분석이라, 사진·타일·내비게이션 부품은 이 프로젝트에서 쓰지 않는다. 이 프로젝트가 쓰는 부품은 맨 아래 "Project Components"에 모았다.

## Overview

The source site is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator and accessories grid introduce a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The editorial page leans darker. Across all analyzed surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**이 프로젝트에서의 분위기 [추가함]**: 동아리 관리 화면에는 제품 사진이 없다. "사진이 주인공, UI는 물러선다"를 **"내용(공지·회원·신청 목록)이 주인공, UI는 물러선다"**로 읽는다. 흰 바탕과 parchment 바탕의 대비로 영역을 나누고, 테두리·그림자는 최소로, 누르는 것은 파란색 하나로 표시한다.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- One sans-serif family (Pretendard) — negative letter-spacing at display sizes for a tight headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.

## Colors

> **Source pages analyzed:** homepage, editorial page, store, product configurator, accessories index. The color system is identical across all five surfaces; only the surface-mode mix differs.

### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs, and the focus ring root. This is the quiet but universal "click me" signal. Press state shifts to a slightly darker variant via the active scale transform rather than a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): A marginally brighter sibling of Action Blue, reserved for the keyboard focus ring on buttons (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): A brighter blue used on dark surfaces for in-copy links and inline callouts, where Action Blue would disappear against the tile background.

### Status **[추가함]**
원본에는 오류·위험 색이 없다(Known Gaps). 화면정의서의 "칸 아래 오류 문구"와 Danger 버튼(삭제처럼 위험한 행동)에 필요해서 하나만 더한다. **강조색(accent)이 아니라 상태색**이라 "두 번째 강조색 금지" 규칙과 구분한다: 누르라는 신호에는 쓰지 않고, 오류 문구·오류 칸 테두리·Danger 버튼에만 쓴다.
- **Danger Red** (`{colors.danger}` — #d70015): 흰 바탕 대비 5.38:1, parchment 위 4.94:1 (작은 글자 기준 4.5:1 이상).
- 성공 색은 두지 않는다. 성공은 화면이 바뀌거나 토스트 문구로 알린다.

### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): The dominant canvas. Content, utility cards, store tiles, configurator grids.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): The signature off-white. Used for alternating light tiles, footer region, and the default page canvas in store utility sections. Just different enough from white to create rhythm.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): A near-white used as the fill for secondary "ghost" buttons — lighter than the parchment canvas so the button still reads as a button against `{colors.canvas-parchment}`.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): The primary dark-tile surface on the homepage product grid.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): A micro-step lighter — used where a dark tile sits directly above or below Tile 1 to create the faintest separation.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): A micro-step darker — used at the bottom of the stack and in embedded video/player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — video player backgrounds, edge-to-edge photographic overlays, the global nav bar background.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7): The base hex of the translucent gray chip used over photography for circular control buttons. In production, applied at ~64% alpha as `rgba(210, 210, 215, 0.64)`.

### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): The voice of every headline, every body paragraph, and the dark utility button's fill. Chosen instead of pure black to keep the page feeling photographic rather than printed.
- **Body** (`{colors.body}` — #1d1d1f): Same hex as ink — one near-black tone for all text on light surfaces.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles and on the global nav bar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on the white Pearl Button surface — slightly softer than pure black.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled button text and legal fine-print.
- **Ink Secondary** (`{colors.ink-secondary}` — #6e6e73) **[추가함]**: 입력칸 도움말, 목록의 날짜·작성자 같은 보조 글자. `ink-muted-48`(#7a7a7a)은 흰 바탕 대비 4.29:1로 작은 글자 기준(4.5:1)에 못 미쳐, 읽어야 하는 보조 글자에는 이 색(5.07:1)을 쓴다. `ink-muted-48`은 원본대로 잠금 상태 글자와 placeholder에만 쓴다.

### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0): The "border" tone on secondary buttons — functions as a ring shadow rather than a hard line. In production, often applied as `rgba(0, 0, 0, 0.04)`.
- **Hairline** (`{colors.hairline}` — #e0e0e0): The 1px hairline border on store utility cards and configurator chips.
- **Input Border** (`{colors.input-border}` — #86868b) **[추가함]**: 입력칸 테두리. 원본 search-input의 `rgba(0, 0, 0, 0.08)`은 검색창 하나일 때는 괜찮지만, 칸이 여러 개인 폼에서는 칸 경계가 보이지 않는다. 입력칸 경계는 3:1 이상이어야 알아볼 수 있어 이 색(3.62:1)을 쓴다.

### Brand Gradient
**No decorative gradients.** Atmospheric depth on product photography is inherent to the imagery, not a CSS gradient overlay. The editorial page's hero uses photographic atmosphere but no gradient tokens are defined. The source is the rare luxury-brand site with zero gradient-based design tokens.

## Typography

### Font Family
- **Display / Body / UI**: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif` — 한글·영문·숫자를 한 글꼴로 쓴다. 원본은 큰 글자용(Display)과 본문용(Text) 두 글꼴을 나눴지만, Pretendard는 가변 글꼴 하나로 두 역할을 함께 맡는다.
- **License**: Pretendard는 SIL Open Font License 1.1(OFL)이라 무료로 쓰고 함께 배포할 수 있다 (github.com/orioncactus/pretendard).
- **Weights**: 300 / 400 / 600 / 700 (원본 사다리 그대로, 500은 쓰지 않는다).
- **OpenType features**: 숫자가 세로로 줄을 맞춰야 하는 곳(목록의 날짜·인원수)은 `font-variant-numeric: tabular-nums`를 쓴다.

### Hierarchy

한글에 맞춰 원본 값을 고쳤다 **[한글 조정]**. 바뀐 원칙은 표 아래에 적었다.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 48px | 600 | 1.25 | -0.02em | Hero headline **[MVP 범위 밖]** |
| `{typography.display-lg}` | 36px | 600 | 1.3 | -0.02em | 큰 제목 (로그인 화면 서비스명) |
| `{typography.display-md}` | 28px | 600 | 1.4 | -0.02em | 페이지 제목 (본문 제목 줄) |
| `{typography.lead}` | 22px | 400 | 1.45 | -0.01em | 제목 아래 한 줄 설명 |
| `{typography.lead-airy}` | 20px | 300 | 1.6 | 0 | 가벼운 안내 문단 (드묾) |
| `{typography.tagline}` | 20px | 600 | 1.4 | -0.01em | 구역 제목, 상단바 서비스명 |
| `{typography.body-strong}` | 16px | 600 | 1.5 | -0.01em | 본문 강조, 카드 제목 |
| `{typography.body}` | 16px | 400 | 1.6 | -0.01em | 기본 본문, 입력값, 버튼 글자 |
| `{typography.dense-link}` | 16px | 400 | 2.2 | 0 | 링크 목록 (햄버거바 메뉴 후보) |
| `{typography.caption}` | 14px | 400 | 1.5 | -0.01em | 보조 설명 |
| `{typography.caption-strong}` | 14px | 600 | 1.45 | -0.01em | 입력칸 라벨, 표 머리 |
| `{typography.button-large}` | 18px | 400 | 1.0 | 0 | 큰 버튼 **[MVP 범위 밖]** (원본 300 → 400) |
| `{typography.button-utility}` | 14px | 400 | 1.4 | -0.01em | 작은 버튼, 탭 |
| `{typography.fine-print}` | 13px | 400 | 1.5 | 0 | 입력칸 도움말·오류 문구 |
| `{typography.micro-legal}` | 11px | 400 | 1.4 | 0 | 아주 작은 안내 (드묾) |
| `{typography.nav-link}` | 13px | 400 | 1.4 | 0 | 작은 메뉴 글자 |

**원본에서 바꾼 것과 이유 [한글 조정]**
- **본문 17px → 16px, 줄 높이 1.47 → 1.6.** 한글은 같은 px에서 영문보다 글자 면이 크고 획이 빽빽해 보인다. 한 단계 작게 쓰고 줄 사이를 넓혀야 원본의 "훑지 않고 읽는" 속도가 나온다.
- **큰 글자 줄 높이 1.07~1.19 → 1.25~1.4.** 한글은 받침 때문에 위아래가 꽉 차서, 원본처럼 좁히면 두 줄 제목의 줄끼리 닿는다.
- **자간을 px → em으로, 값은 -0.01em ~ -0.02em.** 원본의 "큰 글자일수록 좁게"는 그대로 두고, 글자 크기가 바뀌어도 비율이 유지되게 em으로 쓴다. 13px 이하는 0 (원본도 12px 이하에는 쓰지 않음).
- **도움말·오류 글자 12px → 13px.** 한글 12px은 칸 아래 문구로 읽기에 작다.
- **weight 300 → 400 (button-large).** 한글 300은 획이 가늘어 버튼 글자로 약하다. 300은 큰 안내 문단(lead-airy)에만 남긴다.

### Principles

- **Negative letter-spacing at display sizes.** Every headline at 16px and up carries a slight tracking tighten (`-0.01em → -0.02em`). This produces the tight headline cadence. Never used at 13px or below.
- **Body copy at 16px with 1.6 leading.** The source runs 17px for Latin text; for Hangul, one step smaller with more leading gives the same "reading, not scanning" pace.
- **Weight 300 is real and rare.** Used deliberately on large-size reads (`{typography.lead-airy}` at 20px/300). It's a light-atmosphere cue reserved for moments where the content should feel airy.
- **Weight 600, not 700, for headlines.** Headlines sit at weight 600. Weight 700 is used sparingly when a touch more assertion is needed.
- **Line-height is context-specific.** Display sizes use 1.25–1.4 (tight for Hangul). Body uses 1.6. Link stacks use a relaxed 2.2 (`{typography.dense-link}`).
- **Weight 500 is deliberately absent.** The ladder is 300 / 400 / 600 / 700. Mid-weight readings always use 600.

## Layout

### Spacing System
- **Base unit:** 8px. Sub-base values (2, 4, 6) are used for tight typographic adjustments; structural layout snaps to 8/12/16/24/32.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
  - **[한글 조정]** `md`를 17px → 16px로 바꿨다. 원본의 17px은 본문 글자 크기(17px)에 맞춘 값이라, 본문을 16px로 바꾼 이 문서에서는 16px이 같은 역할을 한다.
- **Section vertical padding:** `{spacing.section}` (80px) inside a product tile; tiles stack edge-to-edge with 0 gap (the color change provides the break).
- **Card padding:** `{spacing.lg}` (24px) inside utility grid cards.
- **Button padding:** 8–11px vertical, 15–22px horizontal.
- **Universal rhythm constants:** the body line (16px × 1.6 ≈ 26px) and the 20px tagline size.

### Grid & Container
- **Max content width:** ~980px on text-heavy sections, ~1440px on product grids, full-bleed for product tiles.
- **Column patterns:** 3 to 5 column utility card grid on store/accessories; 2-column side-by-side tiles on homepage occasional sections; single-column centered stack on product tile heroes.
- **Gutters:** 20–24px between cards in a utility grid.

### Desktop 1440 기준 **[추가함]**
- 화면은 **데스크톱 폭 1440px**에서 설계하고 확인한다 (개발 일지 "화면정의서" 결정). 스크린샷 확인도 1440 폭으로 한다.
- 내용 최대 폭은 1440px (원본의 content lock과 같다). 글이 긴 화면(공지 상세)은 원본의 텍스트 구역처럼 ~980px 안에 둔다.
- 폼 하나만 있는 화면(로그인·회원가입)은 폼 폭을 고정한다 (값은 그 화면을 만들 때 spacing 단위로 정한다).
- 1440보다 좁은 화면, 모바일 대응은 하지 않는다 → 아래 "Responsive Behavior"는 **[MVP 범위 밖]**.

### Whitespace Philosophy
Whitespace is the product's pedestal. Every tile begins with at least 64px of air above its headline and 48–64px below. Product renders are never crowded; the nearest content to a product image is at least 40px away. The footer is the only area that breaks this — there, the site goes deliberately dense to make the full information architecture visible at a glance.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and the floating sticky bar |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product renders resting on a surface (the only true "shadow" in the system) |

**Shadow philosophy.** The system uses **exactly one** drop-shadow, and it is applied to photographic product imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars. The single shadow is about giving the product weight, not about UI hierarchy.

### Decorative Depth
- **Atmospheric imagery** on the editorial page (photographic vista) supplies mood; no CSS gradient involved.
- **Edge-to-edge tile alternation** creates rhythm without borders or shadows — the color change itself is the divider.
- **Backdrop-filter blur** on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` creates a "floating over content" effect that's functional, not decorative.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed product tiles (no corner rounding) |
| `{rounded.xs}` | 5px | Inline links when styled as subtle chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons, inline card imagery |
| `{rounded.md}` | 11px | White Pearl Button capsules |
| `{rounded.lg}` | 18px | Store utility cards, accessories grid cards |
| `{rounded.pill}` | 9999px | Primary blue pill CTAs, sub-nav buy button, configurator option chips, search input — the signature pill |
| `{rounded.full}` | 9999px / 50% | Circular control chips floating over photography |

### Photography Geometry **[MVP 범위 밖]**
- **Hero imagery**: full-bleed, 21:9 or taller on the homepage; 16:9 on editorial and shop pages. Product renders are photographic-realistic, often shot on a tinted surface that becomes the tile background.
- **Product renders**: PNG/WebP with transparency; rest on a surface tile and pick up the system shadow.
- **Accessory grid**: square 1:1 crops at `{rounded.lg}` (18px) radius, light neutral backgrounds, product centered with 20–40px internal padding.
- **No rounded imagery in hero tiles** — images are full-bleed rectangular. Rounding (`{rounded.sm}`, `{rounded.lg}`) appears only on inline card imagery.
- Lazy-loading via responsive `srcset` and `sizes` across all breakpoints; CDN-optimized WebP.

## Components

> 아래는 원본 사이트의 부품 기록이다. 이 프로젝트에서 직접 쓰는 부품과 상태는 맨 아래 **"Project Components"**에 따로 정리했다.

### Top Navigation

**`global-nav`** — Persistent, ultra-thin black nav bar pinned to the top of every page. Background `{colors.surface-black}`, height 44px, text `{colors.on-dark}` in `{typography.nav-link}`. Links are quiet, spaced ~20px apart, running edge-to-edge across the top. Right-aligned cluster: Search, Cart icons — always visible. On mobile, collapses to hamburger at ~834px and the logo centers.

**`sub-nav-frosted`** — Surface-specific nav that sticks below the global nav. Background `{colors.canvas-parchment}` at 80% opacity with backdrop-filter blur, creating a frosted-glass effect. Height 52px. Content on left: product category name in `{typography.tagline}`. Content right: inline nav links in `{typography.button-utility}`, ending in a persistent `{component.button-primary}` or a utility link.

### Buttons

**`button-primary`** — The signature action. Background `{colors.primary}` (Action Blue #0066cc), text `{colors.on-primary}` in `{typography.body}`, rounded `{rounded.pill}` (full pill — capsule-shaped), padding 11px × 22px. The full-pill radius IS the brand action signal.
- Active state: `{component.button-primary-active}` — `transform: scale(0.95)` (the system-wide micro-interaction).
- Focus state: `{component.button-primary-focus}` — 2px solid `{colors.primary-focus}` outline.

**`button-secondary-pill`** — Used as the second CTA when two blue pills appear together. Background transparent, text `{colors.primary}`, 1px solid `{colors.primary}` border, rounded `{rounded.pill}`, padding 11px × 22px. Reads as a "ghost pill."

**`button-dark-utility`** — Global nav actions (sign-in, cart, language selector). Background `{colors.ink}` (#1d1d1f), text `{colors.on-dark}` in `{typography.button-utility}`, rounded `{rounded.sm}` (8px), padding 8px × 15px. Active state shrinks via `transform: scale(0.95)`.

**`button-pearl-capsule`** — Product-card secondary button. Background `{colors.surface-pearl}` (#fafafc), text `{colors.ink-muted-80}` in `{typography.caption}`, 3px solid `{colors.divider-soft}` border (functions as a soft ring rather than a visible line), rounded `{rounded.md}` (11px), padding 8px × 14px.

**`button-store-hero`** — A larger primary CTA used on store hero surfaces. Same Action Blue + Paper White as `{component.button-primary}`, but with `{typography.button-large}` and slightly more padding (14px × 28px). Used sparingly on the store landing.

**`button-icon-circular`** — Floats over photography. 44 × 44px, background `{colors.surface-chip-translucent}` at ~64% alpha, icon in `{colors.ink}`, rounded `{rounded.full}`. Used for carousel controls, close buttons, and in-image controls.

**`text-link`** — Inline body links in `{colors.primary}` (Action Blue). Underlined or non-underlined per context.

**`text-link-on-dark`** — Inline body links on dark tiles in `{colors.primary-on-dark}` (Sky Link Blue #2997ff) — Action Blue would disappear against `{colors.surface-tile-1}`.

### Cards & Containers

**`product-tile-light`** — Full-bleed light tile. Background `{colors.canvas}` (white), text `{colors.ink}`, rounded `{rounded.none}` (0 — tiles touch edges), vertical padding `{spacing.section}` (80px). Centered stack: product name in `{typography.display-lg}` → one-line tagline in `{typography.lead}` → two `{component.button-primary}` CTAs → product render resting on the surface with the system shadow.

**`product-tile-parchment`** — Same as `{component.product-tile-light}` but on `{colors.canvas-parchment}` (#f5f5f7). Used to break two consecutive white tiles.

**`product-tile-dark`** — Full-bleed dark tile. Background `{colors.surface-tile-1}` (#272729), text `{colors.on-dark}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Same content stack as the light tile but with `{component.text-link-on-dark}` for inline copy and `{component.button-primary}` (Action Blue still works on the dark surface). Used on the homepage product grid as the alternating dark band.

**`product-tile-dark-2`** — Variant on `{colors.surface-tile-2}` (#2a2a2c). Used where a dark tile sits directly above or below `{component.product-tile-dark}` to create the faintest separation through micro-step lightness change.

**`product-tile-dark-3`** — Variant on `{colors.surface-tile-3}` (#252527). Used at the bottom of the stack and in embedded video/player frames.

**`store-utility-card`** — Used in store grid and accessories grid. Background `{colors.canvas}` (white), 1px solid `{colors.hairline}` border, rounded `{rounded.lg}` (18px), padding `{spacing.lg}` (24px). Top: product image (1:1 crop with `{rounded.sm}` (8px) inner image radius). Below: product name in `{typography.body-strong}`, price in `{typography.body}`, and a `{component.text-link}`. No shadow by default; product render itself carries the system product-shadow.

**`configurator-option-chip`** — Pill-shaped tappable cell used in the product configurator. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.caption}`, rounded `{rounded.pill}`, padding 12px × 16px. Contains a small product thumbnail + label + price delta. Arranged in a grid of 4–5 options per row.

**`configurator-option-chip-selected`** — Selected state. Border upgrades to 2px solid `{colors.primary-focus}`. Same shape, same content.

**`editorial-quote-card`** — A photographic-canvas hero specific to the editorial page. Dark photographic backdrop with `{colors.surface-tile-1}` as the fallback color, centered white-text headline in `{typography.display-lg}`, a small pictographic mark above the headline, single `{component.button-primary}` below. Padding `{spacing.section}` (80px).

**`floating-sticky-bar`** — Floats at the bottom of the viewport on the product configurator during scroll. Background `{colors.canvas-parchment}` at 80% opacity with `backdrop-filter: blur(N)`, height 64px, padding 12px × 32px. Left: running price total in `{typography.body}`. Right: `{component.button-primary}`.

### Inputs & Forms

**`search-input`** — The accessories search input. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.body}`, 1px solid `rgba(0, 0, 0, 0.08)` border, rounded `{rounded.pill}` (full pill — search is also pill-shaped, matching the CTA grammar), padding 12px × 20px, height 44px. Leading icon: search glyph at 14px, muted tint.

Error and validation states were not surfaced in the analyzed pages. → 이 프로젝트의 입력칸 상태는 "Project Components"의 `form-field` **[추가함]**.

### Footer

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (the relaxed leading is what makes the dense columns scannable). Column headings in `{typography.caption-strong}`. Legal row at the very bottom in `{typography.fine-print}` with `{colors.ink-muted-48}` text. Vertical padding 64px.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines in `{typography.display-lg}` or `{typography.display-md}` with negative letter-spacing (`-0.02em`) to get the tight headline cadence.
- Run body copy at `{typography.body}` (16px / 400 / 1.6 / -0.01em).
- Alternate white and parchment surfaces for section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for the primary blue CTA and any other element that should read as an "action".
- Apply the single product-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to product renders resting on a surface — never on cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button — it's the system-wide micro-interaction.
- Keep the global nav `{colors.surface-black}` (true black) — it's the only place pure black appears on most pages.
- **[추가함]** 오류 문구·오류 칸·Danger 버튼에는 `{colors.danger}`만 쓴다. 상태색이지 강조색이 아니다.

### Don't
- Don't introduce a second accent color; every "click me" signal is `{colors.primary}` (Action Blue). (`{colors.danger}`는 누르라는 신호가 아니라 위험·오류 상태 표시라 예외 **[추가함]**)
- Don't add shadows to cards, buttons, or text — shadow is reserved for product imagery.
- Don't use gradients as decorative backgrounds; atmosphere comes from photography.
- Don't set body copy at weight 500 — the ladder is 300 / 400 / 600 / 700, with 500 deliberately absent. Body is always 400; strong inline is 600; display is 600.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge; the color change is the divider.
- Don't tighten line-height below 1.6 for Hangul body copy — the editorial leading is part of the brand.
- Don't mix radii grammars — use `{rounded.sm}` for compact utility, `{rounded.lg}` for utility cards, `{rounded.pill}` for pills, and nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's the dark-tile-only variant. Action Blue is for light surfaces.

## Responsive Behavior **[MVP 범위 밖]**

> 이 프로젝트는 데스크톱 1440 기준만 만든다 (위 "Desktop 1440 기준"). 아래는 원본 기록으로 남기고, 마무리 단계 이후에 다시 본다.

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Single-column tiles; sub-nav collapses to category name + primary CTA only; hero typography drops to 28px |
| Phone | 420–640px | Single-column stack; product renders scale to 80% of tile width; hero h1 drops to 34px |
| Large phone | 641–735px | Tiles transition to tighter padding (48px vertical vs 80px); fine-print wraps |
| Tablet portrait | 736–833px | Global nav collapses to hamburger; sub-nav hides category chips, keeps primary CTA |
| Tablet landscape | 834–1023px | Global nav returns fully expanded; 3-column utility grids become 2-column |
| Small desktop | 1024–1068px | Product tiles use 2/3 width with margin gutters; hero h1 stays at 40px |
| Desktop | 1069–1440px | Full layout; 4–5 column store grids; 1440px content max |
| Wide desktop | ≥ 1441px | Content locks at 1440px, margins absorb extra width |

The structural breakpoints that matter for agents: 1440px (content lock), 1068px (small-desktop), 833px (tablet landscape switch), 734px (tablet portrait), 640px (phone), 480px (small phone).

### Touch Targets
- Minimum 44 × 44px. `{component.button-primary}` lands at ~44 × 100px (with the full-pill radius making the visible hit area more generous than the label suggests).
- `{component.button-icon-circular}` is exactly 44 × 44px.
- Global nav utility links are smaller (~32 × 80px) — they deliberately sit at a tighter target because they're precision desktop actions, and the mobile hamburger replaces them at ≤ 833px.

### Collapsing Strategy
- **Global nav**: full horizontal link row on desktop → collapses to logo + hamburger + cart icon at 834px and below.
- **Sub-nav**: category name + inline links + primary CTA → category name + primary CTA only at mobile; inline links move into a hamburger tray.
- **Product tiles**: stack from 2-column to 1-column at 834px; vertical padding tightens from 80px → 48px at small-phone.
- **Utility grids** (store, accessories): 5-col → 4-col (1440px) → 3-col (1068px) → 2-col (834px) → 1-col (640px).
- **Hero typography**: `{typography.hero-display}` → `{typography.display-lg}` at 1068px → 34px at 640px → 28px at 419px.

### Image Behavior
- All product imagery uses responsive `srcset` with breakpoint-matched crops.
- Hero photography may switch art direction at mobile (e.g., the editorial page's vista crops to a taller aspect ratio on mobile, framing the subject differently).
- Product renders maintain their 1:1 or 4:3 aspect ratios across breakpoints; only scale changes.
- Lazy-loading is default; the above-fold hero loads eagerly.

## Iteration Guide

1. Focus on ONE component at a time. Reference its key directly (`{component.form-field}`, `{component.button-primary}`).
2. Variants of an existing component (`-active`, `-focus`, `-2`, `-3`) live as separate entries.
3. Use `{token.refs}` everywhere — never inline hex. (이 프로젝트: `.module.css`에는 `var(--...)`만)
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay weight 600 with negative letter-spacing. Body stays 400 at 16px. The boundary is unbreakable.
6. The single drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) is reserved for product photography only.
7. When in doubt about emphasis: alternate surface (white → parchment) before adding chrome.

## Known Gaps

- Form validation and error states were not surfaced on the analyzed pages; only the neutral search input is documented. → `form-field` **[추가함]**
- The homepage's embedded video/player frame uses `{colors.surface-black}`; interior player controls are not documented (they're a platform widget, not a web-design token).
- Some component imagery is dynamic (rotating product hero) and its specific copy varies per surface — component specs name the structure, not the rotating content.
- Dark-mode counterparts for store and accessories utility cards were not surfaced on the analyzed pages; the system documented is the daytime/light-dominant variant shipped by default.
- Atmospheric photography (editorial page vista) is a content asset, not a design token; the documented `{component.editorial-quote-card}` describes the structural surface only.
- The exact backdrop-filter blur radius on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` is platform-dependent; production CSS uses `saturate(180%) blur(20px)` as a typical baseline but the value isn't formalized as a token.
- **[추가함]** 토스트, 탭, 모달, 표(목록)는 원본에 없다. 토스트·모달·표는 처음 쓰는 단계에서 이 문서에 [추가함]으로 채운다.

## Project Components (35cheol) **[추가함]**

Figma `04 Components`의 부품 목록(구성)을 이 문서의 값으로 그린다. 상태 이름은 원본 규칙(Default, Active, Focus)에 이 프로젝트에 필요한 잠금·오류를 더했다.

### `form-field` — 입력칸 **[추가함]**
구성(Figma 04): 라벨 → 칸 → 도움말 → 오류 문구. 도움말은 화면정의서가 "항상 보여준다"고 한 칸에만 둔다.

| 부분 | 값 |
|---|---|
| 라벨 | `{typography.caption-strong}`, `{colors.ink}`. 칸과 간격 `{spacing.xs}` |
| 칸 | 배경 `{colors.canvas}`, 글자 `{colors.ink}` `{typography.body}`, 테두리 1px `{colors.input-border}`, 둥글기 `{rounded.sm}`, 안쪽 여백 `{spacing.sm}` × `{spacing.md}`, 높이 44px (원본 search-input 높이, 최소 터치 크기) |
| placeholder | `{colors.ink-muted-48}` |
| 도움말 | `{typography.fine-print}`, `{colors.ink-secondary}`. 칸과 간격 `{spacing.xs}` |
| 오류 문구 | `{typography.fine-print}`, `{colors.danger}`. 도움말 아래 (도움말이 없으면 칸 바로 아래) |
| 칸끼리 간격 | `{spacing.lg}` |

| 상태 | 모양 |
|---|---|
| Default | 위 표 그대로 |
| Focus | 테두리는 그대로, `outline: 2px solid {colors.primary-focus}` (원본 버튼 focus 규칙을 입력칸에도 씀) |
| Error | 테두리 `{colors.danger}` + 오류 문구. 그 칸을 고치면 둘 다 사라진다 (화면정의서 결정 H) |
| Error + Focus | 테두리 `{colors.danger}` 유지, outline은 Focus와 같음 |
| Disabled (요청 중 잠금) | 배경 `{colors.canvas-parchment}`, 글자 `{colors.ink-muted-48}` |

### `button-primary` / `button-secondary-pill` / `button-danger` — 버튼
Figma 04의 버튼 3종(Primary·Secondary·Danger)을 원본 버튼 문법으로 옮긴다.

| 종류 | 원본 부품 | 쓰는 곳 |
|---|---|---|
| Primary | `button-primary` 그대로 | 화면의 주 행동 (로그인, 가입하기, 저장) |
| Secondary | `button-secondary-pill` 그대로 | 보조 행동 (취소) |
| Danger **[추가함]** | `button-secondary-pill` 모양에 글자·테두리 `{colors.danger}` | 삭제처럼 위험한 행동. 확인창 필수 (Figma 04 규칙) |

| 상태 | 모양 |
|---|---|
| Default | 원본 그대로 |
| Active | `transform: scale(0.95)` (원본) |
| Focus | `outline: 2px solid {colors.primary-focus}`, `outline-offset: 2px` (원본, offset만 추가함) |
| Disabled (요청 중 잠금) **[추가함]** | `opacity: 0.4`, Active 축소 없음, `cursor: default`. 색을 새로 만들지 않고 원래 색을 흐리게 해서 "같은 버튼이 지금 잠김"으로 읽히게 한다 |
| Hover | 원본 규칙("Never document hover")에 따라 두지 않는다. 커서만 `pointer` |

- 폼 안의 제출 버튼은 폼 폭을 꽉 채운다 **[추가함]**.

### `segmented-tabs` — 탭 **[추가함]**
SCR-AUTH-01의 로그인 / 회원가입 탭. 원본에 탭이 없어서, 원본의 pill 문법과 surface 대비로 만든다.

| 부분 | 값 |
|---|---|
| 바탕(트랙) | `{colors.canvas-parchment}`, `{rounded.pill}`, 안쪽 여백 `{spacing.xxs}` |
| 탭 하나 | `{typography.button-utility}`, `{colors.ink-muted-80}`, `{rounded.pill}`, 여백 `{spacing.xs}` × `{spacing.md}` |
| 선택된 탭 | 배경 `{colors.canvas}`, 글자 `{colors.ink}` weight 600, 테두리 1px `{colors.hairline}` (그림자 대신) |
| Focus | 버튼과 같은 outline |

### 자리만 (그 단계에서 채움)
| 부품 (Figma 04) | 원본에서 가져올 것 | 단계 |
|---|---|---|
| 박스 | `store-utility-card` | F4 |

### `toast` — 결과 알림 **[추가함]**
F1(회원가입 성공)에서 쓰기 시작했다. 라이브러리(react-hot-toast)가 모양을 인라인 style로 넣어서, 값은 `App.jsx`의 `TOAST_OPTIONS`에 `var(--...)`로 넘긴다.

| 부분 | 값 |
|---|---|
| 자리·시간 | 화면 오른쪽 아래, 3초 |
| 바탕 | `{colors.ink}`, 그림자 없음 (원본 "그림자는 제품 사진에만"), `{rounded.sm}`, 여백 `{spacing.sm}` × `{spacing.md}` |
| 글자 | `{typography.caption}`, `{colors.on-primary}` |
| 아이콘 | 성공 `{colors.primary}`, 오류 `{colors.danger}` (아이콘 점에만) |

### `app-layout` — 공통 레이아웃 뼈대 **[추가함]**
Figma 03 SCR-COMMON-01 배치: 왼쪽 햄버거바는 화면 높이 전체, 오른쪽 위에 상단바, 그 아래 본문 자리. 영역은 surface 대비(햄버거바 parchment ↔ 본문 white)로 나눈다 (원본 "The color change IS the divider").

| 부분 | 값 |
|---|---|
| 햄버거바 폭 | 240px (`--sidebar-width`, 8 × 30) |
| 본문 자리 여백 | `{spacing.xl}` |
| 앱 시작 (AUTH-03 응답 전) | 화면 전체 가운데에 '불러오는 중…' `{typography.body}` `{colors.ink-secondary}`, 글자만 |

### `app-header` — 상단바 **[추가함]**
원본 `sub-nav-frosted`(밝은 바탕, 52px)에서 흐림 효과를 뺐다. `global-nav`(검정 44px)는 마케팅 사이트 맨 위의 띠라, 계속 보고 있는 관리 화면에서는 검정 띠가 내용보다 먼저 눈에 들어온다 ("내용이 주인공").

| 부분 | 값 |
|---|---|
| 바탕 | `{colors.canvas}`, 아래 1px `{colors.hairline}`, 높이 52px (`--header-height`, 원본 sub-nav) |
| 서비스명 | `{typography.tagline}`, `{colors.ink}`, 왼쪽 여백 `{spacing.lg}`. 누르는 글자지만 파랑을 쓰지 않는다 (로고 자리) |
| `> 동아리명` | F4 |
| 프로필 아이콘 | `button-icon-circular` 크기(44 × 44), 바탕 `{colors.canvas-parchment}`, 이름 첫 글자 `{typography.caption-strong}`, `{rounded.pill}`. 오른쪽 여백 `{spacing.lg}` |

| 상태 | 모양 |
|---|---|
| Active | `transform: scale(0.95)` (프로필 아이콘) |
| Focus | 버튼과 같은 outline |

### `profile-menu` — 프로필 메뉴 **[추가함]**
| 부분 | 값 |
|---|---|
| 상자 | `{colors.canvas}`, 1px `{colors.hairline}` (원본 Elevation의 Soft hairline 단계), `{rounded.lg}`, 여백 `{spacing.md}`, 폭 240px (`--menu-width`), **그림자 없음**. 아이콘 아래 `{spacing.xs}`, 오른쪽 끝 맞춤 |
| 이름 / 아이디 | `{typography.body-strong}` `{colors.ink}` / `{typography.caption}` `{colors.ink-secondary}` |
| 구분선 | 1px `{colors.hairline}`, 위아래 `{spacing.sm}` |
| 로그아웃 | `{typography.button-utility}`, `{colors.ink}`, 왼쪽 정렬 글자 버튼. Focus outline |

### `side-nav` — 햄버거바 **[추가함]**
| 부분 | 값 |
|---|---|
| 바탕 | `{colors.canvas-parchment}`, 여백 0 × `{spacing.md}` |
| 제목 줄 '☰ 메뉴' | `{typography.caption-strong}`, `{colors.ink-secondary}`, 높이 52px (상단바와 같은 줄). 접기 동작 없음 (카드에 없음) |
| 항목 (홈, 내 동아리 ▾) | `{typography.body-strong}`, `{colors.ink}`, 줄 높이 2.2 (`{typography.dense-link}`의 줄 간격) |
| 동아리 | `{typography.dense-link}`, `{colors.ink}`, 들여쓰기 `{spacing.md}`. 이름이 길면 말줄임 |
| PENDING | `{colors.ink-secondary}` + ' · 대기중' (회색이지만 읽어야 하는 글자라 ink-muted-48이 아님) |
| 빈 목록·실패 문구 | `{typography.caption}`, `{colors.ink-secondary}`, 들여쓰기 `{spacing.md}` |
| Focus | 버튼과 같은 outline. 현재 위치 강조는 두지 않음 (카드에 없음) |

## 원본 라이선스

원본 파일(VoltAgent/awesome-design-md)의 라이선스 전문이다. 이 문서는 원본을 고친 것이라 MIT 조건에 따라 함께 싣는다.

```text
MIT License

Copyright (c) 2026 VoltAgent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
