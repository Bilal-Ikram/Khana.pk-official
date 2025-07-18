// Enhanced Voice Ordering Service - Combines automation with user guidance
// services/enhancedVoiceOrderingService.js

import { selectorManager, getCurrentPage } from "./domSelectors.js";

class EnhancedVoiceOrderingService {
  constructor() {
    // Core service properties
    this.isActive = false;
    this.currentStep = null;
    this.stepChangeCallback = null;
    this.debugMode = true;

    // Animation and UI feedback
    this.animationTimeouts = [];
    this.currentHighlights = [];

    // Performance and error tracking
    this.performanceMetrics = {};
    this.maxRetries = 3;
    this.defaultWaitTime = 1000;
    this.scrollStep = 300;

    // Page flow configuration
    this.pageFlow = {
      RestaurantListing: {
        validActions: [
          "search_restaurant",
          "find_restaurant",
          "select_restaurant",
          "order",
        ],
        nextPages: ["RestaurantDetails"],
      },
      RestaurantDetails: {
        validActions: ["view_menu", "select_item", "add_to_cart", "order"],
        nextPages: ["MenuItemDetail", "Cart"],
      },
      MenuItemDetail: {
        validActions: ["add_to_cart", "customize_item", "view_cart"],
        nextPages: ["Cart"],
      },
      Cart: {
        validActions: [
          "remove_from_cart",
          "clear_cart",
          "checkout",
          "update_quantity",
        ],
        nextPages: ["Checkout", "RestaurantListing"],
      },
      Checkout: {
        validActions: ["place_order", "update_address", "select_payment"],
        nextPages: ["OrderTracking"],
      },
      OrderTracking: {
        validActions: ["track_order", "rate_order"],
        nextPages: ["RestaurantListing"],
      },
    };
  }

  // ========================================
  // MAIN ENTRY POINTS
  // ========================================

  /**
   * Main entry point for voice intents - enhanced with user guidance
   */
  async executeVoiceIntent(intentData) {
    const startTime = Date.now();
    this.log("🚀 Starting enhanced voice intent execution", intentData);

    try {
      const { intent, entities } = intentData;

      // Start visual feedback
      this.isActive = true;
      this.clearAnimations();

      switch (intent.intent) {
        case "order":
          return await this.handleOrderIntent(entities);
        case "search":
          return await this.handleSearchIntent(entities);
        case "add_to_cart":
        case "add_item":
          return await this.handleAddToCartIntent(entities);
        case "remove_from_cart":
          return await this.handleRemoveFromCartIntent(entities);
        case "show_cart":
        case "view_cart":
          return await this.handleShowCartIntent(entities);
        case "checkout":
          return await this.handleCheckoutIntent(entities);
        default:
          throw new Error(`Unknown intent: ${intent.intent}`);
      }
    } catch (error) {
      this.log("❌ Intent execution failed", error);
      this.handleActionError("executeVoiceIntent", error);
      return { success: false, error: error.message };
    } finally {
      this.logPerformance("executeVoiceIntent", startTime);
    }
  }

  /**
   * Enhanced guided interaction with better page awareness
   */
  startGuidedInteraction(intent, entities = {}) {
    const startTime = Date.now();
    this.log(`Starting enhanced guided interaction at ${startTime}`, {
      intent,
      entities,
    });

    // Convert to intentData format for consistency
    const intentData = {
      intent: { intent: intent },
      entities: entities,
    };

    return this.executeVoiceIntent(intentData);
  }

  // ========================================
  // INTENT HANDLERS - Enhanced with automation + guidance
  // ========================================

  async handleOrderIntent(entities) {
    this.log("📋 Processing enhanced order intent", entities);
    const context = this.getCurrentPageContext();

    try {
      // Step 1: Navigate to home page if not already there
      if (context.page !== "RestaurantListing") {
        this.updateStep({
          message: "Navigating to restaurant listings...",
          target: "homeLink",
          action: "navigating_home",
          context: context.page,
        });
        await this.ensureHomePage();
      }

      // Step 2: Find and select restaurant with visual feedback
      if (!entities.restaurant) {
        this.updateStep({
          message: "Which restaurant would you like to order from?",
          target: "restaurantCard",
          action: "waiting_for_restaurant",
          context: "RestaurantListing",
        });
        this.highlightAllRestaurants();
        return {
          success: true,
          message: "Please specify a restaurant to order from.",
        };
      }

      const restaurantClicked = await this.selectRestaurantWithGuidance(
        entities.restaurant
      );
      if (!restaurantClicked) {
        return { success: false, error: "Restaurant not found" };
      }

      // Step 3: Wait for restaurant page to load
      await this.waitForRestaurantPageWithFeedback();

      // Step 4: Handle food items
      if (entities.food_items && entities.food_items.length > 0) {
        await this.addItemsToCartWithGuidance(
          entities.food_items,
          entities.quantities
        );

        // Step 5: Navigate to cart
        await this.goToCartWithGuidance();

        // Step 6: Guide user to checkout (NO AUTO-FILL)
        await this.guideCheckoutProcess(entities.special_instructions);

        return {
          success: true,
          message:
            "Order process completed! Please fill in your delivery details.",
        };
      } else {
        this.updateStep({
          message: "Restaurant menu loaded! What would you like to order?",
          target: "menuItem",
          action: "menu_ready",
          context: "RestaurantDetails",
        });
        this.highlightAllMenuItems();
        return {
          success: true,
          message:
            "Restaurant page loaded. What would you like to add to your cart?",
        };
      }
    } catch (error) {
      this.log("❌ Enhanced order intent failed", error);
      return { success: false, error: error.message };
    }
  }

  async handleSearchIntent(entities) {
    this.log("🔍 Processing enhanced search intent", entities);
    const context = this.getCurrentPageContext();

    try {
      // Navigate to home if needed
      if (context.page !== "RestaurantListing") {
        this.updateStep({
          message: "Taking you to restaurant search...",
          target: "homeLink",
          action: "navigating_to_search",
          context: context.page,
        });
        await this.ensureHomePage();
      }

      const restaurantClicked = await this.selectRestaurantWithGuidance(
        entities.restaurant
      );

      if (restaurantClicked) {
        await this.waitForRestaurantPageWithFeedback();
        return {
          success: true,
          message: `Found ${entities.restaurant}! Menu is now displayed.`,
        };
      } else {
        return { success: false, error: "Restaurant not found" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleAddToCartIntent(entities) {
    const context = this.getCurrentPageContext();
    const itemName =
      entities.item ||
      entities.food ||
      entities.dish ||
      entities.food_items?.[0];

    if (!itemName) {
      this.updateStep({
        message: "What would you like to add to your cart?",
        target: "menuItem",
        action: "waiting_for_item",
        context: context.page,
      });
      this.highlightAllMenuItems();
      return {
        success: true,
        message: "Please specify what you'd like to add to your cart.",
      };
    }

    // Check page context and guide user
    if (context.page === "RestaurantListing") {
      this.updateStep({
        message: `To add "${itemName}", please first select a restaurant.`,
        target: "restaurantCard",
        action: "need_restaurant_selection",
        context: context.page,
      });
      this.highlightAllRestaurants();
      return {
        success: true,
        message: "Please select a restaurant first to add items.",
      };
    }

    if (
      context.page === "RestaurantDetails" ||
      context.page === "MenuItemDetail"
    ) {
      return await this.addSingleItemToCartWithGuidance(
        itemName,
        entities.quantity || 1
      );
    }

    return {
      success: false,
      error: "Please navigate to a restaurant menu first.",
    };
  }

  async handleShowCartIntent(entities) {
    const context = this.getCurrentPageContext();

    this.updateStep({
      message: "Opening your cart...",
      target: "cartLink",
      action: "showing_cart",
      context: context.page,
    });

    await this.goToCartWithGuidance();

    return { success: true, message: "Here's your cart!" };
  }

  async handleCheckoutIntent(entities) {
    const context = this.getCurrentPageContext();

    if (context.page !== "Cart") {
      this.updateStep({
        message: "Taking you to cart for checkout...",
        target: "cartLink",
        action: "navigating_to_checkout",
        context: context.page,
      });
      await this.goToCartWithGuidance();
    }

    return await this.guideCheckoutProcess();
  }

  // ========================================
  // ENHANCED AUTOMATION METHODS
  // ========================================

  async selectRestaurantWithGuidance(restaurantName) {
    this.log(`🎯 Searching for restaurant with guidance: ${restaurantName}`);

    this.updateStep({
      message: `Looking for "${restaurantName}"...`,
      target: "restaurantCard",
      action: "searching_restaurant",
      context: "RestaurantListing",
    });

    // First, scroll to the restaurant section
    await this.scrollToRestaurantSection();

    // Try multiple selection strategies with visual feedback
    const strategies = [
      {
        name: "exact",
        fn: () => this.findRestaurantByExactName(restaurantName),
      },
      {
        name: "partial",
        fn: () => this.findRestaurantByPartialName(restaurantName),
      },
      {
        name: "fuzzy",
        fn: () => this.findRestaurantByFuzzyMatch(restaurantName),
      },
    ];

    for (const strategy of strategies) {
      this.log(`Trying ${strategy.name} match for ${restaurantName}`);
      const restaurantCard = await strategy.fn();

      if (restaurantCard) {
        this.updateStep({
          message: `Found "${restaurantName}"! Opening restaurant...`,
          target: "restaurantCard",
          action: "restaurant_found",
          context: "RestaurantListing",
        });

        this.highlightElement(restaurantCard, "found-item");
        await this.clickRestaurantCardWithNavigation(restaurantCard);
        return true;
      }
    }

    // If not found, try scrolling and searching more
    this.updateStep({
      message: `"${restaurantName}" not found in visible area. Searching more...`,
      target: "restaurantCard",
      action: "searching_more",
      context: "RestaurantListing",
    });

    const found = await this.scrollAndSearchRestaurant(restaurantName);

    if (!found) {
      this.updateStep({
        message: `Sorry, couldn't find "${restaurantName}". Here are available restaurants:`,
        target: "restaurantCard",
        action: "restaurant_not_found",
        context: "RestaurantListing",
      });
      this.highlightAllRestaurants();
    }

    return found;
  }

  async clickRestaurantCardWithNavigation(restaurantCard) {
    this.log("🖱️ Clicking restaurant card with programmatic navigation");

    // // Debug the restaurant card first
    // this.debugRestaurantCard(restaurantCard);

    // Get the restaurant ID before clicking
    const restaurantId =
      restaurantCard.getAttribute("data-restaurant-id") ||
      restaurantCard
        .querySelector("[data-restaurant-id]")
        ?.getAttribute("data-restaurant-id");
    let targetUrl = null;

    if (restaurantId) {
      targetUrl = `/restaurant/${restaurantId}`;
    }

    // Store current URL
    const currentUrl = window.location.pathname;

    this.pulseElement(restaurantCard);
    await this.wait(100); // Optional: small delay before navigation

    try {
      // Programmatic navigation
      if (targetUrl) {
        this.log("🔄 Attempting programmatic navigation to:", targetUrl);

        // Try to find React Router navigate function
        if (window.history && window.history.pushState) {
          window.history.pushState({}, "", targetUrl);

          // Trigger both popstate and custom navigation events
          window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
          window.dispatchEvent(
            new CustomEvent("navigate", { detail: { path: targetUrl } })
          );

          await this.wait(2000);

          if (window.location.pathname.includes("/restaurant/")) {
            this.log("✅ Navigation successful via programmatic method");
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      this.log(`❌ Navigation failed: ${error.message}`);
      return false;
    }
  }

  // debugRestaurantCard(restaurantCard) {
  //   this.log('🔍 Debugging restaurant card:');

  //   const restaurantId = restaurantCard.getAttribute('data-restaurant-id');
  //   this.log(`- Restaurant ID: ${restaurantId || 'Not found'}`);
  //   this.log(`- Element tag: ${restaurantCard.tagName}`);
  //   this.log(`- Classes: ${restaurantCard.className}`);
  //   this.log(`- Has onclick: ${restaurantCard.onclick ? 'Yes' : 'No'}`);
  //   this.log(`- Has href: ${restaurantCard.href || 'No'}`);

  //   // Check for React fiber properties
  //   const reactKeys = Object.keys(restaurantCard).filter(key =>
  //     key.startsWith('__react') || key.startsWith('_reactInternal')
  //   );
  //   this.log(`- React properties: ${reactKeys.length > 0 ? reactKeys.join(', ') : 'None'}`);

  //   // Check for React props with onClick
  //   const fiberKey = Object.keys(restaurantCard).find(key =>
  //     key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber')
  //   );

  //   if (fiberKey) {
  //     const fiber = restaurantCard[fiberKey];
  //     const props = fiber?.memoizedProps || fiber?.pendingProps;
  //     this.log(`- React onClick handler: ${props?.onClick ? 'Found' : 'Not found'}`);
  //   }

  //   const links = restaurantCard.querySelectorAll('a');
  //   this.log(`- Inner links: ${links.length}`);

  //   // Check for clickable elements
  //   const clickableElements = restaurantCard.querySelectorAll('a, button, [role="button"], [onclick]');
  //   this.log(`- Clickable elements: ${clickableElements.length}`);

  //   // Log element position for click coordinates
  //   const rect = restaurantCard.getBoundingClientRect();
  //   this.log(`- Element position: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`);
  // }
  async waitForRestaurantPageWithFeedback() {
    this.log("⏳ Waiting for restaurant page to load with enhanced feedback");

    this.updateStep({
      message: "Loading restaurant menu...",
      target: "menuItem",
      action: "loading_menu",
      context: "RestaurantDetails",
    });

    let maxAttempts = 20; // Further increased for React apps
    let attempts = 0;
    let lastUrl = window.location.pathname;

    while (attempts < maxAttempts) {
      const currentUrl = window.location.pathname;
      const onRestaurantURL = currentUrl.includes("/restaurant/");

      // Log URL changes
      if (currentUrl !== lastUrl) {
        this.log(`🔄 URL changed from ${lastUrl} to ${currentUrl}`);
        lastUrl = currentUrl;

        // Reset attempt counter on URL change as page is loading
        attempts = Math.max(0, attempts - 5);
      }

      if (onRestaurantURL) {
        this.log("✅ On restaurant URL, checking for content...");

        // Wait a bit for React components to render after URL change
        if (currentUrl !== lastUrl) {
          await this.wait(1500);
        }

        // Check for various possible selectors for restaurant container
        const containerSelectors = [
          '[data-testid="restaurant-details"]',
          '[data-testid="restaurant-page"]',
          '[data-testid="restaurant-header"]',
          ".restaurant-details-page",
          ".restaurant-details",
          ".restaurant-page",
          ".restaurant-container",
          ".restaurant-info",
          '[data-page="restaurant-details"]',
        ];

        let containerFound = false;
        for (const selector of containerSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            this.log(
              `✅ Found restaurant container with selector: ${selector}`
            );
            containerFound = true;
            break;
          }
        }

        // Check for menu items
        const menuItems = this.findElements("menuItem");

        // Also check for other restaurant page indicators
        const restaurantTitle = document.querySelector(
          'h1, h2, h3, [data-testid*="name"], [class*="name"]'
        );
        const hasRestaurantContent =
          containerFound ||
          menuItems.length > 0 ||
          (restaurantTitle && restaurantTitle.textContent.length > 0);

        if (hasRestaurantContent) {
          this.log(
            `✅ Found restaurant content. Container: ${containerFound}, Menu items: ${
              menuItems.length
            }, Title: ${!!restaurantTitle}`
          );

          // Wait a bit more for menu items to load if we have container but no items yet
          if ((containerFound || restaurantTitle) && menuItems.length === 0) {
            this.log(
              "⏳ Restaurant page detected but waiting for menu items..."
            );
            await this.wait(3000); // Longer wait for React components

            // Check again after waiting
            const finalMenuItems = this.findElements("menuItem");
            if (finalMenuItems.length > 0) {
              this.completeRestaurantPageLoad(finalMenuItems.length);
              return true;
            } else {
              // Even if no menu items, if we have restaurant container, consider it success
              this.log("✅ Restaurant page loaded (no menu items found yet)");
              this.completeRestaurantPageLoad(0);
              return true;
            }
          } else if (menuItems.length > 0) {
            this.completeRestaurantPageLoad(menuItems.length);
            return true;
          } else if (containerFound || restaurantTitle) {
            // Found restaurant page indicators
            this.completeRestaurantPageLoad(0);
            return true;
          }
        }
      }

      await this.wait(1000);
      attempts++;

      // Log progress every 5 attempts
      if (attempts % 5 === 0) {
        this.log(
          `⏳ Still waiting... (${attempts}/${maxAttempts}) Current URL: ${currentUrl}`
        );

        // Debug what's on the page
        const allTestIds = Array.from(
          document.querySelectorAll("[data-testid]")
        ).map((el) => el.getAttribute("data-testid"));
        this.log(
          `🔍 Available data-testid elements: ${allTestIds
            .slice(0, 10)
            .join(", ")}${allTestIds.length > 10 ? "..." : ""}`
        );
      }
    }

    // Enhanced error reporting
    this.log(`❌ Timeout after ${maxAttempts} attempts`);
    this.log(`Final URL: ${window.location.pathname}`);
    this.log(`Expected URL pattern: /restaurant/`);

    // Final debug info
    const allElements = document.querySelectorAll(
      "*[data-testid], .restaurant*, .menu*"
    );
    this.log(
      `🔍 Found ${allElements.length} potential restaurant/menu elements for debugging`
    );

    const pageTitle = document.title;
    const h1Elements = document.querySelectorAll("h1, h2, h3");
    this.log(
      `🔍 Page title: "${pageTitle}", Headings found: ${h1Elements.length}`
    );

    throw new Error(
      `Restaurant page failed to load. Current URL: ${window.location.pathname}`
    );
  }
  completeRestaurantPageLoad(menuItemCount) {
    this.updateStep({
      message:
        menuItemCount > 0
          ? "Menu loaded! Browse items below or tell me what to add."
          : "Restaurant page loaded! Menu may still be loading...",
      target: "menuItem",
      action: "menu_loaded",
      context: "RestaurantDetails",
    });

    if (menuItemCount > 0) {
      setTimeout(() => {
        this.highlightAllMenuItems();
      }, 500);
    }

    this.log(`✅ Restaurant page loaded with ${menuItemCount} menu items`);
  }

  // ✅ Solution: Add a parseQuantity() Helper used in addItemsToCartWithGuidance
  parseQuantity(quantityStr) {
    const map = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };

    if (typeof quantityStr === "number") return quantityStr;

    const normalized = quantityStr.toString().trim().toLowerCase();
    return map[normalized] || parseInt(normalized) || 1; // fallback to 1
  }

  async addItemsToCartWithGuidance(foodItems, quantities = []) {
    this.log("🛒 Adding items to cart with guidance", {
      foodItems,
      quantities,
    });

    for (let i = 0; i < foodItems.length; i++) {
      const itemName = foodItems[i];
      const rawQuantity = quantities[i] || 1;
      const parsedQuantity = this.parseQuantity(rawQuantity);

      await this.addSingleItemToCartWithGuidance(itemName, parsedQuantity);
    }
  }

  async addSingleItemToCartWithGuidance(itemName, quantity = 1) {
    this.log(`🍽️ Adding ${quantity}x ${itemName} to cart with guidance`);

    this.updateStep({
      message: `Looking for "${itemName}" on the menu...`,
      target: "menuItem",
      action: "searching_menu_item",
      context: "RestaurantDetails",
    });

    // Find menu item using enhanced selectors
    const menuItems = this.findElements("menuItem");
    let targetItem = null;

    for (const item of menuItems) {
      const nameElement = item.querySelector(
        'h3, h2, .item-name, [data-sti="item-name"]'
      );
      if (nameElement && this.textMatches(nameElement.textContent, itemName)) {
        targetItem = item;
        break;
      }
    }

    if (!targetItem) {
      this.updateStep({
        message: `"${itemName}" not found on menu. Here are available items:`,
        target: "menuItem",
        action: "item_not_found",
        context: "RestaurantDetails",
      });
      this.highlightAllMenuItems();
      return { success: false, message: "Item not found on menu" };
    }

    // Highlight found item
    this.highlightElement(targetItem, "found-item");
    await this.wait(700);

    this.updateStep({
      message: `Found "${itemName}"! Adding ${quantity} to cart...`,
      target: "menuItem",
      action: "adding_to_cart",
      context: "RestaurationDetails",
    });

    let successCount = 0;
    let totalAttempts = 0;

    // Add to cart multiple times if quantity > 1
    for (let i = 0; i < quantity; i++) {
      // Find the add button for each iteration (in case DOM changes)
      let addButton = targetItem.querySelector(
        'button[data-testid="add-to-cart"]'
      );

      // Try fallback selectors one by one if the first doesn't work
      if (!addButton) {
        addButton = targetItem.querySelector(
          'button[aria-label*="add to cart" i]'
        );
      }
      if (!addButton) {
        addButton = targetItem.querySelector('button[title*="add to cart" i]');
      }

      // Alternative: Look for buttons with cart-related text content
      let cartButton = addButton;
      if (!cartButton) {
        const buttons = targetItem.querySelectorAll("button");
        for (const btn of buttons) {
          const text = btn.textContent.toLowerCase();
          const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase() || "";

          // Look for cart-related keywords, avoid favorites
          if (
            (text.includes("cart") ||
              text.includes("add") ||
              ariaLabel.includes("cart")) &&
            !text.includes("favorite") &&
            !ariaLabel.includes("favorite")
          ) {
            cartButton = btn;
            break;
          }
        }
      }

      if (cartButton) {
        this.pulseElement(cartButton);
        await this.wait(500);

        // Track attempt number
        totalAttempts++;
        this.log(
          `🛒 Attempt ${totalAttempts}: Adding ${itemName} to cart (${
            i + 1
          }/${quantity})`
        );

        // Enhanced clicking mechanism
        const clickSuccess = await this.clickAddToCartButtonWithNavigation(
          cartButton,
          itemName
        );

        if (clickSuccess) {
          successCount++;
          this.log(
            `✅ Added ${itemName} to cart (${successCount}/${quantity})`
          );

          // Only show completion message after ALL items are added
          if (i === quantity - 1) {
            this.updateStep({
              message: `✅ "${itemName}" x${quantity} added to cart!`,
              target: "cartLink",
              action: "item_added",
              context: "RestaurantDetails",
            });

            // Animate cart icon
            const cartLink = this.findElement("cartLink");
            if (cartLink) {
              this.bounceElement(cartLink);
            }
          }

          // Wait a bit between clicks to avoid race conditions
          if (i < quantity - 1) {
            await this.wait(1000);
          }
        } else {
          this.log(`❌ Failed to add ${itemName} to cart (attempt ${i + 1})`);
          // Continue with next iteration instead of returning immediately
          // This gives us a chance to try again
        }
      } else {
        this.log(`⚠️ Add button not found for ${itemName} (attempt ${i + 1})`);
        // Continue with next iteration instead of returning immediately
      }
    }

    // Check if we successfully added the requested quantity
    if (successCount === quantity) {
      return {
        success: true,
        message: `${itemName} x${quantity} added to cart`,
      };
    } else if (successCount > 0) {
      return {
        success: false,
        message: `Only ${successCount} of ${quantity} ${itemName} added to cart`,
      };
    } else {
      return { success: false, message: "Could not add any items to cart" };
    }
  }

  // New helper method for robust add-to-cart button clicking
  async clickAddToCartButtonWithNavigation(addButton, itemName) {
    this.log(
      `🖱️ Clicking add-to-cart button for ${itemName} with enhanced method`
    );

    // Get initial cart count/state for verification
    const initialCartState = this.getCartState();

    try {
      // Method 2: Try React event handlers directly
      this.log("🔄 Attempting to trigger React event handlers directly");

      const fiberKey = Object.keys(addButton).find(
        (key) =>
          key.startsWith("__reactInternalInstance") ||
          key.startsWith("__reactFiber")
      );

      if (fiberKey) {
        const fiber = addButton[fiberKey];
        const props = fiber?.memoizedProps || fiber?.pendingProps;

        if (props && props.onClick) {
          this.log("🎯 Found React onClick handler, calling directly");

          const syntheticEvent = {
            target: addButton,
            currentTarget: addButton,
            preventDefault: () => {},
            stopPropagation: () => {},
            type: "click",
            bubbles: true,
            cancelable: true,
          };

          props.onClick(syntheticEvent);
          await this.wait(1000);

          if (this.hasCartStateChanged(initialCartState)) {
            this.log("✅ Cart updated successfully via React onClick");
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      this.log(`❌ Add to cart click failed: ${error.message}`);
      return false;
    }
  }

  // Helper method to get current cart state
  getCartState() {
    try {
      // Try to get cart count from various possible locations
      const cartCountElement = document.querySelector(
        '[data-testid="cart-count"], .cart-count, .cart-badge'
      );
      const cartCount = cartCountElement
        ? parseInt(cartCountElement.textContent) || 0
        : 0;

      // Also check for cart items in localStorage or sessionStorage if your app uses them
      const cartData =
        localStorage.getItem("cart") || sessionStorage.getItem("cart");

      return {
        count: cartCount,
        data: cartData,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.log(`⚠️ Could not get cart state: ${error.message}`);
      return { count: 0, data: null, timestamp: Date.now() };
    }
  }

  // Helper method to check if cart state has changed
  hasCartStateChanged(initialState) {
    try {
      const currentState = this.getCartState();

      // Check if count increased
      if (currentState.count > initialState.count) {
        return true;
      }

      // Check if cart data changed
      if (currentState.data !== initialState.data) {
        return true;
      }

      // Additional check: look for visual cart updates
      const cartLink = this.findElement("cartLink");
      if (cartLink) {
        const hasCartItems = cartLink.querySelector(
          ".cart-count, [data-cart-count]"
        );
        if (hasCartItems) {
          return true;
        }
      }

      return false;
    } catch (error) {
      this.log(`⚠️ Could not verify cart state change: ${error.message}`);
      return false;
    }
  }

  async goToCartWithGuidance() {
    this.log("🛒 Navigating to cart with guidance");

    this.updateStep({
      message: "Opening your cart...",
      target: "cartLink",
      action: "opening_cart",
      context: getCurrentPage(),
    });

    const cartLink = this.findElement("cartLink");

    if (cartLink) {
      this.highlightElement(cartLink, "navigation-highlight");
      this.bounceElement(cartLink);

      await this.wait(1000);
      cartLink.click();
      await this.wait(1500);

      this.updateStep({
        message: "Cart opened! Review your items below.",
        target: "cartItem",
        action: "cart_opened",
        context: "Cart",
      });

      // Highlight cart items
      setTimeout(() => {
        this.highlightCartItems();
      }, 500);

      return true;
    } else {
      // Fallback: direct navigation
      window.location.href = "/cart";
      await this.wait(1500);
      return true;
    }
  }

  async guideCheckoutProcess(specialInstructions = null) {
    this.log("💳 Guiding checkout process - USER FILLS FORM");

    this.updateStep({
      message:
        "Please fill in your delivery details below and click checkout when ready.",
      target: "checkoutForm",
      action: "user_fill_form",
      context: "Cart",
    });

    // Highlight the form fields for user attention (NO AUTO-FILL)
    const formFields = [
      'input[name="name"], input[placeholder*="name"], #name',
      'input[name="phone"], input[placeholder*="phone"], #phone',
      'input[name="address"], textarea[name="address"], #address',
    ];

    formFields.forEach((selector, index) => {
      const field = document.querySelector(selector);
      if (field) {
        setTimeout(() => {
          this.highlightElement(field, "form-field-highlight");
        }, index * 500);
      }
    });

    // If special instructions provided, highlight that field
    if (specialInstructions) {
      const instructionsField = document.querySelector(
        'textarea[name="instructions"], input[name="instructions"], #instructions'
      );
      if (instructionsField) {
        setTimeout(() => {
          this.highlightElement(
            instructionsField,
            "special-instructions-highlight"
          );
          // Just highlight - don't auto-fill
        }, 1500);
      }
    }

    // Highlight checkout button
    setTimeout(() => {
      const checkoutButton = this.findElement("proceedToCheckoutButton");
      if (checkoutButton) {
        this.highlightElement(checkoutButton, "checkout-ready");
      }
    }, 2000);

    this.log("✅ Checkout guidance provided - waiting for user to complete");

    return {
      success: true,
      message: "Please fill in your delivery details and complete checkout.",
    };
  }
  /**
   * Enhanced wait method with better URL detection and error reporting
   */

  // ========================================
  // DOM SELECTORS AND UTILITY METHODS
  // ========================================

  findElement(selectorType, parent = document) {
    if (selectorManager && selectorManager.findElement) {
      return selectorManager.findElement(selectorType, parent);
    }

    // Fallback to basic selectors
    const selectors = this.getBasicSelectors(selectorType);
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  findElements(selectorType, parent = document) {
    if (selectorManager && selectorManager.findElements) {
      return Array.from(selectorManager.findElements(selectorType, parent));
    }

    // Fallback to basic selectors
    const selectors = this.getBasicSelectors(selectorType);
    for (const selector of selectors) {
      const elements = parent.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    }
    return [];
  }

  getBasicSelectors(type) {
    const selectors = {
      restaurantCard: [
        '[data-testid="restaurant-card"]',
        ".restaurant-card",
        ".card",
      ],
      menuItem: ['[data-testid="menu-item"]', ".menu-item", ".card"],
      addToCartButton: [
        '[data-testid="add-to-cart"]',
        ".add-to-cart",
        "button",
      ],
      cartLink: [
        '[data-testid="cart-icon"]',
        ".cart-icon",
        'a[href="/cart"]',
        'a[href*="cart"]',
      ],
      cartItem: ['[data-testid="cart-item"]', ".cart-item"],
      proceedToCheckoutButton: [
        '[data-testid="checkout"]',
        ".checkout-button",
        "button",
      ],
      homeLink: ['[data-testid="home-link"]', 'a[href="/"]', ".home-link"],
    };

    return selectors[type] || [];
  }

  textMatches(text, target) {
    // Normalize: lowercase + remove non-alphanumeric
    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

    // Simple variant mapping for known spelling variants
    const applyVariants = (str) => {
      const variants = {
        nihari: "nehari",
        nehari: "nehari",
        burgers: "burger",
        // add more mappings here as needed
      };
      for (const [key, val] of Object.entries(variants)) {
        if (str.includes(key)) {
          str = str.replace(key, val);
        }
      }
      return str;
    };

    const normText = applyVariants(normalize(text));
    const normTarget = applyVariants(normalize(target));

    if (normText.includes(normTarget)) return true;

    // Fuzzy match: allow small differences using Levenshtein distance
    const distance = this.levenshteinDistance(normText, normTarget);
    const maxDistance = 2; // tweak this threshold for tolerance

    return distance <= maxDistance;
  }

  getCurrentPageContext() {
    const currentPage = getCurrentPage
      ? getCurrentPage()
      : this.detectPageFromURL();
    return {
      page: currentPage,
      config: this.pageFlow[currentPage] || null,
    };
  }

  detectPageFromURL() {
    const path = window.location.pathname;
    if (path.includes("/restaurant/")) return "RestaurantDetails";
    if (path.includes("/cart")) return "Cart";
    if (path === "/") return "RestaurantListing";
    return "Unknown";
  }

  // ========================================
  // VISUAL FEEDBACK METHODS
  // ========================================

  highlightAllRestaurants() {
    const restaurants = this.findElements("restaurantCard");
    this.log(`Highlighting ${restaurants.length} restaurants`);

    restaurants.forEach((restaurant, index) => {
      setTimeout(() => {
        this.highlightElement(restaurant, "restaurant-highlight");
      }, index * 300);
    });
  }

  highlightAllMenuItems() {
    const menuItems = this.findElements("menuItem");
    this.log(`Highlighting ${menuItems.length} menu items`);

    menuItems.forEach((item, index) => {
      setTimeout(() => {
        this.highlightElement(item, "menu-item-highlight");
      }, index * 200);
    });
  }

  highlightCartItems() {
    const cartItems = this.findElements("cartItem");
    this.log(`Highlighting ${cartItems.length} cart items`);

    cartItems.forEach((item, index) => {
      setTimeout(() => {
        this.highlightElement(item, "cart-item-highlight");
      }, index * 200);
    });
  }

  highlightElement(element, className = "voice-highlight") {
    if (!element) {
      this.log(
        `Cannot highlight element - element is null for class: ${className}`
      );
      return;
    }

    this.log(`Highlighting element with class: ${className}`, element);

    element.classList.add(className);
    this.currentHighlights.push({ element, className });

    const timeout = setTimeout(() => {
      element.classList.remove(className);
    }, 3000);

    this.animationTimeouts.push(timeout);
  }

  pulseElement(element) {
    if (!element) return;

    element.style.transform = "scale(1.1)";
    element.style.transition = "transform 0.3s ease";

    const timeout = setTimeout(() => {
      element.style.transform = "scale(1)";
      setTimeout(() => {
        element.style.transform = "";
        element.style.transition = "";
      }, 300);
    }, 300);

    this.animationTimeouts.push(timeout);
  }

  bounceElement(element) {
    if (!element) return;

    element.style.animation = "bounce 0.6s ease";

    const timeout = setTimeout(() => {
      element.style.animation = "";
    }, 600);

    this.animationTimeouts.push(timeout);
  }

  updateStep(step) {
    this.currentStep = step;
    this.log("Step updated", step);

    if (this.stepChangeCallback) {
      this.stepChangeCallback(step);
    }
  }

  handleActionError(action, error) {
    console.error(`❌ Error during ${action}:`, error);
    this.log(`Error in ${action}`, error);

    this.updateStep({
      message: `Sorry, I encountered an issue with ${action}. Please try again or continue manually.`,
      target: null,
      action: "error",
      error: error.message,
      context: getCurrentPage ? getCurrentPage() : "Unknown",
    });

    setTimeout(() => {
      this.stopGuidedInteraction();
    }, 3000);
  }

  // ========================================
  // ORIGINAL AUTOMATION METHODS (preserved)
  // ========================================

  async ensureHomePage() {
    const currentUrl = window.location.pathname;
    if (currentUrl !== "/" && !currentUrl.includes("restaurants")) {
      this.log("🏠 Navigating to home page");
      window.location.href = "/";
      await this.wait(2000);
    }
  }

  async scrollToRestaurantSection() {
    const restaurantSection =
      document.querySelector('[data-testid="restaurant-section"]') ||
      document.querySelector(".restaurant-grid") ||
      document.querySelector("h2, h3").parentElement;

    if (restaurantSection) {
      restaurantSection.scrollIntoView({ behavior: "smooth" });
      await this.wait(1000);
    }
  }

  async findRestaurantByExactName(restaurantName) {
    const cards = this.findElements("restaurantCard");

    for (const card of cards) {
      const nameElement = card.querySelector(
        'h3, h2, .restaurant-name, [data-testid="restaurant-name"]'
      );
      if (
        nameElement &&
        nameElement.textContent.trim().toLowerCase() ===
          restaurantName.toLowerCase()
      ) {
        this.log(`✅ Found exact match: ${nameElement.textContent}`);
        return card;
      }
    }
    return null;
  }

  async findRestaurantByPartialName(restaurantName) {
    const cards = this.findElements("restaurantCard");

    for (const card of cards) {
      const nameElement = card.querySelector(
        'h3, h2, .restaurant-name, [data-testid="restaurant-name"]'
      );
      if (
        nameElement &&
        nameElement.textContent
          .toLowerCase()
          .includes(restaurantName.toLowerCase())
      ) {
        this.log(`✅ Found partial match: ${nameElement.textContent}`);
        return card;
      }
    }
    return null;
  }

  async findRestaurantByFuzzyMatch(restaurantName) {
    const cards = this.findElements("restaurantCard");
    let bestMatch = null;
    let bestScore = 0;

    for (const card of cards) {
      const nameElement = card.querySelector(
        'h3, h2, .restaurant-name, [data-testid="restaurant-name"]'
      );
      if (nameElement) {
        const score = this.calculateSimilarity(
          restaurantName.toLowerCase(),
          nameElement.textContent.toLowerCase()
        );
        if (score > bestScore && score > 0.6) {
          bestScore = score;
          bestMatch = card;
        }
      }
    }

    if (bestMatch) {
      this.log(`✅ Found fuzzy match with score ${bestScore}`);
    }
    return bestMatch;
  }

  async scrollAndSearchRestaurant(restaurantName) {
    this.log("📜 Scrolling to find restaurant");

    let attempts = 0;
    const maxScrollAttempts = 10;

    while (attempts < maxScrollAttempts) {
      window.scrollBy(0, this.scrollStep);
      await this.wait(500);

      const restaurant = await this.findRestaurantByPartialName(restaurantName);
      if (restaurant) {
        await this.clickRestaurantCardWithNavigation(restaurant);
        return true;
      }

      attempts++;
    }

    return false;
  }
  // ========================================
  // UTILITY METHODS
  // ========================================

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toISOString();
      console.log(
        `[${timestamp}] EnhancedVoiceService: ${message}`,
        data || ""
      );
    }
  }

  logPerformance(action, startTime) {
    const duration = Date.now() - startTime;
    this.performanceMetrics[action] = duration;
    this.log(`Performance: ${action} took ${duration}ms`);
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

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

  async handleRemoveFromCartIntent(entities) {
    const context = this.getCurrentPageContext();
    const itemName = entities.item || entities.food || entities.dish;

    if (context.page !== "Cart") {
      this.updateStep({
        message: "Taking you to cart to remove items...",
        target: "cartLink",
        action: "navigating_to_cart",
        context: context.page,
      });
      await this.goToCartWithGuidance();
    }

    if (!itemName) {
      this.updateStep({
        message: "What would you like to remove from your cart?",
        target: "cartItem",
        action: "waiting_for_item_removal",
        context: "Cart",
      });
      this.highlightCartItems();
      return {
        success: true,
        message: "Please specify what you'd like to remove from your cart.",
      };
    }

    const cartItems = this.findElements("cartItem");
    let targetItem = null;

    for (const item of cartItems) {
      const nameElement = item.querySelector(
        'h3, h2, .item-name, [data-testid="item-name"]'
      );
      if (nameElement && this.textMatches(nameElement.textContent, itemName)) {
        targetItem = item;
        break;
      }
    }

    if (!targetItem) {
      this.updateStep({
        message: `"${itemName}" not found in cart. Here are your current items:`,
        target: "cartItem",
        action: "item_not_in_cart",
        context: "Cart",
      });
      this.highlightCartItems();
      return { success: false, message: "Item not found in cart" };
    }

    // Find and click remove button
    const removeButton = targetItem.querySelector(
      'button[data-testid="remove"], .remove-button, button[aria-label*="remove"]'
    );

    if (removeButton) {
      this.highlightElement(targetItem, "item-to-remove");
      this.pulseElement(removeButton);

      this.updateStep({
        message: `Removing "${itemName}" from cart...`,
        target: "cartItem",
        action: "removing_item",
        context: "Cart",
      });

      await this.wait(1000);
      removeButton.click();
      await this.wait(500);

      this.updateStep({
        message: `✅ "${itemName}" removed from cart!`,
        target: "cartItem",
        action: "item_removed",
        context: "Cart",
      });

      return { success: true, message: `${itemName} removed from cart` };
    } else {
      return {
        success: false,
        message: "Could not find remove button for item",
      };
    }
  }

  clearAnimations() {
    this.log("🧹 Clearing all animations and highlights");

    // Clear all timeouts
    this.animationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.animationTimeouts = [];

    // Remove all highlight classes
    this.currentHighlights.forEach(({ element, className }) => {
      if (element && element.classList) {
        element.classList.remove(className);
      }
    });
    this.currentHighlights = [];

    // Remove any inline styles from animations
    const elementsWithInlineStyles = document.querySelectorAll(
      '[style*="transform"], [style*="animation"]'
    );
    elementsWithInlineStyles.forEach((element) => {
      element.style.transform = "";
      element.style.animation = "";
      element.style.transition = "";
    });
  }

  stopGuidedInteraction() {
    this.log("🛑 Stopping guided interaction");

    this.isActive = false;
    this.currentStep = null;
    this.clearAnimations();

    if (this.stepChangeCallback) {
      this.stepChangeCallback(null);
    }
  }

  onStepChange(callback) {
    this.stepChangeCallback = callback;
  }

  isValidAction(action, currentPage) {
    const pageConfig = this.pageFlow[currentPage];
    if (!pageConfig) return true; // Allow all actions on unknown pages

    return pageConfig.validActions.includes(action);
  }

  getNextValidPages(currentPage) {
    const pageConfig = this.pageFlow[currentPage];
    return pageConfig ? pageConfig.nextPages : [];
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  clearPerformanceMetrics() {
    this.performanceMetrics = {};
  }

  // CSS Injection for visual feedback
  injectStyles() {
    if (document.getElementById("enhanced-voice-styles")) return;

    const styles = `
      <style id="enhanced-voice-styles">
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .voice-highlight {
          animation: pulse 2s infinite;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5) !important;
          border: 2px solid #3B82F6 !important;
        }
        
        .restaurant-highlight {
          animation: pulse 1.5s infinite;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5) !important;
          border: 2px solid #22C55E !important;
        }
        
        .menu-item-highlight {
          animation: pulse 1s infinite;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
          border: 2px solid #F97316 !important;
        }
        
        .cart-item-highlight {
          animation: pulse 1s infinite;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5) !important;
          border: 2px solid #A855F7 !important;
        }
        
        .found-item {
          animation: bounce 0.6s ease;
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.8) !important;
          border: 3px solid #22C55E !important;
        }
        
        .item-to-remove {
          animation: pulse 1s infinite;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5) !important;
          border: 2px solid #EF4444 !important;
        }
        
        .navigation-highlight {
          animation: bounce 0.8s ease;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.6) !important;
          border: 2px solid #6366F1 !important;
        }
        
        .form-field-highlight {
          animation: pulse 2s infinite;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4) !important;
          border: 2px solid #3B82F6 !important;
        }
        
        .checkout-ready {
          animation: pulse 1.5s infinite;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
          border: 2px solid #22C55E !important;
          background: rgba(34, 197, 94, 0.1) !important;
        }
        
        .special-instructions-highlight {
          animation: pulse 2s infinite;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.5) !important;
          border: 2px solid #A855F7 !important;
        }
      </style>
    `;

    document.head.insertAdjacentHTML("beforeend", styles);
  }

  // Initialize the service
  init() {
    this.log("🚀 Initializing Enhanced Voice Ordering Service");
    this.injectStyles();

    // Set up cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.stopGuidedInteraction();
    });

    this.log("✅ Enhanced Voice Ordering Service initialized");
  }

  // Public API for external integration
  getState() {
    return {
      isActive: this.isActive,
      currentStep: this.currentStep,
      currentPage: this.getCurrentPageContext(),
      performanceMetrics: this.getPerformanceMetrics(),
    };
  }
}

// Export the service
export default EnhancedVoiceOrderingService;
