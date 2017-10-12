var CKStickyController=CKStickyController ||
{
	construct:function()
    {
		 CKStickyController.$backToTop=U.$footer.find(CKStickyController.BACK_TO_TOP_SELECTOR);
		 CKStickyController.$addedProductNotification=$('#product-added-notification');
		 CKStickyController.$headerTop=U.$header.find('#headerTop');
    },
    
    init:function()
    {
		var hasAddedProductNotification=(U.isProductPage() || U.isBundlePage()) && CKStickyController.$addedProductNotification.length;
		if(hasAddedProductNotification)
		{
			CKStickyController._addedProductNotificationRight=parseInt(CKStickyController.$addedProductNotification.css(U.RIGHT));
			U.$window.scroll(CKStickyController._updateAddedProductNotification).resize(CKStickyController._updateAddedProductNotification);
			CKStickyController._productAddedNotificationTop=CKStickyController.$addedProductNotification.offset().top-parseInt(CKStickyController.$addedProductNotification.css('border-top-width'));
		}
    },
    
    finalize:function()
    {
    	if(CKStickyController.$backToTop.length && CKStickyController._finalizeBackToTop()) CKStickyController._position();
    },
    
	enableBackToTop:function()
    {
    	if(CKStickyController.$backToTop.length)
    	{
    		CKStickyController.$backToTop.data(CKStickyController._DATA_FADED_IN,false)
    		.removeClass(U.HIDDEN)
    		.click(function()
			{
				U.scrollTo(0);
				return false;
		    });
    		
    		U.$window.scroll(CKStickyController._position).resize(CKStickyController._position);
    		CKStickyController._position();
    	}
    },
    
	_finalizeBackToTop:function()
	{
		if(U.isHomepage() || U.isDepartmentPage() || U.isCategoryPage() || U.isSearchPage() || U.isBundlePage() || U.isCustomerServicePage())
		{
			CKStickyController.enableBackToTop();
			return true;
		} else
		{
			CKStickyController.$backToTop.addClass(U.HIDDEN);
			return false;
		}
	},
	
    _position:function()
	{
    	if(U.$footer.position().top>=U.$window.scrollTop()+U.$window.height())
		{
			if(CKStickyController.$backToTop.css(U.POSITION)!=U.FIXED) CKStickyController.$backToTop.css({position:U.EMPTY,top:U.EMPTY,bottom:U.EMPTY});
		} else if(CKStickyController.$backToTop.css(U.POSITION)!=U.ABSOLUTE) CKStickyController.$backToTop.css({position:U.ABSOLUTE,top:-CKStickyController.$backToTop.height()-20,bottom:U.AUTO});
		
    	var scrollTop=U.$window.scrollTop();
		if(scrollTop>CKStickyController._scrollTopToShowHideBackToTop)
		{
			if(CKStickyController.$backToTop.data(CKStickyController._DATA_FADED_IN)==false)
			{
				CKStickyController.$backToTop.data(CKStickyController._DATA_FADED_IN,true);
				U.fadeIn(CKStickyController.$backToTop);
			}
		} else if(CKStickyController.$backToTop.data(CKStickyController._DATA_FADED_IN))
		{
			CKStickyController.$backToTop.data(CKStickyController._DATA_FADED_IN,false);
			U.fadeOut(CKStickyController.$backToTop);
		}
	},
	
	_updateAddedProductNotification:function()
	{
		var scrollTop=U.$window.scrollTop();
		if(scrollTop>CKStickyController._productAddedNotificationTop)
		{
			if(!CKStickyController.$addedProductNotification.hasClass(CKStickyController._STICKY_CLASS)) CKStickyController.$addedProductNotification.addClass(CKStickyController._STICKY_CLASS);
			
			var right=Math.max((U.$window.width()-CKStickyController.$headerTop.width())/2+CKStickyController.addedProductNotificationRight,CKStickyController.addedProductNotificationRight);
			if(parseInt(CKStickyController.$addedProductNotification.css(U.RIGHT))!=right) CKStickyController.$addedProductNotification.css({right:right});
		} else if(CKStickyController.$addedProductNotification.hasClass(CKStickyController._STICKY_CLASS)) CKStickyController.$addedProductNotification.removeClass(CKStickyController._STICKY_CLASS).css({right:U.EMPTY});
	},
	
	_STICKY_CLASS:'sticky',
	BACK_TO_TOP_SELECTOR:'#backToTop',
	_DATA_FADED_IN:'data-faded-in',
	_productAddedNotificationTop:0,
	$headerTop:null,
	$backToTop:null,
	$addedProductNotification:null,
	_scrollTopToShowHideBackToTop:20
}
