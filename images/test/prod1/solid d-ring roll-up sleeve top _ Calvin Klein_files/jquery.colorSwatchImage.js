(function($)
{
	$.fn.colorSwatchImage=function(displayForProduct)
	{
		return this.each(function()
		{
			var $this=$(this);
			var $parent=$this.parent();
			
			var error=function()
			{
				$parent.children('.no-image-swatch').remove();
				$parent.prepend('<div class="no-image-swatch"/>');
				$this.css(U.OPACITY,0);
			};
			
			var src=$this.data(U.SRC);
			if(src!=undefined)
			{
				var $productswatches=$parent.parents('.productswatches');
				src=U.updateImageSrcForSwatch(src,$productswatches.data(U.PART_NUMBER));
				
				$this
				.on(U.LOAD,function()
				{
					if($this.css(U.VISIBILITY)==U.HIDDEN || $this.css(U.OPACITY)==0) U.fadeIn($this);
				})
				.on(U.ERROR,error)
				.attr(U.SRC,src);
				
			} else error();
		});
	};
})(jQuery);
