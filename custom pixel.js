/*
 * Project: Shopify Customer Events Tracking with GTM (plain events)
 * Authors: Karol Krajcir (https://www.karolkrajcir.com) and Julius Fedorovicius (https://www.analyticsmania.com)
 * How to use: https://github.com/karolk95/shopify-customer-events-plain/blob/main/README.md
 * License: GNU General Public License (GPL) (with restrictions) - more here: https://github.com/karolk95/shopify-customer-events-plain/blob/main/LICENSE
 *
 * Restriction: This code may not be incorporated into commercial software products
 * or applications that are sold or generate revenue without express permission from the author.
 *
 * Disclaimer: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/* *********************************************************************************
****************************** GLOBAL SETTINGS *************************************
make sure to go through the settings below and change the values where applicable
********************************************************************************** */
const config = {
    /* *************** CONVERSION TRACKING SETTINGS *************** */
    conversionTracking: {
        gtmContainerId: 'GTM-XXXXXX', // replace with your Google Tag Manager container ID
        // change to false for events that you don't want to be pushed to the data layer:
        trackPageViews: true,
        trackClicks: true,
        trackSearch: true,
        trackFormSubmit: true,
        trackViewItemList: true,
        trackViewItem: true,
        trackAddToCart: true,
        trackViewCart: true,
        trackRemoveFromCart: true,
        trackBeginCheckout: true,
        trackAddShippingInfo: true,
        trackAddPaymentInfo: true,
        trackPurchase: true,
    },

    /* *************** STORE SETTINGS *************** */
    store: {
        affiliationName: init.data.shop.name, // or you can replace it with some other value
    },  

    /* *************** DEVELOPER SETTINGS *************** */
    developer: {
        consoleLogging: false, // set to true if you want to see the console logs
    },

}
/* *********************************************************************************
****************************** END OF GLOBAL SETTINGS ******************************
********************************************************************************** */

const initContextData = init.context?.document;

// Store the clean page URL (and other things) in the dataLayer before GTM loads
window.dataLayer = window.dataLayer || [];
dataLayer.push({
    page_location: initContextData?.location?.href,
    page_referrer: initContextData?.referrer,
    page_title: initContextData?.title,
});

// function to log messages to the console (if enabled in the config)
function pixelLog(message, ...data) {
    if (!config.developer.consoleLogging) return;
    console.log(`>>> PIXEL: ${message}`, ...data);
}

// GTM script
(function(w,d,s,l,i){
w[l]=w[l]||[];
w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer', config.conversionTracking.gtmContainerId);


/* *******************************************************************************
****************************** NON-ECOMMERCE EVENTS ******************************
********************************************************************************** */

/* *************** PAGE VIEW TRACKING *************** */
if (config.conversionTracking.trackPageViews) {
    analytics.subscribe('page_viewed', (event) => {

        const eventContextData = event.context?.document;

        const dataLayerObj = {
            event: 'page_view',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
        }

        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF PAGE VIEW TRACKING *************** */

if (config.conversionTracking.trackClicks) {
    /* *************** CLICK TRACKING - storefront *************** */
    analytics.subscribe('custom_click', (event) => {

        const eventContextData = event.context?.document;

        const dataLayerObj = {
            event: 'custom_click_storefront',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            data: event.customData,
        }

        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
      
    analytics.subscribe('custom_link_click', (event) => {

        const eventContextData = event.context?.document;

        const dataLayerObj = {
            event: 'custom_click_link_storefront',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            data: event.customData,
        }

        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
    /* *************** END OF CLICK TRACKING - storefront *************** */
      
    /* *************** CLICK TRACKING - checkout *************** */
    if (initContextData?.location?.href.includes('/checkouts/')) {
        analytics.subscribe('clicked', (event) => {
        const element = event.data?.element;
        const eventContextData = event.context?.document;
        
        // construct the data layer object:
        const dataLayerObj = {
            event: 'custom_click_checkout',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title, 
            data: {
                click_element : element?.type || '',
                click_id : element?.id || '',
                click_classes : '',
                click_text : element?.value || '',
                click_target : '',
                click_url : element?.href || '',
            }
        }
        
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
        
        });
    }
    /* *************** END OF CLICK TRACKING - checkout *************** */
}
  
/* *************** SEARCH *************** */
if (config.conversionTracking.trackSearch) {
    analytics.subscribe('search_submitted', (event) => {

        const eventContextData = event.context?.document;

        const dataLayerObj = {
            event: 'view_search_results',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            search_term: event.data?.searchResult?.query,
        }

        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });  
}
/* *************** END OF SEARCH *************** */

/* *************** FORM SUBMIT *************** */
if (config.conversionTracking.trackFormSubmit) {
    analytics.subscribe('form_submitted', (event) => {

        const eventContextData = event.context?.document;
        
        // decode the form action URL before checking for '/cart/add'
        const decodedAction = decodeURIComponent(event.data?.element?.action || '');

        // only fire form_submit if the form_action does NOT contain '/cart/add'
        if (!decodedAction.includes('/cart/add')) {

            const dataLayerObj = {
                event: 'form_submit',
                page_location: eventContextData?.location?.href,
                page_referrer: eventContextData?.referrer,
                page_title: eventContextData?.title,
                form_action: event.data?.element?.action,
                form_id: event.data?.element?.id,
            }

            window.dataLayer.push(dataLayerObj);
            pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
        }
    });  
}
/* *************** END OF FORM SUBMIT *************** */


/* *******************************************************************************
****************************** ECOMMERCE EVENTS **********************************
********************************************************************************** */

/* *************** VIEW ITEM LIST *************** */
if (config.conversionTracking.trackViewItemList) {
    analytics.subscribe('collection_viewed', (event) => { 
    
        const eventContextData = event.context?.document;
        const collection = event.data?.collection;
        let googleAnalyticsProducts = [];
    
        // loop through the products:
        collection?.productVariants?.forEach(function(item, index) {
            // GA4
            let productVariant = {
                item_id: item.product?.id,
                item_name: item.product?.title,
                affiliation: config.store.affiliationName,
                index: index,
                item_brand: item.product?.vendor,
                item_category: item.product?.type,
                item_list_id: collection?.id,
                item_list_name: collection?.title,
                price: item.price?.amount,
                quantity: 1
            };
            googleAnalyticsProducts.push(productVariant);     
        });
    
        // construct the data layer object:
        const dataLayerObj = {
            event: 'view_item_list',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                item_list_id: collection?.id,
                item_list_name: collection?.title,
                items: googleAnalyticsProducts
            }
        }
    
        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF VIEW ITEM LIST *************** */

/* *************** VIEW ITEM *************** */
if (config.conversionTracking.trackViewItem) {
    analytics.subscribe('product_viewed', (event) => { 
    
        const eventContextData = event.context?.document;
        const productVariant = event.data?.productVariant;
        let googleAnalyticsProducts = [];

        // GA4 - get the product info
        let productInfo = {
            item_id: productVariant?.product?.id,
            item_name: productVariant?.product?.title,
            affiliation: config.store.affiliationName,
            item_brand: productVariant?.product?.vendor,
            item_category: productVariant?.product?.type,
            item_variant: productVariant?.title,
            price: productVariant?.price?.amount,
            quantity: 1
        };    
        googleAnalyticsProducts.push(productInfo); 
        
        // construct the data layer object:
        const dataLayerObj = {
            event: 'view_item',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: productVariant?.price?.currencyCode,
                value: productVariant?.price?.amount, 
                items: googleAnalyticsProducts
            }
        }
    
        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF VIEW ITEM *************** */


/* *************** ADD TO CART *************** */
if (config.conversionTracking.trackAddToCart) {
    analytics.subscribe('product_added_to_cart', (event) => {
        
        const eventContextData = event.context?.document;
        const cartLine = event.data?.cartLine;
        let googleAnalyticsProducts = [];

        // GA4 - get the product info
        let productInfo = {
            item_id: cartLine?.merchandise?.product?.id,
            item_name: cartLine?.merchandise?.product?.title,
            affiliation: config.store.affiliationName,
            item_brand: cartLine?.merchandise?.product?.vendor,
            item_category: cartLine?.merchandise?.product?.type,
            item_variant: cartLine?.merchandise?.title,
            price: cartLine?.merchandise?.price?.amount,
            quantity: cartLine?.quantity
        };    
        googleAnalyticsProducts.push(productInfo); 
    
        // construct the data layer object:
        const dataLayerObj = {
            event: 'add_to_cart',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: cartLine?.cost?.totalAmount?.currencyCode,
                value: cartLine?.cost?.totalAmount?.amount, 
                items: googleAnalyticsProducts
            }
        }   

        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF ADD TO CART *************** */


/* *************** VIEW CART *************** */
if (config.conversionTracking.trackViewCart) {
    analytics.subscribe('cart_viewed', (event) => {

        const eventContextData = event.context?.document;
        const cart = event.data?.cart;
        let googleAnalyticsProducts = [];

        // loop through the products:
        cart?.lines?.forEach(function(item, index) {
            // GA4
            let lineItem = {
                item_id: item.merchandise?.product?.id,
                item_name: item.merchandise?.product?.title,
                affiliation: config.store.affiliationName,
                index: index,
                item_brand: item.merchandise?.product?.vendor,
                item_category: item.merchandise?.product?.type,
                item_variant: item.merchandise?.title,
                price: item.merchandise?.price?.amount,
                quantity: item.quantity
            };
            googleAnalyticsProducts.push(lineItem);
        });
        
        // construct the data layer object:
        const dataLayerObj = {
            event: 'view_cart',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: cart?.cost?.totalAmount?.currencyCode,
                value: cart?.cost?.totalAmount?.amount, 
                items: googleAnalyticsProducts
            }
        }   

        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF VIEW CART *************** */


/* *************** REMOVE FROM CART *************** */
if (config.conversionTracking.trackRemoveFromCart) {
    analytics.subscribe('product_removed_from_cart', (event) => {
    
        const eventContextData = event.context?.document;
        const cartLine = event.data?.cartLine;
        let googleAnalyticsProducts = [];

        // GA4 - get the product info
        let productInfo = {
            item_id: cartLine?.merchandise?.product?.id,
            item_name: cartLine?.merchandise?.product?.title,
            affiliation: config.store.affiliationName,
            item_brand: cartLine?.merchandise?.product?.vendor,
            item_category: cartLine?.merchandise?.product?.type,
            item_variant: cartLine?.merchandise?.title,
            price: cartLine?.merchandise?.price?.amount,
            quantity: cartLine?.quantity
        };    
        googleAnalyticsProducts.push(productInfo); 
        
        // construct the data layer object:
        const dataLayerObj = {
            event: 'remove_from_cart',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: cartLine?.cost?.totalAmount?.currencyCode,
                value: cartLine?.cost?.totalAmount?.amount, 
                items: googleAnalyticsProducts
            }
        }

        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF REMOVE FROM CART *************** */

/* *************** HELPER FUNCTION TO PROCESS CHECKOUT PRODUCTS *************** */

const processCheckoutProducts = (items) => {
    let finalProductArray = [];
    let orderCoupon = []; // to hold the discount titles
  
    if (items) {
      items.forEach((item, index) => {
        let itemDiscountAmount = 0;
  
        // Process discounts for this item
        item.discountAllocations?.forEach((allocation) => {
          const discount = allocation.discountApplication;
  
          // Capture the discount title if not already added
          if (discount.title && !orderCoupon.includes(discount.title)) {
            orderCoupon.push(discount.title);
          }
  
          // Accumulate discount amount for the item
          const allocationAmount = allocation.amount.amount;
          itemDiscountAmount += allocationAmount;
        });
  
        // GA4: Calculate price after discount
        const itemPrice = item.variant.price.amount;
        // Ensure priceAfterDiscount is never negative
        let priceAfterDiscount = itemPrice - (itemDiscountAmount / item.quantity);
        priceAfterDiscount = Math.max(priceAfterDiscount, 0);
  
        // GA4 - get the product info
        let lineItem = {
          item_id: item.variant?.product?.id,
          item_name: item.variant?.product?.title,
          affiliation: config.store.affiliationName,
          coupon: orderCoupon.join(',') || undefined,
          discount: itemDiscountAmount / item.quantity,
          index: index,
          item_brand: item.variant?.product?.vendor,
          item_category: item.variant?.product?.type,
          item_variant: item.variant?.title,
          price: priceAfterDiscount,
          quantity: item.quantity
        };
        finalProductArray.push(lineItem);
      });
    }
  
    return {
      items: finalProductArray,
      orderCouponString: orderCoupon.join(',')
    };
  };

/* *************** END OF HELPER FUNCTION TO PROCESS CHECKOUT PRODUCTS *************** */


/* *************** BEGIN CHECKOUT *************** */
if (config.conversionTracking.trackBeginCheckout) {
    analytics.subscribe('checkout_started', (event) => {

        const eventContextData = event.context?.document;
        const checkout = event.data?.checkout;
        let orderDiscountAmount = checkout.discountsAmount?.amount || 0;
        let totalPrice = checkout.totalPrice.amount;
        let shipping = checkout?.shippingLine?.price?.amount || 0;
        let tax = checkout?.totalTax?.amount || 0;

        // Extract the discount that applies to the shipping separately
        let shippingDiscount = checkout.delivery?.selectedDeliveryOptions?.reduce((total, option) => {
            let originalCost = option.cost?.amount || 0;
            let discountedCost = option.costAfterDiscounts?.amount || 0;
            return total + (originalCost - discountedCost);
        }, 0) || 0;

        // Total order value calculation
        let totalOrderValue = totalPrice - shipping - tax;

        pixelLog('Event data for ' + event.name + ': ', event.data, init);
        pixelLog('Ecommerce object for ' + event.name + ': ', checkout);
        pixelLog('discountsAmount: ' + orderDiscountAmount);
        pixelLog('shipping discount: ' + shippingDiscount);
        pixelLog('totalPrice: ' + totalPrice);
        pixelLog('shipping: ' + shipping);
        pixelLog('tax: ' + tax);
        pixelLog('totalOrderValue: ' + totalOrderValue);

        // Process products for GA4
        const processedProducts = processCheckoutProducts(checkout?.lineItems);

        // Construct the data layer object:
        const dataLayerObj = {
            event: 'begin_checkout',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: checkout?.currencyCode,
                value: totalOrderValue,
                coupon: checkout.discountApplications?.map(d => d.title).filter(Boolean).join(',') || undefined,
                discount: orderDiscountAmount,
                items: processedProducts.items
            }
        }

        // Push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF BEGIN CHECKOUT *************** */


/* *************** ADD SHIPPING INFO *************** */
if (config.conversionTracking.trackAddShippingInfo) {
    analytics.subscribe('checkout_shipping_info_submitted', (event) => {

        const eventContextData = event.context?.document;
        const checkout = event.data?.checkout;
        let orderDiscountAmount = checkout.discountsAmount?.amount || 0;
        let totalPrice = checkout.totalPrice.amount;
        let shipping = checkout?.shippingLine?.price?.amount || 0;
        let tax = checkout?.totalTax?.amount || 0;

        // Extract the discount that applies to the shipping separately
        let shippingDiscount = checkout.delivery?.selectedDeliveryOptions?.reduce((total, option) => {
            let originalCost = option.cost?.amount || 0;
            let discountedCost = option.costAfterDiscounts?.amount || 0;
            return total + (originalCost - discountedCost);
        }, 0) || 0;

        // Total order value calculation
        let totalOrderValue = totalPrice - shipping - tax;

        pixelLog('Event data for ' + event.name + ': ', event.data, init);
        pixelLog('Ecommerce object for ' + event.name + ': ', checkout);
        pixelLog('discountsAmount: ' + orderDiscountAmount);
        pixelLog('shipping discount: ' + shippingDiscount);
        pixelLog('totalPrice: ' + totalPrice);
        pixelLog('shipping: ' + shipping);
        pixelLog('tax: ' + tax);
        pixelLog('totalOrderValue: ' + totalOrderValue);

        // Process products for GA4
        const processedProducts = processCheckoutProducts(checkout?.lineItems);

        // construct the data layer object:
        const dataLayerObj = {
            event: 'add_shipping_info',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: checkout?.currencyCode,
                value: totalOrderValue,
                coupon: checkout.discountApplications?.map(d => d.title).filter(Boolean).join(',') || undefined,
                discount: orderDiscountAmount,
                shipping_tier: checkout.delivery?.selectedDeliveryOptions?.[0]?.title || undefined,
                items: processedProducts.items
            }
        }

        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF ADD SHIPPING INFO *************** */


/* *************** ADD PAYMENT INFO *************** */
if (config.conversionTracking.trackAddPaymentInfo) {
    analytics.subscribe('payment_info_submitted', (event) => {

        const eventContextData = event.context?.document;
        const checkout = event.data?.checkout;
        let orderDiscountAmount = checkout.discountsAmount?.amount || 0;
        let totalPrice = checkout.totalPrice.amount;
        let shipping = checkout?.shippingLine?.price?.amount || 0;
        let tax = checkout?.totalTax?.amount || 0;

        // Extract the discount that applies to the shipping separately
        let shippingDiscount = checkout.delivery?.selectedDeliveryOptions?.reduce((total, option) => {
            let originalCost = option.cost?.amount || 0;
            let discountedCost = option.costAfterDiscounts?.amount || 0;
            return total + (originalCost - discountedCost);
        }, 0) || 0;

        // Total order value calculation
        let totalOrderValue = totalPrice - shipping - tax;

        pixelLog('Event data for ' + event.name + ': ', event.data, init);
        pixelLog('Ecommerce object for ' + event.name + ': ', checkout);
        pixelLog('discountsAmount: ' + orderDiscountAmount);
        pixelLog('shipping discount: ' + shippingDiscount);
        pixelLog('totalPrice: ' + totalPrice);
        pixelLog('shipping: ' + shipping);
        pixelLog('tax: ' + tax);
        pixelLog('totalOrderValue: ' + totalOrderValue);

        // Process products for GA4
        const processedProducts = processCheckoutProducts(checkout?.lineItems);

        // construct the data layer object:
        const dataLayerObj = {
            event: 'add_payment_info',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            ecommerce: {
                currency: checkout?.currencyCode,
                value: totalOrderValue,
                coupon: checkout.discountApplications?.map(d => d.title).filter(Boolean).join(',') || undefined,
                discount: orderDiscountAmount,
                items: processedProducts.items
            }
        }

        // push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF ADD PAYMENT INFO *************** */


/* *************** PURCHASE *************** */
if (config.conversionTracking.trackPurchase) {
    analytics.subscribe('checkout_completed', (event) => {

        const eventContextData = event.context?.document;
        const checkout = event.data?.checkout;
        let orderDiscountAmount = checkout.discountsAmount?.amount || 0;
        let totalPrice = checkout.totalPrice.amount;
        let shipping = checkout?.shippingLine?.price?.amount || 0;
        let tax = checkout?.totalTax?.amount || 0;

        // Extract the discount that applies to the shipping separately
        let shippingDiscount = checkout.delivery?.selectedDeliveryOptions?.reduce((total, option) => {
            let originalCost = option.cost?.amount || 0;
            let discountedCost = option.costAfterDiscounts?.amount || 0;
            return total + (originalCost - discountedCost);
        }, 0) || 0;

        // Total order value calculation
        let totalOrderValue = totalPrice - shipping - tax;

        pixelLog('Event data for ' + event.name + ': ', event.data, init);
        pixelLog('Ecommerce object for ' + event.name + ': ', checkout);
        pixelLog('discountsAmount: ' + orderDiscountAmount);
        pixelLog('shipping discount: ' + shippingDiscount);
        pixelLog('totalPrice: ' + totalPrice);
        pixelLog('shipping: ' + shipping);
        pixelLog('tax: ' + tax);
        pixelLog('totalOrderValue: ' + totalOrderValue);

        // Determine the payment type
        const paymentType = checkout?.transactions?.[0]?.gateway || 'no payment type';

        // Process products for GA4
        const processedProducts = processCheckoutProducts(checkout?.lineItems);

        // Construct the data layer object
        const dataLayerObj = {
            event: 'purchase',
            page_location: eventContextData?.location?.href,
            page_referrer: eventContextData?.referrer,
            page_title: eventContextData?.title,
            user_email: checkout?.email,
            user_data: checkout?.shippingAddress,
            ecommerce: {
                transaction_id: checkout?.order?.id,
                currency: checkout?.currencyCode,
                value: totalOrderValue,
                tax: tax,
                shipping: shipping,
                shipping_tier: checkout.delivery?.selectedDeliveryOptions?.[0]?.title || undefined, 
                coupon: checkout.discountApplications?.map(d => d.title).filter(Boolean).join(',') || undefined,
                discount: orderDiscountAmount,
                payment_type: paymentType,
                items: processedProducts.items
            }
        };

        // Push the content to the dataLayer:
        window.dataLayer.push({ 'ecommerce': null });
        window.dataLayer.push(dataLayerObj);
        pixelLog('Data pushed to the dataLayer: ', dataLayerObj);
    });
}
/* *************** END OF PURCHASE *************** */
