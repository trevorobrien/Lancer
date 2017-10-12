var CKOverlay; //Legacy Overlay object
var CK = CK ||
{
	/* construct methods should be used for look-ups, but NO actual work should be done */
    _construct:function()
    {
		CKUtil.construct({qlt:'85,0',resMode:'sharp2',op_usm:'0.9,1.0,8,0'});
		
		PVHOverlay.construct({backgroundOpacity:.9});
		CKOverlay=PVHOverlay;
		
		if(typeof CKHeaderNav!=U.UNDEFINED) CKHeaderNav.construct();
		if(typeof CKHeaderMyAccount!=U.UNDEFINED) CKHeaderMyAccount.construct();
		if(typeof CKMiniCart!=U.UNDEFINED) CKMiniCart.construct();
		if(typeof CKNewsletter!=U.UNDEFINED) CKNewsletter.construct();
		if(typeof PVHHeaderMobile!=U.UNDEFINED) PVHHeaderMobile.construct();
		if(typeof CKFooterMobile!=U.UNDEFINED) CKFooterMobile.construct();
		if(typeof CKStickyController!=U.UNDEFINED) CKStickyController.construct();
        if(typeof PVHSelectedFilters!=U.UNDEFINED) PVHSelectedFilters.construct(null,null,null,U.isDesktop() ? $('.categoryControls') : null);
        if(typeof Checkout!=U.UNDEFINED) Checkout.construct();
        if(typeof PVHQuickView!=U.UNDEFINED) PVHQuickView.construct('FULL DETAILS',U.LEFT,'.socialWrapper');
    },
    
    /* init methods should be used to perform calculations, add listeners, set variables, etc. */
    _init:function()
    {
    	CKUtil.init(U.isMobile() ? U.updateImageSrcForPDP : null);
    	PVHOverlay.init();
    	
    	TweenLite.defaultEase=Sine.easeOut;
    	if(typeof CKHeaderNav!=U.UNDEFINED) CKHeaderNav.init();
    	if(typeof CKHeaderMyAccount!=U.UNDEFINED) CKHeaderMyAccount.init();
    	if(typeof CKMiniCart!=U.UNDEFINED) CKMiniCart.init();
    	if(typeof CKNewsletter!=U.UNDEFINED) CKNewsletter.init();
    	if(typeof PVHHeaderMobile!=U.UNDEFINED) PVHHeaderMobile.init();
    	if(typeof CKFooterMobile!=U.UNDEFINED) CKFooterMobile.init();
    	if(typeof CKStickyController!=U.UNDEFINED) CKStickyController.init();
    	if(typeof PVHSelectedFilters!=U.UNDEFINED) PVHSelectedFilters.init();
    	if(typeof Checkout!=U.UNDEFINED) Checkout.init();
    	if(typeof Loyalty!=U.UNDEFINED) Loyalty.init();
    	if(typeof PVHQuickView!=U.UNDEFINED)
    	{
    		PVHQuickView.init(function()
	    	{
    			var $product=U.$body.find(U.PRODUCT_SELECTOR);
	    		var styleNumber=$product.find('.tabsContainer .styleNumber').first().text();
	    		var $styleNumber=U.toElement('styleNumber '+U.LOWERCASE,null,null,styleNumber);
	    		$product.find('.description').before($styleNumber);
	    	},function($div)
        	{
        		$div.find('.contentRecommendationWidget[data-ems-name^=PDP]').remove();
        	});
    	}
    	if(typeof URLPromo!=U.UNDEFINED) URLPromo.init();
    	if(typeof Affiliate!=U.UNDEFINED) Affiliate.init();
    },
    
    /* finalize methods should be used to position/resize elements and start animations */
    _finalize:function()
    {
    	CKUtil.finalize();
    	PVHOverlay.finalize();
    	
    	if(typeof CKHeaderNav!=U.UNDEFINED) CKHeaderNav.finalize();
    	if(typeof CKHeaderMyAccount!=U.UNDEFINED) CKHeaderMyAccount.finalize();
    	if(typeof CKMiniCart!=U.UNDEFINED) CKMiniCart.finalize();
    	if(typeof CKNewsletter!=U.UNDEFINED) CKNewsletter.finalize();
    	if(typeof PVHHeaderMobile!=U.UNDEFINED) PVHHeaderMobile.finalize();
    	if(typeof CKFooterMobile!=U.UNDEFINED) CKFooterMobile.finalize();
    	if(typeof CKStickyController!=U.UNDEFINED) CKStickyController.finalize();
    	if(typeof PVHSelectedFilters!=U.UNDEFINED) PVHSelectedFilters.finalize();
    	if(typeof Checkout!=U.UNDEFINED) Checkout.finalize();
    	if(typeof PVHQuickView!=U.UNDEFINED) PVHQuickView.finalize();
    }
};

/* ALL ck.objects should be constructed, initialized, and finalized by CK, so ready handlers that are added in eSpots/JSP are run after everything has been finalized. */
$(function()
{
    var $doc=$(document);
	$doc.trigger(U.PVH_CONSTRUCT);
	CK._construct();
    $doc.trigger(U.PVH_INIT);
    CK._init();
    $doc.trigger(U.PVH_FINALIZE);
    CK._finalize();
    $doc.trigger(U.PVH_COMPLETE);
    PVHUtil.complete($('.collapsableNav').data('use-accordion'),150);
    $doc.trigger(U.PVH_READY);
});
