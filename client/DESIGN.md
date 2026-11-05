> 출처: Notion 마케팅 사이트 분석본 (원본 출처·라이선스 확인 필요) · 본문은 원본 그대로 두고, 이 프로젝트에 맞춘 규칙은 맨 아래 "Project Components (35cheol)"에 **[추가함]**으로 모았다.

## 이 문서를 읽는 법 **[추가함]**

- 이 문서는 **모양**(색, 글꼴·글자 크기, 간격, 둥글기, 그림자, 부품 상태)의 원본이다. 화면에 무엇이 어떤 순서로 있고 어떻게 동작하는지는 Figma `03 화면정의서`를 따른다. 둘이 부딪히면 동작은 화면정의서, 모양은 이 문서를 따르고, 부딪히는 곳은 짚어서 정한다.
- 코드 값은 `client/src/index.css`의 `:root` 한 곳에 옮긴다. 화면의 `.module.css`는 `var(--...)`만 쓴다.
- 원본은 마케팅 사이트 분석이라 sticker palette·pricing·`ex-*` 부품은 쓰지 않는다. 이 프로젝트가 쓰는 부품과 원본에 없는 규칙은 맨 아래 "Project Components (35cheol)"에 모았다.
- 데스크톱 1440 기준으로 만든다. 원본의 Responsive Strategy는 **[MVP 범위 밖]**.

## Overview

Notion looks like a well-organized desk in good daylight. The dominant surface is not pure white but a warm, paper-soft off-white — `{colors.canvas-soft}` (#f6f5f4) — that takes the clinical edge off the screen and makes long pages feel like a document rather than an app. Type is set in `NotionInter` (a tuned Inter) in near-black `{colors.ink}` at large, tightly-tracked weights, so headlines read as confident statements with very little letter-spacing slack at display sizes (`{typography.display-1}` pulls −2.125px of tracking at 64px). The whole system whispers in greys and blacks, then says exactly one thing in colour: a single, dependable blue, `{colors.primary}` (#0075de), reserved almost entirely for the primary call-to-action and inline links.

Against that quiet chrome, Notion lets a **playful multi-colour sticker palette** carry all of the brand's personality — purple, pink, orange, teal, green and sky-blue appear as small illustrated blocks, app-icon stickers, and category dots scattered through the marketing pages. These colours never structure the layout or paint a CTA; they decorate. The discipline is deliberate: the interface stays monochrome-plus-blue so the content (and the cheerful illustrations) can breathe. The one exception to the bright daylight is the homepage hero, which inverts into a deep indigo "night" band (`{colors.secondary}`) with white type and glowing sticker constellations — a single dark island in an otherwise light document.

Surfaces are defined by hairlines and the faintest layered shadows rather than heavy elevation. Cards round at a friendly 12px (`{rounded.lg}`), the marketing CTAs are fully-pill-shaped (`{rounded.full}`), and utility buttons round at a tighter 8px (`{rounded.md}`). Nothing is loud; the brand's character comes from restraint plus one well-placed splash of joy.

**Key Characteristics:**
- Warm paper-soft canvas `{colors.canvas-soft}` over pure white, never clinical
- Near-black `{colors.ink}` `NotionInter` type with tight negative tracking at display sizes (`{typography.display-1}`)
- Exactly one structural accent — Notion blue `{colors.primary}` — reserved for CTAs and links
- A decorative-only multi-colour sticker palette (`{colors.accent-purple}`, `{colors.accent-pink}`, `{colors.accent-orange}`, `{colors.accent-teal}`, `{colors.accent-green}`, `{colors.accent-sky}`) that adds personality without ever painting structure
- Pill-shaped marketing CTAs (`{rounded.full}`) contrasted with 8px utility buttons (`{rounded.md}`)
- Elevation by hairline + barely-there layered shadow, not heavy drop-shadows
- A single dark indigo hero "night" band (`{colors.secondary}`) inverting the otherwise daylight page rhythm

## Colors

> Source pages analysed: the Notion home page plus Pricing, Enterprise, Product (AI), Product (Agents), and Startups. Every secondary page resolved to the same core palette — Notion runs one tightly-scoped system across the marketing site.

### Brand & Accent
- **Notion Blue** (`{colors.primary}` — #0075de): the single structural accent. Primary CTA fill ("Get Notion free"), inline link colour, active-tab and focus signal. This is the only colour that ever paints an action.
- **Pressed Blue** (`{colors.primary-active}` — #005bab): the darker press state of the primary CTA.
- **Deep Indigo** (`{colors.secondary}` — #213183): the dark hero "night" band background and its sticker-constellation field; a deep brand-blue used for full-bleed inverted sections.

The remaining colours form Notion's **decorative sticker palette** — they appear only as illustrated blocks, app stickers and category dots, never as CTAs or structural fills:
- **Sticker Sky** (`{colors.accent-sky}` — #62aef0)
- **Sticker Purple** (`{colors.accent-purple}` — #d6b6f6) / **Deep Purple** (`{colors.accent-purple-deep}` — #391c57)
- **Sticker Pink** (`{colors.accent-pink}` — #ff64c8)
- **Sticker Orange** (`{colors.accent-orange}` — #dd5b00) / **Deep Orange** (`{colors.accent-orange-deep}` — #793400)
- **Sticker Teal** (`{colors.accent-teal}` — #2a9d99)
- **Sticker Green** (`{colors.accent-green}` — #1aae39)
- **Sticker Brown** (`{colors.accent-brown}` — #523410)

### Surface
- **White** (`{colors.canvas}` / `{colors.surface}` — #ffffff): card and panel surfaces, nav bar, form fields.
- **Warm Paper** (`{colors.canvas-soft}` — #f6f5f4): the signature page canvas and the footer band — a warm off-white that gives the whole site its document-like calm.
- **Hairline** (`{colors.hairline}` — #e6e6e6): 1px card borders and dividers, a black-at-10%-on-white blend kept solid for token reuse.

### Text
- **Ink** (`{colors.ink}` — #000000): primary headings and body text (rendered at ~95% alpha for a soft true-black).
- **Warm Charcoal** (`{colors.ink-secondary}` — #31302e): secondary body copy and footer text.
- **Stone** (`{colors.ink-muted}` — #615d59): supporting / muted copy.
- **Ash** (`{colors.ink-faint}` — #a39e98): captions, metadata, placeholder text.

### Semantic
Notion's marketing surfaces do not expose a dedicated error/success palette in the system chrome — status is carried by the sticker palette (e.g. `{colors.accent-green}` for affirmative ticks) rather than a separate semantic ramp.

## Typography

### Font Family
The entire system is set in **`NotionInter`** — Notion's tuned cut of Inter — with a fallback stack of `Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial`. A single family carries everything from 64px display headlines to 12px eyebrows; there is no serif, no monospace display face. OpenType `lnum` (lining numerals) and `locl` features are enabled on body and heading roles.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-1}` | 64px | 700 | 1.0 | −2.125px | Hero headline ("Meet the night shift") |
| `{typography.display-2}` | 54px | 700 | 1.04 | −1.875px | Large section headlines |
| `{typography.heading-1}` | 40px | 700 | 1.1 | −1px | Section headlines ("Plans and features") |
| `{typography.heading-2}` | 26px | 700 | 1.23 | −0.625px | Sub-section headings |
| `{typography.heading-3}` | 22px | 700 | 1.27 | −0.25px | Card titles |
| `{typography.title}` | 20px | 600 | 1.4 | −0.125px | Feature titles, callouts |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body copy |
| `{typography.body-sm}` | 15px | 400 | 1.33 | 0 | Dense body, table rows, nav |
| `{typography.button}` | 16px | 500 | 1.5 | 0 | Button labels |
| `{typography.caption}` | 14px | 400 | 1.43 | 0 | Captions, footnotes |
| `{typography.eyebrow}` | 12px | 600 | 1.33 | +0.125px | Pill badges, small labels |

### Principles
Notion's type voice is **tight, heavy, and quiet-confident**. Headlines lean on weight 700 and aggressive negative tracking (more negative the larger the size) so display copy feels set, not stretched. Body copy stays at a comfortable 1.5 line-height for document readability. The contrast between a heavy 700 headline and a calm 400 body is the primary expressive lever — there is no decorative typography, only a clear hierarchy.

### Note on Font Substitutes
`NotionInter` is a proprietary tuning of the open-source **Inter** family — substitute Inter directly. To approximate Notion's display tightness, apply the negative letter-spacing values in the table above explicitly (Inter at default tracking will read looser than `NotionInter`).

## Layout

### Spacing System
- **Base unit**: 8px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 28px · `{spacing.xxl}` 32px.
- Card interior padding lands around `{spacing.lg}` (24px); utility buttons use a tight 4px/14px; form fields pad at `{spacing.xxs}`-scale 6px. Section gaps stack the larger steps.

### Grid & Container
Content is centred in a wide max-width column (~1080–1300px on desktop per the extracted breakpoints) with generous outer gutters. Feature sections alternate between full-width text blocks and 2-up / 3-up card grids; the pricing page widens to a 4-column plan table. The dark hero spans full-bleed edge to edge while body sections respect the centred container.

### Whitespace Philosophy
Whitespace is the primary grouping device. Sections are separated by large vertical gaps rather than rules, and cards sit on the warm canvas with quiet hairlines instead of heavy frames. The effect is document-like: airy, scannable, and never crowded.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Wide | 1440px+ | Full multi-column grids, widest container |
| Desktop | 1080–1300px | Standard centred container, 3-up card grids |
| Tablet | 768–840px | Grids collapse to 2-up, nav begins condensing |
| Mobile | ≤600px | Single-column stacks, hamburger nav, full-width CTAs |

#### Touch Targets
Pill CTAs (`button-primary`, `button-secondary`) and utility buttons (`button-utility`) carry comfortable tap padding; aim for a 44×44px minimum hit area on mobile by preserving vertical padding even as labels shrink.

#### Collapsing Strategy
The top nav condenses to a hamburger below the tablet breakpoint; multi-column card grids collapse to a single stacked column; the pricing plan table reflows from 4 side-by-side columns into stacked plan cards. Section padding tightens but the warm-canvas rhythm is preserved.

#### Image Behavior
Product screenshots and illustration tiles sit inside rounded `{rounded.lg}` frames and scale fluidly within their grid cell. Sticker illustrations are small fixed-scale decorative assets that re-flow but do not crop.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | Hairline border `{colors.hairline}`, no shadow | Default cards on the warm canvas |
| 1 — Soft | Layered micro-shadow: `rgba(0,0,0,0.01) 0 0.175px 1.041px`, `0.02 0 0.8px 2.925px`, `0.027 0 2.025px 7.847px`, `0.04 0 4px 18px` | Raised feature cards, floating buttons |
| 2 — Elevated | Deeper 5-stop stack ending in `rgba(0,0,0,0.05) 0 23px 52px` | Modals, popovers, the elevated white pill on the dark hero |

Notion's elevation philosophy is **barely-there**: shadows are built from many near-transparent layers so surfaces feel gently lifted off the paper rather than dramatically dropped. Most cards rely on a hairline alone.

### Decorative Depth
The brand's real depth cue is **illustration**, not shadow. The dark indigo hero (`{colors.secondary}`) uses glowing sticker stickers and a starfield to create a sense of a lit night scene, and feature sections layer small colourful app-icon stickers over plain surfaces to add playful dimensionality. Colour-blocked illustration tiles (purple, pink, orange, teal headers on otherwise-white cards) provide visual rhythm.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Form fields, small tags, inline chips |
| `{rounded.sm}` | 5px | Menu items, list rows, status pills |
| `{rounded.md}` | 8px | Utility / nav buttons, smaller cards |
| `{rounded.lg}` | 12px | Feature cards, illustration frames, content tiles |
| `{rounded.xl}` | 16px | Large containers, image wells |
| `{rounded.full}` | 9999px | Marketing pill CTAs, badges, circular icon buttons |

### Photography Geometry
Product screenshots are framed in rounded `{rounded.lg}` / `{rounded.xl}` wells, typically full-bleed within their container with a hairline edge. Illustration tiles use colour-blocked header bands above white card bodies. Avatars and app-icon stickers are small, sometimes fully circular (`{rounded.full}`). There is no heavy art-direction crop — images scale within their rounded frame.

## Components

> **No hover states documented.** Every spec below documents Default and Active/Pressed states only. Variants live as separate `components:` front-matter entries and are described in their own sub-blocks.

### Navigation

**`nav-bar`** — Top navigation
- White surface `{colors.canvas}`, `{colors.ink}` link text at `{typography.body-sm}`, padding `{spacing.md}`. Sits as a slim sticky bar; left wordmark, centre product/solutions menu links, right "Log in" text link plus a `button-utility` "Get Notion free" CTA. Condenses to a hamburger below the tablet breakpoint.

### Buttons

**`button-primary`** — Primary CTA ("Get Notion free")
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, fully pill-shaped `{rounded.full}`. The single blue action on any page.
- Pressed state lives in `button-primary-pressed` (background `{colors.primary-active}`); marketing buttons also apply a brief `scale(0.9)` press transform.

**`button-primary-pressed`**
- Background `{colors.primary-active}`, text `{colors.on-primary}` — the depressed state of the primary CTA.

**`button-secondary`** — Secondary CTA ("Request a demo")
- White surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, pill `{rounded.full}`, carried by the soft Level-1 shadow. Pairs beside `button-primary` in the hero.

**`button-utility`** — Nav / plan-select button
- White surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, tighter `{rounded.md}` (8px), padding `4px 14px`, 1px `{colors.hairline}` border. Used for the nav CTA and pricing plan-select buttons where the marketing pill would be too large.

**`button-icon-circular`** — Carousel / media control
- Circular `{rounded.full}` control with a translucent `rgba(0,0,0,0.05)` fill and `{colors.on-primary}` glyph, used for slide and play/pause controls; applies a `scale(0.9)` press transform.

### Cards & Containers

**`feature-card`** — Content / feature card
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-md}`, rounded `{rounded.lg}` (12px), padding `{spacing.lg}` (24px). The workhorse marketing card; often topped by a colour-blocked illustration band from the sticker palette. Default elevation is flat (hairline only).

**`feature-card-elevated`** — Raised feature card
- Same chrome as `feature-card` with the soft Level-1 layered shadow for cards that float above the canvas (testimonials, floating product panels).

**`pricing-plan-card`** — Pricing plan column
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, rounded `{rounded.md}` (8px), padding `{spacing.lg}`. A bordered column listing a plan's price and feature checklist, with a `button-utility` select action.

**`pricing-plan-card-featured`** — Highlighted plan column
- Warm `{colors.canvas-soft}` fill to lift the recommended tier off the white siblings, same `{rounded.md}` shape and padding. Distinguished by surface tint rather than a coloured border.

### Inputs & Forms

**`text-input`** — Text / number field
- White surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, 1px `rgb(221,221,221)` border, rounded `{rounded.xs}` (4px), padding `6px`. Square-ish corners deliberately tighter than the pill CTAs. Focus adds the soft Level-1 shadow.

### Signature Components

**`hero-band`** — Dark "night" hero
- Full-bleed deep indigo `{colors.secondary}` band carrying `{typography.display-1}` white headline, sticker-constellation field, and a `button-primary` + `button-secondary` CTA pair. The single inverted dark island in an otherwise daylight page.

**`badge-pill`** — Eyebrow / category pill
- White surface `{colors.surface}`, `{colors.primary}` text, `{typography.eyebrow}` (12px / 600), fully pill `{rounded.full}`, padding `4px 8px`. Small labels such as the pricing "Essential for staying organized" eyebrow and category tags.

**`footer`** — Site footer
- Warm `{colors.canvas-soft}` band, `{colors.ink-secondary}` link text at `{typography.caption}`, padding `{spacing.xxl}`. Multi-column link directory closing every page.

### Examples (illustrative)

> Kit-mirror demonstration surfaces. Each `ex-*` entry references brand-native primitives so downstream consumers (`/preview-design`, `/generate-kit`) re-skin the same 10 surfaces consistently.

**`ex-pricing-tier`** — Default Pricing tier card. Re-uses feature-card chrome with brand canvas-soft surface.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`

**`ex-pricing-tier-featured`** — Featured/highlighted tier — polarity-flipped surface (dark fill + light text in light mode, light fill + dark text in dark mode).
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-product-selector`** — What's Included summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery).
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-cart-drawer`** — Subscription summary — re-purposed for SaaS / B2B (line items per add-on, not literal cart).
- Properties: `backgroundColor`, `rounded`, `padding`, `item-divider`

**`ex-app-shell-row`** — Sidebar nav row inside the App Shell example. Active state uses brand primary as the indicator.
- Properties: `backgroundColor`, `activeIndicator`, `rounded`, `padding`

**`ex-data-table-cell`** — Default data-table th + td chrome. Header uses mono-caps eyebrow typography; body uses body-sm.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-auth-form-card`** — Sign-in / sign-up card. Re-uses feature-card chrome with text-input primitives inside.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal-card`** — Modal dialog surface — same chrome as feature-card with elevated shadow.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-empty-state-card`** — Empty-state illustration frame.
- Properties: `backgroundColor`, `rounded`, `padding`, `captionTypography`

**`ex-toast`** — Toast notification surface — feature-card shape + medium shadow.
- Properties: `backgroundColor`, `rounded`, `padding`, `typography`


## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for the primary action, inline links, and the active/focus signal — nothing decorative.
- Keep the page on the warm `{colors.canvas-soft}` canvas; use pure white `{colors.surface}` for cards and fields to create gentle figure/ground.
- Let the sticker palette (`{colors.accent-pink}`, `{colors.accent-teal}`, `{colors.accent-orange}`, …) live only in illustrations, icon tiles and category dots.
- Set headlines in heavy `{typography.display-1}`/`{typography.heading-1}` with their negative tracking applied explicitly.
- Use pill `{rounded.full}` for marketing CTAs and tighter `{rounded.md}` for nav/utility buttons — the contrast is intentional.
- Define surfaces with `{colors.hairline}` and the barely-there Level-1 shadow rather than heavy drop-shadows.
- Reserve the deep indigo `{colors.secondary}` "night" treatment for a single hero moment, not repeated bands.

### Don't
- Don't paint a CTA or structural fill in any sticker-palette colour — those are decoration only.
- Don't introduce a second structural accent alongside `{colors.primary}`.
- Don't put pill `{rounded.full}` radii on form fields — inputs stay tight at `{rounded.xs}` (4px).
- Don't drop heavy shadows; Notion's elevation is many near-transparent layers, never a hard cast.
- Don't set body copy in a heavy weight — keep 400 for readability and let weight 700 belong to headlines.
- Don't place type on pure clinical white for full pages; the warm `{colors.canvas-soft}` is core to the brand calm.

## Project Components (35cheol) **[추가함]**

원본에 없거나 이 프로젝트에 맞게 정한 규칙이다. 원본 규칙(파랑 하나, 장식 전용 sticker, hairline + 옅은 그림자, pill CTA ↔ 8px utility)에 맞춰 채웠다.

### 글꼴
- `NotionInter` 대신 **Pretendard** (Inter를 바탕으로 한글을 더한 글꼴, SIL OFL 1.1). 원본의 "substitute Inter directly"를 한글까지 지키는 선택이다. Inter에는 한글이 없어서 그대로 쓰면 한글만 다른 글꼴로 바뀐다.
- 쓰는 단계: `heading-1`(로그인 화면 서비스명), `heading-2`(본문 제목 줄), `title`(상단바 서비스명), `body-md`, `body-sm`(햄버거바·메뉴 행, 입력값), `button`, `caption`(도움말·오류·안내), `eyebrow`(햄버거바 묶음 제목). 크기·굵기·줄 높이·자간은 원본 표 그대로.
- **label**: 입력칸 라벨은 원본에 없어서 `caption` 크기에 weight 600을 쓴다 (원본 굵기 사다리 400 / 500 / 600 / 700 안에서).

### 색
| 이름 | 값 | 쓰는 곳 | 이유 |
|---|---|---|---|
| `{colors.danger}` | #d70015 | 오류 문구, 오류 칸 테두리, 위험 버튼 | 원본 Semantic에 오류 색이 없다. sticker 색은 장식 전용이라 상태 표시에 쓰지 않는다. 흰 바탕 대비 5.38:1 |
| `{colors.fill-subtle}` | rgba(0, 0, 0, 0.05) | 원형 아이콘 버튼 바탕, 탭 트랙 | 원본 `button-icon-circular` 값 |
| `{colors.input-border}` | #dddddd | 입력칸 테두리 | 원본 `text-input` 값 `rgb(221,221,221)` |
- **보조 글자 색**: 읽어야 하는 보조 글자(도움말, 아이디, 빈 목록 문구)는 `{colors.ink-muted}`(#615d59, 흰 바탕 6.6:1). `{colors.ink-faint}`(#a39e98)는 흰 바탕 2.6:1이라 placeholder와 잠긴 글자에만 쓴다.
- `{colors.ink}`은 원본 설명대로 95% 검정 `rgba(0, 0, 0, 0.95)`.

### 바탕과 그림자
- 화면 바탕은 `{colors.canvas-soft}`. 카드·입력칸·상단바·메뉴는 흰색 (원본 Do: "warm canvas + white surface").
- Level 2 그림자는 원본에 마지막 단계만 적혀 있어, 앞 단계는 Level 1과 같은 비율로 채웠다: `rgba(0,0,0,0.01) 0 1px 3px, rgba(0,0,0,0.02) 0 3px 7px, rgba(0,0,0,0.02) 0 7px 15px, rgba(0,0,0,0.04) 0 14px 28px, rgba(0,0,0,0.05) 0 23px 52px`.

### `form-field` — 입력칸
| 부분 | 값 |
|---|---|
| 라벨 | label, `{colors.ink}`. 칸과 간격 `{spacing.xs}` |
| 칸 | 원본 `text-input`: 흰색, `{typography.body-sm}`, 1px `{colors.input-border}`, `{rounded.xs}`. 여백 6px × `{spacing.sm}` (원본 6px 하나만 쓰면 가로가 좁아 첫 글자가 테두리에 붙는다) |
| placeholder | `{colors.ink-faint}` |
| 도움말 / 오류 문구 | `{typography.caption}`, `{colors.ink-muted}` / `{colors.danger}`. 칸과 간격 `{spacing.xs}` |
| 칸끼리 간격 | `{spacing.md}` |

| 상태 | 모양 |
|---|---|
| Focus | 테두리 `{colors.primary}` + Level 1 그림자 (원본: Focus는 Level 1, 파랑은 focus 신호) |
| Error | 테두리 `{colors.danger}` + 오류 문구. 그 칸을 고치면 둘 다 사라진다 (화면정의서 결정 H) |
| Disabled (요청 중 잠금) | 바탕 `{colors.canvas-soft}`, 글자 `{colors.ink-faint}` |

### 버튼
| 종류 | 모양 | 쓰는 곳 |
|---|---|---|
| Primary | 원본 `button-primary`. 여백 `{spacing.xs}` × `{spacing.md}` (원본에 값 없음) | 화면의 주 행동 (로그인, 가입하기, 다시 시도). 폼 안에서는 폼 폭을 꽉 채운다 |
| Secondary | 원본 `button-secondary` (흰색 pill + Level 1 그림자) | 보조 행동 (취소, 메인으로) |
| Utility | 원본 `button-utility` (흰색, 1px hairline, `{rounded.md}`, 4px × 14px) | 목록·도구 안의 작은 행동 |
| Danger | Secondary 모양에 글자 `{colors.danger}` | 삭제처럼 위험한 행동. 확인창 필수 (Figma 04 규칙) |

| 상태 | 모양 |
|---|---|
| Active | Primary는 바탕 `{colors.primary-active}` (원본 `button-primary-pressed`). `scale(0.9)`는 원본에서 마케팅 버튼과 원형 아이콘 버튼에만 쓰므로 앱 버튼에는 쓰지 않는다 |
| Focus | `outline: 2px solid {colors.primary}`, `outline-offset: 2px` |
| Disabled (요청 중 잠금) | `opacity: 0.4`, `cursor: default` |

### `segmented-tabs` — 탭
**지금 쓰는 화면 없음** (2026-11-04 로그인·회원가입을 주소로 나누며 뺐다). 탭이 다시 필요할 때의 문법으로 남긴다. 원본에 탭이 없어서 utility 문법으로 만든다.

| 부분 | 값 |
|---|---|
| 바탕(트랙) | `{colors.fill-subtle}`, `{rounded.md}`, 안쪽 여백 `{spacing.xxs}` (따뜻한 바탕 위에서도 트랙이 보이게) |
| 탭 하나 | `{typography.body-sm}`, `{colors.ink-muted}`, `{rounded.sm}`, 여백 6px × `{spacing.md}` |
| 선택된 탭 | 흰색, `{colors.ink}` weight 600, Level 1 그림자 (원본: 떠 있는 흰 면) |

### `auth-card` — 로그인·회원가입 화면 (`/login`, `/signup`)
레퍼런스: EditorM "Desktop sign up and login pages" (Figma Community)의 비율·위치·패널 모서리를 따른다. 입력칸·버튼 모서리, 색, 글꼴은 이 문서를 따른다.

| 부분 | 값 |
|---|---|
| 배치 | 왼쪽 폼 : 오른쪽 패널 = 49 : 51 (`--auth-split`, 레퍼런스 1536 화면의 754 : 781.5). 폼이 주인공이라 먼저(왼쪽) |
| 로그인 ↔ 회원가입 | 탭이 아니라 주소를 나누고(`/login`, `/signup`), 폼 맨 아래 한 줄로 오간다: '계정이 없나요? **회원가입**' (`{typography.caption}` `{colors.ink-muted}`, 링크는 `{colors.primary}` weight 600, hover 밑줄) |
| 폼 영역 | `{colors.canvas-soft}` 위에 **상자 없이**. 가로는 가운데, 세로는 위에서 `--auth-top`(18vh, 레퍼런스 회원가입 제목 202 / 1042)에서 시작하고, 폼 묶음 높이를 `--auth-content-height`(620px = 회원가입 높이)로 잡아 맨 아래 링크를 바닥에 붙인다. 그래서 두 화면의 서비스명·제목·첫 칸·맨 아래 링크가 모두 같은 자리에 있고, 바뀌는 것은 가운데 칸 수뿐이다 (레퍼런스처럼 로그인은 버튼 아래가 넓게 빈다). 1440×900에서 서비스명 162, 제목 198, 첫 칸 354, 링크 762px. 화면 전체에 `scrollbar-gutter: stable`을 둬 긴 화면에서 스크롤바가 생겨도 가로로 밀리지 않는다. 폭 400px, 요소 사이 `{spacing.xl}` (흰 입력칸이 바탕과 구분된다. 원본 Do: "warm canvas + white fields") |
| 머리말 | 서비스명 '35cheol' `{typography.label}` `{colors.ink-muted}` → 화면 제목 32px weight 600 (`--type-auth-title`, 레퍼런스 크기. heading-1 40px는 이 화면에서 폼보다 무겁다) ('다시 오셨네요' / '35cheol 시작하기'), 첫 칸까지 약 56px → 부제 `{typography.body-md}` `{colors.ink-muted}` |
| 오른쪽 패널 | 원본 `hero-band`의 `{colors.secondary}` (화면 하나에 한 번만 쓰는 "night" 띠). 폼 쪽 두 모서리만 45px (`--radius-auth-panel`, 레퍼런스 값. 놓인 면처럼). 화면 높이에 고정(sticky). **지금은 남색 면만 둔다** (2026-11-05 서비스 소개 문구를 뺐다. 들어갈 내용은 다음에 정한다). 장식이라 `aria-hidden` |
| 비밀번호 칸 | 칸 안 오른쪽에 글자 버튼 [보기]/[숨기기] (`{typography.caption}` `{colors.ink-muted}`, 테두리 없음, hover `{colors.fill-subtle}`). 칸의 오른쪽 여백을 버튼 폭만큼 넓힌다 |
| 주 버튼 | 폼 폭을 꽉 채운 Primary. 요청 중에는 문구도 바뀐다 ('로그인 중…', '가입 중…') |
| 만료 안내 | `{colors.fill-subtle}` 바탕(같은 색 바탕 위에서 보이게), `{rounded.md}`, `{typography.caption}`. 오류가 아니라 안내라 빨강을 쓰지 않는다 |

### `toast` — 결과 알림
원본 `ex-toast`(feature-card 모양 + 그림자). 라이브러리(react-hot-toast)가 모양을 인라인 style로 넣어서 값은 `App.jsx`의 `TOAST_OPTIONS`에 `var(--...)`로 넘긴다.

| 부분 | 값 |
|---|---|
| 자리·시간 | 화면 오른쪽 아래, 3초 |
| 상자 | 흰색, 1px hairline, `{rounded.lg}`, Level 2 그림자, 여백 `{spacing.sm}` × `{spacing.md}` |
| 글자 | `{typography.caption}`, `{colors.ink}` |
| 아이콘 | 성공 `{colors.primary}`, 오류 `{colors.danger}` |

### `motion` — 움직임·hover·누르는 범위
원본은 "No hover states documented"(Default·Pressed만 있음)라서, 앱으로 쓰려고 채운 규칙이다. UI 스킬(make-interfaces-feel-better, emil-design-eng, fixing-accessibility) 기준.

| 규칙 | 값 | 이유 |
|---|---|---|
| hover | 마우스가 있는 기기에서만 (`@media (hover: hover) and (pointer: fine)`). 행·메뉴 행은 바탕 `{colors.fill-subtle}`, 선택 안 된 탭은 글자 `{colors.ink}`, Primary는 바탕 `{colors.primary-active}` | 터치에서 누른 뒤 hover 모양이 남지 않게. 원본 utility 문법(옅은 회색 면) 안에서 |
| 색 바뀜 | `background-color`·`color`·`border-color`·`box-shadow`만 150ms `ease` (`--duration-fast`) | 자주 쓰는 조작이라 짧게. `transition: all`은 쓰지 않는다 |
| 팝오버(프로필 메뉴) 열림 | 150ms 강한 ease-out (`--ease-out`), `opacity 0 → 1` + `translateY(-4px) scale(0.97) → 제자리`, 기준점은 아이콘 쪽(`top right`). 닫힐 때는 바로 사라짐 | 아이콘에서 나온다는 위치 단서. 닫힘은 열림보다 빨라야 한다 |
| 움직임 줄이기 설정 | `prefers-reduced-motion: reduce`면 위치·크기 움직임(메뉴 이동, 누름 축소)을 없애고 색·투명도만 남긴다 | 멀미 방지. 이해를 돕는 색 변화는 남긴다 |
| 누르는 범위 | 데스크톱 최소 40 × 40 (`--hit-area-min`). 보이는 크기가 작으면(프로필 아이콘 32px) `::after`로 범위만 넓힌다 | 모양은 원본 그대로 두고 누르기 쉽게 |
| 누름 | 앱 버튼(Primary·Secondary 등)은 색만 바뀌고 크기는 그대로 (`버튼` 표 Active). 원형 아이콘 버튼만 `scale(0.96)`, 150ms ease-out. 원본은 `scale(0.9)`지만 32px 원에서는 3px 넘게 줄어 튀어 보여서, 0.95 이상으로 둔다 | 작은 아이콘도 눌린 느낌은 주되 과하지 않게 |
| 햄버거바 행 높이 | 원본 여백(6px) 그대로, 약 32px. 40px로 넓히지 않는다 | 행끼리 붙어 있어 범위를 넓히면 서로 겹친다. 원본 행 밀도 유지 |
| 글자 | 화면 전체 `-webkit-font-smoothing: antialiased`, 제목 `text-wrap: balance`, 문단 `text-wrap: pretty` | macOS에서 글자가 번지지 않게, 줄 끝에 한 글자만 남지 않게 |

### `app-layout` — 공통 레이아웃 (SCR-COMMON-01)
Figma 03 배치: 왼쪽 햄버거바는 화면 높이 전체, 오른쪽 위에 상단바, 그 아래 본문 자리.

| 부분 | 값 |
|---|---|
| 햄버거바 | 흰색 `{colors.canvas}`, 오른쪽 1px hairline (흰 상단바와 'ㄱ'자 틀이 되어 따뜻한 본문과 색으로 나뉜다. 같은 색이면 선 하나로만 구분돼 흐렸다), 폭 240px (`--sidebar-width`), 여백 `{spacing.xs}`. 화면을 내려도 제자리(sticky) |
| 접기·펼치기 | Notion 방식. **펼침**: 햄버거바 맨 위 줄(상단바와 같은 높이 48px) 왼쪽 끝에 접기 버튼(창 모양 아이콘). **접힘**: 상단바 맨 왼쪽, 서비스명 앞에 ☰ 버튼. 두 버튼이 화면의 같은 자리(왼쪽 16px, 위 8px)에 있어 버튼이 움직이지 않는 것처럼 보인다. 접으면 햄버거바 칸 폭이 0이 되고 본문이 넓어진다 (덮는 서랍은 반응형 단계에서 좁은 화면용). 200ms 강한 ease-out (`--duration-nav`), 움직임 줄이기 설정이면 바로. 처음은 펼침, 접은 상태는 이 브라우저에 기억(localStorage `35cheol.navOpen`). 접힌 햄버거바는 `inert`라 Tab·화면 읽기 프로그램이 들어가지 않고, 누른 버튼이 사라지므로 커서는 반대쪽 버튼으로 넘어간다 |
| 접기·☰ 버튼 | 32 × 32 (누르는 범위 40), 투명 바탕, `{rounded.md}`, 선 아이콘 20px 굵기 1.5 `{colors.ink-secondary}`, hover `{colors.fill-subtle}`. 이름은 '메뉴' + `aria-expanded`, 마우스에는 title '메뉴 접기'/'메뉴 펼치기' |
| 묶음 | 성격이 다른 항목은 묶음으로 나누고 묶음 사이를 20px 띄운다 (`--nav-section-gap`. 16px은 좁고 24px은 떨어져 보여 가운데로. Claude·Notion 사이드바 묶음 간격 범위 안). 지금 묶음: 이동(홈) / 내 동아리 목록. 새 항목을 넣을 때도 같은 성격끼리 묶는다 |
| 묶음 제목 (내 동아리 ▾) | 아래 행보다 작고 흐린 글자: `{typography.eyebrow}`(12px, weight 600), `{colors.ink-muted}` (Notion '개인 페이지', Claude 프로젝트 이름처럼 글자 크기·색으로 '제목'과 '항목'을 나눈다). 누르면 목록을 접고 펼치는 버튼이라 행과 같은 여백·hover는 유지 |
| 행 (홈, 내 동아리, 동아리) | 원본 `ex-app-shell-row`: `{typography.body-sm}`, `{colors.ink-secondary}`, `{rounded.sm}`, 여백 6px × `{spacing.xs}`. 동아리는 들여쓰지 않고 '내 동아리'와 같은 줄에서 시작(묶음 간격으로 이미 한 덩어리로 보임), 길면 말줄임 |
| 현재 화면 행 | 원본 "active indicator = primary": 글자 `{colors.primary}`, weight 600 + 바탕 `--color-fill-strong`(9%). 마우스를 올린 행은 한 단계 옅은 `{colors.fill-subtle}`(5%)이라 '지금 보는 곳'과 '가리키는 곳'이 구분된다 (Claude 사이드바처럼). 현재 화면 행은 마우스를 올려도 그대로 |
| PENDING | `{colors.ink-muted}` + ' · 대기중' |
| 빈 목록·실패 문구 | `{typography.caption}`, `{colors.ink-muted}` |
| 상단바 | 원본 `nav-bar`: 흰색, 아래 1px hairline, 높이 48px (`--header-height`, 아이콘 32 + 위아래 `{spacing.xs}`), 좌우 여백 `{spacing.md}` |
| 서비스명 | `{typography.title}`, `{colors.ink}` (워드마크 자리라 파랑을 쓰지 않음) |
| 프로필 아이콘 | 원본 `button-icon-circular`: 32 × 32 (`--icon-button-size`), `{colors.fill-subtle}`, 이름 첫 글자 `{typography.caption}` weight 600 `{colors.ink}` (흰 바탕이라 원본의 흰 글자 대신 ink), 누르면 `scale(0.96)` (`motion` 참고). hover와 메뉴가 열려 있는 동안은 한 톤 진한 `--color-fill-strong`(9% 검정) |
| 프로필 메뉴 | 팝오버: 흰색, 1px hairline, `{rounded.lg}`(12), Level 2 그림자, 여백 `{spacing.xs}`(8), 폭 240px. **머리**: 아바타 원(프로필 아이콘과 같은 32px, 누를 수 없는 그림) + 이름 `{typography.body-sm}` weight 600 / 아이디 `{typography.caption}` `{colors.ink-muted}`, 길면 말줄임 (Notion·Claude 계정 메뉴처럼 누구로 로그인했는지 한눈에). 구분선 hairline. **메뉴 행**: 선 아이콘 18px(`--icon-size-sm`, 굵기 1.5, `{colors.ink-secondary}`) + 글자 `{typography.body-sm}`, 모서리 4px (= 카드 12 − 여백 8, 겹친 모서리를 나란히), hover `{colors.fill-subtle}`. 로그아웃은 위험한 동작이 아니라 빨강을 쓰지 않고, 요청 중에는 '로그아웃 중…'. 키보드(Enter·Space)로 열면 커서가 첫 항목으로 가고, 마우스로 열면 옮기지 않는다 |
| 본문 자리 | `{colors.canvas-soft}` 위에 여백 `{spacing.xxl}`. 제목 줄은 `{typography.heading-2}` |
| 앱 시작 | `status-panel`을 화면 전체 가운데에 (로딩, 실패면 500 패널 + [다시 시도] = AUTH-03 다시 요청) |

### `status-panel` — 공통 상태 패널 (SCR-COMMON-02)
조회 화면의 로딩·403·404·500을 그리는 부품 하나 (`components/StatusPanel.jsx`). 동작과 문구는 Figma 03 SCR-COMMON-02, 문구는 `messages.js`.

| 부분 | 값 |
|---|---|
| 자리 | 상자 없이 본문 자리 가운데, 위 여백 `{spacing.section}` (원본 Do: 바탕 위에 바로. 비어 있는 상태라 면을 더하지 않는다). 앱 시작(레이아웃 밖)은 화면 전체의 세로 가운데 |
| 로딩 | '불러오는 중…' `{typography.body-md}` `{colors.ink-muted}`, 글자만 (스피너 없음) |
| 제목 | `{typography.title}` (heading 계열 중 본문 제목 `heading-2`보다 한 단계 아래), `{colors.ink}` |
| 설명 | `{typography.caption}`, `{colors.ink-muted}`. 제목과 간격 `{spacing.xs}`, 버튼과 간격 `{spacing.lg}` |
| [메인으로]·[동아리 홈으로] | button-secondary (흰 pill + Level 1 그림자). hover는 Level 2 그림자, 누르면 바탕 `{colors.canvas-soft}` |
| [다시 시도] | button-primary. 누르면 로딩 패널로 바뀌었다가 결과를 그림 |
| 본문 제목 | 화면에 제목 줄이 있으면 남기고 그 아래에 패널 (어느 화면의 실패인지 보이게). 404처럼 화면 자체가 없으면 패널만 |

### `org-card` — 메인 카드 목록 (SCR-ORG-01)
레퍼런스: 네이버 밴드 '내 밴드' 카드(위 사진 + 아래 이름, 약 8:9)를 비율로 옮겼다. 원본 `feature-card`의 "colour-blocked illustration band from the sticker palette"(카드 위 색 띠) 문법으로, 사진 자리를 색 띠로 채운다. 동작·순서는 Figma 03 SCR-ORG-01. 2026-11-05에 A(기존 2:1)·B(3:2)·D(3:4)·E(2:3)·F(밴드형)를 열림·닫힘 스크린샷으로 비교해 F를 골랐다.

| 부분 | 값 |
|---|---|
| 배치 | 카드 최소 폭 200px(`--org-card-min-width`)으로 한 줄에 들어가는 만큼 (`repeat(auto-fill, minmax(…, 1fr))`), 사이 `{spacing.lg}`. 만들기·가입하기가 항상 앞 → 가입한 동아리 → **대기중 동아리는 맨 뒤** (각각 안에서는 ORG-02 순서). 화면정의서의 'ORG-02 정렬 그대로'와 다르게, 들어갈 수 있는 동아리를 앞에 모았다 (2026-11-05). 햄버거바 목록도 같은 순서 (`AppLayout`이 한 번 정렬해 둘 다에 넘긴다) |
| 햄버거바를 여닫을 때 | **비율 고정 + 열 수 변동**: 1440에서 열림 5열 208×234, 닫힘 6열 209×235. 넓어진 폭은 카드를 하나 더 놓는 데 쓰고 카드 모양은 그대로. 열 수 고정(카드가 옆으로 늘어남)과 최대 폭 고정(닫으면 양옆이 빔)은 쓰지 않는다. `auto-fill`이라 0개일 때 두 장이 늘어나지 않는다 |
| 카드 | 흰색, 테두리 없이 Level 1 그림자, `{rounded.xl}`, 가로:세로 8:9 (`--org-card-ratio`, 밴드 235×264) |
| 색 띠 | 카드 위 56% (`--org-band-height`. 밴드 사진은 64%인데 이름 2줄 자리를 남기려고 줄임). 동아리 이름 첫 글자 40px weight 700 흰색, 장식이라 `aria-hidden`. 색은 sticker 6색(sky, purple, pink, orange, teal, green) 중 `orgId % 6`으로 고른다: 같은 동아리는 어디서든 늘 같은 색. purple은 밝아서 글자를 deep purple로 |
| 이름·역할 | 띠 아래 여백 `{spacing.sm}` × `{spacing.md}`. 이름 `--type-body-strong` 2줄까지, 넘치면 … / 역할 `{typography.caption}` `{colors.ink-muted}`. **역할은 카드 아래(여백 `{spacing.sm}`)에 고정**해 이름이 1줄이든 2줄이든 모든 카드에서 같은 높이에 온다. 잘려도 링크 이름은 전체 이름 |
| PENDING | 흰 면·그림자 없이 바탕색 + hairline, 띠는 `--color-fill-strong` 회색 + 글자 `{colors.ink-faint}`, 이름 `{colors.ink-muted}`, 역할 자리에 '대기중' |
| 만들기·가입하기 | 동아리 카드와 같은 흰 카드 (밴드처럼 점선 없음). 가운데에 64px 원(`{colors.fill-subtle}`) 안 24px 선 아이콘(+ / 들어가는 화살표, `{colors.ink-secondary}`) → 제목 `--type-body-strong` → 설명 caption `{colors.ink-muted}`. 동아리 카드와는 색 띠 유무로 구분된다 |
| hover (마우스 기기만, 150ms) | 흰 카드는 Level 2 그림자(떠오름), PENDING은 Level 1 |
| Focus | 버튼과 같은 2px primary outline |
| 로딩·실패 | 만들기·가입하기는 그대로 두고, 그 아래에 `status-panel` (로딩, 500 + [다시 시도]) |
| 0개 | 만들기·가입하기 두 장만. 빈 목록 문구 없음 (화면정의서 SCR-ORG-01) |
| 본문 제목 | 화면에는 두지 않는다 (화면정의서 "본문 제목 줄 없음"). 화면 읽기 프로그램용 `h1` '내 동아리'만 숨겨 둔다 (`.visually-hidden`) |

### `modal` — 모달 (SCR-ORG-02 동아리 만들기, SCR-JOIN-01 가입하기)
원본 `ex-modal-card`("feature-card 모양 + elevated shadow")를 따른다. 부품은 `components/Modal.jsx` 하나, 동작은 Figma 03 각 모달 카드.

| 부분 | 값 |
|---|---|
| 배경(scrim) | 화면 전체 `--color-scrim`(검정 40%) |
| 상자 | 흰색, `{rounded.xl}`(메인 카드와 같은 둥글기), 여백 `{spacing.lg}`, Level 2 그림자. 폭 448px (`--modal-width` = 폼 400 + 좌우 여백 24×2), 위에서 18vh (`--modal-top`, 로그인 폼과 같은 높이 기준) |
| 제목 | `{typography.title}`, 칸과 간격 `{spacing.md}` |
| 칸 | `form-field` 그대로 (라벨 → 칸 → 도움말 → 오류 문구) |
| 버튼 줄 | 오른쪽 정렬 [취소] Secondary · [주 행동] Primary, 사이 `{spacing.xs}`, 칸과 간격 `{spacing.lg}`. 폼 폭을 채우지 않는다 (행동이 둘이라 나란히, 와이어프레임과 같음). 요청 중에는 주 버튼 문구가 바뀌고('만드는 중…') 둘 다 잠긴다 |
| 열림 | 200ms 강한 ease-out (`--duration-modal`): 배경은 opacity, 상자는 opacity + `scale(0.96 → 1)`. **닫힘은 바로** (motion 규칙). 움직임 줄이기면 opacity만 |
| 겹침 | `--z-modal` 20 (프로필 메뉴 10 위). 토스트(react-hot-toast 9999)는 모달 위에 보인다: 모달 안 500·네트워크 토스트가 가려지지 않게 (`<dialog>`의 top layer를 쓰지 않은 이유) |
| 접근성 | `role="dialog"` + `aria-modal="true"` + `aria-labelledby`(제목). 열리면 첫 칸에 커서, 뒤 화면(`#app-shell`)은 `inert`라 Tab·클릭·화면 읽기 프로그램이 닿지 않는다. Esc·바깥 누르면 닫힘(요청 중에는 막음), 닫히면 연 버튼으로 커서를 돌려준다. 열린 동안 뒤 화면 스크롤을 막는다 |
