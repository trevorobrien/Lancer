var CKHeaderNav=CKHeaderNav ||
{
	construct:function()
	{
		CKHeaderNav.$searchWrapper=$(CKHeaderNav.SEARCH_WRAPPER_SELECTOR);
		CKHeaderNav.$searchLink=CKHeaderNav.$searchWrapper.find(CKHeaderNav.SEARCH_LINK_SELECTOR);
		CKHeaderNav.$searchInput=CKHeaderNav.$searchWrapper.find(CKHeaderNav.SEARCH_INPUT_SELECTOR);
	},
	
	init: function()
	{
		if(U.isTablet()) CKHeaderNav._delayDuration=.05;
		else CKHeaderNav._delayDuration=U.FADE_DELAY;
		
		var $headerNav=$('#headerNav');
		CKHeaderNav.$headerNavItem=$headerNav.find(".headerNavItem");
		
		CKHeaderNav._bindHeaderDropdowns($headerNav,CKHeaderNav.$headerNavItem);
		CKHeaderNav._setupNavItems(CKHeaderNav.$headerNavItem);
		CKHeaderNav._setupSearch();
		
		U.$window.resize(CKHeaderNav._resize);
	},
	
	finalize:function() {},
	
	splitDropDownColumn:function(headerNavItemId,columnNthChild)
	{
		var $headerNavItem=$('.headerNavItem#'+headerNavItemId);
		var $column=$headerNavItem.find(join('.dropDownColumn:nth-child(',columnNthChild,')'));
		
		var $newColumn=$column.clone();
		$column.after($newColumn);
		
		var numLinks=$column.children('.dropDownLink').length;
		var numLinksToClone=Math.floor(numLinks/2);
		var numLinksToLeave=numLinks-numLinksToClone;
		$column.children('.dropDownLink').slice(numLinksToLeave).remove();
		$newColumn.children('.dropDownLink').slice(0,numLinksToClone).remove();
		
		CKHeaderNav._resize();
	},
	
	mergeDropDownColumns:function(headerNavItemId,column1NthChild,column2NthChild,keepEmptyColumn)
	{
		var $headerNavItem=$('.headerNavItem#'+headerNavItemId);
		var $column1=$headerNavItem.find(join('.dropDownColumn:nth-child(',column1NthChild,')'));
		var $column2=$headerNavItem.find(join('.dropDownColumn:nth-child(',column2NthChild,')'));
		$column1.append($column2.children());
		if(!keepEmptyColumn) $column2.remove();
	},
	
	getCurrentMode:function()
	{
		return U.$html.hasClass(U.DARK_MODE) ? U.DARK_MODE : U.LIGHT_MODE;
	},
	
	/* Injects second <img> tags for the white logo and magnifying glass */
	enableDarkMode:function(overrides)
	{
		var defaults={logoURL:'//media1.calvinklein.com/images/ck-logo-white.png',showHeaderBGOnHover:false,showHeaderBGOnSticky:false};
		var settings=$.extend({},defaults,overrides);
		
		var $magGlassA=U.$header.find('.magGlass');
		CKHeaderNav.$magGlassBlack=$magGlassA.children(U.IMG);
		var $whiteMagGlass=$(U.toElement(null,U.IMG,{alt:CKHeaderNav.$magGlassBlack.attr(U.ALT),src:U.getAkamaiPath()+'icons/magGlass-white.png'}));
		$magGlassA.append($whiteMagGlass);
		
		var $logoA=U.$header.find('.logo > a');
		CKHeaderNav.$logoBlack=$logoA.children(U.IMG+U.FIRST_CHILD);
		var $logoWhite=$(U.toElement(null,U.IMG,{alt:CKHeaderNav.$logoBlack.attr(U.ALT),title:CKHeaderNav.$logoBlack.attr(U.TITLE),src:defaults.logoURL}));
		$logoA.append($logoWhite);
		
		var timeoutId;
		var bgOnSticky='bg-on-sticky';
		
		if(settings.showHeaderBGOnHover)
		{
			U.$header.mouseenter(function()
			{
				timeoutId=U.callAfterDelay(function()
				{
					U.$header.data(U.HOVER,true);
					if(!U.$header.data(bgOnSticky)) /* Only adjust when sticky code isn't controlling */
					{
						CKHeaderNav._goLight(true);
					}
				},U.toMilliseconds(U.FADE_DELAY));
			}).mouseleave(function()
			{
				clearTimeout(timeoutId);
				
				if(U.$header.data(U.HOVER))
				{
					U.$header.data(U.HOVER,false);
					if(!U.$header.data(bgOnSticky)) /* Only adjust when sticky code isn't controlling */
					{
						CKHeaderNav._goDark();
						if(!settings.showHeaderBGOnSticky) U.$window.scroll(); /* showHeaderBGOnSticky isn't enabled, so trigger scroll to checkPoints */
					}
				}
			});
		}
		
		if(settings.showHeaderBGOnSticky)
		{
			var headerTop=U.$header.position().top;
			U.$window.on(U.SCROLL,function()
			{
				var scrollTop=U.$window.scrollTop();
				
				if(scrollTop>headerTop) /* Start being sticky */
				{
					if(!U.$header.data(bgOnSticky)) /* Don't allow to set sticky when currently sticky */
					{
						U.$header.data(bgOnSticky,true);
						if(!U.$header.data(U.HOVER)) CKHeaderNav._goLight(true); /* Only adjust when isn't already shown */
					}
				} else if(U.$header.data(bgOnSticky)) /* Only remove sticky when currently sticky */
				{
					U.$header.data(bgOnSticky,false);
					if(!U.$header.data(U.HOVER)) CKHeaderNav._goDark(); /* Only adjust when mouse isn't over the header */
				}
			});
		}
		
		U.$html.addClass(U.DARK_MODE);
	},

	_goLight:function(adjustBackground)
	{
		if(U.$html.hasClass(U.DARK_MODE))
		{
			U.$html.removeClass(U.DARK_MODE);
			
			var vars={color:U.BLACK};
			if(adjustBackground) vars.backgroundColor=U.WHITE;
			TweenLite.to(U.$header,U.FADE_DURATION,vars);
			U.fadeIn(CKHeaderNav.$logoBlack.add(CKHeaderNav.$magGlassBlack));
		} else /* Already in lightMode, but verify the background is shown */
		{
			if(adjustBackground && U.$header.css(U.BACKGROUND_COLOR)!=U.WHITE) TweenLite.to(U.$header,U.FADE_DURATION,{backgroundColor:U.WHITE});
		}
	},
	
	_goDark:function()
	{
		if(!U.$html.hasClass(U.DARK_MODE))
		{
			U.$html.addClass(U.DARK_MODE);
			
			TweenLite.to(U.$header,U.FADE_DURATION,{backgroundColor:U.TRANSPARENT,color:U.WHITE});
			U.fadeOut(CKHeaderNav.$logoBlack.add(CKHeaderNav.$magGlassBlack),{killFadeInTween:true});
		}
	},
	
	/* NOTE: Should create a vertical structure of block-level elements, because offset() wasn't returning the expected values when inline.
	 * 
	 * Accepts any number of objects with:
	 * selector: when the element is in-view the current mode will toggle
	 * offset: optional +/- value to offset when the toggle occurs
	 * darkMode: optional - true calls _goDark, false/null call _goLight
	 */
	addTogglePoints:function()
	{
		var argsArray=Array.prototype.slice.call(arguments);
		var argsLength=argsArray.length;
		
		if(argsLength>5) console.error('CKHeaderNav: Warning monitoring this many points may slow the page down.'); //JP:TODO: Should you limit it to 5-7?
		else if(argsLength)
		{
			var createPoints=function()
			{
				CKHeaderNav._togglePoints=[{top:0,darkMode:CKHeaderNav.getCurrentMode()==U.DARK_MODE}]; //First entry should have the current mode
				
				for(var i=0;i<argsLength;i++)
				{
					var point=argsArray[i];
					var $elem=$(point.selector).first();
					if($elem.length) CKHeaderNav._togglePoints.push({$elem:$elem,top:$elem.offset().top,offset:point.offset,darkMode:point.darkMode});
					else console.debug('CKHeaderNav: Warning selector did not return any results:',point.selector);
				}
			}
			
			var updatePoints=function()
			{
				var length=CKHeaderNav._togglePoints.length;
				for(var i=0;i<length;i++)
				{
					var point=CKHeaderNav._togglePoints[i];
					if(point.$elem) point.top=point.$elem.offset().top;
				}
				
				checkPoints();
			}
			
			var checkPoints=function()
			{
				var scrollTop=U.$window.scrollTop();
				
				if(!U.$header.data(U.HOVER))
				{
					var length=CKHeaderNav._togglePoints.length;
					for(var i=length-1;i>=0;i--)
					{
						var point=CKHeaderNav._togglePoints[i];
						var defaultOffset=75;
						var offset=isNaN(point.offset) ? defaultOffset : point.offset;
						var top=point.top;
						
						if(top-offset<scrollTop)
						{
							if(point.darkMode) CKHeaderNav._goDark();
							else CKHeaderNav._goLight();
							break;
						}
					}
				}
			}
			
			U.$window.off(U.SCROLL,checkPoints).on(U.SCROLL,checkPoints);
			U.$window.off(U.RESIZE,updatePoints).on(U.RESIZE,updatePoints); //Will trigger a call to checkPoints
			createPoints();
		}
	},
	
	forceTouchDeselect:function()
	{
		if(U.isTablet())
		{
			CKHeaderNav.$headerNavItem.each(function()
			{
				var $this=$(this);
				if(U.isMouseOver($this)) $this.mouseleave();
			});
		}
	},
	
	_setupNavItems:function($headerNavItem)
	{
		$headerNavItem.data('is-selected',false);
		$headerNavItem.each(function()
		{
			var $this=$(this);
			if($this.find('.headerNavDropDown .dropDownLink').length==0)
			{
				$this.addClass('noDropDown');
				$this.find(CKHeaderNav.MENU_ITEM_SELECTOR).attr(U.ARIA.HASPOPUP, false);
			}
		});
	},
	
	_bindHeaderDropdowns: function($headerNav,$headerNavItem)
	{
		var killTimeline=function($headerNavItem)
		{
			var timeline=$headerNavItem.data('timeline');
			if(timeline) timeline.kill();
		}
		
		var closeDropDown=function($openDropDown)
		{
			$openDropDown.css(U.Z_INDEX,CKHeaderNav._getNextHighestDepth());
			return function()
			{
				$openDropDown.attr('data-is-open',false).data('is-open',false);
				$openDropDown.addClass(U.HIDDEN);
			};
		};
		
		var selectNavItem=function($headerNavItem)
		{
			if($headerNavItem.data('is-selected')==false)
			{
				$headerNavItem.data('is-selected',true);
				
				var $dropDown=$headerNavItem.children('.headerNavDropDown');
				var hasDropDown=$dropDown.find(".dropDownLink").length ? true : false;
				var isCurrent=$headerNavItem.hasClass('current');
				var $otherOpenDropDown=$('.headerNavDropDown[data-is-open="true"]').not($dropDown);
				var hasMouseBeenOverHeaderNav=CKHeaderNav._hasMouseBeenOver();
				var hasOtherOpenDropDown=$otherOpenDropDown.length ? true : false;
				
				killTimeline($headerNavItem);
				
				if(hasDropDown)
				{
					var isThisDropDownOpen=$dropDown.data('is-open')==true;
					var delay=isThisDropDownOpen || hasMouseBeenOverHeaderNav || hasOtherOpenDropDown ? 0 : CKHeaderNav._delayDuration;
					var timeline=new TimelineLite({delay:delay});
					$headerNavItem.data('timeline',timeline);
					timeline.add(function()
					{
						$headerNavItem.addClass(U.HOVER);
					},0);
					
					if($dropDown.hasClass(U.HIDDEN))
					{
						$dropDown.attr('data-is-open',true).data('is-open',true);
						$dropDown.css({'z-index':CKHeaderNav._getNextHighestDepth(),visibility:U.INHERIT});
						timeline.add(function()
						{
							$dropDown.removeClass(U.HIDDEN);
							CKHeaderNav._resize($dropDown);
						},0);
						
						timeline.add(function()
						{
							if(delay>0)
							{
								if($dropDown.css(U.OPACITY)!=0) $dropDown.css({opacity:0});
							} else if($dropDown.css(U.OPACITY)!=1) $dropDown.css({opacity:1});
						},0);
						
						if(delay>0) timeline.to($dropDown,U.FADE_DURATION,{autoAlpha:1},0);
					}
				} else
				{
					var delay=hasMouseBeenOverHeaderNav ? 0 : CKHeaderNav._delayDuration;
					var timeline=new TimelineLite({delay:delay});
					$headerNavItem.data('timeline',timeline);
					timeline.add(function()
					{
						$headerNavItem.addClass(U.HOVER);
					},0);
				}
			}
		}
		
		var deselectNavItem=function($headerNavItem)
		{
			if($headerNavItem.data('is-selected')==true)
			{
				$headerNavItem.data('is-selected',false);
				
				var $dropDown=$headerNavItem.children('.headerNavDropDown[data-is-open="true"]');
				var hasOpenDropDown=$dropDown.find(".dropDownLink").length ? true : false;
				var isThisDropDownOpen=$dropDown.data('is-open')==true;
				var timeline=new TimelineLite();
				
				//Prevents the drop down from showing if the user immediately rolled off the nav item - Not needed for tablet, since it uses a click listener
				if(!CKUtil.isTablet()) killTimeline($headerNavItem);
				
				timeline.add(function()
				{
					$headerNavItem.removeClass(U.HOVER);
				},0);
				if(hasOpenDropDown) timeline.add(closeDropDown($dropDown),0);
				$headerNavItem.data('timeline',timeline);
			}
		}
		
		if(CKUtil.isTablet())
		{
			$headerNavItem.unbind('mouseleave')
			.mouseleave(function()
			{
				deselectNavItem($(this));
			})
			.children('a')
			.unbind('click')
			.click(function(event)
			{
				var $this=$(this);
				var $headerNavItem=$this.parent();
				var $dropDown=$headerNavItem.children('.headerNavDropDown');
				var $openDropDown=$headerNavItem.children('.headerNavDropDown[data-is-open="true"]');
				
				if($openDropDown.length) deselectNavItem($headerNavItem);
				else
				{
					selectNavItem($headerNavItem);
					
					var hasDropDown=$dropDown.find(".dropDownLink").length ? true : false;
					if(hasDropDown)
					{
						U.callAfterNextClick(function()
						{
							deselectNavItem($headerNavItem);
						});
						
						event.preventDefault();
						event.stopImmediatePropagation();
					}
				} 
			});
		} else
		{
			$headerNavItem.unbind('mouseleave')
			.mouseleave(function()
			{
				deselectNavItem($(this));
			})
			.children('a')
			.unbind('mouseenter click')
			.mouseenter(function()
			{
				selectNavItem($(this).parent());
			}).click(function()
			{
				deselectNavItem($(this).parent());
			});
			
			$headerNav.find('#headerNavList').unbind('mouseenter mouseleave')
			.mouseenter(function()
			{
				U.closeOpenElements();
				CKHeaderNav._mouseEnterTime=$.now();
			}).mouseleave(function()
			{
				CKHeaderNav._mouseEnterTime=0;
			});

			CKHeaderNav.$headerNavItem
			.children(CKHeaderNav.MENU_ITEM_SELECTOR)
			.unbind('keydown')
			.keydown(function(e) {
    			var $this=$(this);
    			if (e.keyCode==U.KEYCODE.LEFT) { //left arrow    		        
    				var $parent = $this.parent();
    				var $previous;
    				$parent.prevAll().each(function(index, item){ //To skip headerNavDivider
						var $item = $(item);
    					if($item.hasClass(CKHeaderNav.NAV_ITEM_CLASS)){
    						$previous = $item.find(CKHeaderNav.MENU_ITEM_SELECTOR).first()
								return false;
							}
    					});
    				if($previous){
    					$parent.mouseleave();
        				$previous.focus();
    				}
    		    }
    			else if (e.keyCode==U.KEYCODE.RIGHT) { //right arrow    				
    				var $parent = $this.parent();
    				var $next;
    				$parent.nextAll().each(function(index, item){ //To skip headerNavDivider
						var $item = $(item);
    					if($item.hasClass(CKHeaderNav.NAV_ITEM_CLASS)){
    							$next = $item.find(CKHeaderNav.MENU_ITEM_SELECTOR).first()
								return false;
							}
    					});
    				if($next){
    					$parent.mouseleave();
    		        	$next.focus();
    				}
    		    }
    			else if (e.keyCode==U.KEYCODE.DOWN) { //down arrow
    				e.stopPropagation();
    				e.preventDefault();
    				if($this.attr(U.ARIA.HASPOPUP) == U.TRUE || $this.attr(U.ARIA.HASPOPUP) == true)
    					selectNavItem($this.parent());
    		    }
    			else if (e.keyCode==U.KEYCODE.UP) { //up arrow
    				e.stopPropagation();
    				e.preventDefault();
    				deselectNavItem($(this).parent());
     		    }
    		});
			
			CKHeaderNav.$headerNavItem.each(function() {
				var last = $( this ).find(CKHeaderNav.MENU_ITEM_SELECTOR).last().get(0);
				$(last).keydown(function(e){
					var keycode = e.keyCode;
					if(keycode == U.KEYCODE.TAB && !e.shiftKey){
						CKHeaderNav.$headerNavItem.children(CKHeaderNav.MENU_ITEM_SELECTOR).mouseleave();
					}
				});
	   		});
			
			CKHeaderNav.$headerNavItem.first().find(U.A).first().keydown(function(e){
				var keycode = e.keyCode;
				if(keycode == U.KEYCODE.TAB && e.shiftKey){
					CKHeaderNav.$headerNavItem.children(CKHeaderNav.MENU_ITEM_SELECTOR).mouseleave();
				}
			});
			
			CKHeaderNav.$headerNavItem.children(CKHeaderNav.MENU_ITEM_SELECTOR).focus(function(){
				var $this=$(this);
				var $parent = $this.parent();
				var $dropdown = $this.next(CKHeaderNav.NAV_DROP_DOWN_SELECTOR);
				if($dropdown.hasClass(U.HIDDEN)){
					CKHeaderNav.$headerNavItem.children(CKHeaderNav.MENU_ITEM_SELECTOR).mouseleave();
				}
	   		});
			
		}
	},
	
	_resize:function($targetDropDown)
	{
		var containerWidth=U.$header.width();
		var $headerNav=U.$header.find('#headerNav');
		var paddingLeftRight=parseInt(U.$header.find('#mini_cart_link').css(U.PADDING_RIGHT))*2;
		var $dropdown=$targetDropDown instanceof jQuery ? $targetDropDown : $headerNav.find('#headerNavInner .headerNavDropDown');
		var padding=parseInt($dropdown.css('padding-left'))+parseInt($dropdown.css('padding-right'));
		
		$dropdown.each(function()
		{
			var $this=$(this);
			var width=containerWidth-padding;
			
			var isTemplate2=$this.hasClass('template2');
			var numColumns=isTemplate2 ? CKHeaderNav._template2NumColumns : CKHeaderNav._numColumns;
			
			if(isTemplate2)
			{
				var $centeredContent=$this.find('.centeredContent');
				$centeredContent.height(U.EMPTY).height($centeredContent.height());
			}
			
			$this.find('.dropDownColumn').width(U.EMPTY);
			if($this.outerWidth()!=containerWidth) $this.width(width);
			
			var maxWidth=Math.min(width,$headerNav.width())-paddingLeftRight;
			$this.find('.dropDownColumn').width(maxWidth/numColumns);
			
			var $parent=$this.parent();
			$this.css({left:-$parent.offset().left});
		});
		
		CKHeaderNav._checkSearchPlaceholderText();
		if(U.hasFocus(CKHeaderNav.$searchInput)) CKHeaderNav.$searchInput.blur();
	},
	
	_getNextHighestDepth:function()
	{
		return CKHeaderNav._nextDepth++;
	},
	
	_hasMouseBeenOver:function()
	{
		if(CKHeaderNav._mouseEnterTime)
		{
			return $.now()-CKHeaderNav._mouseEnterTime>U.toMilliseconds(CKHeaderNav._delayDuration);
		}
	},
	
	_setupSearch:function()
	{
		var $searchBar=CKHeaderNav.$searchWrapper.find('#searchBar');
		var $searchText=$searchBar.find('.searchText');
		var duration=.35;
		
		CKHeaderNav._initialSearchWidth=$searchBar.width();
		
		var open=function()
		{
			var width=CKHeaderNav.$searchWrapper.width();
			var widthDiff=width-CKHeaderNav._initialSearchWidth;
			
			TweenLite.to($searchBar,duration,{width:width});
			TweenLite.to($searchText,duration,{left:-widthDiff});
			
			U.fadeIn(CKHeaderNav.$searchInput,{killFadeInTween:true});
			U.fadeOut($searchText,{hide:true,duration:duration/2,killFadeInTween:true});
		};
		
		CKHeaderNav.$searchInput.focus(open).blur(function()
		{
			if(!U.isMouseOver($searchBar)) //Keeps search from closing - U.VISIBLE was removed onblur, so during clicks in ck.util.js, hasClass is false and doesn't submit the form
			{
				CKHeaderNav.$searchWrapper.removeClass(U.VISIBLE);
				
				TweenLite.to($searchBar,duration,{width:CKHeaderNav._initialSearchWidth});
				TweenLite.to($searchText,duration,{left:0});
				
				U.fadeOut(CKHeaderNav.$searchInput,{duration:duration/4*3,delay:duration/4,killFadeInTween:true});
				U.fadeIn($searchText,{show:true,duration:duration/4*3,delay:duration/4,killFadeInTween:true});
			}
		});
		
		CKHeaderNav.$searchLink.keydown(U.keydownEvent);
		
		CKHeaderNav._initialPlaceholderText=CKHeaderNav.$searchInput.attr(U.PLACEHOLDER);
		CKHeaderNav._checkSearchPlaceholderText();
	},
	
	_checkSearchPlaceholderText:function()
	{
		if(U.$window.width()<CKHeaderNav._searchMediaQueryWidth) /* Switch placeholder to just 'Search' */
		{
			if(CKHeaderNav.$searchInput.attr(U.PLACEHOLDER)!=CKHeaderNav.SEARCH_PLACEHOLDER) CKHeaderNav.$searchInput.attr(U.PLACEHOLDER,CKHeaderNav.SEARCH_PLACEHOLDER);
		} else if(CKHeaderNav.$searchInput.attr(U.PLACEHOLDER)!=CKHeaderNav._initialPlaceholderText) CKHeaderNav.$searchInput.attr(U.PLACEHOLDER,CKHeaderNav._initialPlaceholderText);
	},
	
	NAV_ITEM_CLASS:'headerNavItem',
	NAV_ITEM_SELECTOR:'.headerNavItem',
	NAV_DROP_DOWN_SELECTOR: '.headerNavDropDown',
    MENU_ITEM_SELECTOR:'a[role="menuitem"]',
	SEARCH_WRAPPER_SELECTOR:'header .searchWrapper',
    SEARCH_LINK_SELECTOR:'.searchLink',
    SEARCH_INPUT_SELECTOR:'input.searchInput',
    AUTO_SUGGEST_LINK_SELECTOR:'.autoSuggestLink',
    SEARCH_PLACEHOLDER:'Search',
	$headerNavItem:null,
	$searchWrapper:null,
	$searchLink:null,
	$searchInput:null,
	$magGlassBlack:null,
	$logoBlack:null,
	_initialPlaceholderText:null,
	_nextDepth:10010,
	_mouseEnterTime:0,
	_delayDuration:null,
	_togglePoints:null,
	_numColumns:5,
	_template2NumColumns:6,
	_initialSearchWidth:0,
	_searchMediaQueryWidth:1075
}
