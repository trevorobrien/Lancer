var PVHFullscreen = PVHFullscreen ||
{
	fullScreenContainerSelector:"#fullscreenWrapper", 
	bgColor:null, //Default
	init:function()
	{
	    var containerHeight = 0,
	    containerTop = 0,
	    winWidth = U.$window.width(), 
	    screenDiff = 0,
	    $fullScreenContainer = $(PVHFullscreen.fullScreenContainerSelector),
	    $pvhOverlayBG=null,
	    $fullWindowImage=null,
	    $fullScrenImg=null,
	    $wrapper=null,
	    
	    _init = function ()
	    {
	    	if(U.isTouch())
	    	{
	    		var THUMBNAIL_IMG_SELECTOR='.bundle_package .itemcontainer img, .bundle_package .fullscreenLink';
    			var TARGET_SELECTOR=U.isTablet() ? '#zoom1, '+THUMBNAIL_IMG_SELECTOR : THUMBNAIL_IMG_SELECTOR;
	    		U.$body.off(U.CLICK,TARGET_SELECTOR).on(U.CLICK,TARGET_SELECTOR,function(event)
		    	{
		    		var $img=$(this);
		    		if($img.is('.fullscreenLink')) $img=$img.siblings(U.IMG);
		    		
		    		var $product=$img.parents(U.PRODUCT_SELECTOR);
		    		var transparentImageURL=U.getTransparentImageURL(U.isLandscape($product));
		    		var src=$img.attr(U.SRC);
		    		
		    		if(src && src!=transparentImageURL)
		    		{
		    			var imageURL=U.updateImageSrcForZoom(src,$product.data(U.PART_NUMBER),U.isLandscape($product));
		    			U.openFullscreenImageView(imageURL);
		    		}
    				return false;
		    	});
	    	} else
	    	{
	    		var THUMBNAIL_SELECTOR='.bundle_package .itemcontainer';
	    		var TARGET_SELECTOR='.cloudzoom-zoom-inside, '+THUMBNAIL_SELECTOR;
	    		U.$body.off(U.CLICK,TARGET_SELECTOR).on(U.CLICK,'.cloudzoom-zoom-inside, '+THUMBNAIL_SELECTOR,function(event)
		    	{
		    		var $container=$(this);
		    		var $product=$container.parents(U.PRODUCT_SELECTOR);
		    		var src=$container.children(U.IMG).attr(U.SRC);
		    		var overrideActiveAlt=$container.hasClass('itemcontainer');
		    		var closeCloudZoom=!U.isCK() && $container.is(U.toClass(U.CLOUD_ZOOM_INSIDE_CLASS));
		    		
		    		PVHFullscreen.open(src,$product,overrideActiveAlt,event,closeCloudZoom);
		    		
    				return false;
		    	});
	    		
	    		$fullScreenContainer.unbind(U.CLICK).click(PVHFullscreen.close);
	    	}
	    	
	    	PVHFullscreen.bgColor=U.BODY_BG_COLOR;
	    	PVHFullscreen._open=_open;
			PVHFullscreen._process=_process;
    	},
    	
    	_open=function(imageURL,overrideActiveAlt,$product)
    	{
    		$pvhOverlayBG=$('<div class="pvhOverlayBG"><div class="loadingBG"></div></div>');
    		
    		$fullWindowImage=$(PVHFullscreen.fullScreenContainerSelector);
    		$fullWindowImage.append($pvhOverlayBG).show();
			U.disableScrolling();
			
			$fullScrenImg=$('<img class="fullscreenImg" />');
			$fullScrenImg.wrap('<div class="wrapper" />');
			
			$wrapper=$fullScrenImg.parent();
			if(U.isLandscape($product)) $wrapper.addClass(U.LANDSCAPE);
			$wrapper.append('<div class="pvhOverlayCloseX"><a href="javascript:PVHFullscreen.close();"></a></div>');
			
			var imageURLNoQS=U.dropProtocol(U.dropQS(imageURL).url);
			var $altsToClone=$('#product .product_visual_thumbnails:visible').first();
			var $currentProdThumbnails=$altsToClone.children('.prodThumbnails');
			var altsBelongToImage=$currentProdThumbnails.find(join('img[src*="',imageURLNoQS,'"]')).length;
			
			var imageIdentifiers=U.IMAGE_IDENTIFIERS.slice();
			if(imageIdentifiers[0]==U.EMPTY) imageIdentifiers[0]=U.DOLLAR_SIGN; //Use the end of the URL for SP, since there's no identifier for the main image
			var imageRegEx=new RegExp(join(U.OPENING_PAREN,imageIdentifiers.join(U.PIPE),U.CLOSING_PAREN));
			
			if($currentProdThumbnails.length && altsBelongToImage)
			{
				$wrapper.append($altsToClone.clone());
				
				var $productVisualThumbnails=$wrapper.children('.product_visual_thumbnails');
				$productVisualThumbnails.removeAttr(U.STYLE);
				
				var $prodThumbnails=$productVisualThumbnails.children('.prodThumbnails');
				$prodThumbnails.children('.cloudzoom-gallery').removeClass('cloudzoom-gallery').removeAttr('data-cloudzoom');
				
				if(overrideActiveAlt)
				{
					$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).removeClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
					$prodThumbnails.first().children(U.A).addClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
				}
			} else if(imageRegEx.test(imageURLNoQS))
			{
				var $productVisualThumbnails=$('<div id="product_visual_thumbnails" class="product_visual_thumbnails clearfix" />');
				$wrapper.append($productVisualThumbnails);
				
				var $product=$(U.PRODUCT_SELECTOR);
				var isLandscape=U.isLandscape($product);
				var altHTML='<div class="prodThumbnails"><a><img data-src="{0}" /></a></div>';
				
				if(typeof U.IMAGE_IDENTIFIERS!=U.UNDEFINED)
				{
					var length=imageIdentifiers.length;
					for(var i=0;i<length;i++)
					{
						var updatedImageURL=U.updateImageSrcForAlt(imageURLNoQS.replace(imageRegEx,U.IMAGE_IDENTIFIERS[i]),$product.data(U.PART_NUMBER),isLandscape);
						$productVisualThumbnails.append(altHTML.replace('{0}',updatedImageURL));
					}
				}
				
				var $prodThumbnails=$productVisualThumbnails.children('.prodThumbnails');
				
				//JP:TODO: data-part-number isn't from the component, it's from the bundle
				U.loadImages($prodThumbnails.find('img[data-src]'),null,function(src)
		    	{
					return U.updateImageSrcForAlt(src,$product.data(U.PART_NUMBER),isLandscape);
		    	},true,'.prodThumbnails',isLandscape);
				
				//Take only the first match, since for SP the main image URL will match all image URLs
				$prodThumbnails.find(join('img[src*="',imageURLNoQS,'"]')).first().parent(U.A).addClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
			}
			
			if(U.isNotNull($prodThumbnails))
			{
				$prodThumbnails.find('img:not(.loaded)').each(function()
				{
					var $img=$(this);
					$img.on(U.ERROR,function()
					{
						$img.parents('.prodThumbnails').remove();
					});
				});
				
				$prodThumbnails.filter('#videoAlt').remove();
				
				$prodThumbnails.click(function(event)
				{
					$productVisualThumbnails.find(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS)).removeClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
					
					var $this=$(this);
					$this.children(U.A).addClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
		    		var imageURL=$this.find(U.IMG).attr(U.SRC);
		    		if(imageURL)
		    		{
		    			var $product=$(U.PRODUCT_SELECTOR);
		    			_process(event, U.updateImageSrcForZoom(imageURL,$product.data(U.PART_NUMBER),U.isLandscape($product)));
		    		}
					return false;
				});
				
				if(U.isCK()) //Adds close text and positions alts
				{
					var closeLinkClass='altsCloseLink';
					$productVisualThumbnails.append(U.toElement(closeLinkClass,null,null,U.CLOSE));
					
					var thumbnailHeight=(U.isLandscape($product) ? U.LAND_ALT_HEIGHT : U.ALT_HEIGHT);
					if(U.isDesktop() && U.supportsRetinaDisplay()) thumbnailHeight/=2;
					
					var numThumbnails=$prodThumbnails.length;
					var marginTop=10; //display: none on parent, so can't measure elements
					var closeLinkHeight=30;
					var thumbnailsMaxHeight=(thumbnailHeight*numThumbnails)+(marginTop*(numThumbnails-1))+closeLinkHeight;
					var altsTop=$altsToClone.length ? $altsToClone.offset().top : 0;
					
					if(altsTop+thumbnailsMaxHeight<U.$window.height() && altsTop>0) $productVisualThumbnails.css(U.TOP,altsTop);
					else $productVisualThumbnails.css(U.TOP,marginTop);
				}
			}
    		
    		$wrapper.off("mousemove", _dance).on("mousemove", _dance);
			U.$window.off("resize.full-window-image", _resize).on("resize.full-window-image", _resize);
    	},
    	
    	_process = function (evnt, fullWindowSource)
    	{
	    	_fetchAndLoad(evnt, fullWindowSource, function ()
	    	{
	    		var $fullScreenContainer=$(PVHFullscreen.fullScreenContainerSelector);
    			$fullScreenContainer.css({top: 0});
    			
    			containerHeight = $wrapper.height();
				containerTop = $wrapper.position().top;
				screenDiff = $fullScrenImg.height() - containerHeight;
				
				_dance(evnt);
				
				if($fullScreenContainer.css(U.VISIBILITY)==U.HIDDEN)
				{
					U.fadeIn($fullScreenContainer);
					if($fullScrenImg.css(U.VISIBILITY)==U.HIDDEN) $fullScrenImg.css(U.VISIBILITY,U.INHERIT);
				} else if($fullScrenImg.css(U.VISIBILITY)==U.HIDDEN) U.fadeIn($fullScrenImg);
    		});
    	},
    	
    	_fetchAndLoad = function (evnt, fullWindowSource, callback)
    	{
			var _errorOut=function()
			{
				$fullScrenImg.off('load error');
				$fullWindowImage.find('.error').remove();
				$fullScrenImg.remove();
				
				$fullWindowImage.prepend($wrapper);
				$wrapper.css('background-color',U.BODY_BG_COLOR).append('<div class="error">'+$fullWindowImage.data('error')+'</div>');
				
				$fullWindowImage.css('background','none');
				if(callback instanceof Function) callback();
			};
			
			var timeoutId=setTimeout(_errorOut,10000);
			
			$fullScrenImg.on(U.LOAD,function()
			{
				$fullScrenImg.off('load error');
				clearTimeout(timeoutId);
				$fullWindowImage.prepend($wrapper);
				$fullWindowImage.css('background','none');
				if(callback instanceof Function) callback();
			})
			.on(U.ERROR,function()
			{
				clearTimeout(timeoutId);
				_errorOut();
			})
			.attr(U.SRC, fullWindowSource);
		},
		
		_dance = function (w)
		{
			var top=-4;
			if(screenDiff>0) top=Math.min(top,screenDiff * ((w.clientY-containerTop) / containerHeight) * - 1);
			$fullScreenContainer.find(".fullscreenImg").css("top",Math.max(top,-screenDiff));
		},
		
		_resize = function()
		{
			containerHeight = $wrapper.height();
			containerTop = $wrapper.position().top;
			winWidth = U.$window.width();
			screenDiff = Math.max(0,$fullScreenContainer.find(".fullscreenImg").height() - containerHeight);
			_dance({clientY:0});
		};
		
		_init();
	},
	
	open:function(src,$product,overrideActiveAlt,event,closeCloudZoom)
	{
		var transparentImageURL=U.getTransparentImageURL(U.isLandscape($product));
		
		if(src && src!=transparentImageURL)
		{
			var imageURL=U.updateImageSrcForZoom(src,$product.data(U.PART_NUMBER),U.isLandscape($product));
			PVHFullscreen._open(imageURL,overrideActiveAlt,$product);
			
			PVHFullscreen._process(event, imageURL);
			if(closeCloudZoom) U.$zoom.data('CloudZoom').closeZoom();
		}
	},
	
	close:function ()
	{
		var $fullScreenContainer=$(PVHFullscreen.fullScreenContainerSelector);
		$fullScreenContainer.find('.wrapper').off("mousemove");
		
		$fullScreenContainer.off("load error");
		
		U.fadeOut($fullScreenContainer,{onComplete:function()
		{
			$fullScreenContainer.empty().hide().removeAttr(U.STYLE);
		}});
		
		U.$window.off("resize.full-window-image");
		U.enableScrolling();
	},
	
	_open:null,
	_process:null
}
