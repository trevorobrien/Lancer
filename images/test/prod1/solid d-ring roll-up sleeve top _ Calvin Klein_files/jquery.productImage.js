
(function($)
{
	$.fn.productImage=function(isQuickview,$product,cloudZoomGallerySelector)
	{
		var transparentImageURL=U.getTransparentImageURL(U.isLandscape($product));
		var NO_IMAGE_SELECTOR=U.toClass(U.NO_IMAGE);
		
		return this.each(function()
		{
			var $img=$(this);
			$img.off('load.productImage error.productImage');
			$img.parent(NO_IMAGE_SELECTOR).removeClass(U.NO_IMAGE);
			
			var error=function(force)
			{
				if(force==true || U.isNotNull($img.attr(U.SRC))) //Added for IE, because it's immediately triggering an error (before the src attr is set)
				{
					if($img.data(U.SRC)!=transparentImageURL) $img.attr(U.SRC,transparentImageURL).data(U.SRC,transparentImageURL);
				}
			};
			
			$img.on('load.productImage',function()
			{
				$img.off('load.productImage error.productImage');
				if($img.data(U.SRC)!=transparentImageURL) $img.parent().removeClass(U.NO_IMAGE);
				
				setTimeout(function()
				{
					$img.parents('#zoomWrapper').addClass(U.LOADED);
					if($img.data(U.SRC)==transparentImageURL) $img.parent(':not('+NO_IMAGE_SELECTOR+')').addClass(U.NO_IMAGE);
					
					$img.CloudZoom();
					if(cloudZoomGallerySelector) $(cloudZoomGallerySelector).CloudZoom();
					else $('.cloudzoom-gallery').CloudZoom();
				},0);
				
			}).on('error.productImage',error);
			
			var load=function()
			{
				var src=$img.data(U.SRC);
				if(U.isNotNull(src)) $img.attr(U.SRC,U.decodeAmps(src));
				else error(true);
			};
			
			if(isQuickview) U.callAfterCallstack(load);
			else load();
		});
	};
})(jQuery);
