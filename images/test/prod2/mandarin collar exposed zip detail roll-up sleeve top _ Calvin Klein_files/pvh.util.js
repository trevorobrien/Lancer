/* WARNINGS:
 * PVHUtil should never reference a StoreUtil property/method, as this is the base object.
 * Since this object is extended BEFORE the init and finalize methods run, setting PVHUtil.someProperty in them will result in a null value in the StoreUtil object.
 * Variables also CANNOT be defined in both objects or they can be set back to null after extending PVHUtil.
 * Avoid using PVHUtil, instead use the U shortcut, so the if it's defined in the StoreUtil file it will be called.
 */

var U; //Shortcut to Util object
var PVHUtil = U = PVHUtil ||
{
		construct:function(transparentThumb,transparentImage,closeXImage,scene7Params)
	    {
	    	U.$window=$(window);
	    	U.$doc=$(document);
	    	U.$html=U.$doc.children(U.HTML);
	    	U.$body=U.$html.children(U.BODY);
	    	U.$page=U.$body.children(U.PAGE);
	    	U.$main=U.$page.children(U.MAIN);
	    	U.$header=U.$page.children(U.HEADER);
	    	U.$footer=U.$body.children(U.FOOTER);
	    	U.$progressBar=U.$body.children('#progress_bar');
	    	U._storeId=WCParamJS.storeId;
	    	U._langId=WCParamJS.langId;
	    	U._catalogId=WCParamJS.catalogId;
	    	U._eSpotOverlayViewURL=join(U.getStorePath(),'PVHContentAreaESpotView');
	    	U._isMobile=U.$html.hasClass(U.MOBILE);
			U._isDesktop=U.$html.hasClass(U.DESKTOP);
			U._isTablet=/ipad/i.test(navigator.userAgent);
			U._isHomepage=U.$html.hasClass('homepage');
			U._isDepartmentPage=U.$html.hasClass('departmentPage');
			U._isCategoryPage=U.$html.hasClass('categoryPage');
			U._isSearchLandingPage=U.$html.hasClass('searchLandingPage');
			U._isSearchResultsPage=U.$html.hasClass('searchResultsPage');
			U._isNoSearchResultsPage=U.$html.hasClass('noSearchResultsPage');
			U._isSearchPage=(U.isSearchLandingPage() || U.isSearchResultsPage()) && !U.isNoSearchResultsPage();
			U._isProductPage=U.$html.hasClass('productPage');
			U._isBundlePage=U.$html.hasClass('bundlePage');
			U._isShoppingBagPage=U.$html.hasClass('shoppingBagPage');
			U._isShippingAndBillingPage=U.$html.hasClass('orderShippingBillingPage');
			U._isCheckout=U.$html.hasClass('checkoutPage');
			U._isOrderConfirmationPage=U.$html.hasClass('orderConfirmationPage');
			U._isCustomerServicePage=U.$html.hasClass('customerServicePage') || U.$html.hasClass('customer-service');
			U._isMyAccountPage=U.$html.hasClass('myAccountPage');
			U._isRegistrationPage=U.$html.hasClass('registrationPage');
			U._transparentImageURL=join(U.getAkamaiPath(),transparentThumb);
			U._transparentPDPImageURL=join(U.getAkamaiPath(),transparentImage ? transparentImage : transparentThumb);
			U._closeXImage=join(U.getAkamaiPath(),'icons/',closeXImage);
			U._isIELessThan11=U.$html.hasClass('dj_ie');
			U._isIE8=U.$html.hasClass('dj_ie8');
			U._isUSUser=U.$html.hasClass('usUser');
			U._isCanadaUser=U.$html.hasClass('canadaUser');
			U._wcUserCookie='WC_LogonUserId_' + U.getStoreId();
			U._wcOrderIdCookie='WC_CartOrderId_' + U.getStoreId();
			U._wcCartTotalCookie='WC_CartTotal_';
			U._isRegisteredUser=U.getWCUserCookie() ? true : false;
			if(scene7Params) U._defaultScene7Params=U.updateQS(U._defaultScene7Params,false,scene7Params);
			U._isCK=isCK;
			U._isSP=isSP;
			U._isTH=isTH;
			U._isTwoUpDisplayGrid=U.$html.hasClass('twoUpGridDisplay');
	    },
	    
	/* See warnings above */
	    init:function(bundleThumbnailSrcFunc,allowComponentsToControlCloudZoom,autoSuggestExclusionFunction)
	    {
	    	U._addQSFunctions();
	    	U._addPrototypeFunctions();
	    	U._addJQueryFunctions();
	    	U._setupPDP(bundleThumbnailSrcFunc ? bundleThumbnailSrcFunc : U.updateImageSrcForGrid,allowComponentsToControlCloudZoom);
	    	U.setupRecommendations();
	    	U.setupCanadaPreference();
	    	U.setupAutoSuggest(autoSuggestExclusionFunction);
	    	U.setupADA();
	    	if(U.isShoppingBagPage() && U.isFeatureEnabled(U.GWP_OVERLAY)) U.setupGWPOverlay();
	    	
	    	if(typeof dojo!=U.UNDEFINED) //dojo isn't included in some views
	    	{
	    		//If this doesn't run, some script is breaking dojo 1.8 - See PageTemplate
		    	dojo.addOnLoad(function()
		    	{
		    		console.log('PVHUtil: dojo.addOnLoad triggered');
		    	});
	    	}
	    },
	    
	/* See warnings above */
	    finalize:function()
	    {
	    	if(U.supportsRetinaLines()) U.$html.addClass('retinaLines');
	    	else U.$html.addClass('noRetinaLinesSupport');
	    	
	    	if(!U.supportsPositionSticky()) U.$html.addClass('noPositionStickySupport');
	    	if(U.isTablet()) U.$html.addClass(U.TABLET);
	    	
	    	U.$window.on(U.LOAD,function()
	        {
	        	U.$html.addClass(U.LOADED);
	        });
	    	
	    	U.setupDropKick();
	    },
	    
	/* Last function called */
	    complete:function(useAccordion,filtersMaxColumnWidth)
	    {
	    	if($.fn.filters) U.$body.find('.productResultsView').filters(filtersMaxColumnWidth);
			if($.fn.collapsableNav) U.$body.find('.collapsableNav').collapsableNav(useAccordion);
			
	    	U.$html.addClass(U.READY);
            U.$window.resize().scroll();
	    },
	    
    /* IS FUNCTIONS */
	    
	    //NaN, false, empty strings, the string 'undefined', and empty jQuery objects are considered null
	    //Zero, empty objects/arrays*, and the string 'false' are NOT considered null
	    //*Empty arrays returned from dojo.query ARE considered null, so it follows jQuery
		isNull:function(val)
		{
	    	return !U.isNotNull(val);
		},
		
		isNotNull:function(val)
		{
			var retVal;
			if(val && val instanceof jQuery) retVal=val.length>0;																//jQuery object
			else if(typeof HTMLElement!=U.UNDEFINED && val instanceof HTMLElement) retVal=true;									//HTML element
			else if(typeof HTMLElement==U.UNDEFINED && val && typeof val.nodeType!=U.UNDEFINED && val.nodeType==3) retVal=true;	//IE8 HTML element
			else if(typeof val==U.NUMBER) retVal=!isNaN(val);																	//0-9 or NaN
			else if(val && val instanceof Array) retVal=typeof val._NodeListCtor==U.FUNCTION ? val.length>0 : true;				//Array or dojo collection
			else if(val && typeof val.isNodeList!=U.UNDEFINED && val.isNodeList()) retVal=val.length>0;							//HTMLCollection or NodeList
			else retVal=!(val==U.EMPTY || val==null || val==U.UNDEFINED);														//null, false, '', or 'undefined'
			return retVal;
		},
		
		is:function($elem,pseudoSelector)
		{
			var retVal=false;
			$elem.each(function()
			{
				retVal=$(this).is(pseudoSelector);
				if(retVal) return false; 
			});
			return retVal;
		},
		
		isVisible:function($elem)
		{
			return U.is($elem,':visible');
		},
		
		isMouseOver:function($elem)
		{
			return U.is($elem,':hover');
		},
		
		//Must set tabindex="0" for the element to be focusable, then this will work. It also returns true if the element has been tabbed to.
		isPressed:function($elem)
		{
			return U.is($elem,':active');
		},
		
		isDisabled:function($elem)
		{
			return U.is($elem,'[disabled]');
		},
		
		isTabbable:function($elem)
		{
			return U.is($elem,U.TABBABLE);
		},
		
		isFocusable:function($elem)
		{
			return U.is($elem,U.FOCUSABLE);
		},
		
		isAncestorOf:function($target,$ancestor)
		{
			return $target.closest($ancestor).length>0;
		},
		
		isFeatureEnabled:function(feature)
		{
			return storeFeatures[feature];
		},
		
		isValidZipForCountry:function(zip,country)
		{
			if(country == 'US') return U._US_ZIP_REGEX.test(zip);
			return true;
		},
		
		isHomepage:function()
		{
			return U._isHomepage;
		},
		
		isDepartmentPage:function()
		{
			return U._isDepartmentPage;
		},
		
		isCategoryPage:function()
		{
			return U._isCategoryPage;
		},
		
		isSearchPage:function()
		{
			return U._isSearchPage;
		},
		
		isSearchLandingPage:function()
		{
			return U._isSearchLandingPage;
		},

		isSearchResultsPage:function()
		{
			return U._isSearchResultsPage;
		},
		
		isNoSearchResultsPage:function()
		{
			return U._isNoSearchResultsPage;
		},
		
		isProductPage:function()
		{
			return U._isProductPage;
		},
		
		isBundlePage:function()
		{
			return U._isBundlePage;
		},
		
		isShoppingBagPage:function()
		{
			return U._isShoppingBagPage;
		},
		
		isShippingAndBillingPage:function()
		{
			return U._isShippingAndBillingPage;
		},
		
		isCheckout:function()
		{
			return U._isCheckout;
		},
		
		isOrderConfirmationPage:function()
		{
			return U._isOrderConfirmationPage;
		},
		
		isRegisteredUser:function()
		{
			return U._isRegisteredUser;
		},
		
		isMobile:function()
		{
			return U._isMobile;
		},
		
		isDesktop:function()
		{
			return U._isDesktop;
		},
		
		isTouch:function()
		{
			return U.isMobile() || U.isTablet();
		},
		
		isTablet:function()
		{
			return U._isTablet;
		},
		
		isIELessThan11:function()
		{
			return U._isIELessThan11;
		},
		
		isIE8:function()
		{
			return U._isIE8;
		},
		
		isPortrait:function($elem)
		{
			return $elem.hasClass(U.PORTRAIT);
		},
		
		isLandscape:function($elem)
		{
			return $elem.hasClass(U.LANDSCAPE);
		},
		
		isLandscapeURL:function(url)
		{
			return false;
		},
		
		isUSUser:function()
		{
			return U._isUSUser;
		},
		
		isCanadaUser:function()
		{
			return U._isCanadaUser;
		},
		
		isCustomerServicePage:function()
		{
			return U._isCustomerServicePage;
		},
		
		isMyAccountPage:function()
		{
			return U._isMyAccountPage;
		},
		
		isRegistrationPage:function()
		{
			return U._isRegistrationPage;
		},
		
		isTwoUpDisplayGrid:function()
		{
			return U._isTwoUpDisplayGrid;
		},
		
	/* IS STORE FUNCTIONS - NOTE: Before using these, consider adding a feature to storeFeatures and using U.isFeatureEnabled(U.FEATURE_NAME_CONST) */
		
		isCK:function()
		{
			return U._isCK;
		},
		
		isSP:function()
		{
			return U._isSP;
		},
		
		isTH:function()
		{
			return U._isTH;
		},
		
	/* HAS FUNCTIONS */
		hasFocus:function($elem)
		{
			return U.is($elem,':focus');
		},
		
	/* GET FUNCTIONS */
		
		getStorePath:function()
		{
			return getAbsoluteURL();
		},
		
	    getStoreId:function()
	    {
	    	return U._storeId;
	    },
	    
	    getLangId:function()
	    {
	    	return U._langId;
	    },
	    
	    getCatalogId:function()
	    {
	    	return U._catalogId;
	    },
	    
	    getCookie:function(name)
		{
			return $.cookie(name);
		},
		
		getWCUserCookie:function()
		{
			return $.cookie(U._wcUserCookie);
		},
		
		getWCOrderIdCookie:function()
		{
			return $.cookie(U._wcOrderIdCookie);
		},
		
		getWCCartTotalCookie:function(orderId)
		{
			return $.cookie(U._wcCartTotalCookie + orderId);
		},
		
		getESpot:function(emsName,$targetOrCallback)
		{
			var failure=function(jqXHR,textStatus,errorThrown)
			{
				console.log('U.getESpot: Failed to load',emsName,jqXHR);
			}
			
			if($targetOrCallback instanceof Function) return U.get(U._eSpotOverlayViewURL,{emsName:emsName},$targetOrCallback,failure);
			else if($targetOrCallback instanceof jQuery) return U.get(U._eSpotOverlayViewURL,{emsName:emsName},function(data)
			{
				$targetOrCallback.append(data);
			},failure);
		},
		
		getAutoHeight:function($elem)
		{
			var initDisplay=$elem.css(U.DISPLAY);
			if(initDisplay==U.NONE) $elem.css(U.DISPLAY,U.BLOCK);
			
			var styleHeight=$elem.length ? $elem.inlineStyle(U.HEIGHT) : null;
			var autoHeight=$elem.height(U.AUTO).height();
			$elem.height(U.EMPTY);
			if(styleHeight) $elem.height(styleHeight);
			if(initDisplay==U.NONE) $elem.css(U.DISPLAY,U.NONE);
			
			return autoHeight;
		},
		
		getAkamaiPath:function()
		{
			return akamaiPath;
		},
		
		getScene7Path:function()
		{
			return scene7Path;
		},
		
		getTransparentImageURL:function(isLandscape)
		{
			return U._transparentImageURL;
		},
		
		getTransparentPDPImageURL:function(isLandscape)
		{
			return U._transparentPDPImageURL;
		},
		
		getCloseXImageURL:function()
		{
			return U._closeXImage;
		},
		
	/* AJAX FUNCTIONS */
	    
		get:function(url,additionalQSVars,success,failure,always,excludeStoreVars)
		{
			return U.ajax(url,additionalQSVars,success,failure,always,false,excludeStoreVars);
		},
		
		post:function(url,additionalQSVars,success,failure,always,excludeStoreVars)
		{
			return U.ajax(url,additionalQSVars,success,failure,always,true,excludeStoreVars);
		},
		
		//Adds the required store QS vars automatically - These are always part of the URL
		//Also automatically checks that the response is not an error
		ajax:function(url,additionalQSVars,success,failure,always,usePost,excludeStoreVars)
		{
			var fullURL=U.updateQS(url,excludeStoreVars ? false : true,usePost ? null : additionalQSVars);
			var errorCheck=function(data,textStatus,jqXHR)
			{
				if(data) U._checkAjaxResponseForError(data,success,jqXHR);
			};
			
			var $xhrReq=usePost ? $.post(fullURL,additionalQSVars,errorCheck) : $.get(fullURL,errorCheck);
			if(failure instanceof Function) $xhrReq.fail(failure);
			if(always instanceof Function) $xhrReq.always(always);
			return $xhrReq;
		},
		
	/* HELPER FUNCTIONS */
		
		setupDropKick:function($parent)
		{
			if($.fn.dropkick)
			{
				var settings={};
				if($parent) $parent.find(U.DROP_KICK_SELECT).dropkick(settings);
				else $(U.DROP_KICK_SELECT).dropkick(settings);
			}
		},
		
		redirect:function(url)
		{
			if(U.isNotNull(url)) document.location.href=url;
		},
		
		addVideoThumbListeners:function()
	    {
	    	var $productMainImage=$('.product_main_image');
	    	var $productMainVideo=$('.product_main_video');
	    	
	    	if($productMainVideo.length)
	    	{
	    		var $zoomMessage=$('#product .zoom-message');
	    		$('#product_visual_thumbnails, .swatchWrapper').off(U.CLICK,'.cloudzoom-gallery').on(U.CLICK,'.cloudzoom-gallery',function(event)
		    	{
		    		event.stopImmediatePropagation();
		    		
		    		$('#videoAlt a').removeClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
		    		U.fadeIn($productMainImage.add($zoomMessage));
					U.fadeOut($productMainVideo);
					$productMainVideo.trigger(U.HIDE);
		    		return false;
		    	});
		    	
	    		$('#product_visual_thumbnails').off(U.CLICK,'#videoAlt a').on(U.CLICK,'#videoAlt a',function()
				{
	    			var $this=$(this);
	    			$this.parent().siblings('.prodThumbnails').children(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).removeClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
	    			$this.addClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
	    			
	    			U.fadeOut($productMainImage.add($zoomMessage));
					U.fadeIn($productMainVideo);
					$productMainVideo.trigger(U.SHOW);
				});
	    		
	    		return $productMainVideo;
	    	}
	    },
	    
	    addSwipeListeners:function($productMainVideo)
	    {
			var $cloudZoom=$('#zoom1');
	    	if(U.isNotNull($cloudZoom) && !$cloudZoom.data('hammer'))
	    	{
	    		var $productMainImage=$('.product_main_image');
	    		var $productVisualThumbnails=$('#product_visual_thumbnails, #bundle_visual_thumbnails');
	        	var moveNext=function(event)
	    		{
	        		if($productVisualThumbnails.children('.prodThumbnails').length>1)
	        		{
	        			$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).parent().next().children(U.A).click();
		        		
		        		$productMainImage.removeClass(U.FIRST);
	        			var isLastAlt=$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).parent(':last-child').length;
	        			if(isLastAlt) $productMainImage.addClass(U.LAST);
	        		}
	    		};
	        	
	        	var movePrevious=function(event)
	    		{
	        		if($productVisualThumbnails.children('.prodThumbnails').length>1)
	        		{
	        			$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).parent().prev().children(U.A).click();
		    			
		    			$productMainImage.removeClass(U.LAST);
	        			var isFirstAlt=$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).parent(':first-child').length;
	        			if(isFirstAlt) $productMainImage.addClass(U.FIRST);
	        		}
	    		};
	    		
	    		var velocity=.001;
	        	$cloudZoom.hammer({velocity:velocity}).unbind('swipeleft swiperight').bind('swipeleft',moveNext).bind('swiperight',movePrevious);
	        	if(U.isNotNull($productMainVideo)) $productMainVideo.hammer({velocity:velocity}).unbind('swiperight').bind('swiperight',movePrevious);
	        	
	        	var $productArrow=$productMainImage.find('.productArrow');
	        	if($productArrow.length)
	        	{
	        		$productArrow.filter('.next').unbind(U.CLICK).click(moveNext);
	        		$productArrow.filter('.previous').unbind(U.CLICK).click(movePrevious);
	        	}
	    	}
	    },
	    
	    forceRedraw:function($elem)
		{
			var style=$elem.attr(U.STYLE);
			if(U.isNotNull(style) && style.match(/display/i)) var initDisplay=$elem.css(U.DISPLAY);
			var scrollTop=U.$window.scrollTop();
			$elem.css(U.DISPLAY,U.NONE);
			$elem.get(0).offsetHeight;
			$elem.css(U.DISPLAY,initDisplay || U.EMPTY);
			if(scrollTop>0 && U.$window.scrollTop()!=scrollTop) U.$window.scrollTop(scrollTop);
		},
		
		enableScrolling:function()
	    {
	    	U._disabledScrollLevel--;
	    	if(U._disabledScrollLevel==0)
	    	{
	    		U.$body.css({overflow:U.EMPTY});
				U.$page.css({top:U.EMPTY});
				U.forceRedraw(U.$body);
	        	U.$window.scrollTop(U._currentScrollTop);
	    	}
	    },
		
	    disableScrolling:function()
	    {
	    	U._disabledScrollLevel++;
	    	if(U._disabledScrollLevel==1)
	    	{
	    		U._currentScrollTop=U.$window.scrollTop();
	    		U.$body.css({overflow:U.HIDDEN});
				U.$page.css({top:-U._currentScrollTop});
	    	}
	    },
	    
		callWhenAvailable:function(testFunc,performFunc)
		{
			if(testFunc())
			{
				performFunc();
				return true;
			} else
			{
				var interval=setInterval(function()
				{
					if(testFunc())
					{
						clearInterval(interval);
						performFunc();
					}
				},50);
				
				return interval;
			}
		},
		
		callAfterDelay:function(func,delay)
		{
			if(isNaN(delay)) delay=50;
			if(func instanceof Function) return setTimeout(func,delay);
		},
		
		callAfterCallStack:function(func)
		{
			return U.callAfterDelay(func,0);
		},
		
		//Call the returned function to remove the next click listener (assuming it hasn't happened yet)
		callAfterNextClick:function(func,$excludeTarget)
		{
			var $target=U.$page.length ? U.$page.add(U.FOOTER) : U.$body;
			var click=function(event)
			{
				if(U.isNull($excludeTarget) || !U.isAncestorOf($(event.target),$excludeTarget))
				{
					remove(); //Makes sure only one click occurs between #page and footer
					func();
					
					return true;
				} return false;
			}
			
			var remove=function()
			{
				$target.off(U.CLICK,click);
			};
			
			U.callAfterCallStack(function()
			{
				$target.on(U.CLICK,function(event)
				{
					var didClick=click(event);
					if(didClick) remove();
				});
			});
			
			return remove;
		},
		
		dropProtocol:function(url)
		{
			return url ? url.replace(/^https?:/i,U.EMPTY) : null;
		},
		
		setProtocol:function(url,secure)
		{
			if(url)
			{
				var protocol=secure ? U.HTTPS : U.HTTP;
				return url.replace(/(^https?:\/\/|^\/\/)/i,protocol+U.COLON+U.FORWARD_SLASH+U.FORWARD_SLASH);
			}
		},
		
		decodeHTML:function(html)
		{
			return html ? html.replace(/&amp;/g,U.AMP).replace(/&lt;/g,U.LESS_THAN).replace(/&gt;/g,U.GREATER_THAN).replace(/&#034;/g,U.DOUBLE_QUOTE).replace(/&#039;/g,U.SINGLE_QUOTE) : null;
		},
		
		closeDropKick:function()
		{
			$('.dk_open').blur();
		},
		
		blurFocus:function()
		{
			$('input:focus, select:focus').blur();
		},
		
		closeOpenElements:function()
		{
			U.closeDropKick();
			U.blurFocus();
		},
		
		supportsRetinaDisplay:function()
		{
			return window.matchMedia && window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches;
		},
		
		supportsRetinaLines:function()
		{
			if(U._supportsRetinaLines!=null) return U._supportsRetinaLines;
			else
			{
				if(U.supportsRetinaDisplay())
				{
					var $testElem=$('<div style="border: .5px solid transparent" />');
					U.$body.append($testElem);
					U._supportsRetinaLines=$testElem.get(0).offsetHeight==1;
					$testElem.remove();
					return U._supportsRetinaLines;
				}
			}
		},
		
		supportsPositionSticky:function()
		{
			if(U._supportsPositionSticky!=null) return U._supportsPositionSticky;
			else
			{
				var $testElem=$('<div style="position: -webkit-sticky; position: sticky; " />');
				U.$body.append($testElem);
				var position=$testElem.css(U.POSITION);
				U._supportsPositionSticky=position=='-webkit-sticky' || position==U.STICKY;
				$testElem.remove();
				return U._supportsPositionSticky;
			}
		},
		
		submitSearchForm:function($searchInput,$CatalogSearchForm)
		{
			var placeholderText=$searchInput.attr(U.PLACEHOLDER);
			var val=$.trim($searchInput.val());
			if(U.isNotNull(val) && (U.isNull(placeholderText) || val!=placeholderText))
			{
				$CatalogSearchForm.submit();
				return true;
			} else
			{
				$searchInput.focus();
				return false;
			}
		},
		
		setupPlaceholderText:function()
		{
			if($.fn.placeholderText) $('[placeholder]:not([type=password])').placeholderText();
		},
		
		setupGrid:function($parent)
		{
			$parent.productGrid();
		},
		
		setupAutoSuggest:function(autoSuggestExclusionFunction)
		{
			if($.fn.autoSuggest && !U.isCheckout() && !U.isCanadaUser())
			{
				var $searchFormParent=$('div#searchBar');
				$searchFormParent.each(function()
				{
					var $this=$(this);
					var $autoSuggest=$this.find('.autoSuggestBox');
					$autoSuggest.autoSuggest($this,autoSuggestExclusionFunction);
				});
			}
		},
		
		setupADA:function()
		{
			$('#skip-navigation').click(function()
			{
				$('main :tabbable').first().focus();
			});
			
			var mouseDown=function()
			{
				document.removeEventListener(U.MOUSE_DOWN,mouseDown);
				U.$html.removeClass(U.TABBING);
			};
			
			U.$doc.on(U.KEY_PRESS,function(event)
			{
				if(event.key==U.KEY.TAB && !U.$html.hasClass(U.TABBING))
				{
					U.$html.addClass(U.TABBING);
					document.addEventListener(U.MOUSE_DOWN,mouseDown); //Listen for a browser event to avoid manual jquery triggered events
				}
			});
		},
		
		setupGWPOverlay:function()
		{
			$('.checkoutButtonContainer:not(.setup), .cartAdditionalPayments:not(.setup)').each(function()
			{
				var hasDeclined=false;
				var $buttonContainer=$(this);
				
				$buttonContainer.addClass('setup')
				.get(0).addEventListener(U.CLICK,function(event) //Uses capture, since the buttons use onclick
				{
					var $target=$(event.target);
					if($target.is(U.IMG)) $target=$target.parent();
					
					var $gwpProductWrapper=$('#order_details.freeGiftProductWrapper');
					if($gwpProductWrapper.length && !hasDeclined && $buttonContainer.find('.checkoutBttn, .payPalButton, a#srd_XC').is($target) && $gwpProductWrapper.find('.freeGiftProduct input[type=radio]:checked').length==0)
					{
						$gwpProductWrapper.find('.gwpSelectError').addClass(U.HIDDEN);
						
						O.open({$content:$gwpProductWrapper,hideNonDestroyedContent:false,id:'gwpOverlay'},false,function()
						{
							$gwpProductWrapper.find('input[type=radio]').change(function()
							{
								$gwpProductWrapper.find('.gwpSelectSuccess').removeClass(U.HIDDEN);
								$gwpProductWrapper.find('.gwpSelectError, .gwpSelectMessage, .gwpDecline, .productRow').addClass(U.HIDDEN);
								$gwpProductWrapper.find('.gwpButtons').css({borderTop:U.NONE});
							});
						});
						
						$gwpProductWrapper.find('.gwpDecline').off(U.CLICK).click(function()
						{
							hasDeclined=true;
							
							//Check if the $target button was removed from the DOM
							if(!$target.parent().length) $target=U.$body.find(U.toId($target.attr(U.ID)));
							
							$target.get(0).click();
							O.close();
						});
						
						$gwpProductWrapper.find('.gwpContinue').off(U.CLICK).click(function()
						{
							if($('.freeGiftProduct input[type=radio]:checked').length)
							{
								//Check if the $target button was removed from the DOM
								if(!$target.parent().length) $target=U.$body.find(U.toId($target.attr(U.ID)));
								
								$target.get(0).click();
								O.close();
							} else $gwpProductWrapper.find('.gwpSelectError').removeClass(U.HIDDEN);
						});
						
						event.stopImmediatePropagation();
					}
				},true);
			});
		},
		
		createSessionCookie:function(name, value)
		{
			$.cookie(name, value, { path: U.FORWARD_SLASH });
		},
		
		removeCookie:function(name) 
		{
			$.cookie(name, null, { path: U.FORWARD_SLASH });
		},
		
		loadSizeGuide:function(emsName,$target,onComplete)
	    {
	    	var tween=U.fadeOut($target);
	    	U.getESpot(emsName,function(data)
	    	{
	    		if(tween.totalProgress()==1)
	    		{
	    			$target.html(data);
	    			U.fadeIn($target);
	    			if(onComplete) onComplete();
	    		} else
	    		{
	    			tween.eventCallback('onComplete',function()
	    			{
	    				$target.html(data);
	    				U.fadeIn($target);
	    				if(onComplete) onComplete();
	    			});
	    		}
	    	})
	    },
	    
	    displayUserData:function()
	    {
	    	var userCookie = U.getWCUserCookie();
			if(userCookie != null){
				$('.registeredUser').removeClass(U.HIDDEN);
				$('.guestUser').addClass(U.HIDDEN);
				var user_object = JSON.parse(userCookie);
				$('.header_firstName').text(user_object.firstName);
			}else{
				$('.guestUser').removeClass(U.HIDDEN);
				$('.registeredUser').addClass(U.HIDDEN);
			}
		},
		
		setupCountriesDropDown:function()
		{
			var $sharedAddressForm=$('.sharedAddressForm');
			$sharedAddressForm.addClass('billingAddress');
			
			var $country=$('.billingAddress .countrySelect:visible');
			if($country.length && $country.children('option').length>3)
			{
				var $cityAndZip=$('.billingAddress .cityInput, .billingAddress .zipInput');
			} else
			{
				$sharedAddressForm.removeClass('billingAddress');
				$country.unbind('change.pvh');
			}
		},
		
		clearCountriesDropDown:function()
		{
			$('.sharedAddressForm').removeClass('billingAddress');
			$('.countrySelect').unbind('change.pvh');
		},
		
		keydownEvent:function(event)
    	{
			if(event.keyCode == U.KEYCODE.ENTER || event.keyCode == U.KEYCODE.SPACE){
				event.preventDefault();
				this.click();
			}
    	},
    	
		setupProductArrows:function($prodThumbnails)
	    {
	    	var numAlts=$prodThumbnails.length;
			var $productMainImage=$('.product_main_image');
			$productMainImage.addClass('altsLoaded');
			
			if(numAlts>1)
			{
				$productMainImage.addClass(U.FIRST);
				
				$prodThumbnails.not(':first-child, :last-child').click(function()
				{
					$productMainImage.removeClass(join(U.FIRST,U.SPACE,U.LAST));
				});
				
				$prodThumbnails.first().click(function()
				{
					$productMainImage.removeClass(U.LAST).addClass(U.FIRST);
				});
				
				$prodThumbnails.last().click(function()
				{
					$productMainImage.removeClass(U.FIRST).addClass(U.LAST);
				});
			} else $productMainImage.addClass(join(U.FIRST,U.SPACE,U.LAST))
	    },
	    
	    resetProductArrows:function()
	    {
	    	var $productMainImage=$('.product_main_image');
			$productMainImage.removeClass(join(U.FIRST,U.SPACE,U.LAST,U.SPACE,'altsLoaded'));
	    },
	    
		addUnderscoreEncoding:function(str)
		{
			return str.replace(/"/g,'_inches_').replace(/'/g,"_feet_").replace(/\./g,'_dot_').replace(/ /g,'_space_').replace(/\//g,'_fslash_');
		},
		
		removeUnderscoreEncoding:function(str)
		{
			return str.replace(/_inches_/g,U.DOUBLE_QUOTE).replace(/_feet_/g,U.SINGLE_QUOTE).replace(/_dot_/g,U.PERIOD).replace(/_space_/g,U.SPACE).replace(/_fslash_/g,U.FORWARD_SLASH);
		},
		
		setupCanadaPreference:function()
		{
			if(typeof canadaPage != U.UNDEFINED && canadaPage) 
			{
				 var paramForceCanada = U.getQSVar(U._FORCE_CANADA);
				 
				 if(paramForceCanada == U.TRUE)
				 {
					 U.createSessionCookie(U._FORCE_CANADA, U.TRUE);
				 } else if (paramForceCanada == U.FALSE){

					 U.removeCookie(U._FORCE_CANADA);
					 document.location.replace(U.updateQS(document.location.href,false,{'forceCanada': U.EMPTY}).replace(new RegExp('[&?]'+ U._FORCE_CANADA + U.EQUALS), U.EMPTY));
				 } 
			}
		},
		
	    updateLanguage:function(newLangId)
	    {
	    	var currentUrl = window.location.href;
	        //var currentLangId = new RegExp('[\?&]' + 'langId' + '=([^&#]*)').exec(currentUrl);

	    	var newUrl = '';
	    	if(currentUrl.indexOf('langId') > -1 ) 
	    	{
	    		newUrl = currentUrl.replace(/langId(=|%3D)-(\d)/g,'langId$1'+newLangId);
	    		
	    	}
	    	else {
	    		if(currentUrl.indexOf('?') > -1)
	    			newUrl = currentUrl + '&langId=' + newLangId;
	    		else 
	    			newUrl = currentUrl + '?langId=' + newLangId;
	    	}
	    	
	    	//inject a new param before hash to make sure myaccount doesnt refresh twice
	    	var hash = U.getHash(newUrl);
	    	newUrl = U.updateQS(U.dropHash(newUrl), null, {refreshMyAccount:true}) + hash;
	    	
	        
	        $.cookie(U._PREFLANGCOOKIENAME, newLangId,{ path: U.FORWARD_SLASH, expires: Math.round(365.25 * 10)});
	        
	        var action = 'updatePrefLang';
	        
	        if(U.isRegisteredUser()){
	        	
	        	
	        	U.get('AjaxRESTHelper',{action:action,newLangId:newLangId},function(data)
				{
					MessageHelper.hideAndClearMessage();
					
			   		var idx = data.indexOf('/*');
					var idxLast = data.indexOf('*/');
					var textFromParasedJSON = $.trim( data.substring( idx + 2, idxLast ) );
			        var responseInJSON = $.parseJSON(textFromParasedJSON);
					
					var status = responseInJSON ? responseInJSON.status : false;
					
					console.debug('Updated preferred language to profile :: '+status);
					window.location.href = newUrl;
				
				}, null, cursor_clear);
	        	
	        } else {
	        	window.location.href = newUrl;	
	        }
	        
	    },
		
		setupDescription:function(keepOpen) {},
		setupRecommendations:function() {},
		updateSwatchContainerWidth:function() {},
		addSizeSelectorError:function($parent) {},
		removeSizeSelectorError:function() {},
		
	/* FILTER FUNCTIONS */
    	
    	filterBy:function(filter,facetLabelOrLabels,scrollToSelector)
    	{
    		var $filtersWrapper=$('.filtersWrapper');
    		var $filter=$filtersWrapper.find('.navFilter'+U.toId(filter));
    		var facetLabelAttrName='data-facet-label';
    		if(facetLabelOrLabels instanceof Array)
    		{
    			var length=facetLabelOrLabels.length;
    			var facetLabels=U.EMPTY;
    			for(var i=0;i<length;i++)
    			{
    				var facetLabel=facetLabelOrLabels[i];
    				facetLabels+=U.toAttribute(facetLabelAttrName,facetLabel);
    				if(i+1!=length) facetLabels+=U.COMMA;
    			}
    			var $facet=$filter.find(facetLabels);
    		} else var $facet=$filter.find(U.toAttribute(facetLabelAttrName,facetLabelOrLabels));
    		
    		if($filter.length && $facet.length)
    		{
    			$filtersWrapper.find('.selected').removeClass('selected');
    			$filtersWrapper.find('.disabled').removeClass('disabled');
    			$facet.click();
    			if(scrollToSelector) U.scrollTo($(scrollToSelector).offset().top+1);
    		} else console.error('Cannot find '+filter+' filter or facet(s) '+facetLabelOrLabels);
    	},
    	
    	filterByStyle:function(facetLabel,scrollToSelector)
    	{
    		U.filterBy(U.STYLE,facetLabel,scrollToSelector);
    	},
    	
	/* IMAGE FUNCTIONS */
    	
    	//quality - This can greatly increase file size without much difference, so avoid using 100
    	_getScene7Querystring:function(width,height)
    	{
    		var scene7QS=join('?wid=0&hei=0'+U._defaultScene7Params);
    		return U.updateImageSrc(scene7QS,width,height);
    	},
    	
    	_getScene7SwatchQuerystring:function()
    	{
    		return U._getScene7Querystring(U.SWATCH_WIDTH,U.SWATCH_HEIGHT);
    	},

	    _getScene7PDPSwatchQuerystring:function()
    	{
    		return U._getScene7Querystring(U.PDP_SWATCH_WIDTH,U.PDP_SWATCH_HEIGHT);
    	},
    	
    	_getScene7AltQuerystring:function()
    	{
    		return U._getScene7Querystring(U.ALT_WIDTH,U.ALT_HEIGHT);
    	},
	    
    	_getScene7ZoomQuerystring:function()
    	{
    		return U._getScene7Querystring(U.ZOOM_WIDTH,U.ZOOM_HEIGHT);
    	},
    	
    	_getScene7PDPQuerystring:function()
    	{
    		return U._getScene7Querystring(U.PDP_WIDTH,U.PDP_HEIGHT);
    	},
    	
    	_getScene7GridQuerystring:function()
    	{
    		return U._getScene7Querystring(U.GRID_WIDTH,U.GRID_HEIGHT);
    	},
    	
		updateCloudZoomData:function($elem,imageURL,zoomImageURL)
		{
			var zoomImageData=$elem.attr('data-cloudzoom');
			if(U.isNotNull(zoomImageData))
			{
				if(U.isNotNull(imageURL))
				{
					if(zoomImageData.match(/image/)) zoomImageData=zoomImageData.replace(/(^.*image\s*:\s*('|"))(.*?)(\2.*$)/,join('$1',imageURL,'$4'));
					else zoomImageData=join(zoomImageData,", image:'",imageURL,U.SINGLE_QUOTE);
				}
				
				if(U.isNotNull(zoomImageURL))
				{
					if(zoomImageData.match(/zoomImage/)) zoomImageData=zoomImageData.replace(/(^.*zoomImage\s*:\s*('|"))(.*?)(\2.*$)/,join('$1',zoomImageURL,'$4'));
					else zoomImageData=join(zoomImageData,", zoomImage:'",zoomImageURL,U.SINGLE_QUOTE);
				}
				
				$elem.attr('data-cloudzoom',zoomImageData);
			}
		},
		
		addCloudZoomNoImage:function($zoom,transparentImageURL)
		{
			var src=$zoom.attr(U.SRC);
    		if(src!=transparentImageURL) $zoom.attr(U.SRC,transparentImageURL);
    		$zoom.parent().addClass(U.NO_IMAGE);
		},
		
		clearCloudZoomNoImage:function()
		{
			U.$zoom.parent().removeClass(U.NO_IMAGE);
		},
		
		_updateCloudZoomURLs:function($zoom,$product)
		{
			var PRODUCT_IMAGE_SRC='product-image-src';
			var $productswatches=$product.find('.swatchWrapper .productswatches');
			
			var src=U.isBundlePage() ? null : $productswatches.first().children(U.toClass(U.ACTIVE)).data(PRODUCT_IMAGE_SRC);
			if(U.isNull(src)) src=$zoom.attr(U.DATA_SRC);
			
			if(U.isNotNull(src))
			{
				$zoom.attr(U.DATA_SRC,U.updateImageSrcForPDP(src,$product.data(U.PART_NUMBER),U.isLandscape($product)));
		    	U.updateCloudZoomData($zoom,null,U.updateImageSrcForZoom(src,$product.data(U.PART_NUMBER),U.isLandscape($product)));
			}
			
			$productswatches.each(function()
	    	{
	    		var $productswatches=$(this);
	        	$productswatches.find('.cloudzoom-gallery').each(function()
	        	{
	        		var $this=$(this);
		    		var src=$this.parent().data(PRODUCT_IMAGE_SRC);
		    		U.updateCloudZoomData($this,U.updateImageSrcForPDP(src,$product.data(U.PART_NUMBER),U.isLandscape($product)),U.updateImageSrcForZoom(src,$product.data(U.PART_NUMBER),U.isLandscape($product)));
	        	});
	    	});
		},
		
		loadImages:function($img,dataVar,querystringFunc,removeOnError,parentSelectorToRemove,isLandscape,onComplete)
	    {
			if($img.length)
			{
				if(U.isNull(dataVar)) dataVar=U.SRC;
				
				var transparentImageURL=U.getTransparentImageURL(isLandscape);
				var numImages=$img.length;
				var numImagesLoaded=0;
				
				var complete=function($img,success)
				{
					$img.off(U.toEvent(U.LOAD,U.ERROR));
					$img.attr(U.DATA_IS_LOADED,success)
					numImagesLoaded++;
					if(numImagesLoaded==numImages && onComplete instanceof Function) onComplete();
				}
				
				var error=function($img)
				{
					if(!$img.attr(U.SRC)!=transparentImageURL)
					{
						if(removeOnError)
						{
							if(parentSelectorToRemove) $img.parents(parentSelectorToRemove).remove();
							else $img.remove();
						} else $img.attr(U.SRC,transparentImageURL).parent().addClass(U.NO_IMAGE);
					}
					
					complete($img,false);
				}
				
				var reset=function($img)
				{
					$img.removeAttr(U.DATA_IS_LOADED);
					$img.parent().removeClass(U.NO_IMAGE);
				}
				
		    	$img.on(U.LOAD,function()
				{
		    		var $this=$(this);
					if($this.attr(U.SRC)!=transparentImageURL) $this.parent().removeClass(U.NO_IMAGE);
					complete($this,true);
				}).on(U.ERROR,function()
				{
					error($(this));
				}).each(function()
				{
					var $this=$(this);
					var dataSrc=$this.data(dataVar);
					var src=dataSrc;
					var errorThrown;
					
					reset($this);
					
					if(querystringFunc instanceof Function)
					{
						try
						{
							src=querystringFunc(dataSrc,null,isLandscape);
							if(U.isNull(src)) console.log('U.loadImages error: querystringFunc returned a null value.');
						} catch(e)
						{
							errorThrown=true;
							error($this);
						}
					}
					
					if(U.isNotNull(src)) $this.attr(U.SRC,U.dropProtocol(src));
					else if(!errorThrown) error($this);
				});
			}
	    },
	    
	    loadCheckoutImages:function()
	    {
	    	$('.productRow .image > img').each(function()
			{
				var $this=$(this);
				var dataSrc=$this.data(U.SRC);
				var $productRow=$this.parents('.productRow');
				var isLandscape=U.isLandscapeURL(dataSrc);
				U.loadImages($this,null,function(src)
				{
					return U.updateImageSrcForGrid(src,$productRow.data(U.PART_NUMBER),isLandscape);
				},null,null,isLandscape);
			});
	    },
	    
	    _updateImageSrcFor:function(func,src,partNumber)
	    {
	    	var querystring=func();
	    	var qsObj=U.dropQS(src);
	    	var cropN=qsObj.vars[U.CROP_N];
	    	var sharpen=qsObj.vars[U.OP_SHARPEN];
	    	if(cropN) querystring=U.updateQS(querystring,false,{cropN:decodeURIComponent(cropN)});
	    	if(sharpen && U.isFeatureEnabled(U.SHARPEN_IMAGES)) querystring=U.updateQS(querystring,false,{op_sharpen:decodeURIComponent(sharpen)});
	    	
			return U.updateStyleIndentifer(qsObj.url,partNumber)+querystring;
	    },
	    
		updateImageSrcForGrid:function(src,partNumber,isLandscape)
		{
			return U._updateImageSrcFor(U._getScene7GridQuerystring,src,partNumber);
		},
		
		updateImageSrcForPDP:function(src,partNumber,isLandscape)
		{
			return U._updateImageSrcFor(U._getScene7PDPQuerystring,src,partNumber);
		},
		
		updateImageSrcForSwatch:function(src,partNumber)
		{
			return U._updateImageSrcFor(U._getScene7SwatchQuerystring,src,partNumber);
		},
		
		updateImageSrcForPDPSwatch:function(src,partNumber)
		{
			return U._updateImageSrcFor(U._getScene7PDPSwatchQuerystring,src,partNumber);
		},
		
		updateImageSrcForAlt:function(src,partNumber,isLandscape)
		{
			return U._updateImageSrcFor(U._getScene7AltQuerystring,src,partNumber);
		},
		
		updateImageSrcForZoom:function(src,partNumber,isLandscape)
		{
			return U._updateImageSrcFor(U._getScene7ZoomQuerystring,src,partNumber);
		},
		
		updateImageSrc:function(src,wid,hei)
		{
			if(src==null) return null;
			else
			{
				if(src.match(/wid=/)) src=src.replace(/wid=\d+(&?)/,wid ? join('wid=',wid,'$1') : U.EMPTY);
				else src=U.updateQS(src,false,{wid:wid});
				
				if(src.match(/hei=/)) src=src.replace(/hei=\d+(&?)/,hei ? join('hei=',hei,'$1') : U.EMPTY);
				else src=U.updateQS(src,false,{hei:hei});
				return src;
			}
		},
		
		getCloudZoomURL:function(zoomImageData)
		{
			return zoomImageData ? zoomImageData.replace(/(^.*zoomImage\s*:\s*('|"))(.*?)(\2.*$)/,'$3') : null;
		},
		
		dropColorCode:function(partNumber)
		{
			return partNumber ? partNumber.toString().replace(/-\d{3}$/,U.EMPTY) : null;
		},
		
		dropStyleIndentifer:function(url)
		{
			return url;
		},
		
		updateStyleIndentifer:function(url,partNumber)
		{
			return url;
		},
		
		updatePartNumber:function(partNumberAndColorCode,partNumber)
		{
			return partNumberAndColorCode;
		},
		
		openFullscreenImageView:function(imageURL)
		{
			var fullScreenUrl = join(U.getStorePath(),'FullscreenImageView?storeId=',U.getStoreId(),'&title=',encodeURIComponent(document.title),'&imageURL=',encodeURIComponent(imageURL.replace(/&/g,'&amp')));
			window.open(fullScreenUrl);
		},
		
	/* QUERYSTRING / HASH FUNCTIONS */
		
	    getQSVars:function()
		{
			return $.getQSVars();
		},
		
		getQSVar:function(name)
		{
			return $.getQSVar(name);
		},
		
		getRequiredQSVars:function()
		{
			return {storeId:U.getStoreId(),langId:U.getLangId(),catalogId:U.getCatalogId()};
		},
		
		//url can be null to just create a querystring
		updateQS:function (url,includeRequiredQSVars,keyValuePairs)
		{
			if(U.isNull(url)) url=U.EMPTY;
			if(includeRequiredQSVars==true) keyValuePairs=$.extend(U.getRequiredQSVars(),keyValuePairs,U.getRequiredQSVars()); //Retains order, but overrides any duplicate vars 
			
			var addParam=function(url,key, value)
			{
				if(value)
				{
					var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i"),
					value = encodeURIComponent(value);
					var separator = url.indexOf(U.QUESTION_MARK) != -1 ? "&" : "?";
					if (url.match(re)) return url.replace(re, '$1' + key + "=" + value + '$2');
					else return url + separator + key + "=" + value;
				}
			}
			
			var removeParam=function(url,key)
			{
				return url.replace(new RegExp('&?' + key + '=(.+?)(&|$)'),'$2').replace(/\?&/,U.QUESTION_MARK).replace(/\?$/,U.EMPTY);
			}
			
			for(var key in keyValuePairs)
			{
				var value=keyValuePairs[key];
				if(value) url=addParam(url,key,value);
				else url=removeParam(url,key);
			}
			
			return url;
		},
		
		dropQS:function(url)
		{
			if(url)
			{
				var match=/(^.*)\?(.*$)/.exec(url);
				if(match) return {url:match[1],vars:U.getHashVars(match[2])}
				else return {url:url,vars:[]};
			}
		},
		
		getHash:function(removeHashMark)
		{
			if(typeof location.hash!=U.UNDEFINED) return removeHashMark ? location.hash.replace(/^#/,U.EMPTY) : location.hash;
			else return U.EMPTY;
		},
		
		dropHash:function(url)
		{
			return url ? url.replace(/#.*$/, U.EMPTY) : null;
		},
		
		getHashVars:function(hashes)
		{
			var vars=[];
			var hash;
			var hashes=(hashes ? hashes : U.getHash(true)).split(U.AMP);
			
			for(var i = 0; i < hashes.length; i++)
			{
				hash = hashes[i].split(U.EQUALS);
				if(hash[0]!=U.EMPTY)
				{
					vars.push(hash[0]);
					vars[hash[0]] = hash[1];
				}
			}
			
			return vars;
		},
		
		removeURLHash:function()
		{ 
		    if(typeof history!=U.UNDEFINED && typeof history.pushState!=U.UNDEFINED)
		    {
		    	history.pushState(U.EMPTY, document.title, window.location.pathname+window.location.search);
		    	return true;
		    } else return false;
		},
		
		decodeAmps:function(url)
		{
			return url ? url.replace(/&amp;/gi,U.AMP) : null;
		},
		
		getCurrentURL:function(includeQuerystring)
		{
			var href=location.href.replace(/#.*$/,U.EMPTY);
			return includeQuerystring ? href : U.dropQS(href).url;
		},
		
	/* TO FUNCTIONS */
		
		toClass:function(str)
		{
			return typeof str==U.STRING ? str.replace(U._OPTIONAL_DOT_HASH_FIRST_CHAR_REGEX,U.DOT) : null;
		},
		
		toId:function(str)
		{
			return typeof str==U.STRING ? str.replace(U._OPTIONAL_DOT_HASH_FIRST_CHAR_REGEX,U.HASH_MARK) : null;
		},
		
		toSelector:function()
		{
			var args=Array.prototype.slice.call(arguments);
			return args instanceof Array && args.length ? args.join(U.COMMA) : null;
		},
		
		toAttribute:function(name,value)
		{
			return typeof name==U.STRING ? join('[',name,typeof value!=U.UNDEFINED ? U.EQUALS+U.DOUBLE_QUOTE+value+U.DOUBLE_QUOTE : U.EMPTY,']') : null;
		},
		
		toNumber:function(num)
		{
			return isNaN(num) || typeof num!=U.NUMBER ? 0 : num;
		},
		
		toMilliseconds:function(num)
		{
			return isNaN(num) || typeof num!=U.NUMBER ? 0 : num*1000;
		},
		
		toElement:function(classes,tagName,attributesObj,content)
		{
			var attributes=U.EMPTY;
			
			if(!tagName) tagName=U.DIV;
			if(!content) content=U.EMPTY;
			if(classes) attributes=join(U.CLASS,U.EQUALS,U.SINGLE_QUOTE,classes,U.SINGLE_QUOTE);
			if(attributesObj)
			{
				for(var prop in attributesObj)
				{
					attributes+=U.SPACE+U.toElementAttribute(prop,attributesObj[prop]);
				}
			}
			
			return U.TAG_TEMPLATE.replace(/\{0\}/g,tagName).replace(/\{1\}/,attributes).replace(/\{2\}/,content ? U.decodeHTML(content) : U.EMPTY);
		},
		
		toElementAttribute:function(name,value)
		{
			return join(name,U.EQUALS,U.DOUBLE_QUOTE,value,U.DOUBLE_QUOTE);
		},
		
		toEvent:function()
		{
			var args=Array.prototype.slice.call(arguments);
			return args.length>1 ? args.join(U.SPACE) : args[0];
		},
		
		toData:function(attributeName)
		{
			return U.DATA_DASH+attributeName;
		},
		
	/* ANIMATION FUNCTIONS */
		
	    scrollTo:function(scrollTop,duration,$target,syncToExandCollapse,onComplete)
	    {
			if(U.isNull(duration) || isNaN(duration)) duration=.75;
			if(syncToExandCollapse) duration=U.EXPAND_COLLAPSE_DURATION;
			else var ease=Power3.easeIn;
	        return TweenLite.to($target ? $target : [U.$html,U.$body],duration,{scrollTop:scrollTop,ease:ease,onComplete:onComplete});
	    },
	    
	    //options: duration, delay, autoAlpha, onComplete
	    fadeIn:function($elem,options)
	    {
	    	var defaults={autoAlpha:1,duration:U.FADE_DURATION};
	    	var settings=$.extend({},defaults,options);
	    	
	    	if(settings.killFadeInTween) TweenLite.killTweensOf($elem,{autoAlpha:true});
	    	if(settings.show) $elem.removeClass(U.HIDDEN).show();
	    	if(options && typeof options.delay==U.BOOLEAN && options.delay) settings.delay=U.FADE_DELAY;
	    	return TweenLite.to($elem,settings.duration,{autoAlpha:settings.autoAlpha,delay:settings.delay,ease:settings.ease,onComplete:settings.onComplete,onStart:settings.onStart});
	    },
	    
	    fadeOut:function($elem,options)
	    {
	    	var defaults={autoAlpha:0,duration:U.FADE_DURATION};
	    	var settings=$.extend({},defaults,options);
	    	
	    	if(settings.killFadeInTween) TweenLite.killTweensOf($elem,{autoAlpha:true});
	    	if(settings.hide)
	    	{
	    		var onComplete=function()
	    		{
	    			$elem.addClass(U.HIDDEN).hide();
	    			if(settings.onComplete instanceof Function) settings.onComplete();
	    		}
	    	}
	    	
	    	return TweenLite.to($elem,settings.duration,{autoAlpha:settings.autoAlpha,delay:settings.delay,ease:settings.ease,onComplete:onComplete ? onComplete : settings.onComplete,onStart:settings.onStart});
	    },
	    
	    fadeOutIn:function($elemOut,$elemIn,startTogether)
		{
			U.fadeOut($elemOut,{onComplete:!startTogether ? function()
			{
				U.fadeIn($elemIn);
			} : null});
			
			if(startTogether) U.fadeIn($elemIn);
		},
		
		fadeInOut:function($elem,delayBeforeFadeOut,onComplete)
		{
			if(U.isNull(delayBeforeFadeOut)) delayBeforeFadeOut=3;
			
			TweenLite.killTweensOf($elem,{autoAlpha:true});
			U.fadeIn($elem,{onComplete:function()
			{
				U.fadeOut($elem,{onComplete:onComplete,delay:delayBeforeFadeOut});
			}})
		},
		
	    expand:function($elem,options)
		{
	    	var defaults={duration:U.EXPAND_COLLAPSE_DURATION};
	    	var settings=$.extend({},defaults,options);
	    	
			var height=U.getAutoHeight($elem);
			
	    	$elem.data(U.OPEN,true);
			$elem.css({display:U.BLOCK});
			var vars={height:height,onComplete:function()
			{
				$elem.height(U.AUTO);
				if(settings.adjustOverflow) $elem.css({overflow:U.VISIBLE});
				if(settings.onComplete instanceof Function) settings.onComplete();
			}};
			
			if(settings.easing) vars.ease=easing;
			if(settings.roundProps==true) vars.roundProps=U.HEIGHT;
			if(settings.fadeIn!=false)
			{
				vars.autoAlpha=1;
				TweenLite.killTweensOf($elem,{autoAlpha:true});
			}
			
			TweenLite.killTweensOf($elem,{height:true});
			TweenLite.to($elem,settings.duration,vars);
			
			return height;
		},
		
		collapse:function($elem,options)
		{
			var defaults={duration:U.EXPAND_COLLAPSE_DURATION};
	    	var settings=$.extend({},defaults,options);
			var height=settings.height ? settings.height : 0;
			
			$elem.data(U.OPEN,false);
			
			var vars={height:height,onComplete:function()
			{
				if(height==0 && settings.hide!=false) $elem.css({display:U.NONE});
				if(settings.onComplete instanceof Function) settings.onComplete();
			}};
			
			if(settings.adjustOverflow) $elem.css({overflow:U.EMPTY});
			if(settings.roundProps==true) vars.roundProps=U.HEIGHT;
			if(settings.fadeOut!=false)
			{
				vars.autoAlpha=0;
				TweenLite.killTweensOf($elem,{autoAlpha:true});
			}
			
			TweenLite.killTweensOf($elem,{height:true});
			TweenLite.to($elem,settings.duration,vars);
		},
		
		isOpen:function($elem)
		{
			return $elem.data(U.OPEN)==true;
		},
		
	/* CONSTANTS */
		
		TRUE:'true',
		FALSE:'false',
		UNDEFINED:'undefined',
		EMPTY:'',
		ARRAY:'array',
		FUNCTION:'function',
		NUMBER:'number',
		STRING:'string',
		BOOLEAN:'boolean',
		TRANSPARENT:'transparent',
	    ERROR:'error',
	    LOAD:'load',
	    LOADING:'loading',
	    HIDE:'hide',
	    SHOW:'show',
	    HIDDEN:'hidden',
	    VISIBLE:'visible',
	    READY:'ready',
	    LOADED:'loaded',
	    OPEN:'open',
	    CLOSE:'close',
	    OPENING:'opening',
	    CLOSING:'closing',
	    MORE:'more',
	    LESS:'less',
	    ON:'on',
	    OFF:'off',
	    ADDED:'added',
	    ORDER:'order',
	    SELECTED:'selected',
	    DISABLED:'disabled',
	    ACTIVE:'active',
	    CURRENT:'current',
		POSITION:'position',
	    FIXED:'fixed',
	    RELATIVE:'relative',
	    ABSOLUTE:'absolute',
	    STATIC:'static',
	    DISPLAY:'display',
	    NO_DISPLAY:'nodisplay',
	    VISIBILITY:'visibility',
	    OPACITY:'opacity',
	    INHERIT:'inherit',
	    BLOCK:'block',
	    AUTO:'auto',
	    NONE:'none',
	    LEFT:'left',
	    RIGHT:'right',
	    TOP:'top',
	    BOTTOM:'bottom',
	    OVERFLOW:'overflow',
	    LINE_HEIGHT:'line-height',
	    FIRST:'first',
	    LAST:'last',
	    FIRST_CHILD:':first-child',
	    LAST_CHILD:':last-child',
	    FOCUSABLE:':focusable',
	    TABBABLE:':tabbable',
	    TABBING:'tabbing',
	    INDEX:'index',
	    HTTP:'http',
	    HTTPS:'https',
	    DOT:'.',
	    PERIOD:'.',
	    COMMA:',',
	    COLON:':',
	    PIPE:'|',
	    ELLPISIS:'...',
	    HASH_MARK:'#',
	    PLUS:'+',
	    MINUS:'-',
	    SPACE:' ',
	    EQUALS:'=',
	    AMP:'&',
	    QUESTION_MARK:'?',
	    DOUBLE_QUOTE:'"',
	    SINGLE_QUOTE:"'",
	    GREATER_THAN:'>',
	    LESS_THAN:'<',
	    UNDERSCORE:'_',
	    OPENING_PAREN:'(',
	    CLOSING_PAREN:')',
	    DOLLAR_SIGN:'$',
	    FORWARD_SLASH:'/',
	    TAG_TEMPLATE:'<{0} {1}>{2}</{0}>',//{0}-tagName, {1}-attributes, {2}-content
	    DASH:'-',
	    NDASH:'&ndash;',
	    MDASH:'&mdash;',
	    GT:'&gt;',
	    LT:'&lt;',
	    CLICK:'click',
	    MOUSE_LEAVE:'mouseleave',
	    MOUSE_ENTER:'mouseenter',
	    MOUSE_OUT:'mouseout',
	    MOUSE_OVER:'mouseover',
	    MOUSE_DOWN:'mousedown',
	    KEY_UP:'keyup',
	    KEY_DOWN:'keydown',
	    KEY_PRESS:'keypress',
	    FOCUS:'focus',
	    FOCUS_OUT:'focusout',
	    BLUR:'blur',
		BEFORE_UNLOAD:'beforeunload',
	    CHANGE:'change',
	    SCROLL:'scroll',
	    RESIZE:'resize',
	    HOVER:'hover',
	    MESSAGE:'message',
	    HASH_CHANGE:'hashchange',
	    SEARCH_INPUT_BLUR:'searchinputblur',
	    PVH_CONSTRUCT:'pvhconstruct',
	    PVH_INIT:'pvhinit',
	    PVH_FINALIZE:'pvhfinalize',
	    PVH_COMPLETE:'pvhcomplete',
	    PVH_READY:'pvhready',
	    ID:'id',
	    HTML:'html',
	    HEAD:'head',
	    BODY:'body',
	    MAIN:'main',
	    HEADER:'header',
	    FOOTER:'footer',
	    PAGE:'#page',
	    FRAME:'frame',
	    IFRAME:'iframe',
	    DIV:'div',
		A:'a',
	    IMG:'img',
	    SPAN:'span',
	    INPUT:'input',
	    SELECT:'select',
	    BUTTON:'button',
	    UL:'ul',
	    LI:'li',
	    CLASS:'class',
	    DATA:'data',
	    DATA_DASH:'data-',
	    DATA_SRC:'data-src',
	    DATA_IS_LOADED:'data-is-loaded',
	    VALUE:'value',
	    LOWERCASE:'lowercase',
	    UPPERCASE:'uppercase',
	    CAPITALIZE:'capitalize',
	    PART_NUMBER:'part-number',
	    COLOR_CODE:'color-code',
	    BACKGROUND_COLOR:'background-color',
	    WHITE:'#FFF',
	    BLACK:'#000',
	    PARENT:'parent',
	    HREF:'href',
	    WIDTH:'width',
	    HEIGHT:'height',
	    STYLE:'style',
	    SRC:'src',
	    TITLE:'title',
	    PLACEHOLDER:'placeholder',
	    SECTION:'section',
	    NEW_LINE:'\n',
	    MIN_WIDTH:'min-width',
	    MAX_WIDTH:'max-width',
	    MIN_HEIGHT:'min-height',
	    MAX_HEIGHT:'max-height',
	    MARGIN_TOP:'margin-top',
	    MARGIN_BOTTOM:'margin-bottom',
	    MARGIN_LEFT:'margin-left',
	    MARGIN_RIGHT:'margin-right',
	    PADDING_TOP:'padding-top',
	    PADDING_BOTTOM:'padding-bottom',
	    PADDING_LEFT:'padding-left',
	    PADDING_RIGHT:'padding-right',
	    BORDER_WIDTH:'border-width',
	    Z_INDEX:'z-index',
	    SCROLL_TOP:'scrollTop',
	    NO_IMAGE:'no-image',
	    COUNT:'count',
	    US:'US',
	    DETAILS:'Details',
	    DESKTOP:'desktop',
	    MOBILE:'mobile',
	    TABLET:'tablet',
	    PORTRAIT:'portrait',
		LANDSCAPE:'landscape',
	    EXPAND_COLLAPSE_DURATION:.4,
		FADE_DURATION:.35,
		FADE_DELAY:.15,
		PRODUCT_SELECTOR:'#product',
		PRODUCTS_SELECTOR:'#products',
		CLOUD_ZOOM:'CloudZoom',
		CLOUD_ZOOM_SELECTOR:'#zoom1',
		SIZE_DROP_DOWN_SELECTOR:'.sizeSelector',
		CLOUD_ZOOM_GALLERY_ACTIVE_CLASS:'cloudzoom-gallery-active',
		CLOUD_ZOOM_INSIDE_CLASS:'cloudzoom-zoom-inside',
		CROP_N:'cropN',
		OP_SHARPEN:'op_sharpen',
		DROP_KICK_SELECT:'select[data-custom=true]',
		DARK_MODE:'darkMode',
		LIGHT_MODE:'lightMode',
		STICKY:'sticky',
		ARIA: {
			DISABLED: 'aria-disabled',
			HASPOPUP: 'aria-haspopup',
			CHECKED: 'aria-checked',
			SELECTED: 'aria-selected',
			LABELLED_BY: 'aria-labelledby',
			DESCRIBED_BY: 'aria-describedby'
		},
		TAB_INDEX: 'tabindex',
		ALT: 'alt',
		KEYCODE:
		{
			ENTER: 13,
			SPACE: 32,
			TAB: 9,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			ESC: 27
		},
		KEY:
		{
			TAB:'Tab'
		},
		SWATCH_WIDTH:14,
		SWATCH_HEIGHT:14,
		GRID_WIDTH:255,
		GRID_HEIGHT:255,
	    PDP_WIDTH:530,
	    PDP_HEIGHT:530,
	    ZOOM_WIDTH:1500,
	    ZOOM_HEIGHT:1500,
	    PDP_SWATCH_WIDTH:90,
	    PDP_SWATCH_HEIGHT:131,
	    ALT_WIDTH:100,
	    ALT_HEIGHT:146,
	    BODY_BG_COLOR:'#FFF',
	    HEADER_DEPARTMENT_LINKS:'HeaderDepartmentLinks',
	    GRID_SWATCHES:'GridSwatches',
	    GRID_THIRD_IMAGE:'GridThirdImage',
	    GRID_OVERLAY_LOADING_ANIMATION:'GridOverlayLoadingAnimation',
	    SHARPEN_IMAGES:'SharpenImages',
	    DISABLE_OOS_SWATCHES:'DisableOOSSwatches',
	    GWP_OVERLAY:'GWPOverlay',
	    CATEGORY_SHORTDESC_ASUGGEST:'CategoryShortDescAutoSuggest',
	    
	/* VARIABLES */
		
		$window:null,
		$doc:null,
		$html:null,
		$body:null,
		$page:null,
    	$main:null,
    	$header:null,
    	$footer:null,
    	$progressBar:null,
    	$zoom:null,
		
    /* _______________________________________________________________PRIVATE_______________________________________________________________ */
	    
	    _addQSFunctions:function()
	    {
			$.extend({
			    getQSVars: function()
			    {
			      var vars = [], hash;
			      var hashes = window.location.href.slice(window.location.href.indexOf(U.QUESTION_MARK) + 1).split(U.AMP);
			      for(var i = 0; i < hashes.length; i++)
			      {
			        hash = hashes[i].split('=');
			        vars.push(hash[0]);
			        vars[hash[0]] = hash[1];
			      }
			      return vars;
			    },
			    getQSVar: function(name){
			      return $.getQSVars()[name];
			    }
			});
	    },
	    
	    _addPrototypeFunctions:function()
	    {
	    	Element.prototype.isNodeList=function(){ return false; }
	    	NodeList.prototype.isNodeList=HTMLCollection.prototype.isNodeList=function(){ return true; }
	    },
	    
	    _addJQueryFunctions:function()
	    {
	    	$.fn.inlineStyle=function(prop)
	    	{
		        return this.prop(U.STYLE)[$.camelCase(prop)];
		    };

		    $.fn.toggleClick=function()
		    {
		        var functions = arguments;
		        return this.each(function()
		        {
		            var iteration=0;
		            $(this).click(function()
		            {
		                functions[iteration].apply(this,arguments);
		                iteration=(iteration+1)%functions.length;
		            });
		        });
		    };
	    },
	    
	    _checkAjaxResponseForError:function(data,successHandler,jqXHR)
		{
	    	var errorPageView=jqXHR.getResponseHeader(U._ERROR_PAGE_VIEW);
	    	if(U.isNull(errorPageView))
	    	{
	    		var responseHTML=$.parseHTML(data);
				var exceptionKey=$(responseHTML).find(U._GENERIC_ERROR_KEY_SELECTOR).val();
				if(U.isNotNull(exceptionKey)) U.redirect(U.updateQS(U._GENERIC_ERROR_VIEW_NAME,true,{excMsgKey:exceptionKey}));
				else if(successHandler instanceof Function) successHandler(data);
	    	}
		},
		
		_setupPDP:function(bundleThumbnailSrcFunc,allowComponentsToControlCloudZoom)
		{
			var $product=$(U.PRODUCT_SELECTOR);
			if($product.length)
			{
				U.$zoom=U.$body.find('#zoom1[data-src]');
				
				if(U.$zoom.length && $product.data('unknown-category')) //Happens when a product is only found as a component of a bundle
				{
					if(U.isLandscapeURL(U.$zoom.attr(U.DATA_SRC))) $product.removeClass(U.PORTRAIT).addClass(U.LANDSCAPE); //If needed, switch to landscape
				}
				
				var isLandscape=U.isLandscape($product);
				
				var transparentImageURL=U.getTransparentPDPImageURL(isLandscape);
		    	$.fn.CloudZoom.defaults.errorCallback=function(error)
		    	{
		    		var $zoom=error.$element;
		    		U.addCloudZoomNoImage($zoom,transparentImageURL);
		    	};
		    	
		    	if(U.$zoom.length)
		    	{
					U._updateCloudZoomURLs(U.$zoom,$product);
					U.$zoom.productImage(false,$product,U.isBundlePage() && !allowComponentsToControlCloudZoom ? '#product_visual_thumbnails .cloudzoom-gallery' : null);
					PVHFullscreen.init();
		    	}
		    	
		    	var $productSwatches=$product.find('.swatchWrapper ul.productswatches');
		    	var $productSwatchImg=$productSwatches.find(U.IMG);
		    	if($productSwatchImg.length) $productSwatchImg.colorSwatchImage(true);
		    	
		    	if($.fn.tabs) $product.find('.tabsContainer').tabs();
		    	if($.fn.colorSwatchToolTip) $product.find('#swatchDiv').colorSwatchToolTip();
		    	
		    	U.addVideoThumbListeners();
		    	if(U.isTouch()) U.addSwipeListeners($product.find('.product_main_video'));
		    	
		    	U.setupDescription();
		    	
		    	if(U.isBundlePage()) U._setupBundle($product,bundleThumbnailSrcFunc,isLandscape);
		    	
		    	var $sizeDropDown=$(U.SIZE_DROP_DOWN_SELECTOR);
				var $li=$sizeDropDown.find('.sizeSwatches > li');
				$li.keydown(U.keydownEvent);
				
				$productSwatches.find(U.A).keydown(function(event)
				{
					if(event.keyCode == U.KEYCODE.ENTER || event.keyCode == U.KEYCODE.SPACE)
					{
						event.preventDefault();
						$(this).click();
					}
		    	});
			}
		},
		
		_setupBundle:function($product,bundleThumbnailSrcFunc,isLandscape)
		{
			if($.fn.bundleLookDisplay) $product.bundleLookDisplay(bundleThumbnailSrcFunc);
			else if($.fn.bundleSetDisplay) $product.bundleSetDisplay(bundleThumbnailSrcFunc);
			
			//Component thumbnail
    		$('.bundleImage img[data-src]').each(function()
    		{
    			var $this=$(this);
    			U.loadImages($this,null,function(src)
				{
					return bundleThumbnailSrcFunc(src,$this.parents('[data-part-number]').data(U.PART_NUMBER),isLandscape);
				},null,null,isLandscape);
    			
    			var $bundleImage=$this.parent();
    			$bundleImage.parent(U.LI).find('.productswatches a').click(function()
	    		{
    				var $a=$(this);
	    			var $swatch=$a.parent();
	    			$product.data('updateSetImage')($this.attr(U.ID),$swatch.data('product-image-src'),$a.hasClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS));
	    		});
    		});
    		
    		//Bundle alts
    		var $product=$(U.PRODUCT_SELECTOR);
    		var partNumber=$product.data(U.PART_NUMBER);
    		$bundleAlt=$product.find('.prodThumbnails .cloudzoom-gallery');
        	if($bundleAlt.length)
        	{
        		$bundleAlt.each(function()
    	    	{
    	    		var $this=$(this);
    	    		var src=$this.children('img[data-src]').attr(U.DATA_SRC);
    	    		if(src) U.updateCloudZoomData($this,U.updateImageSrcForPDP(src,partNumber,isLandscape),U.updateImageSrcForZoom(src,partNumber,isLandscape));
    	    	});
        	}
    		
    		U.loadImages($product.find('.prodThumbnails img[data-src]:not([data-src=""])'),null,function(src)
			{
				return U.updateImageSrcForAlt(src,partNumber,isLandscape);
			},true,'.prodThumbnails',isLandscape,function()
			{
				U.fadeIn($product.find('#product_visual_thumbnails'));
			});
		},
		
		updateBundleThumbnail:function($img,url,bundleThumbnailSrcFunc)
		{
			var $component=$img.parents(U.toAttribute(U.toData(U.PART_NUMBER))).first();
			var isLandscape=U.isLandscape($(U.PRODUCT_SELECTOR));
			
			$img.attr(U.DATA_SRC,url).data(U.SRC,url);
			
			U.loadImages($img,null,function(src)
			{
				return bundleThumbnailSrcFunc(src,$component.data(U.PART_NUMBER),isLandscape);
			},null,null,isLandscape);
			
			var $fullscreen=$img.siblings('#wrap').children('.cloud-zoom');
			$fullscreen.attr(U.HREF,U.updateImageSrcForZoom(url,$component.data(U.PART_NUMBER),isLandscape));
		},
		
		//TODO: Need to change if this id changes
		getBillingAddressId:function()
		{
			return $('#billing_address_id_1').val();
		},
		
		//WI28636 27239 - THCKSP Mobile - Click To Apply Promo Feature
		applyPromo:function(promoCode)
		{
			U.createSessionCookie(U._APPLIED_PROMO_COOKIE,promoCode);
			U.createSessionCookie(U._URL_PROMO_COOKIE,promoCode);
			if(U.isShoppingBagPage() || U.isShippingAndBillingPage()) CheckoutHelperJS.applyPromoAndUpdateOrderItem();
		},
		
		//Returns true if it was set using U.applyPromo and the promoCode is the same
		hasAppliedPromo:function(promoCode)
		{
			var appliedPromoCookie=U.getCookie(U._APPLIED_PROMO_COOKIE);
			return appliedPromoCookie && appliedPromoCookie==promoCode;
		},
		
		removeAppliedPromo:function(promoCode)
		{
			if(U.hasAppliedPromo(promoCode)) U.removeCookie(U._APPLIED_PROMO_COOKIE);
		},
		
		/* CONSTANTS */
		
		_ERROR_PAGE_VIEW:'Error-Page-View',
		_GENERIC_ERROR_KEY_SELECTOR:'#genericErrorMessageKey',
		_GENERIC_ERROR_VIEW_NAME:'GenericApplicationError',
		_OPTIONAL_DOT_HASH_FIRST_CHAR_REGEX:/^[\.#]?/,
		_US_ZIP_REGEX:/(^\d{5}$)|(^\d{5}-\d{4}$)/,
		_APPLIED_PROMO_COOKIE:'applied_promo',
		_URL_PROMO_COOKIE:'url_promo',
		_FORCE_CANADA:'forceCanada',
		_PREFLANGCOOKIENAME:'prefLang',
		
	/* VARIABLES */
		
		_storeId:null,
		_langId:null,
		_catalogId:null,
		_eSpotOverlayViewURL:null,
		_supportsRetinaLines:null,
		_supportsPositionSticky:null,
		_currentScrollTop:0,
		_disabledScrollLevel:0,
		_isMobile:false,
		_isDesktop:false,
		_isTablet:false,
		_isHomepage:false,
		_isDepartmentPage:false,
		_isCategoryPage:false,
		_isSearchPage:false,
		_isSearchLandingPage:false,
		_isSearchResultsPage:false,
		_isNoSearchResultsPage:false,
		_isProductPage:false,
		_isBundlePage:false,
		_isShoppingBagPage:false,
		_isCheckout:false,
		_isOrderConfirmationPage:false,
		_isCustomerServicePage:false,
		_isMyAccountPage:false,
		_isRegistrationPage:false,
		_isRegisteredUser:false,
		_isIELessThan11:false,
		_isIE8:false,
		_isUSUser:true,
		_isCanadaUser:false,
		_transparentImageURL:null,
		_transparentPDPImageURL:null,
		_closeXImage:null,
		_wcUserCookie:null,
		_wcOrderIdCookie:null,
		_wcCartTotalCookie:null,
		_defaultScene7Params:'&fmt=jpeg&qlt=90%2c0&resMode=trilin&op_usm=0.8%2c1.0%2c6%2c0&iccEmbed=0',
		_isCK:false,
		_isSP:false,
		_isTH:false,
		_isTwoUpDisplayGrid:false
};
