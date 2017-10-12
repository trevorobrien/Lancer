var URLPromo = URLPromo ||
{	
	/**
	 * variable to store URL Promotion cookie name
	 */
	URLPromoCookieName:"url_promo",

	/**
	 * variable to store URL Promo code parameter
	 */
	PVHPromoURLParam:"ed_545",
	
	/**
	 * initializes Link Promotion cookies
	 */
	init:function(){
		
		//initialize Promo cookie
		if(typeof CheckoutHelperJS != 'undefined' && CheckoutHelperJS.shoppingCartPage){
			// no action on shopping cart page
		}
		else{
			URLPromo.createURLPromoCookie();
		}
		
	},
	
	/**
	 * creates Promotion cookie
	 */
	createURLPromoCookie:function(){
		
		var cookieVal = URLPromo.getParameter(URLPromo.PVHPromoURLParam);
		
		if(U.isNotNull(cookieVal)){
			//create Promotion session cookie
			$.cookie(URLPromo.URLPromoCookieName, cookieVal,{ path: '/'});
		}
		
	},
	
	/**
	 * Removes the cookie on session timeout
	 */
	removeURLPromoCookie:function(){
		
		$.cookie(URLPromo.URLPromoCookieName, null, { path: '/' });
		
	},

	/**
	 * get value from Promotion cookie
	 */
	getURLPromoCookieVal:function(){
		
		var cookieVal = $.cookie(URLPromo.URLPromoCookieName);
		return cookieVal;
	},
	
	
	/**
	 * reads url parameters
	 */
	getParameter:function(paramName) {
		var searchString = window.location.search.substring(1), i, val, params = searchString.split("&");
	
		for (i=0;i<params.length;i++) {
			val = params[i].split("=");
			
			if (val[0] == paramName) {
				return unescape(val[1]);
			}
		}
		return null;
	}
	
} 