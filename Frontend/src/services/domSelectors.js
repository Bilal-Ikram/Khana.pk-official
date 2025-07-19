// services/domSelectors.js
// Centralized DOM selectors for voice interaction automation
// Supports multiple food delivery platforms and responsive layouts

export const DOM_SELECTORS = {
  KHANA_PK: {
    // === Page Identifier Selectors ===
    PAGE_IDENTIFIERS: {
      restaurantListingPage: [
        /// HOMPAGE
        '[data-testid="khana-pk-main-container"]',
        ".restaurant-listing-page",
        '[data-page="restaurants"]',
      ],
      restaurantDetailsPage: [
        '[data-testid="restaurant-header"]',
        ".restaurant-details-page",
        '[data-page="restaurant-details"]',
        '[data-testid="menu-item"]',
      ],

      cartPage: [
        '[data-testid="cart-items-section"]',
        ".cart-page",
        '[data-page="cart"]',
      ],
      checkoutPage: [
        '[data-testid="checkout-form"]',
        ".checkout-page",
        '[data-page="checkout"]',
      ],
      orderTrackingPage: [
        '[data-testid="order-status"]',
        ".order-tracking-page",
        '[data-page="order-tracking"]',
      ],
    },
    // === Restaurant Listing Page ===
    RESTAURANT_LISTING: {
      restaurantCard: [
        '[data-testid="restaurant-card"]',
        ".restaurant-card",
        '[class*="restaurant"]',
        ".store-card",
        ".vendor-card",
      ],
      restaurantName: [
        '[data-testid="restaurant-name"]',
        ".restaurant-name",
        ".store-name",
        ".vendor-name",
        "h3",
        "h2",
      ],
      searchInput: [
        '[data-testid="search-input"]',
        'input[type="search"]',
        'input[placeholder*="search"]',
        'input[placeholder*="Search"]',
        ".search-input",
      ],
      searchBar: [
        '[data-testid="search-bar"]',
        ".search-bar",
        ".search-container",
      ],
      cuisineFilter: [
        '[data-testid="cuisine-filter"]',
        ".cuisine-filter",
        '[class*="filter"]',
      ],
      gridViewToggle: ['[data-testid="grid-view-toggle"]'],
      listViewToggle: ['[data-testid="list-view-toggle"]'],
      addToFavorites: ['[data-testid="add-to-favorites"]'],
      removeFromFavorites: ['[data-testid="remove-from-favorites"]'],
      favoritesTab: ['[role="button"]:contains("Favorites")'],
      showAllRestaurantsTab: ['[role="button"]:contains("All")'],
      emptyState: [
        ".empty-state",
        '[data-testid="empty-state"]',
        '[data-testid="no-results-found"]',
      ],
    },

    // === Restaurant Details Page ===
    RESTAURANT_DETAILS: {
      menuTab: ['[data-testid="menu-tab"]'],
      infoTab: ['[data-testid="info-tab"]'],
      featuredOnlyCheckbox: ['input[type="checkbox"][value="Featured Only"]'],
      openNowCheckbox: ['input[type="checkbox"][value="Open Now"]'],
      // === Menu Item Details CARD ===

      menuItem: [
        '[data-testid="menu-item"]',
        ".menu-item",
        ".dish-card",
        ".food-item",
      ],
      menuItemName: [
        '[data-testid="item-name"]',
        ".item-name",
        ".dish-name",
        ".food-name",
        "h4",
        "h3",
      ],
      menuItemDescription: [
        '[data-testid="item-description"]',
        ".item-description",
        ".description",
      ],
      menuItemPrice: ['[data-testid="item-price"]', ".item-price", ".price"],
      variationOption: [
        '[data-testid="variation-option"]',
        ".variation-button",
        'button[class*="variation"]',
      ],
      ingredientTag: [
        '[data-testid="ingredient-tag"]',
        ".ingredient-tag",
        ".ingredient",
      ],
      tagBadge: ['[data-testid="tag-badge"]', ".tag-badge", ".badge"],
      vegetarianBadge: [
        '[data-testid="vegetarian-badge"]',
        ".vegetarian-badge",
        '[class*="vegetarian"]',
      ],
      spicyBadge: [
        '[data-testid="spicy-badge"]',
        ".spicy-badge",
        '[class*="spicy"]',
      ],
      quantityControls: [
        '[data-testid="quantity-controls"]',
        ".quantity-controls",
        '[class*="quantity"]',
      ],
      preparationTime: [
        '[data-testid="preparation-time"]',
        ".preparation-time",
        '[class*="prep"]',
      ],
      addToCartButton: [
        'button[data-testid="add-to-cart"]',
        'button[class*="bg-pink-500"]',
        "button:has(.shopping-cart)",
        ".add-to-cart",
        'button[class*="cart"]',
        // Remove generic 'button[class*="add"]' as it's too broad
      ],
    },

    // === Cart Page ===
    CART_PAGE: {
      cartPageTitle: [
        '[data-testid="cart-title"]',
        '[data-voice-target="cart-title"]',
      ],
      cartItemsSection: ['[data-testid="cart-items-section"]'],
      cartItem: ['[data-testid="cart-item"]', ".cart-item", ".basket-item"],
      cartItemImage: ['[data-testid="cart-item-image"]'],
      cartItemName: [
        '[data-testid="cart-item-name"]',
        ".cart-item-name",
        ".item-title",
      ],
      cartItemPrice: ['[data-testid="cart-item-price"]', ".cart-item-price"],
      cartItemVariation: [
        '[data-testid="cart-item-variation"]',
        ".cart-item-variation",
      ],
      quantityControls: [
        '[data-testid="quantity-controls"]',
        ".quantity-controls",
        '[data-voice-target="quantity-controls"]',
      ],
      decreaseQuantityButton: [
        '[data-testid="decrease-quantity-button"]',
        '[data-voice-target="decrease-quantity-button"]',
      ],
      increaseQuantityButton: [
        '[data-testid="increase-quantity-button"]',
        '[data-voice-target="increase-quantity-button"]',
      ],
      removeItemButton: [
        '[data-testid="remove-item-button"]',
        '[data-voice-target="remove-item-button"]',
      ],
      cartTotal: [
        '[data-testid="cart-total"]',
        '[data-voice-target="cart-total"]',
      ],
      proceedToCheckoutButton: [
        '[data-testid="checkout-button"]',
        '[data-voice-target="checkout-button"]',
        ".checkout-button",
      ],
      clearCartButton: [
        '[data-testid="clear-cart-button"]',
        '[data-voice-target="clear-cart-button"]',
      ],
      emptyCartMessage: [
        '[data-testid="empty-cart-message"]',
        '[data-testid="cart-is-empty"]',
      ],
      browseRestaurantsLink: [
        '[data-testid="browse-restaurants-link"]',
        'a[href="/"]',
      ],
    },

    // === Order Tracking Page ===
    ORDER_TRACKING: {
      orderStatus: ['[data-testid="order-status"]'],
      orderTimeline: ['[data-testid="order-timeline"]'],
      orderSummaryItem: ['[data-testid="order-summary-item"]'],
      orderTotal: ['[data-testid="order-total"]'],
      deliveryDetailsName: ['[data-testid="delivery-details-name"]'],
      deliveryDetailsAddress: ['[data-testid="delivery-details-address"]'],
      deliveryNotes: ['[data-testid="delivery-notes"]'],
      ratingStars: ['[data-testid="rating-stars"]'],
      reviewTextarea: ['[data-testid="review-textarea"]'],
      submitRatingButton: ['[data-testid="submit-rating-button"]'],
      editRatingButton: [
        '[data-testid="edit-rating-button"]',
        '[data-testid="edit-rating-button-secondary"]',
      ],
      photoUploadInput: ['[data-testid="photo-upload-input"]'],
      photoPreview: ['[data-testid="photo-preview"]'],
    },

    // === Checkout Process ===
    CHECKOUT_PAGE: {
      addressInput: [
        '[data-testid="address-input"]',
        'input[placeholder*="address"]',
        'input[placeholder*="Address"]',
        ".address-input",
      ],
      paymentMethodSelect: [
        '[data-testid="payment-method-select"]',
        ".payment-method-select",
        'select[name="paymentMethod"]',
      ],
      placeOrderButton: [
        '[data-testid="place-order"]',
        ".place-order",
        'button[type="submit"]:contains("Place Order")',
      ],
    },

    // === Navigation Selectors (Voice Assistant Friendly) ===
    NAVIGATION: {
      backButton: [
        '[data-testid="back-button"]',
        ".back-button",
        'button:contains("Back")',
        'a[href]:contains("Back")',
      ],
      homeLink: ['[data-testid="home-link"]', ".nav-home", 'a[href="/"]'],
      cartLink: ['[data-testid="cart-link"]', ".nav-cart", 'a[href="/cart"]'],
      profileLink: [
        '[data-testid="profile-link"]',
        ".nav-profile",
        'a[href="/profile"]',
      ],
      previousPageLink: [
        '[data-testid="prev-page"]',
        ".prev-page",
        'a:contains("Back")',
      ],
      nextPageLink: [
        '[data-testid="next-page"]',
        ".next-page",
        'a:contains("Next")',
      ],
    },

    // === Error Handling & Feedback ===
    ERROR_HANDLING: {
      errorMessage: [
        ".error-message",
        '[role="alert"]',
        ".bg-red-100",
        "#error",
      ],
      successMessage: [
        ".success-message",
        '[role="status"]',
        ".bg-green-100",
        "#success",
      ],
      loadingSpinner: [
        '[data-testid="loading-spinner"]',
        ".animate-spin",
        ".loading",
        ".spinner",
      ],
      confirmationModal: [
        ".modal",
        '[data-testid="confirmation-modal"]',
        ".confirm-dialog",
      ],
      modalConfirmButton: [
        '[data-testid="modal-confirm"]',
        ".modal-confirm",
        'button:contains("Yes")',
      ],
      modalCancelButton: [
        '[data-testid="modal-cancel"]',
        ".modal-cancel",
        'button:contains("No")',
      ],
    },

    // === Voice Interface Selectors ===
    VOICE_INTERFACE: {
      voiceInstructions: [
        '[data-testid="voice-instructions"]',
        ".voice-instructions",
        '[aria-live="polite"]',
      ],
      voiceCommandInput: [
        '[data-testid="voice-command-input"]',
        ".voice-command-input",
        "#voice-input",
      ],
      voiceActionButton: [
        '[data-testid="voice-action-button"]',
        ".voice-action-button",
        "#execute-voice",
      ],
    },
  },
};

console.log("DOM_SELECTORS.KHANA_PK:", DOM_SELECTORS.KHANA_PK);

export const PLATFORM_DETECTION = {
  "khana.pk": "KHANA_PK",
  "www.khana.pk": "KHANA_PK",
  "localhost": "KHANA_PK",
  "khana-pk-official.vercel.app": "KHANA_PK",
};

// Or use a more flexible detection function:
export function detectPlatform() {
  const hostname = window.location.hostname;
  
  // Direct mapping first
  if (PLATFORM_DETECTION[hostname]) {
    return PLATFORM_DETECTION[hostname];
  }
  
  // Flexible matching for development/staging URLs
  if (hostname.includes('khana-pk') || 
      hostname.includes('localhost') || 
      hostname.includes('khana.pk')) {
    return 'KHANA_PK';
  }
  
  // Default fallback
  console.warn(`Unknown platform: ${hostname}, defaulting to KHANA_PK`);
  return 'KHANA_PK';
}

// === SELECTOR UTILITIES ===
export class SelectorManager {
  constructor() {
    this.currentPlatform = this.detectPlatform();
    this.selectors =
      DOM_SELECTORS[this.currentPlatform] || DOM_SELECTORS.GENERIC;
  }

  // Detect current platform based on URL
  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();

    for (const [domain, platform] of Object.entries(PLATFORM_DETECTION)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }

    return "GENERIC";
  }

  // Get selectors for current platform
  getSelectors(elementType) {
    // Direct match (legacy fallback)
    if (this.selectors[elementType]) {
      return this.selectors[elementType];
    }

    // Search inside nested groups like RESTAURANT_LISTING, CART_PAGE, etc.
    for (const group of Object.values(this.selectors)) {
      if (group && typeof group === "object" && group[elementType]) {
        return group[elementType];
      }
    }

    // Fallback to GENERIC if still not found
    if (DOM_SELECTORS.GENERIC) {
      for (const group of Object.values(DOM_SELECTORS.GENERIC)) {
        if (group && typeof group === "object" && group[elementType]) {
          return group[elementType];
        }
      }
    }

    // Not found
    console.warn(`⚠️ No selector found for elementType: ${elementType}`);
    return [];
  }

  // Find element using multiple selectors (priority order)
  findElement(elementType, container = document) {
    const selectors = this.getSelectors(elementType);

    for (const selector of selectors) {
      const element = container.querySelector(selector);
      if (element) {
        console.log(`✅ Found ${elementType} using selector: ${selector}`);
        return element;
      }
    }

    console.warn(
      `❌ Could not find ${elementType} using selectors:`,
      selectors
    );
    return null;
  }

  // Find all elements using multiple selectors
  findElements(elementType, container = document) {
    const selectors = this.getSelectors(elementType);
    let allElements = [];

    for (const selector of selectors) {
      const elements = Array.from(container.querySelectorAll(selector));
      if (elements.length > 0) {
        console.log(
          `✅ Found ${elements.length} ${elementType} using selector: ${selector}`
        );
        allElements = allElements.concat(elements);
      }
    }

    // Remove duplicates
    const uniqueElements = [...new Set(allElements)];

    if (uniqueElements.length === 0) {
      console.warn(
        `❌ Could not find any ${elementType} using selectors:`,
        selectors
      );
    }

    return uniqueElements;
  }

  // Smart text search within elements
  findElementByText(elementType, searchText, container = document) {
    const elements = this.findElements(elementType, container);
    const normalizedSearch = searchText.toLowerCase().trim();

    // First try exact match
    for (const element of elements) {
      const text = element.textContent.toLowerCase().trim();
      if (text === normalizedSearch) {
        console.log(`✅ Found exact match for "${searchText}"`);
        return element;
      }
    }

    // Then try partial match
    for (const element of elements) {
      const text = element.textContent.toLowerCase().trim();
      if (text.includes(normalizedSearch) || normalizedSearch.includes(text)) {
        console.log(
          `✅ Found partial match for "${searchText}": "${element.textContent}"`
        );
        return element;
      }
    }

    // Finally try fuzzy match (for typos or variations)
    for (const element of elements) {
      const text = element.textContent.toLowerCase().trim();
      if (this.fuzzyMatch(text, normalizedSearch)) {
        console.log(
          `✅ Found fuzzy match for "${searchText}": "${element.textContent}"`
        );
        return element;
      }
    }

    console.warn(`❌ Could not find ${elementType} with text: "${searchText}"`);
    return null;
  }

  // Simple fuzzy matching for typos
  fuzzyMatch(text1, text2, threshold = 0.7) {
    const distance = this.levenshteinDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  }

  // Calculate Levenshtein distance for fuzzy matching
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Update selectors for current platform
  updatePlatform() {
    this.currentPlatform = this.detectPlatform();
    this.selectors =
      DOM_SELECTORS[this.currentPlatform] || DOM_SELECTORS.GENERIC;
    console.log(`🔄 Updated platform to: ${this.currentPlatform}`);
  }
}

// Export singleton instance
export const selectorManager = new SelectorManager();

// === VOICE TARGET ATTRIBUTES ===
// Legacy support for your existing data-voice-target attributes
export const VOICE_TARGETS = {
  restaurants: "restaurantCard",
  "restaurant-card": "restaurantCard",
  "search-bar": "searchBar",
  "search-input": "searchInput",
  "order-history": "cartItems",
  "order-card": "cartItems",
  "order-details": "cartItems",
};

// Helper function to convert voice targets to modern selectors
export function getVoiceTargetSelector(voiceTarget) {
  const elementType = VOICE_TARGETS[voiceTarget];
  if (elementType) {
    return selectorManager.getSelectors(elementType)[0];
  }

  // Fallback to data attribute
  return `[data-voice-target="${voiceTarget}"]`;
}
export function getCurrentPage() {
  const platform = selectorManager.currentPlatform;
  const platformSelectors = DOM_SELECTORS[platform];

  if (!platformSelectors || !platformSelectors.PAGE_IDENTIFIERS) {
    console.log(`⚠️ PAGE_IDENTIFIERS undefined for platform: ${platform}`);
    console.log("Detected platform:", selectorManager.currentPlatform);
    console.log(
      "DOM_SELECTORS:",
      DOM_SELECTORS[selectorManager.currentPlatform]
    );

    return null;
  }

  const { PAGE_IDENTIFIERS } = platformSelectors;

  const identifiers = {
    RestaurantListing: PAGE_IDENTIFIERS.restaurantListingPage,
    RestaurantDetails: PAGE_IDENTIFIERS.restaurantDetailsPage,
    Cart: PAGE_IDENTIFIERS.cartPage,
    Checkout: PAGE_IDENTIFIERS.checkoutPage,
    OrderTracking: PAGE_IDENTIFIERS.orderTrackingPage,
  };

  for (const [page, selectors] of Object.entries(identifiers)) {
    for (const selector of selectors) {
      try {
        if (document.querySelector(selector)) {
          return page;
        }
      } catch {
        continue;
      }
    }
  }

  return null; // Unknown page
}
