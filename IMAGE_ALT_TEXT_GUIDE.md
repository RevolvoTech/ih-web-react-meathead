# IMAGE SEO - ALT TEXT OPTIMIZATION GUIDE

## Why Alt Text Matters for SEO
Google can't "see" images - it reads alt text to understand image content. Optimized alt text = better image search rankings.

---

## CURRENT IMAGES - RECOMMENDED ALT TEXT

### Logo
**File:** `/images/logo.webp`
**Current Alt:** "Meathead Logo"
**Optimized Alt:** "MEATHEAD Premium Beef Patties Islamabad - High Protein Gym Food Logo"

---

### Product Images

#### Main Patty Image
**File:** `/images/patty.webp`
**Current Alt:** "Meathead Premium Beef Patty"
**Optimized Alt:** "Premium beef patty 125g with 24g protein - MEATHEAD smash burger patty Islamabad Pakistan"

#### Product 1
**File:** `/images/product_1.webp`
**Suggested Alt:** "MEATHEAD cooked beef patty high protein meal replacement alternative to protein powder Islamabad"

---

## ALT TEXT BEST PRACTICES

### ✅ DO:
- Include primary keywords naturally
- Describe what's actually in the image
- Keep it under 125 characters
- Include location (Islamabad/Rawalpindi) when relevant
- Mention product benefits (24g protein, halal, etc.)

### ❌ DON'T:
- Keyword stuff ("beef patty beef patty beef patty")
- Use generic descriptions ("image of food")
- Leave alt text empty
- Use same alt text for different images
- Ignore file names (rename to be SEO-friendly)

---

## RECOMMENDED FILE NAME OPTIMIZATIONS

**Current → Optimized:**
- `patty.webp` → `meathead-premium-beef-patty-24g-protein-islamabad.webp`
- `logo.webp` → `meathead-high-protein-beef-patties-logo-pakistan.webp`
- `product_1.webp` → `halal-beef-burger-patty-smash-burger-islamabad.webp`

---

## IMAGE METADATA FOR FUTURE UPLOADS

When adding new images, use this template:

```jsx
<Image
  src="/images/[descriptive-filename].webp"
  alt="MEATHEAD [what's shown] [benefit] [location if relevant]"
  width={800}
  height={800}
  loading="lazy" // for performance
/>
```

**Examples:**

```jsx
// Cooking process
<Image
  src="/images/beef-patty-cooking-tallow.webp"
  alt="MEATHEAD beef patty cooking in pure beef tallow for maximum flavor and nutrition Islamabad"
  width={600}
  height={400}
/>

// Customer eating
<Image
  src="/images/gym-bro-eating-beef-burger.webp"
  alt="Islamabad gym enthusiast eating MEATHEAD high protein smash burger post-workout meal"
  width={600}
  height={400}
/>

// Nutrition facts
<Image
  src="/images/beef-patty-nutrition-label-24g-protein.webp"
  alt="MEATHEAD beef patty nutrition facts showing 24g protein 0g carbs better than protein powder"
  width={500}
  height={600}
/>

// Packaging
<Image
  src="/images/meathead-beef-patties-packaging-delivery.webp"
  alt="MEATHEAD premium beef patties delivery packaging twin cities Islamabad Rawalpindi"
  width={600}
  height={400}
/>
```

---

## FUTURE IMAGE NEEDS FOR SEO

### High-Priority Images to Add:

1. **Customer Transformations**
   - Before/After gym results
   - Alt: "Islamabad gym enthusiast muscle gain transformation using MEATHEAD high protein beef patties"

2. **Comparison Graphics**
   - MEATHEAD vs Protein Powder infographic
   - Alt: "MEATHEAD beef patties vs protein powder comparison chart showing superior nutrition"

3. **Recipe/Usage Images**
   - Smash burger preparation
   - Alt: "How to make perfect smash burger with MEATHEAD premium beef patties at home"

4. **Delivery Process**
   - Delivery bike in Islamabad
   - Alt: "MEATHEAD beef patties delivery service Islamabad Rawalpindi fresh protein delivery"

5. **Gym Partnership**
   - Photos at local gyms
   - Alt: "MEATHEAD protein partner with [Gym Name] Islamabad bodybuilding nutrition"

---

## QUICK UPDATE CHECKLIST

To update current images:

1. **Go to Hero.tsx (line 39-45):**
```tsx
<Image
  src="/images/logo.webp"
  alt="MEATHEAD Premium Beef Patties Islamabad - High Protein Gym Food Logo"
  width={300}
  height={300}
  className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto lg:mx-0"
/>
```

2. **Go to Hero.tsx (line 168-174):**
```tsx
<Image
  src="/images/patty.webp"
  alt="Premium beef patty 125g with 24g protein MEATHEAD smash burger halal beef Islamabad Pakistan"
  width={800}
  height={800}
  className="w-full h-auto"
  priority
/>
```

3. **Update any other Image components** throughout the site with keyword-rich alt text.

---

## BONUS: SOCIAL MEDIA IMAGE OPTIMIZATION

### Instagram Posts - Alt Text Template:
```
"MEATHEAD beef patties [specific image content] - 24g protein, halal, Islamabad delivery #BeefPattiesIslamabad #GymFoodPakistan"
```

### Facebook - Image Description:
```
"Premium beef burger patties in Islamabad - Better than protein powder for muscle gain.
MEATHEAD delivers high-protein meals to twin cities gym enthusiasts.
#IslamabadGym #ProteinAlternative"
```

---

**Pro Tip:** Google Image Search is MASSIVE for food products. Proper alt text can drive 30-40% more traffic from image searches alone!
