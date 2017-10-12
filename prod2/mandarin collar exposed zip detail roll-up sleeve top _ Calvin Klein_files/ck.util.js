var CKUtil = CKUtil ||
{
	construct:function(scene7Params)
	{
		PVHUtil.construct('transparent_261x344.gif',null,'overlayCloseX-2x.png',scene7Params); //WARNING: Must be called before extending PVHUtil
		
		CKUtil._transparentLandscapeImageURL=join(PVHUtil.getAkamaiPath(),'transparent_261x199.gif');
		CKUtil._isFeaturedCategoryLandingPage=PVHUtil.$html.hasClass('multipleFeaturedSubCategoriesPage');
		
		if(PVHUtil.isDesktop())
		{
			PVHUtil._transparentPDPImageURL=PVHUtil._transparentImageURL=join(U.getAkamaiPath(),'transparent_352x465.gif');
			CKUtil._transparentLandscapeImageURL=join(PVHUtil.getAkamaiPath(),'transparent_352x268.gif');
			
			CKUtil.SWATCH_WIDTH=24;
			CKUtil.SWATCH_HEIGHT=24;
			
			if(PVHUtil.isTwoUpDisplayGrid())
			{
				CKUtil.GRID_WIDTH=498;
				CKUtil.GRID_HEIGHT=656;
				CKUtil.LAND_GRID_HEIGHT=379;
			} else if(CKUtil.isFeaturedCategoryLandingPage())
			{
				CKUtil.GRID_WIDTH=407;
				CKUtil.GRID_HEIGHT=536;
				CKUtil.LAND_GRID_HEIGHT=310;
			} else
			{
				CKUtil.GRID_WIDTH=329;
				CKUtil.GRID_HEIGHT=434;
				CKUtil.LAND_GRID_HEIGHT=250;
				CKUtil.PDP_WIDTH=564;
				CKUtil.PDP_HEIGHT=743;
				CKUtil.LAND_PDP_HEIGHT=429;
			}
			
			if(PVHUtil.supportsRetinaDisplay())
			{
				CKUtil.SWATCH_WIDTH=48;
				CKUtil.SWATCH_HEIGHT=48;
				CKUtil.ALT_WIDTH=200;
				CKUtil.ALT_HEIGHT=264;
				CKUtil.LAND_ALT_HEIGHT=152;
				
				if(!PVHUtil.isTablet())
				{
					CKUtil.GRID_WIDTH=Math.floor(CKUtil.GRID_WIDTH*CKUtil.RETINA_FACTOR);
					CKUtil.GRID_HEIGHT=Math.floor(CKUtil.GRID_HEIGHT*CKUtil.RETINA_FACTOR);
					CKUtil.LAND_GRID_HEIGHT=Math.floor(CKUtil.LAND_GRID_HEIGHT*CKUtil.RETINA_FACTOR);
					CKUtil.PDP_WIDTH=Math.floor(CKUtil.PDP_WIDTH*CKUtil.RETINA_FACTOR);
					CKUtil.PDP_HEIGHT=Math.floor(CKUtil.PDP_HEIGHT*CKUtil.RETINA_FACTOR);
					CKUtil.LAND_PDP_HEIGHT=Math.floor(CKUtil.LAND_PDP_HEIGHT*CKUtil.RETINA_FACTOR);
				}
			}
		}
		
		CKUtil=U=$.extend({},PVHUtil,CKUtil);
	},
	
	init:function(bundleThumbnailSrcFunc,autoSuggestExclusionFunction)
	{
		PVHUtil.init(bundleThumbnailSrcFunc,true,autoSuggestExclusionFunction);
		
		$("#shareWishlistLink").click(function(){
			var $shareForm=$("form#SendMsgForm");
			U.scrollTo($shareForm.position().top,null,null,null, function(){ 
				var $shareFormInput = $shareForm.find("input:enabled:visible").first();
				$shareFormInput.focus();
			});
		});
	},
	
	finalize:function()
	{
		PVHUtil.finalize();
		
		if(U.isRegistrationPage()) U._initRegistrationForm();
	},
	
	/* GET FUNCTIONS */
		
		getTransparentImageURL:function(isLandscape)
		{
			return isLandscape ? U._transparentLandscapeImageURL : U._transparentImageURL;
		},
		
		getTransparentPDPImageURL:function(isLandscape)
		{
			return isLandscape ? U._transparentLandscapeImageURL : U._transparentPDPImageURL;
		},

	/* IS FUNCTIONS */
		
		isFeaturedCategoryLandingPage:function(isLandscape)
		{
			return CKUtil._isFeaturedCategoryLandingPage;
		},
		
	/* HELPER FUNCTIONS */
	
		setupDropKick:function($parent)
		{
			if($.fn.dropkick)
			{
				var settings={fade:U.isCategoryPage() || U.isSearchResultsPage(),keepSelectInvisible:U.isMobile()};
				if($parent) $parent.find(U.DROP_KICK_SELECT).dropkick(settings);
				else $(U.DROP_KICK_SELECT).dropkick(settings);
				
				if(U.isMobile() && (U.isProductPage() || U.isBundlePage()))
				{
					var $quantity=$('.quantity_section');
					$quantity.each(function()
					{
						var $this=$(this);
						$this.prepend(U.toElement('decrease',U.A,{value:-1}));
						$this.append(U.toElement('increase',U.A,{value:1}));
						
						var $select=$this.find(U.SELECT);
						$this.children(U.A).click(function()
						{
							var value=parseInt($(this).attr(U.VALUE));
							var newValue=parseInt($select.val())+value;
							var maxValue=parseInt($select.children().last().val());
							if(newValue>0 && newValue<=maxValue) $select.val(newValue).change();
						});
					});
				}
			}
		},
		
		//Because of the sticky footer, CK needs to offset margin-top for $page
		enableScrolling:function()
	    {
	    	U._disabledScrollLevel--;
	    	if(U._disabledScrollLevel==0)
	    	{
	    		U.$body.css({overflow:U.EMPTY});
				U.$page.css(U.MARGIN_TOP,U.EMPTY);
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
				U.$page.css(U.MARGIN_TOP,-U._currentScrollTop);
	    	}
	    },
	    
	    //If changed, update CKUtilityNavigation
		displayUserData:function()
	    {
			if(CKUtil.isRegisteredUser())
			{
				$('.desktop .registeredUser').removeClass(U.HIDDEN);
				$('.guestUser').remove();
				
				// needed only for desktop when full header is displayed
				if(typeof HEADER_GREETING != U.UNDEFINED) 
				{
					var userCookie = U.getWCUserCookie();
					var user_object = JSON.parse(userCookie);
					var $headerMyAccount=$('.headerMyAccount');
					if(U.isNull(user_object.firstName)) $headerMyAccount.text(HEADER_GREETING);
					else
					{
						var firstName=user_object.firstName;
						var maxLength=20;
						if(firstName.length>maxLength) firstName=firstName.substr(0,maxLength)+U.ELLPISIS;
						$headerMyAccount.text(join(HEADER_GREETING,U.COMMA,U.SPACE,firstName));
					}
				}
			} else
			{
				$('.desktop .guestUser').removeClass(U.HIDDEN);
				$('.registeredUser').remove();
			}
		},
		
		setupRecommendations:function()
		{
			if(!U.isTouch())
			{
				$(U.PRODUCT_SELECTOR).on(U.MOUSE_OVER,'.recommendationProductImage',function(e)
				{
					var $details=$(this).siblings('.recommendationProductDetails');
					U.fadeIn($details);
					$details.css(U.Z_INDEX,1000);
				})
				.on(U.MOUSE_OUT,'.recommendationProductImage',function(e)
				{
					var $details=$(this).siblings('.recommendationProductDetails');
					U.fadeOut($details,{duration:.1,onComplete:function() { $details.css(U.Z_INDEX,U.AUTO); }});
				});
			}
		},
		
		setupDescription:function(keepOpen)
		{
			$('.itemDescriptionTrigger').unbind(U.CLICK)
			.each(function()
			{
				var $this=$(this);
				var $collapsable=$this.siblings('.partialCollapse');
				
				$collapsable.css(U.MAX_HEIGHT,U.EMPTY);
				var maxHeight=parseInt($collapsable.css(U.MAX_HEIGHT));
				
				$collapsable.css({height:U.EMPTY,overflow:U.VISIBLE,maxHeight:U.INHERIT});
				if($collapsable.height()>maxHeight)
				{
					$collapsable.css({overflow:U.EMPTY}).height(maxHeight).data(U.OPEN,false);
					$this.css({visibility:U.INHERIT});
					
					$this.click(function()
					{
						if($collapsable.data(U.OPEN)==false)
						{
							U.expand($collapsable,{fadeIn:false});
							$this.text($this.data(U.LESS));
						} else
						{
							U.collapse($collapsable,{height:maxHeight,fadeOut:false});
							$this.text($this.data(U.MORE));
						}
					});
				} else $this.css({visibility:U.EMPTY});
				
				$this.text($this.data(U.MORE));
			});
		},
		
		//iframeFocusFixCallback - After blur occurs outside the iframe, the focus call below doesn't trigger the listener.
		submitSearchForm:function($searchInput,$CatalogSearchForm,iframeFocusFixCallback,overrideIsHeaderSearch)
		{
			var placeholderText=$searchInput.attr(U.PLACEHOLDER);
			var val=$.trim($searchInput.val());
			var $searchWrapper=$searchInput.parents('.searchWrapper');
			var isHeaderSearch=overrideIsHeaderSearch || U.isAncestorOf($searchWrapper,U.$header);
	    	var isSearchFieldHidden=isHeaderSearch && !U.isMobile() && !$searchWrapper.hasClass(U.VISIBLE);
	    	
			if(isSearchFieldHidden || U.isNull(val) || val==placeholderText)
			{
				$searchWrapper.addClass(U.VISIBLE);
				if(iframeFocusFixCallback) iframeFocusFixCallback();
				else $searchInput.focus();
				return false;
			} else
			{
				$CatalogSearchForm.submit();
				return true;
			}
		},
		
	/* IMAGE FUNCTIONS */
		
		//Checks a CMC URL for the heights of landscape images (hei=161 or hei=296)
		isLandscapeURL:function(url)
		{
			return url && /hei=(161|296)/.test(url) ? true : false;
		},
		
		updateImageSrcForGrid:function(src,partNumber,isLandscape)
		{
			if(isLandscape==null) isLandscape=U.isLandscapeURL(src);
			
			if(isLandscape) return U._updateImageSrcFor(U._getScene7LandscapeGridQuerystring,src,partNumber);
			else return PVHUtil.updateImageSrcForGrid(src,partNumber);
		},
		
		updateImageSrcForPDP:function(src,partNumber,isLandscape)
		{
			if(isLandscape==null) isLandscape=U.isLandscapeURL(src);
			
			if(isLandscape) return U._updateImageSrcFor(U._getScene7LandscapePDPQuerystring,src,partNumber);
			else return PVHUtil.updateImageSrcForPDP(src,partNumber);
		},
		
		updateImageSrcForAlt:function(src,partNumber,isLandscape)
		{
			if(isLandscape==null) isLandscape=U.isLandscapeURL(src);
			
			if(isLandscape) return U._updateImageSrcFor(U._getScene7LandscapeAltQuerystring,src,partNumber);
			else return PVHUtil.updateImageSrcForAlt(src,partNumber);
		},
		
		updateImageSrcForZoom:function(src,partNumber,isLandscape)
		{
			if(isLandscape==null) isLandscape=U.isLandscapeURL(src);
			
			if(isLandscape) return U._updateImageSrcFor(U._getScene7LandscapeZoomQuerystring,src,partNumber);
			else return PVHUtil.updateImageSrcForZoom(src,partNumber);
		},
		
		_getScene7LandscapeAltQuerystring:function()
    	{
    		return U._getScene7Querystring(U.ALT_WIDTH,U.LAND_ALT_HEIGHT);
    	},
    	
    	_getScene7ZoomQuerystring:function()
    	{
    		var factor=U.supportsRetinaDisplay() ? U.RETINA_FACTOR : 1;
    		var width=Math.min(Math.floor(U.$window.width()*factor),U.ZOOM_WIDTH);
    		var ratio=width/U.ZOOM_WIDTH;
    		var height=Math.floor(U.ZOOM_HEIGHT*ratio);
    		return U._getScene7Querystring(width,height);
    	},
	    
    	_getScene7LandscapeZoomQuerystring:function()
    	{
    		var factor=U.supportsRetinaDisplay() ? U.RETINA_FACTOR : 1;
    		var width=Math.min(Math.floor(U.$window.width()*factor),U.ZOOM_WIDTH);
    		var ratio=width/U.ZOOM_WIDTH;
    		var height=Math.floor(U.LAND_ZOOM_HEIGHT*ratio);
    		return U._getScene7Querystring(width,height);
    	},
    	
    	_getScene7LandscapePDPQuerystring:function()
    	{
    		return U._getScene7Querystring(U.PDP_WIDTH,U.LAND_PDP_HEIGHT);
    	},
    	
    	_getScene7LandscapeGridQuerystring:function()
    	{
    		return U._getScene7Querystring(U.GRID_WIDTH,U.LAND_GRID_HEIGHT);
    	},
    	
	/* CONSTS */
		
    	IMAGE_IDENTIFIERS:['_main','_alternate1','_alternate2','_alternate3'],
		ALT_WIDTH:100,
		ALT_HEIGHT:132,
		LAND_ALT_HEIGHT:76,
		PDP_WIDTH:390,
		PDP_HEIGHT:514,
		LAND_PDP_HEIGHT:296,
		ZOOM_WIDTH:1500,
		ZOOM_HEIGHT:1975,
		LAND_ZOOM_HEIGHT:1139,
		GRID_WIDTH:261,
		GRID_HEIGHT:344,
		LAND_GRID_HEIGHT:199,
		SWATCH_WIDTH:100,
		SWATCH_HEIGHT:100,
		RETINA_FACTOR:1.25,
		
	/* PRIVATE */
		
		_initRegistrationForm:function()
	    {
			var supportsBeforeUnload=U.isDesktop() && !U.isTablet();
			var $register=U.$body.find('#Register');
			var $saveButton=$register.find('#userRegistrationSaveWrapper > .primary');
			var $inputs=$register.find(U.toSelector(U.INPUT,U.SELECT));
			var hasUnsavedChanges=$register.data('has-unsaved-loyalty-data');
			var eventName=U.CHANGE+'.registration';
			
			$inputs.on(eventName,function()
			{
				$inputs.off(eventName);
				hasUnsavedChanges=true;
			});
			
			if(supportsBeforeUnload)
			{
				U.$window.on(U.BEFORE_UNLOAD,function(event)
				{
					if(hasUnsavedChanges && !$saveButton.is(document.activeElement))
					{
						event.returnValue=MessageHelper.messages['REMIND_TO_SAVE'];
						return event.returnValue;
					}
				});
			} else
			{
				var showConfirm=function()
				{
					if(typeof CKHeaderNav!=U.UNDEFINED) CKHeaderNav.forceTouchDeselect();
					if(hasUnsavedChanges) return confirm(join(MessageHelper.messages['REMIND_TO_SAVE'],U.NEW_LINE,U.NEW_LINE,MessageHelper.messages['OK_TO_LEAVE']));
				};
				
				$('area:not([target="_blank"]), a:not([target="_blank"]):not([href*="tel:"]):not([href*="window.open"]):not([onclick*="window.open"]):not(#newsletterSignup):not(.searchLink):not(.searchIcon.primary):not(#menuButton):not(#searchButton):not(.historyDisplayA):not(#cmNewsletterClose):not(#cmSignUp):not(#cmContinueToCK)').not($saveButton).click(showConfirm);
				
				$('#autoSuggestStatic_1').on(U.CLICK,U.A,showConfirm);
				
				$('#CatalogSearchForm').submit(showConfirm);
			}
	    },
		
		_transparentLandscapeImageURL:null,
		_isFeaturedCategoryLandingPage:false
};
