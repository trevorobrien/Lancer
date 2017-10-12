
var Affiliate=Affiliate ||
{	
	
	/**
	 * variable to store PepperJam cookie name
	 */
	PepperJamCookieName:"PepperJam_Referral",
	
	/**
	 * variable to store PepperJam cookie expiry - in days
	 */
	PepperJamCookieExpiry:120,
	
	/**
	 * initializes affiliate cookies
	 */
	init:function(){
		
		//initialize PepperJam cookie
		Affiliate.validatePepperJamCookie();
	},
	
	/**
	 * checks if url has PepperJam affiliate details and if present create PepperJam cookie (if cookie not present) and set it to expire in 120 days,
	 * and if cookie already exists then update PepperJam cookie (if cookie already present)
	 */
	validatePepperJamCookie:function(){
			
		var source = Affiliate.getParameter('source');
		var affiliateid = Affiliate.getParameter('affiliateId');
		var clickid =  Affiliate.getParameter('clickId');
		var affiliatecustomid =  Affiliate.getParameter('affiliateCustomId');
		
		//Check for PepperJam cookie parameters presence in the request parameters
		if (source != null && affiliateid != null && clickid != null && affiliatecustomid != null) {
			
			var cookieVal = 'source='+ source +'&affiliateid=' + affiliateid + '&clickid=' + clickid + '&affiliatecustomid=' + affiliatecustomid ;
			
			var now = new Date();
			var dateTime = now.getFullYear() + '-' + Affiliate.prefixZero(now.getMonth())+ '-' + Affiliate.prefixZero(now.getDate()) + ' ' + Affiliate.prefixZero(now.getHours())+ 
				':' + Affiliate.prefixZero(now.getMinutes()) + ':' + Affiliate.prefixZero(now.getSeconds());
			
			cookieVal = cookieVal + '&datetime=' + dateTime; 
			
			// create/update PepperJam cookie
			$.cookie(Affiliate.PepperJamCookieName, cookieVal,{ path: '/', expires: Affiliate.PepperJamCookieExpiry});
		} 
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
	},
	
	/**
	 * prefix 0 for date format
	 */
	prefixZero:function(val) {
		return ((val < 10) ? '0'+ val : val);
	}

} 