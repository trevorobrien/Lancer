//Must be extended by a Store MiniCart object

var PVHMiniCart = PVHMiniCart ||
{
	addListeners:function(fadeIn)
	{
		if(!U.isTouch() && MiniCart.getBagTotal())
    	{
			MiniCart.$element.empty().hide(); //Empty out the empty cart and hide it until it's finished loading
			
			MiniCart.$miniCartWrapper.one(U.MOUSE_ENTER,function()
	    	{
	    		if(MiniCart.$element.children().length==0) //Means mini cart as never been loaded via add to cart, etc.
	    		{
	    			MiniCart._loadMiniCartView(U.EMPTY,U.EMPTY,function(data)
		    		{
	    				MiniCart.$element.css({display:U.EMPTY});
		    			MiniCart._setMiniCartData(data);
		    			if(fadeIn && U.isMouseOver(MiniCart.$miniCartWrapper)) MiniCart._fadeInMiniCart(true);
		    		});
	    		}
	    	});
    	}
	},
	
	//Needs call after the html for the mini cart is updated
    refinalize:function()
    {
    	MiniCart._setup();
    },
    
    close:function(resetOpacity)
    {
    	if(arguments.length==0) resetOpacity=true;
    	
    	MiniCart.$element.css(resetOpacity ? {visibility:U.EMPTY,opacity:U.EMPTY} : {visibility:U.EMPTY});
    },
    
    //If changed, update CKUtilityNavigation's "My Bag" total logic
    getBagTotal:function()
    {
    	var total=parseInt(U.getWCCartTotalCookie( U.getWCOrderIdCookie() ) ); 
    	return isNaN(total) ? 0 : total;
    },
    
    //If changed, update CKUtilityNavigation's "My Bag" total logic
    updateBagTotal:function()
    {
    	var total=MiniCart.getBagTotal();
    	MiniCart.$numItemsInBag.text(total);
    	MiniCart.$shoppingBag.attr(MiniCart._DATA_HAS_PRODUCTS,total>0);
    },

    resetBagCount:function()
    {
    	U.removeCookie(U._wcCartTotalCookie + U.getWCOrderIdCookie());
    	U.removeCookie(U._wcOrderIdCookie);
    	MiniCart.$numItemsInBag.text(0);
    	MiniCart.$shoppingBag.attr(MiniCart._DATA_HAS_PRODUCTS,false);
    },
    
    updateMiniCart:function(serviceResponse, actualQty, redirectToCart)
    {
    	MiniCart.ajaxUpdateMiniShoppingCartDisplay(serviceResponse.orderItem[0].orderItemId, actualQty, true);
    	if(redirectToCart)
    	{
    		U.callAfterCallStack(function() //Done to allow any Tealium code to still submit
    		{
    			MiniCart.$miniCartLink.get(0).click();
    		});
    	}
    },
    
    shouldRedirect:function()
    {
    	return MiniCart._shouldRedirect;
    },
    
    ajaxUpdateMiniShoppingCartDisplay: function(orderItemId, actualQtyAdded, displayMiniCart)
	{
    	O.close();
		MiniCart._loadMiniCartView(orderItemId,actualQtyAdded,function(data)
		{
			//if $element is display: none, then it's never been loaded via mouseenter, so show it and remove the mouseenter listener
			if(MiniCart.$element.css(U.DISPLAY)==U.NONE)
			{
				MiniCart.$element.css({display:U.EMPTY});
				MiniCart.$miniCartWrapper.unbind(U.MOUSE_ENTER);
			}
			MiniCart._setMiniCartData(data);
			//WI29008 Tealium : Copy minicart utag data exactly from prod site.
			//WI29819: CK: Bundles Product added notification only shows 1 product and Mobile bundles are missing alts
			if (!U.isShippingAndBillingPage()) PVHTealium.submitMiniCartView();
			if(!U.isMobile() && displayMiniCart) MiniCart._fadeInMiniCart();
    	});
	},
	
	ajaxUpdateMiniShoppingBagOnly: function(orderItemId)
	{
		O.close();
		MiniCart._loadMiniCartView(orderItemId,U.EMPTY,MiniCart._setMiniCartData);
	},
	
	_loadMiniCartView:function(orderItemId,actualQtyAdded,successHandler)
	{
		if(MiniCart._$hxrReq) MiniCart._$hxrReq.abort();
		
        MiniCart._$hxrReq=U.post('MiniShoppingCartView',
        {
        	addedOrderItemId : orderItemId,
        	actualQtyAdded:actualQtyAdded,
        	isShoppingBagPage:U.isShoppingBagPage()
    	},successHandler,function()
    	{
			console.log('Error in Ajax Mini Cart Request.');
		});
	},
    
    _$hxrReq:null,
    $element:null,
    $numItemsInBag:null,
    $shoppingBag:null,
    $miniCartLink:null,
    _miniCartTimoutId:null,
    _DATA_HAS_PRODUCTS:'data-has-products-in-cart',
    _shouldRedirect:false
};
