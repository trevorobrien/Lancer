(function($)
{
	//settings.$content - jQuery DOM element to add
	//settings.contentSelector - Selector of DOM element to add
	//settings.contentURL - URL to load
	//settings.emsName - eSpot name to load
	//settings.title - adds a sticky title bar to the overlay
	//onSuccess - Should return the $content object
	
	$.fn.overlay=function(settings,autoDestroy,onLoad,onDestroy,onClose,onSuccess,duration)
	{
		var $this=this;
		var RESIZE='resize.PVHOverlay';
		if(U.isNull(duration)) duration=.4;
		var $currentFocus=$(document.activeElement);
		
		var close=function(bypassSetFocus,forceAutoDestroy)
		{
			if($getRequest)
			{
				$getRequest.abort();
				$getRequest=null;
			}
			U.$window.unbind(RESIZE,resize);
			
			if(settings.showBG) TweenLite.to($overlayBG,duration,{autoAlpha:0,overwrite:true,ease:Sine.easeOut});
			else $overlayBG.css({visibility:U.EMPTY,opacity:U.EMPTY});
			
			var always=function()
			{
				$overlay.remove();
				
				if(U.isNotNull($currentFocus) && bypassSetFocus != true)
				{
					if(U.isFocusable($currentFocus)) $currentFocus.focus();
					else $currentFocus.parents('.focusParent').find(U.FOCUSABLE).first().focus(); //The element is no longer focusable/visible, so look for a "focusParent", then find the first focusable element.
				}
			}
			
			var onComplete=function()
			{
				if(autoDestroy || forceAutoDestroy) $content.remove();
				else
				{
					var $parent=$content.data(U.PARENT);
					if($parent && $parent.length) $content.appendTo($parent);
					if(settings.hideNonDestroyedContent) $content.hide();
				}
				
				always();
			};
			
			if(U.isNotNull($content))
			{
				if(settings.moveUp) TweenLite.to($overlayContentWrapper,duration,{autoAlpha:0,top:U.$window.height()/2,overwrite:true,ease:Expo.easeOut,onComplete:onComplete});
				else if(settings.moveDown) TweenLite.to($overlayContentWrapper,duration,{autoAlpha:0,top:-$overlayContentWrapper.height(),overwrite:true,ease:Expo.easeOut,onComplete:onComplete});
				else TweenLite.to($overlayContentWrapper,duration,{autoAlpha:0,overwrite:true,ease:Sine.easeOut,onComplete:onComplete});
			} else always();
			
			if(onDestroy instanceof Function) onDestroy();
			if(onClose instanceof Function) onClose();
		}
		
		var open=function()
		{
			$this.append($overlay);
			if(settings.showBG) TweenLite.to($overlayBG,duration,{autoAlpha:settings.backgroundOpacity,overwrite:true,ease:Sine.easeIn});
			else $overlayBG.css({visibility:U.INHERIT,opacity:0});
		}
		
		var load=function(bypassTween)
		{
			$content.data(U.PARENT,$content.parent());
			$overlayContent.append($content);
			$content.show();
			
			var title=$overlayContent.find('[data-overlay-title]:not(.nodisplay)').data('overlay-title') || settings.title;
			if(U.isNotNull(title)) $overlay.find('.pvhOverlayTitle').html(title);
			else $overlay.find('.pvhOverlayTitle').empty();
			
			var delay=.5;
			if(bypassTween!=true)
			{
				if(settings.moveUp) TweenLite.from($overlayContentWrapper,duration,{autoAlpha:0,top:U.$window.height()/2,overwrite:true,ease:Expo.easeOut,delay:delay});
				else if(settings.moveDown) TweenLite.fromTo($overlayContentWrapper,.75,{autoAlpha:0,top:-$overlayContentWrapper.height(),overwrite:true,ease:Expo.easeOut,delay:delay},{autoAlpha:1,top:96,onComplete:resize});
				else TweenLite.fromTo($overlayContentWrapper,.75,{autoAlpha:0,overwrite:true,ease:Sine.easeIn,delay:delay},{autoAlpha:1,onComplete:resize});
			} else delay=0;
			
			resize();
			
			if(onLoad instanceof Function) onLoad();
			
			//Delay until animation code is run and overlay is visible.
			U.callAfterDelay(function()
			{
				$overlayBG.removeClass(U.LOADING).find('.loadingBG').remove();
				
				//WARNING/NOTE (29483): Once you tab into an iframe, it won't circle back to start if last tab-stop is in the iframe. Jumps to page.
				
				var $tabbable=$overlayContentWrapper.find(U.TABBABLE);
				var $first=$tabbable.first();
				var $last=$tabbable.last();
				
				$first.keydown(function(event)
				{
					if(event.key==U.KEY.TAB && event.shiftKey)
					{
						event.preventDefault();
						$last.focus();
					}
				});
				
				$last.keydown(function(event)
				{
					if(event.key==U.KEY.TAB && !event.shiftKey)
					{
						event.preventDefault();
						$first.focus();
					}
				});
				
				$first.focus();
			},U.toMilliseconds(delay));
		}
		
		var resize=function()
		{
			var maxHeight=U.$window.height()-parseInt($overlayContentWrapper.css(U.MARGIN_TOP))-parseInt($overlayContentWrapper.css(U.MARGIN_BOTTOM))-parseInt($overlayContent.css(U.MARGIN_TOP));
			if(settings.moveDown) maxHeight-=$overlayContentWrapper.position().top;
			if(parseInt($overlayContent.css(U.MAX_HEIGHT))!=maxHeight) $overlayContent.css(U.MAX_HEIGHT,maxHeight);
			
			if(U.isMobile())
			{
				var maxWidth=U.$window.width()-parseInt($overlayContentWrapper.css(U.MARGIN_LEFT))-parseInt($overlayContentWrapper.css(U.MARGIN_RIGHT));
				if(parseInt($overlayContent.css(U.MAX_WIDTH))!=maxWidth) $overlayContent.css(U.MAX_WIDTH,maxWidth);
			}
		}
		
		var replaceContent=function(_settings,_autoDestroy,_onLoad,_onDestroy)
		{
			//Process partial close on open content
			if($getRequest)
			{
				$getRequest.abort();
				$getRequest=null;
			}
			
			if($content)
			{
				if(autoDestroy) $content.remove();
				else
				{
					var $parent=$content.data(U.PARENT);
					if($parent && $parent.length) $content.appendTo($parent);
					if(settings.hideNonDestroyedContent) $content.hide();
				}
			}
			
			if(onDestroy instanceof Function) onDestroy();
			
			//Override initial params
			settings=_settings;
			autoDestroy=_autoDestroy;
			onLoad=_onLoad;
			onDestroy=_onDestroy;
			
			//Process partial load on new content
			$content=settings.$content;
			if(U.isNotNull(settings.contentSelector)) $content=$(settings.contentSelector);
			if(U.isNotNull($content)) load(true);
		}
		
		var closeLabel = MessageHelper.messages['OVERLAY_CLOSE'];
		var $overlay=$('<div class="pvhOverlay"><div class="pvhOverlayContainer"><div class="pvhOverlayContentWrapper" id="pvhOverlayContentWrapper" tabindex="-1"><div class="pvhOverlayCloseX" role="button" aria-label="' + closeLabel + '" tabindex="0"><img class="closeXImg"></div><div class="pvhOverlayContent" role="dialog"></div></div></div><div class="pvhOverlayBG"></div></div>');
		var $overlayContentWrapper=$overlay.find('.pvhOverlayContentWrapper');
		var $pvhOverlayContainer=$overlay.find('.pvhOverlayContainer');
		var $overlayContent=$overlay.find('.pvhOverlayContent');
		var $overlayBG=$overlay.find('.pvhOverlayBG');
		
		if(settings.showLoadingAnimation) $overlayBG.addClass(U.LOADING).append('<div class="loadingBG"></div>');
		
		$overlay.find('.closeXImg').attr(U.SRC, U.getCloseXImageURL());
		$overlay.find('.pvhOverlayCloseX').before('<div class="pvhOverlayTitle" />');
		$overlay.find('.pvhOverlayCloseX, .pvhOverlayBG').click(close);
		$overlay.find('.pvhOverlayCloseX').keydown(U.keydownEvent);
		
		$overlay.keydown(function(event)
		{
		    if(event.keyCode == U.KEYCODE.ESC && !event.isDefaultPrevented() && $overlay.find('.dk_container.dk_open').length==0) //Ensure the escape keydown event won't be handled by another overlay or an open drop down.
		    {
		    	event.preventDefault();
		    	close();
		    }
		});
		
		if(!settings.showBG) $overlayContentWrapper.addClass('shadow');
		if(settings.moveDown) $pvhOverlayContainer.css({display:U.BLOCK});
		
		var $getRequest;
		var opened=false;
		var $content=settings.$content;
		var excludeStoreVars=settings.excludeStoreVars;
		
		if(U.isNotNull(settings.contentSelector)) $content=$(settings.contentSelector);
		if(U.isNotNull($content))
		{
			U.$window.bind(RESIZE,resize);
			open();
			load();
			opened=true;
		} else
		{
			var success=function(data)
			{
				$getRequest=null;
				$content=onSuccess instanceof Function ? onSuccess(data) : $(data);
				load();
			};
			
			if(U.isNotNull(settings.contentURL))
			{
				U.$window.bind(RESIZE,resize);
				open();
				opened=true;
				
				$getRequest=U.get(settings.contentURL,null,success,close,null,excludeStoreVars);
			} else if(U.isNotNull(settings.emsName))
			{
				U.$window.bind(RESIZE,resize);
				open();
				opened=true;
				
				$getRequest=U.getESpot(settings.emsName,success);
			} else console.debug('PVHOverlay - No content specified for the overlay.');
		}
		
		$overlay.data('replaceContent',replaceContent);
		$overlay.data(U.CLOSE,close);
		if(opened) return $overlay;
	};
})(jQuery);
