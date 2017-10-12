var PVHAltImages = PVHAltImages ||
{
	_populate:function(partNumber,colorCode,$product)
	{
		PVHAltImages.isLandscape=U.isLandscape($product.length ? $product : U.$html);
		PVHAltImages.imagesProcessed = 0;
		PVHAltImages.metaImages = [];
		
		if(colorCode)
		{
			PVHAltImages.altLinks = PVHAltImages._createLinks(partNumber,colorCode);
			PVHAltImages._loadAltImages(partNumber);
			
			var $productMainVideo=$('.product_main_video');
			if($productMainVideo.length)
			{
				var videoAltImagePath=U.isCK() ? PVHAltImages.altLinks[0] : U.getAkamaiPath()+'icons/video.png';
				$('#product_visual_thumbnails').append(join('<div id="videoAlt" class="prodThumbnails"><a><img src="',videoAltImagePath,'"></a></div>'));
			}
		}
	},
	
	//partNumber is passed only from bundles
	update:function(colorCode,partNumber)
	{
		var $product_visual_thumbnails=$('#product_visual_thumbnails');
		var load=function()
		{
			$product_visual_thumbnails.empty();
			var $product=$product_visual_thumbnails.parents(U.PRODUCT_SELECTOR);
			PVHAltImages._populate(U.dropColorCode(partNumber ? partNumber : PVHAltImages.productId),colorCode,$product);
		}
		
		U.clearCloudZoomNoImage();
		U.resetProductArrows();
		
		if($product_visual_thumbnails.css(U.VISIBILITY)==U.HIDDEN) load();
		else U.fadeOut($product_visual_thumbnails,{duration:true,onComplete:load,duration:U.isCK() ? .1 : U.FADE_DURATION});
	},
	
	//If the already active color swatch is selected, CloudZoom clears the cloudzoom-gallery-active class
	resetSelectedAlt:function($a)
	{
		if($a==null) $a=$('#product_visual_thumbnails > .prodThumbnails:first-child > a');
		U.callAfterCallStack(function()
		{
			$a.addClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS);
		});
	},
	
	clearAll:function()
	{
		$('#product_visual_thumbnails > .prodThumbnails, #product_visual_thumbnails > .fullscreenLink').remove();
	},
	
	reset : function()
	{
		PVHAltImages.productId = null;
	},
	
	_createLinks : function(partNumber,colorCode)
	{
		if(typeof U.IMAGE_IDENTIFIERS!=U.UNDEFINED)
		{
			var length=U.IMAGE_IDENTIFIERS.length;
			var retVal=[];
			for(var i=0;i<length;i++)
			{
				retVal.push(PVHAltImages._buildNewLink(partNumber,colorCode,U.IMAGE_IDENTIFIERS[i]));
			}
			return retVal;
		}
	},
	
	//partNumber should NOT contain -colorCode - update handles this by calling U.dropColorCode
	_buildNewLink : function(partNumber, colorCode, type)
	{
		var url=join(U.getScene7Path(),partNumber,U.UNDERSCORE,colorCode,type);
		return U.updateImageSrcForAlt(url,partNumber,PVHAltImages.isLandscape);
	},
	
	_loadAltImages:function(partNumber)
	{
		if(PVHAltImages.altLinks.length) PVHAltImages._loadImage(0,PVHAltImages.altLinks.length,partNumber);
	},
	
	_loadImage:function(index,max,partNumber)
	{
		var $cur = $('#product_visual_thumbnails');
		for (var index=0;index<max;index++)
		{
			var $prodThumbnail=$(join('<div class="prodThumbnails" index="',index,'" />'));
			$cur.append($prodThumbnail);
			var src=PVHAltImages.altLinks[index];
			var alt = U.$zoom.attr(U.ALT);
			if(alt==undefined) alt=U.EMPTY;
			
			var $img=$('<img id="altImage_'+index+'" index="'+index+'" data-alt="'+alt+'">');
			var htmlToAdd ='<a data-cloudzoom="showTitle:false ,useZoom: \'#zoom1\', image: \''+U.updateImageSrcForPDP(src,partNumber,PVHAltImages.isLandscape)+'\', zoomImage: \''+U.updateImageSrcForZoom(src,partNumber,PVHAltImages.isLandscape)+'\'" class="cloudzoom-gallery"></a>';
			var $a=$prodThumbnail.append(htmlToAdd).children(U.A);
			$a.append($img);
			$a.click(U.clearCloudZoomNoImage);
			if($prodThumbnail.index()==0) PVHAltImages.resetSelectedAlt($a);
			
			$img.on(U.LOAD,function()
			{
				var $this=$(this);
				var imgIndex=$this.attr(U.INDEX)
				PVHAltImages.imagesProcessed++;
				PVHAltImages.metaImages[imgIndex] = U.updateImageSrcForZoom($this.attr(U.SRC),partNumber,PVHAltImages.isLandscape);
				$this.addClass(U.LOADED).attr(U.DATA_IS_LOADED,true);
				$this.off(U.LOAD+U.SPACE+U.ERROR);
				$this.attr(U.ALT,$this.data(U.ALT));
				
				if(PVHAltImages.imagesProcessed >= max) PVHAltImages.processAllThumbnails($cur, max);
			}).on(U.ERROR,function()
			{
				$(this).parents('.prodThumbnails').remove();
				PVHAltImages.imagesProcessed++;
				
				if(PVHAltImages.imagesProcessed >= max) PVHAltImages.processAllThumbnails($cur, max);
			}).attr(U.SRC,src);
		}
	},
	
	processAllThumbnails:function($cur, max)
	{
		var $prodThumbnails=$cur.children('.prodThumbnails');
		U.setupProductArrows($prodThumbnails);
		
		if(U.$zoom.data('CloudZoom')) $('.cloudzoom-gallery').CloudZoom();
		U.fadeIn($cur,{duration:U.isCK() ? .175 : U.FADE_DURATION});
		
		if(U.isCK() && !U.isMobile() && $prodThumbnails.length) //Fullscreen link
		{
			var $product=$cur.parents(U.PRODUCT_SELECTOR);
			var transparentImageURL=U.getTransparentImageURL(U.isLandscape($product));
			
			$cur.append(join('<a class="fullscreenLink">',MessageHelper.messages['FULLSCREEN'],'</a>'));
			$cur.children('.fullscreenLink').click(function(event)
			{
				var src=$cur.find(join(U.toClass(U.CLOUD_ZOOM_GALLERY_ACTIVE_CLASS),U.SPACE,U.IMG)).attr(U.SRC);
				
				if(U.isTablet())
				{
		    		if(src && src!=transparentImageURL)
		    		{
		    			var imageURL=U.updateImageSrcForZoom(src,$product.data(U.PART_NUMBER),U.isLandscape($product));
		    			U.openFullscreenImageView(imageURL);
		    		}
				} else
				{
					var overrideActiveAlt=false;
					var closeCloudZoom=false;
					
					PVHFullscreen.open(src,$product,overrideActiveAlt,event,closeCloudZoom);
				}
			});
		}
	},
	
	productId : null,
	altLinks : [],
	isLandscape : false,
	imagesProcessed:0,
	metaImages:null
}
