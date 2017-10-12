(function($)
{
	$.fn.colorSwatchToolTip=function()
	{
		var $this=this;
		
		if(!U.isTouch())
		{
			$this.off('mouseenter mouseleave','.productswatches > li > a').on('mouseenter','.productswatches > li > a',function(e)
			{
				var $a=$(this);
				if($a.siblings('.swatchToolTipWrapper').length==0) $a.parent().append('<div class="swatchToolTipWrapper"><div class="swatchToolTip">'+$a.children('img').attr('title')+'</div></div>');
				
				var $toolTip=$(this).siblings('.swatchToolTipWrapper');
				TweenLite.to($toolTip,.35,{autoAlpha:1,delay:.25});
				$toolTip.css('z-index',1000);
			}).on('mouseleave','.productswatches > li > a',function(e)
			{
				var $toolTip=$(this).siblings('.swatchToolTipWrapper');
				if($toolTip.get(0)!=undefined)
				{
					TweenLite.to($toolTip,.1,{autoAlpha:0,overwrite:true});
					$toolTip.css('z-index','auto');
				}
			});
		}
		
		return $this;
	};
})(jQuery);
