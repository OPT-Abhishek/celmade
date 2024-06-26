/* Jonathan Snook - MIT License - https://github.com/snookca/prepareTransition */
(function(a){a.fn.prepareTransition=function(){return this.each(function(){var b=a(this);b.one("TransitionEnd webkitTransitionEnd transitionend oTransitionEnd",function(){b.removeClass("is-transitioning")});var c=["transition-duration","-moz-transition-duration","-webkit-transition-duration","-o-transition-duration"];var d=0;a.each(c,function(a,c){d=parseFloat(b.css(c))||d});if(d!=0){b.addClass("is-transitioning");b[0].offsetWidth}})}})(jQuery);
/* replaceUrlParam - http://stackoverflow.com/questions/7171099/how-to-replace-url-parameter-with-javascript-jquery */
function replaceUrlParam(e,r,a){var n=new RegExp("("+r+"=).*?(&|$)"),c=e;return c=e.search(n)>=0?e.replace(n,"$1"+a+"$2"):c+(c.indexOf("?")>0?"&":"?")+r+"="+a};
/*============================================================================
Money Format
- Shopify.format money is defined in option_selection.js.
If that file is not included, it is redefined here.
==============================================================================*/
if ((typeof Shopify) === 'undefined') { Shopify = {}; }
if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    var value = '',
    placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
    formatString = (format || this.money_format);
    if (typeof cents == 'string') {
      cents = cents.replace('.','');
    }
    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');
      if (isNaN(number) || number == null) {
        return 0;
      }
      number = (number/100.0).toFixed(precision);
      var parts   = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents   = parts[1] ? (decimal + parts[1]) : '';
      return dollars + cents;
    }
    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
      case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
      case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
      case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    }
    return formatString.replace(placeholderRegex, value);
  };
}
// Timber functions

window.timber = window.timber || {};
timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html                    : $('html'),
    $body                    : $(document.body),
    // Navigation
    $navigation              : $('#AccessibleNav'),
    $mobileSubNavToggle      : $('.mobile-nav__toggle'),
    // Collection Pages
    $changeView              : $('.change-view'),
    // Product Page
    $productImage            : $('#slider-for'),
    $thumbImages             : $('#pro-detail-slider').find('a.product-single__thumbnail'),
    <!-- old -->
    // Customer Pages
    $recoverPasswordLink     : $('#RecoverPassword'),
    $hideRecoverPasswordLink : $('#HideRecoverPasswordLink'),
    $recoverPasswordForm     : $('#RecoverPasswordForm'),
    $customerLoginForm       : $('#CustomerLoginForm'),
    $passwordResetSuccess    : $('#ResetSuccess')
  };
};
timber.init = function () {
  timber.cacheSelectors();
  timber.accessibleNav();
  timber.mobileNavToggle();
  timber.productImageSwitch();
  timber.formCart();
  timber.responsiveVideos();
  timber.collectionViews();
  timber.loginForms();
};
timber.accessibleNav = function () {
  var $nav = timber.cache.$navigation,
  $allLinks = $nav.find('a'),
  $topLevel = $nav.children('li').find('a'),
  $parents = $nav.find('.site-nav--has-dropdown'),
  $subMenuLinks = $nav.find('.site-nav__dropdown').find('a'),
  activeClass = 'nav-hover',
  focusClass = 'nav-focus';
  // Mouseenter
  $parents.on('mouseenter touchstart', function(evt) {
    var $el = $(this);
    if (!$el.hasClass(activeClass)) {
      evt.preventDefault();
    }
    showDropdown($el);
  });
  // Mouseout
  $parents.on('mouseleave', function() {
    hideDropdown($(this));
  });
  $subMenuLinks.on('touchstart', function(evt) {
    // Prevent touchstart on body from firing instead of link
    evt.stopImmediatePropagation();
  });
  $allLinks.focus(function() {
    handleFocus($(this));
  });
  $allLinks.blur(function() {
    removeFocus($topLevel);
  });
  // accessibleNav private methods
  function handleFocus ($el) {
    var $subMenu = $el.next('ul'),
    hasSubMenu = $subMenu.hasClass('sub-nav') ? true : false,
    isSubItem = $('.site-nav__dropdown').has($el).length,
    $newFocus = null;
    // Add focus class for top level items, or keep menu shown
    if (!isSubItem) {
      removeFocus($topLevel);
      addFocus($el);
    } else {
      $newFocus = $el.closest('.site-nav--has-dropdown').find('a');
      addFocus($newFocus);
    }
  }
  function showDropdown ($el) {
    $el.addClass(activeClass);
    setTimeout(function() {
      timber.cache.$body.on('touchstart', function() {
        hideDropdown($el);
      });
    }, 250);
  }
  function hideDropdown ($el) {
    $el.removeClass(activeClass);
    timber.cache.$body.off('touchstart');
  }
  function addFocus ($el) {
    $el.addClass(focusClass);
  }
  function removeFocus ($el) {
    $el.removeClass(focusClass);
  }
};
timber.mobileNavToggle = function () {
  timber.cache.$mobileSubNavToggle.on('click', function() {
    $(this).parent().toggleClass('mobile-nav--expanded');
  });
};
timber.getHash = function () {
  return window.location.hash;
};
timber.productPage = function (options) {
  var moneyFormat = options.money_format,
  variant = options.variant,
  selector = options.selector;
  // Selectors
  var $productImage = $('#slider-for'),
  $buyNow = $('#buyNow'),
  $addToCart = $('#AddToCart'),
  $productPrice = $('#ProductPrice'),
  $comparePrice = $('#ComparePrice'),
  $ProductDiscount = $('#ProductDiscount'),
  $variantsku = $('#variantsku'),
  $barcode = $('#barcode'),
  $weight = $('#weight'),
  $quantityElements = $('.quantity-selector, label + .js-qty'),
  $addToCartText = $('#AddToCartText'),
  $qty_plus_minus = $('.cart-plus-minus'),
  $productSelect = $('#productSelect'),
  $productSelectoption = $('#productSelect option'),
  $instock = $('.in-stock'),
  $outstock = $('.out-stock'),
  $data_value = $('#data-value');

  if (variant) {
    
    if (variant && variant.featured_media) {
      jQuery('#pro-detail-slider .slick-slide[data-image-id="' + variant.featured_media.id + '"]').trigger('click');
    }
    // Select a valid variant if available
    if (variant.available) {
      
      // Available, enable the submit button, change text, show quantity elements
      $addToCart.removeClass('disabled').prop('disabled', false);
      $buyNow.removeClass('disabled').prop('disabled', false);
      $addToCartText.html("Add to Cart");
      $instock.show();
      $outstock.hide();
      $qty_plus_minus.removeClass('disabled').prop('disabled', false);
      $quantityElements.show();
    } else {
      
      // Sold out, disable the submit button, change text, hide quantity elements
      $buyNow.addClass('disabled').prop('disabled', true);
      $addToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.html("Sold out");
      $instock.hide();
      $outstock.show();
      $qty_plus_minus.addClass('disabled').prop('disabled', true);
      $quantityElements.hide();
    }
    // Regardless of stock, update the product price
    $productPrice.html( Shopify.formatMoney(variant.price, moneyFormat) );
    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
      .html(Shopify.formatMoney(variant.compare_at_price, moneyFormat))
      .show();
    } else {
      $comparePrice.hide();
    }
    if(variant.price < variant.compare_at_price) {
      $ProductDiscount
      .html(((variant.compare_at_price - variant.price)*100.0/(variant.compare_at_price)).toFixed())
      .show();
    }else{
      $ProductDiscount.hide();
    }
    $variantsku.text(variant.sku);
    $barcode.text(variant.barcode);
    $weight.text(variant.weight);

    if(variant.id) {

          $('.swatch-element').on('click', function(evt) {
            var data_value = $(this).attr('data-value');
            $(this).parents('.variant-wrap').parent().find('#data-value').text(data_value);
          });
       
    }

  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $buyNow.addClass('disabled').prop('disabled', true);
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html("Sold out");
    $instock.show();
    $outstock.hide();
    $quantityElements.hide();
    $barcode.empty();
    $variantsku.empty();
    $weight.empty();
    $instock.hide();
    $outstock.show();
  }
};
var Shopify = Shopify || {};

Shopify.optionsMap = {};

Shopify.updateOptionsInSelector = function(selectorIndex) {
    
  switch (selectorIndex) {
    case 0:
      var key = 'root';
      var selector = jQuery('.single-option-selector:eq(0)');
      break;
    case 1:
      var key = jQuery('.single-option-selector:eq(0)').val();
      var selector = jQuery('.single-option-selector:eq(1)');
      break;
    case 2:
      var key = jQuery('.single-option-selector:eq(0)').val();  
      key += ' / ' + jQuery('.single-option-selector:eq(1)').val();
      var selector = jQuery('.single-option-selector:eq(2)');
  }
  
  var initialValue = selector.val();
  selector.empty();    
  var availableOptions = Shopify.optionsMap[key];
  for (var i=0; i<availableOptions.length; i++) {
    var option = availableOptions[i];
    var newOption = jQuery('<option></option>').val(option).html(option);
    selector.append(newOption);
  }
  jQuery('.swatch[data-option-index="' + selectorIndex + '"] .swatch-element').each(function() {
    if (jQuery.inArray($(this).attr('data-value'), availableOptions) !== -1) {
      $(this).removeClass('soldout').show().find(':radio').removeAttr('disabled','disabled').removeAttr('checked');
    }
    else {
      $(this).addClass('soldout').hide().find(':radio').removeAttr('checked').attr('disabled','disabled');
    }
  });
  if (jQuery.inArray(initialValue, availableOptions) !== -1) {
    selector.val(initialValue);
  }
  selector.trigger('change');  
  
};
$( document ).ready(function() {
            
  setTimeout(function() {

    $(".swatch-element.first-variant").trigger('click');

  },10);

});
Shopify.linkOptionSelectors = function(product) {
  // Building our mapping object.
  for (var i=0; i<product.variants.length; i++) {
    var variant = product.variants[i];
    if (variant.available) {
      // Gathering values for the 1st drop-down.
      Shopify.optionsMap['root'] = Shopify.optionsMap['root'] || [];
      Shopify.optionsMap['root'].push(variant.option1);
      Shopify.optionsMap['root'] = Shopify.uniq(Shopify.optionsMap['root']);
      // Gathering values for the 2nd drop-down.
      if (product.options.length > 1) {
        var key = variant.option1;
        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
        Shopify.optionsMap[key].push(variant.option2);
        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
      }
      // Gathering values for the 3rd drop-down.
      if (product.options.length === 3) {
        var key = variant.option1 + ' / ' + variant.option2;
        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
        Shopify.optionsMap[key].push(variant.option3);
        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
      }
    }
  }
  // Update options right away.
  Shopify.updateOptionsInSelector(0);
  if (product.options.length > 1) Shopify.updateOptionsInSelector(1);
  if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
  // When there is an update in the first dropdown.
  jQuery(".single-option-selector:eq(0)").change(function() {
    Shopify.updateOptionsInSelector(1);
    if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
    return true;
  });
  // When there is an update in the second dropdown.
  jQuery(".single-option-selector:eq(1)").change(function() {
    if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
    return true;
  });  
};


timber.productImageSwitch = function () {
  timber.cache.$thumbImages.on('click', function(evt) {
    var img_src_id = $( this ).find('img').attr('data-image-id');
    jQuery('#pro-detail-slider a[data-image-id="' + img_src_id + '"]').trigger('click');
  });
};
timber.formCart = function () {
  $('form.cart-').submit();
}
timber.responsiveVideos = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');
  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    $(this).wrap('<div class="video-wrapper"></div>');
  });
  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};
timber.collectionViews = function () {
  if (timber.cache.$changeView.length) {
    timber.cache.$changeView.on('click', function() {
      var view = $(this).data('view'),
      url = document.URL,
      hasParams = url.indexOf('?') > -1;
      if (hasParams) {
        window.location = replaceUrlParam(url, 'view', view);
      } else {
        window.location = url + '?view=' + view;
      }
    });
  }
};
timber.loginForms = function() {
  function showRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.show();
    timber.cache.$customerLoginForm.hide();
  }
  function hideRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.hide();
    timber.cache.$customerLoginForm.show();
  }
  timber.cache.$recoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    showRecoverPasswordForm();
  });
  timber.cache.$hideRecoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    hideRecoverPasswordForm();
  });
  // Allow deep linking to recover password form
  if (timber.getHash() == '#recover') {
    showRecoverPasswordForm();
  }
};
timber.resetPasswordSuccess = function() {
  timber.cache.$passwordResetSuccess.show();
};
/*============================================================================
Drawer modules
- Docs http://shopify.github.io/Timber/#drawers
==============================================================================*/
timber.Drawers = (function () {
  var Drawer = function (id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };
    this.$nodes = {
      parent: $('body, html'),
      page: $('#PageContainer'),
      moved: $('.is-moved-by-drawer')
    };
    this.config = $.extend(defaults, options);
    this.position = position;
    this.$drawer = $('#' + id);
    if (!this.$drawer.length) {
      return false;
    }
    this.drawerIsOpen = false;
    this.init();
  };
  Drawer.prototype.init = function () {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.find(this.config.close).on('click', $.proxy(this.close, this));
  };
  Drawer.prototype.open = function (evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;
    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }
    // Without this, the drawer opens, the click event bubbles up to $nodes.page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }
    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }
    // Notify the drawer is going to open
    timber.cache.$body.trigger('beforeDrawerOpen.timber', this);
    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$nodes.moved.addClass('is-transitioning');
    this.$drawer.prepareTransition();
    this.$nodes.parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
    this.drawerIsOpen = true;
    // Set focus on drawer
    this.trapFocus(this.$drawer, 'drawer_focus');
    // Run function when draw opens if set
    if (this.config.onDrawerOpen && typeof(this.config.onDrawerOpen) == 'function') {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }
    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }
    // Lock scrolling on mobile
    this.$nodes.page.on('touchmove.drawer', function () {
      return false;
    });
    this.$nodes.page.on('click.drawer', $.proxy(function () {
      this.close();
      return false;
    }, this));
    // Notify the drawer has opened
    timber.cache.$body.trigger('afterDrawerOpen.timber', this);
  };
  Drawer.prototype.close = function () {
    if (!this.drawerIsOpen) { // don't close a closed drawer
    return;
  }
  // Notify the drawer is going to close
  timber.cache.$body.trigger('beforeDrawerClose.timber', this);
  // deselect any focused form elements
  $(document.activeElement).trigger('blur');
  // Ensure closing transition is applied to moved elements, like the nav
  this.$nodes.moved.prepareTransition({ disableExisting: true });
  this.$drawer.prepareTransition({ disableExisting: true });
  this.$nodes.parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);
  this.drawerIsOpen = false;
  // Remove focus on drawer
  this.removeTrapFocus(this.$drawer, 'drawer_focus');
  this.$nodes.page.off('.drawer');
  // Notify the drawer is closed now
  timber.cache.$body.trigger('afterDrawerClose.timber', this);
};
Drawer.prototype.trapFocus = function ($container, eventNamespace) {
  var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';
  $container.attr('tabindex', '-1');
  $container.focus();
  $(document).on(eventName, function (evt) {
    if ($container[0] !== evt.target && !$container.has(evt.target).length) {
      $container.focus();
    }
  });
};
Drawer.prototype.removeTrapFocus = function ($container, eventNamespace) {
  var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';
  $container.removeAttr('tabindex');
  $(document).off(eventName);
};
return Drawer;
})();
// Initialize Timber's JS on docready
$(timber.init);
