//JP:TODO: Update Mini cart and PAN to use the alt images

var CKMiniCart = MiniCart = CKMiniCart ||
{
	/* Used to store order quantity locally */
	_orderQuantity : 0,
	
	construct:function()
	{
		CKMiniCart=MiniCart=$.extend({},PVHMiniCart,CKMiniCart);
		
		CKMiniCart.$numItemsInBag = $(CKMiniCart.ITEMS_IN_BAG_SELECTOR);
		CKMiniCart._orderQuantity = $.trim($("#updatedOrderQuantity").text());
		CKMiniCart.$shoppingBagItems = $('.shopping-bag');
		CKMiniCart.$element=CKUtil.$body.find(CKMiniCart.SELECTOR);
		CKMiniCart.$miniCartWrapper=$('.miniCartWrapper');
		CKMiniCart.$addedProductNotification=$("#product-added-notification")
		
		CKMiniCart.$shoppingBag=CKMiniCart.$shoppingBagItems; //Will have _DATA_HAS_PRODUCTS attribute
		CKMiniCart.$miniCartLink=$('#mini_cart_link');
	},

	init:function()
	{
		CKMiniCart._bindEvents();
		if(U.isMobile()) CKMiniCart._initMobileStickyMiniCartHandler();
	},

    finalize:function()
    {
    	CKMiniCart.addListeners(true);
    	CKMiniCart.updateBagTotal();
    },
    
    _setMiniCartData:function(data)
	{
		if(!CKUtil.isMobile())
		{
			CKMiniCart.$element.html(data);
		}
		
		CKMiniCart.updateBagTotal();
	},

	_fadeInMiniCart:function(isFirstView)
	{
		var $highlight=CKMiniCart.$element.find('.highlight');
		$highlight.removeClass('highlight');
		TweenLite.to($highlight,.5,{backgroundColor:'#F0F4F8'});
		TweenLite.to($highlight,.5,{backgroundColor:'transparent',delay:1.5});
		
		var $miniCart=$('#mini_cart');
		if(CKUtil.isIE8()) $miniCart.css({visibility:'inherit'});
		else CKUtil.fadeIn($miniCart);
		
		if(isFirstView) $miniCart.addClass(CKMiniCart._MINI_CART_OPEN_CLASS);
		
		clearTimeout(CKMiniCart._miniCartTimoutId);
		CKMiniCart._miniCartTimoutId=setTimeout(function()
		{
			CKMiniCart.close(false);
			
			//If this passes after calling close, then the user isn't over top of the mini cart and it hasn't been closed, so it can be faded out
			if(!CKUtil.isIE8() && $miniCart.css('visibility')!='visible' && $miniCart.css('opacity')>0) CKUtil.fadeOut($miniCart,CKMiniCart.close);
		},3000);
	},
	
	_bindEvents : function() {
		CKMiniCart.$shoppingBagItems.mouseleave(CKMiniCart._mouseLeaveMiniCart);
		
		if(!CKUtil.isTouch())
		{
			CKMiniCart.$shoppingBagItems.mouseenter(CKMiniCart._mouseEnterMiniCart);
			$(CKMiniCart.SELECTOR).on('mouseleave','#mini_cart',function(event)
			{
				if(!event) event = window.event;
				var relatedTarget = event.relatedTarget || event.toElement;

				if(relatedTarget)
				{
					var shoppingBagItems=CKMiniCart.$shoppingBagItems.get(0);
					while(relatedTarget != shoppingBagItems && relatedTarget.nodeName != 'BODY' && relatedTarget.parentNode) relatedTarget = relatedTarget.parentNode;
					if(relatedTarget == shoppingBagItems) return;
				}
				
				CKMiniCart._closeMiniCart();
			});
		}
		
		$('#pdpAdd2CartButton, #pdpAdd2CartButtonMobile').click(function() {
			var $currentButton = $(this);
			var catalogEntry = $currentButton.attr('data-catentryId');
			var entitledItemId = "#entitledItem_" + catalogEntry;
			var quantity = $("#quantity_" + catalogEntry).val();
			var isPopup = $currentButton.attr('data-popup');
			CKMiniCart.ajaxAdd2ShopCart(entitledItemId, quantity,isPopup);
		});
	},
	
	_mouseEnterMiniCart:function()
	{
		CKMiniCart._openMiniCart();
	},
	
	_mouseLeaveMiniCart:function(event)
	{
		if(!event) event = window.event;
		var target = event.target || element.srcElement;
		if(target.id!='mini_cart')
		{
			var relatedTarget = event.relatedTarget || event.toElement;

			if(relatedTarget)
			{
				while(relatedTarget.id != 'mobile-ShoppingBagContainer' && relatedTarget.nodeName != 'BODY' && relatedTarget.parentNode) relatedTarget = relatedTarget.parentNode;
				if(relatedTarget.id == 'mobile-ShoppingBagContainer') return;
			}
		}
		
		CKMiniCart._closeMiniCart();
	},
	
	_closeMiniCart:function()
	{
		var $miniCart=$('#mini_cart');
		CKUtil.fadeOut($miniCart,{killFadeInTween:true,onComplete:function()
		{
			$miniCart.removeClass(CKMiniCart._MINI_CART_OPEN_CLASS);
		}});
	},
	
	_openMiniCart:function()
	{
		var $miniCart=$('#mini_cart');
		CKUtil.fadeIn($miniCart,{delay:true,onStart:function()
		{
			$miniCart.addClass(CKMiniCart._MINI_CART_OPEN_CLASS);
		}});
		
		U.closeOpenElements();
		if(CKUtil.isTablet()) CKUtil.forceIOSRedraw($miniCart.find('#mini-cart-item-container'));
	},
	
	_updateProductAddedNotification: function(data)
	{
		CKMiniCart.$addedProductNotification.html(data);
		MiniCart.updateBagTotal();
		
		CKUtil.fadeInOut(CKMiniCart.$addedProductNotification,null,CKMiniCart.$addedProductNotification.empty);
	},
	
	updateMiniCart:function(serviceResponse, actualQty, redirectToCart)
    {
		MiniCart.ajaxProductAddedNotificationView(serviceResponse,false,actualQty);
		MiniCart.ajaxUpdateMiniShoppingCartDisplay(serviceResponse.orderItem[0].orderItemId, actualQty, false);
    },
	
	ajaxProductAddedNotificationView: function(serviceResponse,addFromWishListToBag,actualQty) {

		var catEntryCSV = "";
		var quantityCSV = "";
		
		if(U.isBundlePage() || addFromWishListToBag){
			if(serviceResponse.orderItem.length > 0){
				for(var i=0; i<serviceResponse.orderItem.length; i++){
					
					var index = i+1;
					
					if(i == 0){
						if (serviceResponse.catEntryId != undefined && serviceResponse.quantity != undefined){
							catEntryCSV += serviceResponse.catEntryId[0];
							quantityCSV += serviceResponse.quantity[0];
						} else {
							catEntryCSV += serviceResponse['catEntryId_'+index][0];
							// actualQty won't handle addToCart of multiple skus
							// might want to rewrite this logic if multiple sku add is expected
							quantityCSV += actualQty ? actualQty : serviceResponse['quantity_'+index][0];
						}					
					}else{
						catEntryCSV += "," + serviceResponse['catEntryId_'+index][0];
						quantityCSV += "," + serviceResponse['quantity_'+index][0];
						if(addFromWishListToBag)
							CKMiniCart.$numItemsInBag.text(index);
					}
				}
			}
		}else{
			quantityCSV = actualQty ? actualQty : serviceResponse['quantity'][0];
			catEntryCSV = serviceResponse['catEntryId'][0];	
		}
		
		if(MiniCart._$hxrReq_APN) MiniCart._$hxrReq_APN.abort();
		
        MiniCart._$hxrReq_APN=U.post('ProductAddedNotificationView',
        {
    		
        	orderItemId : (serviceResponse.orderItem.length > 1) ? "" : serviceResponse.orderItem[0].orderItemId,
    		catEntryIds : catEntryCSV,
    		quantities : quantityCSV
    		
    	}, function(data) {
    		CKMiniCart._updateProductAddedNotification(data);
    	
    	}, function() {
			console.log("Error in Ajax MIni Cart Request.");
		});
		
	},
	
	_initMobileStickyMiniCartHandler: function ()
	{
		if(U.isProductPage() || U.isBundlePage())
		{
			var $productAddedNotification=U.$header.find("#product-added-notification");
			var arrowOffset = 8;
			var headerHeight = U.$header.height()+arrowOffset;
			U.$window.scroll(function()
			{
				if(U.isVisible($productAddedNotification))
				{
					var scrollTop=U.$window.scrollTop();
					$productAddedNotification.css(U.TOP,Math.max(arrowOffset, Math.min(headerHeight, headerHeight-scrollTop)));
				}
			});
		}
	},
	_ajaxAddItem2MiniShoppingCart : function(catEntryIdentifier, quantity) {
		var params = {};
		params.storeId		= U.getStoreId();
		params.catalogId	= U.getCatalogId();
		params.langId		= U.getLangId();
		params.orderId		= ".";
		params.calculationUsage = "-1,-2,-5,-6,-7";
		
		if(dojo.isArray(catEntryIdentifier) && dojo.isArray(quantity)){
			for(var i=0; i<catEntryIdentifier.length; i++){
				if(!isPositiveInteger(quantity[i])){
					MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
					return;
				}
				params["catEntryId_" + (i+1)] = catEntryIdentifier[i];
				params["quantity_" + (i+1)]	= quantity[i];
			}
		}
		else{
			if(!isPositiveInteger(quantity)){
				MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
				return;
			}
			params.catEntryId	= catEntryIdentifier;
			params.quantity		= quantity;
		}

		/**
		 * Add an item to a shopping cart in Ajax mode. A message is displayed after
		 * the service call.
		 * @constructor
		 */
		wc.service.declare({
			id: "AddOrderItemsFromWishList",
			actionId: "AddOrderItemsFromWishList",
			url: getAbsoluteURL() + "AjaxRESTOrderItemAdd",
			formId: ""

		 /**
		 * display a success message
		 * @param (object) serviceResponse The service response object, which is the
		 * JSON object returned by the service invocation
		 */

			,successHandler: function(serviceResponse) {
				CKMiniCart.ajaxProductAddedNotificationView(serviceResponse,true);
				MiniCart.ajaxUpdateMiniShoppingCartDisplay(serviceResponse.orderItem[0].orderItemId);
				if(U.isMobile())MessageHelper.displaySuccessMessage(MessageHelper.messages['SHOPCART_ADDED']);
			}
		/**
		 * display an error message
		 * @param (object) serviceResponse The service response object, which is the
		 * JSON object returned by the service invocation
		 */
			,failureHandler: function(serviceResponse) {
				CKMiniCart.$numItemsInBag.text(CKMiniCart._orderQuantity);
				// WI26815 - CK: Minibag count is getting vanished when trying to add a out of stock inventory to cart
				CKMiniCart.updateBagTotal();

				if (serviceResponse.errorMessage) {
					if(serviceResponse.errorMessageKey == "_ERR_MAX_BUYABLE_QTY_EXCEEDED"){
						
						var qty = trim(serviceResponse.errorMessageParam[0]);
						var itemName = trim(serviceResponse.errorMessageParam[1]);
						var replacements = {"{0}":qty,"{1}":itemName};
						var errorString = MessageHelper.messages["_ERR_MAX_BUYABLE_QTY_EXCEEDED"];
						errorMessage = errorString.replace(/{\w+}/g, function(all) {
							   return replacements[all] || all;
							});
						
						MessageHelper.displayErrorMessage(errorMessage);
	 				} else if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
						MessageHelper.displayErrorMessage(MessageHelper.messages["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
					} else if (serviceResponse.errorMessageKey == "_ERR_RETRIEVE_PRICE") {
						MessageHelper.displayErrorMessage(MessageHelper.messages["ERROR_RETRIEVE_PRICE"]);
					} else {
						MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
					}
				}
				else {
					 if (serviceResponse.errorMessageKey) {
						MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
					 }
				}
				cursor_clear();
			}
		});
		wc.service.invoke("AddOrderItemsFromWishList", params);
		
	},
	ajaxAddAllWishListItem2ShopCart : function() {
		var catEntryIds = $('.hidden-catEntryIdentifier');
		var catEntryIdArray = new Array();
		var quantityArray = new Array();
		var count = catEntryIds.length;
		var totalQuantity = 0;
		for(var i=0; i<count; i++){
			catEntryIdArray[i] = catEntryIds[i].value;
			quantityArray[i] = 1; // Only one quantity can be added to cart from wish list
			totalQuantity += quantityArray[i];
		}
		if(count >= 1){
			CKMiniCart._ajaxAddItem2MiniShoppingCart(catEntryIdArray, quantityArray, 1);
			$(window).scrollTop(0);
		}else{
			MessageHelper.displayErrorMessage(MessageHelper.messages["PRODUCT_NOT_BUYABLE"]);
		}	
	},
	
	$shoppingBagItems : null,
    SELECTOR:'#mobile-ShoppingBagContainer',
    PRODUCT_WRAPPER_SELECTOR:'.mini-cart-item-container',
    PRODUCT_SELECTOR:'.mini_cart_product',
    ITEMS_IN_BAG_SELECTOR:'.orderQuantity',
    $productWrapper:null,
    $addedProductNotification:null,
	_MINI_CART_OPEN_CLASS:'mini-cart-open',
	$numItemsInBag : null,
	_$hxrReq_APN:null
}
